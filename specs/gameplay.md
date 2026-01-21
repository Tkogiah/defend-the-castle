# Gameplay Spec (Draft)

## Core Fantasy
Co-op fantasy heroes defend a central castle against waves while building a deck to upgrade abilities.

## Inspirations
- Dominion (deck-building engine)
- Tower defense (wave defense, loss condition)
- Co-op PVE boardgame roots (original 2014 design)

## Map
- Hex grid with 5 rings around a center hex (total 91 hexes)
- Enemies spawn at outer ring and move inward
- Players start at center hex and traverse outward OR INWARD
- Player movement follows a fixed clockwise path (not free movement)
- Flat labeling (pointy-top): A=upper-right (NE), B=right, C=down-right, D=down-left, E=left, F=up-left

## Win/Lose
- Win: defeat the final boss
- Lose: any enemy reaches the center hex
- Knockout: a player is killed by an enemy entering their hex

## Waves
- 10 waves, each with 10 enemies
- Boss at end of each wave

## Economy
- Enemies drop crystals (currency)
- Players return to center hex to spend crystals on cards

## Cards & Gear
- Cards: upgrade abilities and drive the deck engine
- Boss loot: gear grants non-deck abilities (e.g., dragon mounts, speed boots)
- Gear can be traded between players on the same hex

## Turn Structure (Draft)
- Players: play cards, move, attack within range, collect crystals, return to base and buy new cards
- Enemies: move inward a random number of hexes (bounded by min/max per enemy)

## Session Length Target
- Goal: ~60 minutes (boardgame playtests were 2–3 hours due to math overhead)

## View
- 2D isometric (possible future map rotation)
