#!/usr/bin/env ruby

require "json"
require "optparse"
require_relative "manual_contract"

paths = {}
OptionParser.new do |parser|
  parser.on("--code-root PATH", "source repository checkout") { |value| paths[:code_root] = value }
  parser.on("--root PATH", "alias for --code-root") { |value| paths[:code_root] = value }
  parser.on("--manual-root PATH", "central manual checkout") { |value| paths[:manual_root] = value }
  parser.on("--inventory PATH", "module inventory JSON") { |value| paths[:inventory] = value }
  parser.on("--manifest PATH", "manual manifest YAML") { |value| paths[:manifest] = value }
end.parse!

repository_root = File.expand_path(paths.fetch(:code_root, Dir.pwd))
manual_root = File.expand_path(paths.fetch(:manual_root, File.join(repository_root, "docs/manual")))
inventory_path = File.expand_path(paths.fetch(:inventory, ARGV.fetch(0, File.join(repository_root, "build/manual/release-module-inventory.json"))), repository_root)
manifest_path = File.expand_path(paths.fetch(:manifest, ARGV.fetch(1, File.join(manual_root, "manifest.yaml"))), repository_root)
expected_release = {
  "ref" => ENV.fetch("MANUAL_RELEASE_REF", "0.3.0"),
  "commit" => ENV.fetch("MANUAL_RELEASE_COMMIT", "978d0490fc438570e7520643aed50e20614772d1"),
}
validator = ManualDocs::Validator.new(
  inventory: JSON.parse(File.read(inventory_path)),
  manifest_path: manifest_path,
  repository_root: repository_root,
  manual_root: manual_root,
  expected_release: expected_release,
  strict: ENV["MANUAL_STRICT"] == "1",
)
abort(validator.errors.join("\n")) unless validator.errors.empty?
mode = ENV["MANUAL_STRICT"] == "1" ? "strict release mode" : "incremental authoring mode"
puts "Manual contract valid (#{mode})."
