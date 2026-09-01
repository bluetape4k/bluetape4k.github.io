require "minitest/autorun"
require "pathname"
require "tmpdir"

require_relative "testcontainers_image_contract"

class TestcontainersImageContractTest < Minitest::Test
  REPOSITORY_ROOT = Pathname.new(
    ENV.fetch("BLUETAPE4K_GRAPH_ROOT", File.expand_path("../../../..", __dir__)),
  ).freeze
  CATALOG_PATH = Pathname.new(
    ENV.fetch(
      "BLUETAPE4K_CATALOG_PATH",
      File.expand_path("../../../bluetape4k-dependencies/gradle/libs.versions.toml", REPOSITORY_ROOT),
    ),
  ).freeze

  def validator
    TestcontainersImageContract::Validator.new(
      repository_root: REPOSITORY_ROOT,
      catalog_path: CATALOG_PATH,
    )
  end

  def test_current_repository_satisfies_the_image_and_documentation_contract
    assert_empty validator.errors
  end

  def test_missing_catalog_is_reported_fail_closed
    errors = TestcontainersImageContract::Validator.new(
      repository_root: REPOSITORY_ROOT,
      catalog_path: REPOSITORY_ROOT.join("missing-catalog.toml"),
    ).errors
    assert errors.any? { |error| error.include?("central catalog not found") }, errors.join("\n")
  end

  def test_readme_bom_version_follows_the_stable_catalog
    with_readme_repository("2.0.0") do |repository_root|
      errors = readme_errors(repository_root, "2.0.0")

      assert_empty errors
    end
  end

  def test_readme_bom_version_rejects_snapshot_drift
    with_readme_repository("2.0.0-SNAPSHOT") do |repository_root|
      errors = readme_errors(repository_root, "2.0.0")

      assert_equal 2, errors.count { |error| error.include?("is missing catalog bluetape4k-bom 2.0.0") }
    end
  end

  def test_catalog_accepts_snapshot_semantic_version
    assert_empty catalog_errors("2.1.0-SNAPSHOT")
  end

  def test_catalog_rejects_non_semantic_bom_version
    errors = catalog_errors("release-head")

    assert errors.any? { |error| error.include?("must be a semantic version") }, errors.join("\n")
  end

  private

  def with_readme_repository(bom_version)
    Dir.mktmpdir do |directory|
      required_lines = TestcontainersImageContract::EXPECTED_IMAGES.values.map do |image|
        "`#{image.fetch(:reference)}`"
      end
      required_lines.concat(TestcontainersImageContract::EXPECTED_DOCUMENT_TOKENS)
      required_lines << bom_version
      %w[README.md README.ko.md].each do |name|
        File.write(File.join(directory, name), required_lines.join("\n"))
      end
      yield directory
    end
  end

  def readme_errors(repository_root, bom_version)
    validator = TestcontainersImageContract::Validator.allocate
    validator.instance_variable_set(:@repository_root, repository_root)
    validator.send(:validate_readmes, bom_version)
  end

  def catalog_errors(bom_version)
    versions = TestcontainersImageContract::EXPECTED_CATALOG_VERSIONS.merge(
      "bluetape4k-bom" => bom_version,
    )
    contents = versions.map { |key, value| %(#{key} = "#{value}") }.join("\n")
    validator = TestcontainersImageContract::Validator.allocate
    validator.send(:validate_catalog, contents)
  end
end
