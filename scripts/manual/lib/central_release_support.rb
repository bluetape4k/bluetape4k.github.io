# frozen_string_literal: true

require "json"
require "fileutils"
require "open3"
require "pathname"

module CentralReleaseSupport
  Options = Struct.new(
    :code_root, :manual_root, :manifest, :source_root, :tag, :sha, :inventory, :allow_planned,
    keyword_init: true,
  )

  module_function

  def parse(arguments, slug:, expected_tag: nil, expected_sha: nil, inventory_name: "module-inventory.json")
    default_site_root = File.expand_path("../../..", __dir__)
    options = Options.new(
      code_root: nil,
      manual_root: File.join(default_site_root, "docs/manual/bluetape4k-#{slug}"),
      manifest: nil,
      source_root: nil,
      tag: expected_tag,
      sha: expected_sha,
      inventory: nil,
      allow_planned: false,
    )
    positional = []
    values = arguments.dup
    until values.empty?
      argument = values.shift
      case argument
      when "--root", "--code-root"
        options.code_root = values.shift
      when "--manual-root"
        options.manual_root = values.shift
      when "--manifest"
        options.manifest = values.shift
      when "--source-root"
        options.source_root = values.shift
      when "--tag", "--release"
        options.tag = values.shift
      when "--sha", "--commit"
        options.sha = values.shift
      when "--inventory"
        options.inventory = values.shift
      when "--allow-planned"
        options.allow_planned = true
      else
        positional << argument
      end
    end

    options.code_root ||= Dir.pwd if File.file?(File.join(Dir.pwd, "settings.gradle.kts")) || File.file?(File.join(Dir.pwd, "build.gradle.kts"))
    options.code_root ||= default_site_root
    options.tag ||= positional.shift
    options.sha ||= positional.shift
    options.inventory ||= positional.shift
    options.manifest ||= File.join(options.manual_root, "manifest.yaml")
    options.inventory ||= File.join(options.code_root, "build/manual", inventory_name)
    options.tag ||= manifest_value(options.manifest, "releaseRef")
    options.sha ||= manifest_value(options.manifest, "releaseCommit")
    unless positional.empty?
      raise ArgumentError, "unexpected arguments: #{positional.join(' ')}"
    end
    raise ArgumentError, "release tag and commit are required" unless options.tag && options.sha

    options
  end

  def manifest_value(manifest_path, key)
    require "yaml"
    manifest = YAML.safe_load(File.read(manifest_path))
    manifest.is_a?(Hash) ? manifest[key] : nil
  rescue Errno::ENOENT, Psych::SyntaxError
    nil
  end

  def ensure_inventory(options, slug:, inventory_name: "module-inventory.json", release_filter: true)
    inventory_path = File.expand_path(options.inventory, options.code_root)
    unless File.file?(inventory_path)
      FileUtils.mkdir_p(File.dirname(inventory_path))
      if slug == "image"
        script = File.expand_path("../repositories/bluetape4k-image/export_settings_inventory.rb", __dir__)
        run!("ruby", script, File.join(options.code_root, "settings.gradle.kts"), inventory_path, chdir: options.code_root)
      else
        gradlew = File.join(options.code_root, "gradlew")
        raise ArgumentError, "Gradle wrapper not found: #{gradlew}" unless File.file?(gradlew)
        run!(gradlew, "--no-daemon", "--no-configuration-cache", "--console=plain", "exportManualModuleInventory", chdir: options.code_root)
      end
    end
    rows = JSON.parse(File.read(inventory_path))
    raise ArgumentError, "module inventory must be an array: #{inventory_path}" unless rows.is_a?(Array)
    unless release_filter
      return rows
    end

    release_paths = git_output(options.code_root, "ls-tree", "-r", "--name-only", options.tag).lines(chomp: true).to_h { |entry| [entry, true] }
    filtered = rows.select do |row|
      source_dir = row.is_a?(Hash) ? row["sourceDir"] : nil
      source_dir.is_a?(String) && release_paths.key?(File.join(source_dir, "build.gradle.kts"))
    end
    File.binwrite(inventory_path, JSON.pretty_generate(filtered) + "\n")
    filtered
  rescue JSON::ParserError => error
    raise ArgumentError, "module inventory JSON is invalid: #{error.message}"
  end

  def run!(*command, chdir:)
    _stdout, stderr, status = Open3.capture3(*command, chdir: chdir)
    return true if status.success?

    detail = stderr.lines.last(20).join.strip
    raise ArgumentError, "inventory export failed: #{detail}"
  end

  def git_output(root, *arguments)
    stdout, stderr, status = Open3.capture3("git", "-C", root, *arguments)
    return stdout if status.success?

    raise ArgumentError, "git #{arguments.join(' ')} failed: #{stderr.strip}"
  end
end
