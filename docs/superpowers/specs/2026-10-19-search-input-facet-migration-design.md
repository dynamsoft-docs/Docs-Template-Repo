# Search Input Facet Migration Design

## Goal

Allow the shared search input to use the configured product facet with
`Crawler-Global-Docs-New` while retaining existing behavior for other indexes.

## Design

- Keep `site.searchIndexName` as the index selector used by
  `_includes/search-input.html`.
- When that index is `Crawler-Global-Docs-New`, use `site.searchFacet` and
  `site.searchFacetValue` for the configured filter and hidden refinement list.
  The current values are `product` and `company`.
- For other indexes in the existing filtered-search branch, keep using the
  `languagues` facet and the current language (or `core`) as its filter value.
- Preserve the FAQ-index exception, no-filter branch, result templates, and
  search interactions.

## Validation

Build the Jekyll site and inspect rendered output using temporary pages with the
global and legacy index values, confirming that both select the intended facet
and filter. Do not modify other existing worktree changes.
