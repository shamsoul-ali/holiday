# Sabah Map — Implementation Context

Handoff document for porting the Sabah district map from the web dashboard to
the mobile app (or any other surface).

Last updated: 2026-04-17 · web commit `5dc4d6b`.

---

## Where it lives

### Web (reference implementation — already built)
| File | Purpose |
|---|---|
| `apps/web/app/bayu/_components/SabahOccupancy.tsx` | **Main map component** — renders the occupancy heat map on the Overview page |
| `apps/web/app/bayu/(dashboard)/sabah-map/page.tsx` | Debug page at `/bayu/sabah-map` — overlay + polygon gallery + raw SVG |
| `apps/web/app/bayu/_data/sabah-geo.ts` | **Auto-generated** polygon data (35 districts + 5 highlights) |
| `apps/web/app/bayu/_data/sipitang.ts` | Sipitang polygon path (matrix baked in) |
| `apps/web/app/bayu/_data/extract-sabah.js` | Extractor script (node) that regenerates `sabah-geo.ts` |
| `apps/web/app/bayu/_data/stats.ts` | Mock stats — `stats.hotels.districts` has 26 entries |
| `apps/web/public/sabah/municipal.svg` | Copy of raw SVG for the debug backdrop |

### Source SVGs (input)
| File | Notes |
|---|---|
| `apps/bayu-app/Sabah_municipal_map.svg` | **Primary source.** Colored district map (viewBox 794×656, with `transform="translate(0, 358.64)"` on Layer 1). Per-district fills, municipal/city-council tiers. |
| `apps/bayu-app/sipitang.svg` | **Sipitang-only** polygon (standalone). Used because the municipal SVG has Sipitang as outline-only (`fill:none`). Its `<g transform="matrix(4.166666, 0, 0, 4.166666, -878.5, -6753.8)">` is baked into the path during extraction. |
| `apps/bayu-app/Sabah_location_map.svg` | Reference only — useful for coastline/borders but has no per-district fills in the Sabah region. |
| `apps/bayu-app/my.svg` | Full Malaysia outline (not used for the Sabah detail map). |

---

## How the pipeline works

```
Sabah_municipal_map.svg ──► extract-sabah.js ──► sabah-geo.ts
        (+ sipitang.svg) ─► (baked matrix)  ─► sipitang.ts
                                              │
                                              ▼
                     SabahOccupancy.tsx ◄───  GEO_TO_DISTRICT
                                              (hand-mapped)
```

### Extractor logic (`extract-sabah.js`)
1. Parses every `<path>` tag in `Sabah_municipal_map.svg`.
2. Classifies by fill color:
   - `#aaaaff` — Majlis Daerah (district council, 21 of them)
   - `#5555ff` — Majlis Perbandaran (municipal: Tawau, Sandakan, Penampang)
   - `#000055` — Dewan Bandaraya (KK only)
   - `#ffaaaa` — Lembaga Bandaran (Kudat + northern islands)
   - `#b3b3b3` — Sarawak/Brunei grey (outside Sabah, later skipped)
   - `fill:none + stroke:#ff0000` — outline-only polygons (e.g. Sipitang)
3. Computes per-polygon bbox + centroid (adding `TRANSLATE_Y = 358.64` so centroids
   are in rendered coords).
4. Filters to Sabah viewport, sorts by area desc, assigns IDs `d0, d1, …`.
5. Keeps `#ffaaaa` polygons in a separate `SABAH_HIGHLIGHTS` array (rendered
   as Kudat).
6. Also emits one-path `SABAH_MAINLAND` (biggest `#808080` land silhouette) as
   a subtle base layer so unmapped regions still show as land.

### Key constants
```ts
export const SABAH_VIEWBOX = { x: 0, y: 16.9, width: 794, height: 638.1 };
export const SABAH_CONTENT_TRANSLATE_Y = 358.63757;
// Paths are in SOURCE coords. Wrap rendering in
// <g transform={`translate(0, ${SABAH_CONTENT_TRANSLATE_Y})`}>.
```

---

## District mapping (critical reference)

`GEO_TO_DISTRICT` in `SabahOccupancy.tsx` — polygon id → stats district id.
IDs and data updated together in `sabah-geo.ts` + `stats.ts`.

