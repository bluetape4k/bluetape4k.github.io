#!/usr/bin/env ruby

require "fileutils"
require "json"
require "minitest/autorun"
require "tmpdir"
require "yaml"

require_relative "release_manual_contract"

class DependenciesReleaseManualContractTest < Minitest::Test
  RELEASE_SHA = "3c203aa9f8ba80685aac766c5fb8f24e23d0058e"

  def setup
    @root = Dir.mktmpdir("dependencies-release-manual-")
    @code_root = File.join(@root, "code")
    @manual_root = File.join(@root, "manual")
    FileUtils.mkdir_p(File.join(@code_root, "gradle"))
    FileUtils.mkdir_p(File.join(@manual_root, "generated"))
    FileUtils.mkdir_p(File.join(@manual_root, "en", "modules"))
    FileUtils.mkdir_p(File.join(@manual_root, "ko", "modules"))

    File.write(File.join(@code_root, "gradle.properties"), "baseVersion=2.0.0\nsnapshotVersion=\n")
    File.write(
      File.join(@code_root, "gradle", "libs.versions.toml"),
      <<~TOML,
        bluetape4k-dependencies = "2.0.0"
        bluetape4k-bom = "2.0.0"
        bluetape4k-exposed-bom = "2.0.0"
        bluetape4k-aws-bom = "1.0.0"
        bluetape4k-graph-bom = "1.0.0"
        bluetape4k-image-bom = "1.0.0"
        bluetape4k-javers-bom = "1.0.0"
        bluetape4k-leader-bom = "1.0.0"
        bluetape4k-text-bom = "1.0.0"
      TOML
    )
    %w[en ko].each do |locale|
      File.write(File.join(@manual_root, locale, "index.md"), "# Manual\n")
      File.write(File.join(@manual_root, locale, "modules", "bom.md"), "# BOM\n")
    end
    File.write(
      File.join(@manual_root, "manifest.yaml"),
      {
        "schemaVersion" => 2,
        "repository" => "bluetape4k/bluetape4k-dependencies",
        "releaseRef" => "2.0.0",
        "releaseCommit" => RELEASE_SHA,
        "publication" => {
          "manualVersion" => "2.0",
          "contentStatus" => "complete",
        },
        "overview" => { "documents" => { "en" => ["en/index.md"], "ko" => ["ko/index.md"] } },
      }.to_yaml,
    )
    File.write(
      File.join(@manual_root, "generated", "manifest.json"),
      JSON.pretty_generate(
        "schemaVersion" => 2,
        "modules" => [
          {
            "id" => "ecosystem-bom",
            "sourceDir" => ".",
            "en" => "en/modules/bom.md",
            "ko" => "ko/modules/bom.md",
          },
        ],
      ),
    )
  end

  def teardown
    FileUtils.remove_entry(@root)
  end

  def test_accepts_exact_stable_release_contract
    contract = DependenciesReleaseManualContract.new(
      code_root: @code_root,
      manual_root: @manual_root,
      manifest_path: File.join(@manual_root, "manifest.yaml"),
      tag: "2.0.0",
      sha: RELEASE_SHA,
      git_resolver: ->(_root, _ref) { RELEASE_SHA },
    )

    assert contract.validate!
  end

  def test_rejects_a_snapshot_child_version
    catalog = File.join(@code_root, "gradle", "libs.versions.toml")
    File.write(catalog, File.read(catalog).sub('bluetape4k-aws-bom = "1.0.0"', 'bluetape4k-aws-bom = "1.1.0-SNAPSHOT"'))

    error = assert_raises(DependenciesReleaseManualContract::ContractError) do
      DependenciesReleaseManualContract.new(
        code_root: @code_root,
        manual_root: @manual_root,
        manifest_path: File.join(@manual_root, "manifest.yaml"),
        tag: "2.0.0",
        sha: RELEASE_SHA,
        git_resolver: ->(_root, _ref) { RELEASE_SHA },
      ).validate!
    end

    assert_match(/bluetape4k-aws-bom/, error.message)
  end
end
