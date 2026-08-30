#!/usr/bin/env ruby
# frozen_string_literal: true

require "optparse"
require_relative "release_drift"

root = File.expand_path("../../../..", __dir__)
site_root = File.expand_path("../../../..", __dir__)
manual_root = File.join(root, "docs/manual/bluetape4k-image")
tag = "0.4.0"
options = {}
OptionParser.new do |parser|
  parser.banner = "Usage: validate_release_drift.rb [options] [TAG]"
  parser.on("--root PATH", "source/site checkout root") { |value| root = File.expand_path(value) }
  parser.on("--code-root PATH", "alias for --root") { |value| root = File.expand_path(value) }
  parser.on("--site-root PATH", "central manual site checkout root") { |value| site_root = File.expand_path(value) }
  parser.on("--manual-root PATH", "central manual root") { |value| manual_root = File.expand_path(value) }
  parser.on("--manifest PATH", "manual manifest path") { |value| options[:manifest] = File.expand_path(value, root) }
  parser.on("--generated-manifest PATH", "generated manifest path") { |value| options[:generated_manifest] = File.expand_path(value, root) }
  parser.on("--inventory PATH", "release module inventory path") { |value| options[:inventory] = File.expand_path(value, root) }
  parser.on("--tag TAG", "release tag") { |value| tag = value }
end.parse!
tag = ARGV.shift unless ARGV.empty?
abort("unexpected arguments: #{ARGV.join(' ')}") unless ARGV.empty?
contract = ManualDocs::ReleaseDrift.new(
  repository_root: root,
  tag: tag,
  manifest_path: options.fetch(:manifest, File.join(manual_root, "manifest.yaml")),
  generated_manifest_path: options.fetch(:generated_manifest, File.join(manual_root, "generated/manifest.json")),
  index_paths: {
    "en" => File.join(manual_root, "en/index.md"),
    "ko" => File.join(manual_root, "ko/index.md"),
  },
  repository_map_paths: {
    "en" => File.join(manual_root, "en/architecture/repository-map.md"),
    "ko" => File.join(manual_root, "ko/architecture/repository-map.md"),
  },
  diagram_source_path: File.join(site_root, "scripts/manual/repositories/bluetape4k-image/render_image_diagrams.rb"),
  inventory_path: options.fetch(:inventory, File.join(root, "build/manual/release-module-inventory.json")),
)
result = contract.validate
abort(result.errors.join("\n")) unless result.errors.empty?

expected = result.expected
puts "Release drift contract passed: #{expected.fetch(:release_ref)} #{expected.fetch(:release_commit)}; #{expected.fetch(:project_count)} projects (#{expected.fetch(:published_library_count)} libraries, #{expected.fetch(:bom_count)} BOM, #{expected.fetch(:example_count)} examples, #{expected.fetch(:benchmark_count)} benchmark)."
