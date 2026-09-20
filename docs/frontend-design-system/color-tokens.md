# Color tokens

Raw palette values live in `tokens/color.css`. Components consume semantic aliases so a future theme change does not require page-level rewrites.

The dominant identity is `--blue-950` / `--blue-900` deep navy. `--blue-500` and `--blue-600` are controlled technical accents; they are not used as decorative gradients. Cool ink values keep dense engineering content readable on white and off-white surfaces.

- `--color-bg-primary`, `--color-bg-secondary`, `--color-bg-inverse` define the canvas.
- `--color-surface-1`, `--color-surface-2`, `--color-surface-raised` define panels.
- `--color-text-*` and `--color-border-*` define hierarchy and structure.
- `--color-action-primary`, `--color-action-hover`, and `--color-action-muted` define the RFQ action family.
- `--color-success`, `--color-warning`, `--color-danger`, and `--color-info` are reserved for system state.
- `--color-engineering`, `--color-manufacturing`, `--color-quality`, and `--color-rfq` categorize technical content.

Do not introduce a raw hex value inside a component without adding a token and recording why it exists.
