# CYB final IP handoff

This package is the formal replacement source for the placeholder IP in miniapp and web prototypes.

## Files

- `cyb-ip-final-source.svg`: transparent vector source for the main stage, floating companion, breathing page, and share-card co-frame image.
- `cyb-ip-final-transparent.png`: transparent bitmap export, 1024 x 1024.
- `cyb-ip-final-states.svg`: 8-state reference board using the frozen state colors.
- `cyb-ip-final-states.png`: bitmap export of the 8-state reference board.

## Frontend rules

- Replace the placeholder IP directly with `cyb-ip-final-source.svg` or the PNG export.
- Keep one shell shape for every page. The shell must not change with persona.
- `yangbaoState` may drive: oxygen-core color, glow strength, bubbles, small expression state, and speech copy.
- `personaState` may drive only identity chips, report cards, badges, share-card identity color, and low-opacity atmosphere.
- CTA stays `#35D6B8`; do not recolor CTA by emotion or persona.

## Frozen 8-state colors

- `oxy-yong`: `#35D6B8`
- `oxy-yun`: `#5AA7FF`
- `oxy-xi`: `#FFB84D`
- `oxy-mi`: `#A78BFA`
- `oxy-ran`: `#FF6B6B`
- `oxy-yu`: `#8B95A7`
- `oxy-ju`: `#FFD166`
- `oxy-ban`: `#7BC96F`
