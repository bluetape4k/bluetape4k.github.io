#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative "release_diagram_contract"

require "optparse"

root = File.expand_path("../../../..", __dir__)
manual_root = File.join(root, "docs/manual/bluetape4k-text")
inventory = File.join(manual_root, "release-diagrams.yaml")
mode = nil
OptionParser.new do |options|
  options.on("--root PATH") { |value| root = value }
  options.on("--code-root PATH") { |value| root = value }
  options.on("--manual-root PATH") { |value| manual_root = value }
  options.on("--inventory PATH") { |value| inventory = value }
  options.on("--write") { mode = "write" }
  options.on("--check") { mode = "check" }
end.parse!(ARGV)
contract = ReleaseDiagrams::Contract.new(root: root, manual_root: manual_root, inventory_path: inventory)

begin
  case mode
  when "write"
    contract.sync!
    puts "release-diagrams: linked entries=#{contract.entries.size} release=#{contract.release_ref} commit=#{contract.release_commit}"
  when "check"
    failures = contract.errors
    if failures.empty?
      puts "release-diagrams: failures=0 entries=#{contract.entries.size} release=#{contract.release_ref}"
    else
      warn failures.join("\n")
      exit 1
    end
  else
    warn "usage: sync_release_diagrams.rb --write|--check"
    exit 2
  end
rescue ReleaseDiagrams::ContractError => error
  warn error.message
  exit 1
end
