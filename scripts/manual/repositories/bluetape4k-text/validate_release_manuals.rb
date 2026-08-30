#!/usr/bin/env ruby

require_relative "manual_contract"
require_relative "release_contract"
require_relative "release_inventory"

default_root = File.expand_path("../../../..", __dir__)
code_root = default_root
manual_root = File.join(default_root, "docs/manual/bluetape4k-text")
manifest = nil
source_root = nil
tag = nil
sha = nil

arguments = ARGV.dup
while (index = arguments.index { |argument| argument.start_with?("--") })
  option = arguments.delete_at(index)
  value = arguments.delete_at(index)
  case option
  when "--root", "--code-root" then code_root = value
  when "--manual-root" then manual_root = value
  when "--manifest" then manifest = value
  when "--source-root" then source_root = value
  when "--tag", "--release" then tag = value
  when "--sha", "--commit" then sha = value
  else abort "unknown option: #{option}"
  end
end
tag ||= arguments.shift || ReleaseInventory::DEFAULT_REF
sha ||= arguments.shift || ReleaseInventory::DEFAULT_SHA
manifest ||= File.join(manual_root, "manifest.yaml")
ReleaseContract.new(root: code_root, tag: tag, expected_sha: sha).validate!
inventory = ReleaseInventory.new(root: code_root, ref: tag, expected_sha: sha).validate!
ManualContract.new(
  root: code_root,
  manifest: manifest,
  manual_root: manual_root,
  source_root: source_root,
  expected_release: { "ref" => tag, "commit" => sha },
).validate!

puts "Strict release manual contract valid: annotated tag #{tag} -> #{sha}; " \
     "#{inventory.fetch('modules').length} modules, #{inventory.fetch('examples').length} examples, " \
     "#{inventory.fetch('evidence').length} evidence files."
