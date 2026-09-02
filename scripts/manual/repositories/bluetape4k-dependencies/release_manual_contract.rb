#!/usr/bin/env ruby

require "json"
require "open3"
require "yaml"

class DependenciesReleaseManualContract
  class ContractError < StandardError; end

  EXPECTED_REPOSITORY = "bluetape4k/bluetape4k-dependencies"
  EXPECTED_RELEASE = "2.0.0"
  EXPECTED_MINOR = "2.0"
  EXPECTED_CATALOG_VERSIONS = {
    "bluetape4k-dependencies" => "2.0.0",
    "bluetape4k-bom" => "2.0.0",
    "bluetape4k-exposed-bom" => "2.0.0",
    "bluetape4k-aws-bom" => "1.0.0",
    "bluetape4k-graph-bom" => "1.0.0",
    "bluetape4k-image-bom" => "1.0.0",
    "bluetape4k-javers-bom" => "1.0.0",
    "bluetape4k-leader-bom" => "1.0.0",
    "bluetape4k-text-bom" => "1.0.0",
  }.freeze

  def initialize(code_root:, manual_root:, manifest_path:, tag:, sha:, git_resolver: nil)
    @code_root = File.expand_path(code_root)
    @manual_root = File.expand_path(manual_root)
    @manifest_path = File.expand_path(manifest_path)
    @tag = tag
    @sha = sha
    @git_resolver = git_resolver || method(:resolve_git_commit)
  end

  def validate!
    require_equal("release tag", EXPECTED_RELEASE, @tag)
    require_equal("release checkout", @sha, @git_resolver.call(@code_root, "HEAD"))
    require_equal("annotated tag", @sha, @git_resolver.call(@code_root, "refs/tags/#{@tag}"))

    manifest = YAML.safe_load(File.read(@manifest_path, encoding: "UTF-8"))
    require_equal("manifest repository", EXPECTED_REPOSITORY, manifest["repository"])
    require_equal("manifest releaseRef", @tag, manifest["releaseRef"])
    require_equal("manifest releaseCommit", @sha, manifest["releaseCommit"])
    require_equal("manual version", EXPECTED_MINOR, manifest.dig("publication", "manualVersion"))
    require_equal("content status", "complete", manifest.dig("publication", "contentStatus"))

    properties = parse_properties(File.join(@code_root, "gradle.properties"))
    require_equal("baseVersion", EXPECTED_RELEASE, properties["baseVersion"])
    require_equal("snapshotVersion", "", properties.fetch("snapshotVersion", nil))

    catalog = File.read(File.join(@code_root, "gradle", "libs.versions.toml"), encoding: "UTF-8")
    EXPECTED_CATALOG_VERSIONS.each do |key, version|
      pattern = /^\s*#{Regexp.escape(key)}\s*=\s*"#{Regexp.escape(version)}"(?:\s|$)/
      raise ContractError, "catalog #{key} must be #{version}" unless catalog.match?(pattern)
    end

    generated = JSON.parse(
      File.read(File.join(@manual_root, "generated", "manifest.json"), encoding: "UTF-8"),
    )
    require_equal("generated schema", 2, generated["schemaVersion"])
    modules = generated["modules"]
    raise ContractError, "generated modules must not be empty" unless modules.is_a?(Array) && !modules.empty?

    documents = manifest.fetch("overview").fetch("documents").values.flatten
    documents.concat(modules.flat_map { |item| [item["en"], item["ko"]] })
    documents.each do |relative|
      next if relative.is_a?(String) && File.file?(File.join(@manual_root, relative))

      raise ContractError, "manual document missing: #{relative.inspect}"
    end

    true
  rescue KeyError => error
    raise ContractError, "manifest field missing: #{error.message}"
  end

  private

  def require_equal(label, expected, actual)
    return if actual == expected

    raise ContractError, "#{label}: expected #{expected.inspect}, got #{actual.inspect}"
  end

  def parse_properties(path)
    File.readlines(path, chomp: true, encoding: "UTF-8").each_with_object({}) do |line, result|
      next if line.strip.empty? || line.lstrip.start_with?("#")

      key, value = line.split("=", 2)
      result[key] = value if value
    end
  end

  def resolve_git_commit(root, ref)
    stdout, stderr, status = Open3.capture3("git", "-C", root, "rev-parse", "#{ref}^{commit}")
    raise ContractError, "git ref unresolved: #{ref}: #{stderr.strip}" unless status.success?

    stdout.strip
  end
end