| Geo id | Source fill | District | Notes |
|---|---|---|---|
| d0  | `#aaaaff` | kinabatangan | huge E-center river district |
| d1  | `#aaaaff` | tongod | large center-S |
| d2  | `#aaaaff` | nabawan | large interior-S |
| d3  | `#aaaaff` | lahaddatu | large E-S |
| d4  | `#aaaaff` | beluran | large NE |
| d5  | `#5555ff` | tawau | MP Tawau |
| d6  | `#b3b3b3` | *(skipped)* | Sarawak/Brunei grey landmass — NOT Sabah |
| d7  | `#aaaaff` | ranau | interior N (Mt Kinabalu) |
| d8  | `#aaaaff` | keningau | interior center |
| d9  | `#5555ff` | sandakan | MP Sandakan |
| d10 | `#aaaaff` | tenom | SW interior |
| d11 | `#aaaaff` | telupid | E interior |
| d12 | `#aaaaff` | beaufort | W coast south |
| d13 | `#aaaaff` | kotamarudu | N |
| d14 | `#aaaaff` | pitas | far N |
| d15 | `#aaaaff` | kotabelud | NW coast |
| d16 | `#aaaaff` | papar | W coast south |
| d17 | `#aaaaff` | kunak | SE coast |
| d18 | `#aaaaff` | tambunan | interior |
| d19 | `#aaaaff` | tuaran | NW coast |
| d20 | *outline* | *(skipped)* | Old Sipitang red-outline — replaced by sipitang.svg |
| d21 | `#aaaaff` | semporna | far SE |
| d22 | `#aaaaff` | kualapenyu | SW coast peninsula |
| d23 | `#5555ff` | penampang | MP Penampang |
| d24 | `#000055` | **kk** | Kota Kinabalu (DBKK) — **capital**, distinct gold fill |
| d25 | `#aaaaff` | semporna | secondary Semporna sub-polygon |
| d26 | `#aaaaff` | tawau | secondary Tawau sub-polygon |
| d27 | `#aaaaff` | pitas | secondary Pitas sub-polygon |
| d28 | `#aaaaff` | tawau | tertiary Tawau sub-polygon |
| d29 | `#aaaaff` | *(skipped)* | legend artifact |
| d30 | `#aaaaff` | *(skipped)* | legend artifact |
| d31 | `#aaaaff` | semporna | tertiary Semporna sub-polygon |
| d32 | `#aaaaff` | beluran | secondary Beluran sub-polygon |
| d33 | `#aaaaff` | sandakan | secondary Sandakan sub-polygon |
| d34 | `#aaaaff` | putatan | |
| h0–h3 | `#ffaaaa` | **kudat** | All 5 highlight polygons = Kudat (admin + Banggi) |
| h4 | `#ffaaaa` | *(skipped)* | legend artifact |
| synthetic | sipitang.svg | **sipitang** | Imported separately, see below |

`SKIP_POLYGONS = {'d6','d20','d29','d30','h4'}` — hidden on render.

`CAPITAL_GEO_ID = 'd24'` — gets special gold fill + pulsing star + "CAPITAL" badge.

`HIGHLIGHTS_DISTRICT_ID = 'kudat'` — all `SABAH_HIGHLIGHTS` render with Kudat's data.

---

## The Sipitang exception

Sipitang is drawn as **outline-only** in the municipal SVG (`fill:none`,
`stroke:#ff0000`) — no fill polygon. A dedicated `sipitang.svg` has a proper
filled polygon in native coords `2481 × 3508` with a matrix transform:

```
matrix(4.166666, 0, 0, 4.166666, -878.502, -6753.800)
```

The extractor bakes this matrix into every coordinate, producing a path with
bbox `(431, 189)` → `(1675, 3213)` in matrix-applied coords.

To position it inside the Sabah map, `SabahOccupancy.tsx` applies a wrapper
transform computed from a target bbox:

```ts
const SIPITANG_TRANSFORM = (() => {
  const nativeMinX = 431, nativeMinY = 189;
  const nativeW = 1243;      // baked bbox width
  const targetTLX = 84;      // source x where Sipitang's left edge sits
  const targetTLY = 82.5;    // source y where Sipitang's top edge sits
  const targetW = 78;        // rendered width (aspect preserved → height ≈ 190)
  const scale = targetW / nativeW;
  const tx = targetTLX - nativeMinX * scale;
  const ty = targetTLY - nativeMinY * scale;
  return `translate(${tx}, ${ty}) scale(${scale})`;
})();
```

After the global `translate(0, 358.64)` content wrapper, Sipitang renders at
roughly rendered coords `x 84–162, y 441–631`, butting against Beaufort (north)
and Tenom (east).

Label in source coords: `(118, 170)` — shows "45%" / "Sipitang" above the
polygon.

Hover uses a synthetic id `sipitang-synth` instead of a geo id.

---

## Color + occupancy scale

```ts
function occupancyColor(pct) {
  const t = pct / 100;
  if (t < 0.5)  return mix('#12253F', '#2EAFE8', t * 2);        // dark navy → sky
  if (t < 0.8)  return mix('#2EAFE8', '#F7B731', (t-0.5)/0.3);  // sky → gold
  return          mix('#F7B731', '#F5362F', (t-0.8)/0.2);       // gold → red
}
```

Anything ≥ 90% gets a `hotGlow` blur filter. Capital (KK) ignores occupancy
and uses solid gold `#F7B731` regardless.

---

## Overlays on top of the map

