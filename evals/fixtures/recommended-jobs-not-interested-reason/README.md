# Recommended Jobs / Not Interested eval fixture

This directory contains a frozen, eval-only Product context snapshot used by the
Recommended Jobs / Not Interested regression smoke tooling.

The files under `canonical-product-context/` are historical test inputs. They
are intentionally committed here so the eval does not depend on any external or
retired repository layout.

Rules:

- Do not use these files as current Product Knowledge.
- Current JobVision Product Knowledge remains `https://docs-jv.jvoffice.ir/`.
- Preserve the recorded hashes unless the eval is intentionally re-frozen.
- Re-freezing requires explicit review of the current canonical source and the
  regression's expected authority boundaries.
