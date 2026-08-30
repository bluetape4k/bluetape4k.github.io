#!/usr/bin/env ruby
# frozen_string_literal: true

require_relative "shared_diagram_contract"

root = File.expand_path("../../../..", __dir__)
manual_root = File.join(root, "docs/manual/bluetape4k-javers")
inventory = File.join(manual_root, "shared-diagrams.yaml")
mode = ARGV.shift
if ARGV.any?
  options = ARGV.each_slice(2).to_h
  root = File.expand_path(options.fetch("--root", options.fetch("--code-root", root)))
  manual_root = File.expand_path(options.fetch("--manual-root", manual_root), root)
  inventory = File.expand_path(options.fetch("--inventory", File.join(manual_root, "shared-diagrams.yaml")), root)
end
contract = SharedDiagrams::Contract.new(root: root, inventory_path: inventory, manual_root: manual_root)

begin
  case mode
  when "--write"
    contract.sync!
    puts "shared-diagrams: linked entries=#{contract.entries.size} selected=#{contract.active_entries.size} deferred=#{contract.entries.count(&:deferred?)} release=#{contract.release_ref} commit=#{contract.release_commit}"
  when "--check"
    failures = contract.errors
    if failures.empty?
      puts "shared-diagrams: failures=0 entries=#{contract.entries.size} selected=#{contract.active_entries.size} deferred=#{contract.entries.count(&:deferred?)} release=#{contract.release_ref}"
    else
      warn failures.join("\n")
      exit 1
    end
  else
    warn "usage: sync_shared_diagrams.rb --write|--check"
    exit 2
  end
rescue SharedDiagrams::ContractError => error
  warn error.message
  exit 1
end
