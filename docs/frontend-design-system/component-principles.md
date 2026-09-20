# Component principles

Primitives live in `components/design-system/primitives.tsx`; product patterns live in `components/design-system/product.tsx`. Product components should compose primitives instead of creating new visual rules.

Technical panels use a border and surface tone. Status tags use semantic state. Primary buttons always describe the next action and keep the RFQ action recognizable. Engineering annotations use an index, a short title, and a decision detail.

The block renderer is the boundary between structured page data and UI. A new content block should add a typed block, an adapter fixture, and a reusable renderer before a page can use it.
