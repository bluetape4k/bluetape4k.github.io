#!/usr/bin/env ruby

require "json"
require "optparse"
require "yaml"
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
inventory_path = File.expand_path(paths.fetch(:inventory, ARGV.fetch(0, File.join(repository_root, "build/manual/module-inventory.json"))), repository_root)
manifest_path = File.expand_path(paths.fetch(:manifest, ARGV.fetch(1, File.join(manual_root, "manifest.yaml"))), repository_root)
inventory = JSON.parse(File.read(inventory_path))
manifest = YAML.safe_load(File.read(manifest_path))
abort("manual manifest must provide releaseRef and releaseCommit") unless manifest.is_a?(Hash)
expected_release = {
  "ref" => manifest.fetch("releaseRef"),
  "commit" => manifest.fetch("releaseCommit"),
}
errors = ManualDocs::Validator.new(
  inventory: inventory,
  manifest_path: manifest_path,
  repository_root: repository_root,
  manual_root: manual_root,
  expected_release: expected_release,
).errors
abort(errors.join("\n")) unless errors.empty?
puts "Manuals are aligned."
