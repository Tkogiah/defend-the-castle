# Art Spec — Defend the Castle (MVP)

## Hex Tile Dimensions (current code)
- HEX_SIZE = 28 (pointy-top axial)
- Hex bounds (native): 49 x 56 px (rounded from 48.5 x 56)
- Recommended working sizes:
  - 2x: 98 x 112 px
  - 3x: 147 x 168 px
- Sprite origin: center of the tile

## Pending Decision
- We may switch to a rounder/isometric-feel board. Hold on final pixel asset production until board/HEX_SIZE is confirmed to avoid rework.

## Safe Area / Padding
- Keep artwork inside the hex outline.
- Avoid overhangs outside 49 x 56 (or scaled equivalent) unless intentional VFX.

## Isometric Look (without changing grid)
- Use top-left lighting and darker lower-right edges for depth.
- Preserve crisp 1px outline if needed for readability.

## Center Hex (Castle)
- Stronger contrast/trim than standard tiles.
- Keep silhouette centered with no overhang.

## Optional Future-Proof Option
- If we switch to HEX_SIZE = 32:
  - Hex bounds approx: 55 x 64 px
  - 64 x 64 sprites can work with slight side margins.
