# Whirlwind Merchant Card — Integration Proposal

Source: Claude (2026‑01‑30). Saved for later reference.

## 1) Data: `src/data/cards.js`
Add one entry to `MERCHANT_CARDS`:

```js
{
  id: 'whirlwind',
  type: 'merchant',
  name: 'Whirlwind',
  cost: 15,
  description: 'Until end of turn, attacks also hit all enemies within range 1 of your hex. Additional Whirlwinds add +1 AoE damage.',
}
```

No new fields needed — effect resolved via a turn‑scoped flag, similar to existing cards.

## 2) State flag: `src/core/state.js`
Add `whirlwindStacks: 0` to `player.turnBonus` and reset it each turn.

```js
turnBonus: {
  range: 0,
  baseMovement: 0,
  baseDamage: 0,
  whirlwindStacks: 0,
}
```

## 3) Core rules: `src/core/rules.js`

### a) `playMerchantCard` switch case
```js
case 'whirlwind':
  // Stackable: each additional card adds +1 AoE damage
  newState = setPlayerTurnBonus(newState, {
    whirlwindStacks: newState.player.turnBonus.whirlwindStacks + 1,
  });
  break;
```

### b) `tryAttackAtHex` AoE block
After the primary attack resolves:
- If `whirlwindStacks > 0`, hit all enemies within axial distance 1 of **player.position** (excluding primary target).
- AoE bonus damage = `whirlwindStacks - 1` (first card enables AoE, additional cards add +1 AoE damage each).
- Use `attackEnemy`/`damageEnemy` consistently so crystal rewards, freeze charges, and boss logic apply naturally.
- Iterate over a snapshot of enemy IDs to avoid mid‑loop removals.

## 4) Files to change (if implemented)
- `src/data/cards.js` — add Whirlwind entry
- `src/core/state.js` — add `whirlwindActive` to turnBonus default/reset
- `src/core/rules.js` — add Whirlwind case + AoE block

No changes to `main.js`, `render/`, `input/`, or `ui/` required.

## 5) Optional UX cues (low priority)
- Log message: “Whirlwind active — attacks cleave nearby enemies.”
- Overlay: ring‑1 highlight around the player during Whirlwind turns (optional).

## 6) Edge cases to confirm
- **Freeze interaction:** recommend each AoE hit consumes a freeze charge if Ice is active.
- **Boss death mid‑loop:** iterate over snapshot list; skip enemies removed after boss death effects.
