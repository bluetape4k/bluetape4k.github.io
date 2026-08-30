#!/usr/bin/env ruby

require "json"
require_relative "manual_contract"
require_relative "release_contract"
require_relative "../../lib/central_release_support"

module ManualDocs
  class ReleaseManualValidator
    def initialize(repository_root:, tag:, expected_sha:, inventory_path:, manifest_path:, release_contract: nil,
                   manual_root: nil, source_root: "docs/manual")
      @repository_root = File.expand_path(repository_root)
      @tag = tag
      @expected_sha = expected_sha
      @inventory_path = File.expand_path(inventory_path, @repository_root)
      @manifest_path = File.expand_path(manifest_path, @repository_root)
      @manual_root = File.expand_path(manual_root || File.dirname(@manifest_path))
      @source_root = source_root
      @release_contract = release_contract || ReleaseContract.new(
        repository_root: @repository_root,
        tag: @tag,
        expected_sha: @expected_sha,
        manifest_path: @manifest_path,
        manual_root: @manual_root,
      )
    end

    def errors
      release_result = @release_contract.validate
      errors = release_result.errors.dup
      return errors << "release inventory not found: #{@inventory_path}" unless File.file?(@inventory_path)
      return errors << "manual manifest not found: #{@manifest_path}" unless File.file?(@manifest_path)

      inventory = JSON.parse(File.read(@inventory_path))
      errors.concat(Validator.new(
        inventory: inventory,
        manifest_path: @manifest_path,
        repository_root: @repository_root,
        manual_root: @manual_root,
        source_root: @source_root,
        expected_release: { "ref" => @tag, "commit" => @expected_sha },
        strict: true,
      ).errors)
      errors.sort
    rescue JSON::ParserError => error
      errors << "release inventory JSON is invalid: #{error.message}"
    end

    def checked_link_count
      @release_contract.validate.checked_count
    end

    def checked_source_path_count
      @release_contract.validate.source_path_count || 0
    end
  end
end

if $PROGRAM_NAME == __FILE__
  if ARGV.any? { |argument| argument.start_with?("--code-root", "--root", "--manual-root", "--source-root", "--manifest", "--tag", "--sha", "--inventory") }
    begin
      options = CentralReleaseSupport.parse(ARGV, slug: "graph")
      inventory = CentralReleaseSupport.ensure_inventory(options, slug: "graph")
      validator = ManualDocs::ReleaseManualValidator.new(
        repository_root: options.code_root,
        tag: options.tag,
        expected_sha: options.sha,
        inventory_path: options.inventory || File.join(options.code_root, "build/manual/module-inventory.json"),
        manifest_path: options.manifest,
        manual_root: options.manual_root,
        source_root: options.source_root || "docs/manual",
      )
      errors = validator.errors
      abort(errors.join("\n")) unless errors.empty?
      puts "Strict release manual contract valid: annotated tag #{options.tag} -> #{options.sha}; #{inventory.length} modules, #{validator.checked_source_path_count} manifest source paths and #{validator.checked_link_count} release-local links checked."
    rescue ArgumentError => error
      warn error.message
      exit 1
    end
  else
    tag = ARGV.fetch(0, "0.5.1")
    sha = ARGV.fetch(1, "3e0fa7cb9e3bc70c2743aeebda2487f3e45e4907")
    inventory_path = ARGV.fetch(2, "build/manual/release-module-inventory.json")
    validator = ManualDocs::ReleaseManualValidator.new(
      repository_root: Dir.pwd,
      tag: tag,
      expected_sha: sha,
      inventory_path: inventory_path,
      manifest_path: "docs/manual/manifest.yaml",
    )
    errors = validator.errors
    abort(errors.join("\n")) unless errors.empty?
    puts "Strict release manual contract valid: annotated tag #{tag} -> #{sha}; #{validator.checked_source_path_count} manifest source paths and #{validator.checked_link_count} release-local links checked."
  end
end
