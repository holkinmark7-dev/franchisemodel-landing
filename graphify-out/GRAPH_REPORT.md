# Graph Report - franchisemodel-landing  (2026-07-28)

## Corpus Check
- 9 files · ~5,274 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 22 nodes · 24 edges · 7 communities
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]

## God Nodes (most connected - your core abstractions)
1. `prefersReducedMotion()` - 3 edges
2. `isNarrow()` - 3 edges
3. `asset()` - 3 edges
4. `decideMode()` - 3 edges
5. `Device()` - 2 edges
6. `Props` - 1 edges

## Surprising Connections (you probably didn't know these)
- `decideMode()` --calls--> `prefersReducedMotion()`  [EXTRACTED]
  src/components/Hero.tsx → src/lib/env.ts
- `decideMode()` --calls--> `isNarrow()`  [EXTRACTED]
  src/components/Hero.tsx → src/lib/env.ts
- `Device()` --calls--> `asset()`  [EXTRACTED]
  src/components/Device.tsx → src/lib/env.ts

## Communities (7 total, 0 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.38
Nodes (3): decideMode(), isNarrow(), prefersReducedMotion()

### Community 1 - "Community 1"
Cohesion: 0.47
Nodes (3): Device(), Props, asset()

## Knowledge Gaps
- **1 isolated node(s):** `Props`
  These have ≤1 connection - possible missing edges or undocumented components.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `prefersReducedMotion()` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **Why does `isNarrow()` connect `Community 0` to `Community 1`?**
  _High betweenness centrality (0.004) - this node is a cross-community bridge._
- **What connects `Props` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._