Hand-positioned markers in source coords (see `AIRPORTS` and `ISLANDS` arrays
at the top of `SabahOccupancy.tsx`):

- **Airports (5):** BKI, SDK, TWU, LDU, KUD — pulsing dot + ✈ glyph + code +
  full name. Primary airport (BKI) has a stronger pulse.
- **Islands (4):** Sipidan, Mabul, Banggi, Layang-Layang — dashed halo ring +
  dot + name, positioned offshore.

Districts anchored by an airport marker (kk, sandakan, tawau, lahaddatu,
kudat) skip their polygon label to avoid double-labeling — the airport marker
identifies them.

Label offsets (for tiny polygons whose bbox centroid collides with neighbors):
```ts
const LABEL_OFFSETS = {
  d21: { dx: -8,  dy: -14 }, // KK — pull NW
  d15: { dx:  8,  dy:  10 }, // Penampang — push SE
  d31: { dx: -14, dy:   0 }, // Putatan — west
};
```
*(Note: ids here refer to the older mapping — review against current mapping table above when porting.)*

---

## Porting to the mobile app

Path components in `react-native-svg` mirror web SVG 1:1:
`<Svg>`, `<G transform>`, `<Path d fill stroke>`, `<Circle>`, `<Text>`.

### Minimum viable mobile port
1. Copy `sabah-geo.ts` and `sipitang.ts` into the mobile workspace (pure data,
   zero runtime deps).
2. Port `stats.hotels.districts` (or just the 26 `{id, name, occupancy, rooms}`
   objects you care about) from `stats.ts`.
3. Install `react-native-svg` if not already.
4. Create a `<SabahMap>` component that renders:
   ```tsx
   <Svg viewBox={`${SABAH_VIEWBOX.x} ${SABAH_VIEWBOX.y} ${SABAH_VIEWBOX.width} ${SABAH_VIEWBOX.height}`}>
     <G transform={`translate(0, ${SABAH_CONTENT_TRANSLATE_Y})`}>
       <G>{SABAH_MAINLAND.map(p => <Path d={p.d} fill="#1A3053" opacity={0.55} />)}</G>
       <G transform={SIPITANG_TRANSFORM}>
         <Path d={SIPITANG_PATH} fill={occupancyColor(sipitang.occupancy)} />
       </G>
       <G>
         {[...SABAH_DISTRICTS, ...SABAH_HIGHLIGHTS]
           .filter(g => !SKIP_POLYGONS.has(g.id))
           .map(g => {
             const districtId = GEO_TO_DISTRICT[g.id] ?? HIGHLIGHTS_DISTRICT_ID;
             const district = districtsById[districtId];
             return (
               <Path
                 key={g.id}
                 d={g.d}
                 fill={occupancyColor(district?.occupancy ?? 55)}
                 stroke="#0B1A30"
                 strokeWidth={0.6}
                 onPress={() => onSelect(district)}
               />
             );
           })}
       </G>
     </G>
   </Svg>
   ```

### Things to watch for
- **Transforms as strings** work on `react-native-svg`, but older versions may
  need the transform prop split. Latest versions (13+) accept the string form.
- **Event handling**: use `onPressIn`/`onPress` on `<Path>` — hover doesn't
  exist on mobile.
- **Text labels** need `paintOrder` + `stroke` to be set via separate attrs
  since react-native-svg may not accept CSS-style `style={{ paintOrder }}`.
  Substitute with a second `<Text>` underneath acting as the stroke.
- **Reanimated**: path animations (pulse, dash-offset) can be done via
  `Animated.createAnimatedComponent(Path)` + `useAnimatedProps`.

### Recommended mobile additions
- Pinch-to-zoom around the map (`react-native-gesture-handler` + `Animated`
  on the outer `<G>` scale).
- Long-press to pin a district; bottom-sheet appears with details.
- Use the existing Reanimated stack already in the mobile app — no new deps
  required.

---

## Regenerating `sabah-geo.ts`

```bash
cd apps/web
node app/bayu/_data/extract-sabah.js
```

This re-reads `/Users/hazman/holiday/holiday/apps/bayu-app/Sabah_municipal_map.svg`
and overwrites `sabah-geo.ts`. **Polygon IDs shift if new fills are added** —
always re-audit `GEO_TO_DISTRICT` after a re-extract.

---

## Open questions / known rough edges

- Sipitang is manually positioned with magic numbers — any viewport change
  requires re-tuning `targetTLX / targetTLY / targetW`.
- `SABAH_MAINLAND` base layer covers most of Sabah; its silhouette is the
  biggest `#808080` path and includes non-Sabah land (part of Sarawak/Brunei).
  If this ever looks wrong, switch to a Sabah-only silhouette extracted via
  the coastline layer of the location map.
- Capital detection is a single string (`CAPITAL_GEO_ID = 'd24'`) — moves if
  ordering changes.
