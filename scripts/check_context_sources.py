#!/usr/bin/env python3
"""Deterministic, offline checks for the Harness external source registry."""
from __future__ import annotations

import sys
from pathlib import Path
from urllib.parse import urlparse

import yaml

ROOT = Path(__file__).resolve().parents[1]
REGISTRY = ROOT / "context-sources.yml"
DESIGN_LANGUAGE_REPOSITORY = "https://github.com/hosseinmor/design-language"
DESIGN_LANGUAGE_DISCOVERY = "registry/manifest.generated.json"

REQUIRED = {
    "jobvision_product_knowledge": "current_product_meaning_and_behavior",
    "cando_product_knowledge": "current_product_meaning_and_behavior",
    "design_language": "reusable_design_and_interaction_rules",
    "content_system": "product_language_and_expression_rules",
    "product_walkthrough": "reviewed_experience_evidence_not_product_policy",
    "current_prd": "pm_owned_intended_product_change",
    "current_design_artifact": "designer_owned_selected_experience",
    "other_evidence": "evidence_only",
}


class StrictLoader(yaml.SafeLoader):
    pass


def unique_mapping(loader, node):
    mapping = {}
    for key_node, value_node in node.value:
        key = loader.construct_object(key_node)
        if key in mapping:
            raise ValueError(f"duplicate YAML key: {key}")
        mapping[key] = loader.construct_object(value_node)
    return mapping


StrictLoader.add_constructor(
    yaml.resolver.BaseResolver.DEFAULT_MAPPING_TAG,
    unique_mapping,
)


def check():
    document = yaml.load(REGISTRY.read_text(encoding="utf-8"), Loader=StrictLoader)
    assert isinstance(document, dict) and document.get("schema_version") == "1"

    sources = document.get("sources")
    assert isinstance(sources, dict) and set(sources) == set(REQUIRED), "source set drift"

    for name, expected in REQUIRED.items():
        entry = sources[name]
        assert isinstance(entry, dict) and entry.get("authority") == expected, f"{name}: invalid authority"
        assert isinstance(entry.get("access"), str) and entry["access"], f"{name}: access check missing"
        assert isinstance(entry.get("retrieval"), str) and entry["retrieval"], f"{name}: retrieval missing"
        if "resolution" in entry:
            assert "location" not in entry and "current_repository" not in entry, f"{name}: unknown location guessed"
        else:
            assert isinstance(entry.get("entry_point"), str) and entry["entry_point"], f"{name}: missing entry point"

    for name, scope, hostname in (
        ("jobvision_product_knowledge", "jobvision", "docs-jv.jvoffice.ir"),
        ("cando_product_knowledge", "cando", "docs-cd.jvoffice.ir"),
    ):
        entry = sources[name]
        assert entry.get("product_scope") == scope, f"{name}: incorrect scope"
        url = urlparse(entry["location"])
        assert url.scheme == "https" and url.hostname == hostname, f"{name}: noncanonical location"
        assert entry.get("entry_point") == entry["location"], f"{name}: wrong entry point"

    design_language = sources["design_language"]
    content_system = sources["content_system"]

    for name, entry in (("design_language", design_language), ("content_system", content_system)):
        assert entry.get("current_repository") == DESIGN_LANGUAGE_REPOSITORY, f"{name}: stale repository locator"
        repo = urlparse(entry["current_repository"])
        assert repo.scheme == "https" and repo.hostname == "github.com", f"{name}: invalid repository URL"
        assert entry.get("discovery") == DESIGN_LANGUAGE_DISCOVERY, f"{name}: discovery contract changed"

    assert design_language.get("entry_point") == "AGENTS.md", "design_language: wrong entry point"
    assert content_system.get("entry_point") == "foundations/content/README.md", "content_system: wrong entry point"

    serialized = REGISTRY.read_text(encoding="utf-8")
    assert "hosseinmor/product-knowledge" not in serialized, "stale product-knowledge repository reference"
    assert "karbon-design-language" not in serialized, "unverified proposed repository name must not remain"
    assert "product-content-system" not in serialized, "unverified proposed repository name must not remain"

    print(
        "PASS: context sources schema, authority, product scope, and current "
        "Design Language / Content locators"
    )


if __name__ == "__main__":
    try:
        check()
    except (OSError, yaml.YAMLError, ValueError, AssertionError, TypeError, KeyError) as error:
        print(f"FAIL: {error}", file=sys.stderr)
        sys.exit(1)
