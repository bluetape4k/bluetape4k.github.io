#!/usr/bin/env ruby

require_relative "release_manual_contract"

site_root = File.expand_path("../../../..", __dir__)
code_root = site_root
manual_root = File.join(site_root, "docs/manual/bluetape4k-dependencies")
manifest = File.join(manual_root, "manifest.yaml")
tag = nil
sha = nil

arguments = ARGV.dup
until arguments.empty?
  option = arguments.shift
  value = arguments.shift
  case option
  when "--root", "--code-root" then code_root = value
  when "--manual-root" then manual_root = value
  when "--manifest" then manifest = value
  when "--source-root" then next
  when "--tag", "--release" then tag = value
  when "--sha", "--commit" then sha = value
  else abort "unknown option: #{option}"
  end
end

abort "--tag and --sha are required" unless tag && sha

DependenciesReleaseManualContract.new(
  code_root: code_root,
  manual_root: manual_root,
  manifest_path: manifest,
  tag: tag,
  sha: sha,
).validate!

puts "Dependencies stable manual contract valid: #{tag} -> #{sha}"
