# The Story of the World (SotW)
## Complete Project Documentation
**Version:** 2.0  
**Last Updated:** May 2026  
**Author:** Vincent Dahinden  
**Repository:** https://github.com/VincentDahinden/world-through-time  
**Live URL:** https://world-through-time.vercel.app  

---

# SECTION 1 — PROJECT VISION

## 1.1 Concept

The Story of the World (SotW) is an interactive historical atlas and timeline 
application that allows users to explore world history visually. The core 
differentiator is **simultaneity** — the ability to see what was happening 
across the entire world in any given year.

When a user slides the timeline to 1453, they see:
- The Ottoman Empire conquering Constantinople
- The Aztec Empire at the height of its power
- The Ming Dynasty dealing with the Tumu Crisis
- England embroiled in the Wars of the Roses
- France recovering from the Hundred Years War

## 1.2 The Killer Features

**The World in [Year]** — zoom out and floating cards appear over each entity's 
territory showing the current ruler, coat of arms and headline event. Hover to 
expand with portrait, dynasty and top event.

**The Year Snapshot** — freeze the timeline at any year and see a beautifully 
presented summary of everything happening across the world at that moment. 
Shareable as an image. This is the viral mechanic and the product differentiator.

## 1.3 Target Audience

**Primary:** History enthusiasts globally  
**Secondary:** Secondary and university students  
**Tertiary:** Teachers  
**Long term:** Media, museums, documentary makers  

## 1.4 Commercial Model

**Freemium B2C:**
- **Free tier** — full map, current period, all entities and events
- **Pro tier £6/month or £50/year** — ruler portraits, coats of arms, historical 
  quotes, territory borders, story mode, full 0 AD–present, year snapshot export

---

# SECTION 2 — TECHNOLOGY STACK

| Layer | Tool | Why |
|---|---|---|
| Frontend framework | React + Vite | Industry standard |
| Map engine | MapLibre GL | Free, powerful, no usage limits |
| Map wrapper | react-map-gl | Reduces MapLibre complexity |
| Map tiles | MapTiler (Aquarelle style) | Beautiful watercolour aesthetic |
| Database | Supabase (PostgreSQL) | Free tier, visual table editor |
| Hosting | Vercel | Free, auto-deploys from GitHub |
| Version control | GitHub | Industry standard |
| AI coding tool | Cursor | Founder writes almost no code |

## 2.1 Environment Variables

Required in `.env` file (never commit):

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_MAPTILER_API_KEY=your-maptiler-key
```

Same variables must be added to Vercel Environment Variables.

## 2.2 Project File Structure

```
world-through-time/
├── src/
│   ├── components/
│   │   ├── WorldMap.jsx        ← Map, markers, clustering, arcs, coat of arms
│   │   ├── Timeline.jsx        ← Year slider, play button, speed controls
│   │   ├── DetailsPanel.jsx    ← Event details, ruler, dynasty timeline, biography
│   │   ├── CategoryFilter.jsx  ← Category toggle buttons
│   │   ├── EntityFilter.jsx    ← Civilisation toggle buttons
│   │   ├── AmbientAudio.jsx    ← Dynasty-based ambient music system
│   │   ├── NotableFigures.jsx  ← Notable people panel
│   │   └── WorldSnapshot.jsx   ← Floating territory cards (zoom < 3)
│   ├── pages/
│   │   └── Admin.jsx           ← Password-protected data entry interface
│   ├── lib/
│   │   └── supabase.js         ← Supabase client connection
│   ├── App.jsx                 ← Main component, global state
│   ├── main.jsx                ← Entry point, React Router setup
│   └── index.css               ← Global styles, font imports
├── public/
│   └── audio/                  ← Dynasty MP3 files for ambient audio
├── .env                        ← Secret keys (never commit)
├── .gitignore
├── vercel.json
├── DOCUMENTATION.md
├── package.json
└── vite.config.js
```

---

# SECTION 3 — DATABASE SCHEMA

## 3.1 Overview

The database lives in Supabase (PostgreSQL). It has 6 core tables:
- `entities` — the civilisations
- `rulers` — all rulers across all entities
- `events` — all historical events
- `cities` — key cities with historical name variants
- `notable_people` — important historical figures (non-rulers)

## 3.2 Complete Schema SQL

```sql
-- ENTITIES
CREATE TABLE entities (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  short_name    TEXT,
  colour        TEXT,
  region        TEXT,
  successor_of  INTEGER REFERENCES entities(id),
  coat_of_arms_url TEXT,
  territory_lat NUMERIC(9,6),
  territory_lng NUMERIC(9,6),
  notes         TEXT
);

-- RULERS
CREATE TABLE rulers (
  id              SERIAL PRIMARY KEY,
  entity_id       INTEGER NOT NULL REFERENCES entities(id),
  name            TEXT NOT NULL,
  reign_start     INTEGER NOT NULL,
  reign_end       INTEGER NOT NULL,
  status          TEXT NOT NULL DEFAULT 'confirmed'
                  CHECK (status IN ('confirmed', 'disputed')),
  title           TEXT,
  dynasty         TEXT,
  notes           TEXT,
  wikipedia_url   TEXT,
  portrait_url    TEXT,
  coat_of_arms_url TEXT,
  biography       TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- EVENTS
CREATE TABLE events (
  id              SERIAL PRIMARY KEY,
  entity_id       INTEGER REFERENCES entities(id),
  entity_id_2     INTEGER REFERENCES entities(id),
  title           TEXT NOT NULL,
  year            INTEGER NOT NULL,
  year_end        INTEGER,
  category        TEXT NOT NULL CHECK (category IN (
                    'Governance & Law', 'Military & Conflict',
                    'Built Environment', 'Religion & Belief',
                    'Economy & Trade', 'Society & Demographics',
                    'Science & Knowledge', 'Culture & Arts',
                    'Power & Succession', 'Environment & Ecology',
                    'Collapse & Transformation'
                  )),
  subtype         TEXT,
  latitude        NUMERIC(9,6),
  longitude       NUMERIC(9,6),
  latitude_2      NUMERIC(9,6),
  longitude_2     NUMERIC(9,6),
  location_name   TEXT,
  description     TEXT,
  quote           TEXT,
  quote_attribution TEXT,
  image_url       TEXT,
  significance    TEXT CHECK (significance IN ('major', 'moderate', 'minor')),
  status          TEXT NOT NULL DEFAULT 'confirmed'
                  CHECK (status IN ('confirmed', 'debated', 'contested')),
  wikipedia_url   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- CITIES
CREATE TABLE cities (
  id              SERIAL PRIMARY KEY,
  modern_name     TEXT NOT NULL,
  historical_name TEXT,
  entity_id       INTEGER REFERENCES entities(id),
  city_type       TEXT CHECK (city_type IN (
                    'capital', 'major_city', 'port', 'religious_centre',
                    'fortress', 'trade_hub'
                  )),
  latitude        NUMERIC(9,6) NOT NULL,
  longitude       NUMERIC(9,6) NOT NULL,
  active_from     INTEGER,
  active_to       INTEGER,
  description     TEXT,
  wikipedia_url   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- NOTABLE PEOPLE
CREATE TABLE notable_people (
  id              SERIAL PRIMARY KEY,
  entity_id       INTEGER REFERENCES entities(id),
  name            TEXT NOT NULL,
  birth_year      INTEGER,
  death_year      INTEGER,
  active_from     INTEGER,
  active_to       INTEGER,
  category        TEXT CHECK (category IN (
                    'Governance & Law', 'Military & Conflict',
                    'Built Environment', 'Religion & Belief',
                    'Economy & Trade', 'Society & Demographics',
                    'Science & Knowledge', 'Culture & Arts',
                    'Power & Succession', 'Environment & Ecology',
                    'Collapse & Transformation'
                  )),
  title           TEXT,
  description     TEXT,
  portrait_url    TEXT,
  wikipedia_url   TEXT,
  latitude        NUMERIC(9,6),
  longitude       NUMERIC(9,6),
  location_name   TEXT,
  significance    TEXT CHECK (significance IN ('major', 'moderate', 'minor')),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

## 3.3 Key Design Decisions

**`entity_id_2` and `latitude_2/longitude_2` on events:**
For animated arcs between entities. Arc draws from `latitude_2/longitude_2` 
(origin) to `latitude/longitude` (event location). For Military & Conflict 
events without `latitude_2`, the arc auto-draws from the entity's 
`territory_lat/territory_lng`.

**`dynasty` on rulers:**
Maps directly to audio filename. `House of Tudor` → `house-of-tudor.mp3`.
Also drives the dynastic timeline bar in the details panel.

**`biography` on rulers:**
~150 word biography displayed in an expandable floating panel.

**`coat_of_arms_url` on rulers:**
Per-dynasty coat of arms. Displayed in ruler box and as floating map marker.

**`active_from/active_to` on notable_people:**
When the person was professionally active (first major work to last), 
not birth/death dates.

**Point events show for 1 year:**
Events without `year_end` show for current year + 1 year only.

---

# SECTION 4 — ENTITIES

## 4.1 Current Entities (10)

| ID | Name | Short Name | Colour | Region | Territory Coords |
|---|---|---|---|---|---|
| 1 | Ottoman Empire | Ottoman | #C0622A | Middle East/Balkans | 41.0, 29.0 |
| 2 | Ming Dynasty | Ming | #3A6FA8 | East Asia | 39.9, 116.4 |
| 3 | Crown of Castile/Spain | Castile | #8A4CAF | Western Europe | 40.4, -3.7 |
| 4 | Aztec Empire | Aztec | #2A9A4A | Mesoamerica | 19.4, -99.1 |
| 5 | New Spain | New Spain | #A07830 | Mesoamerica | 19.4, -99.1 |
| 6 | Kingdom of England | England | #9B1B30 | Western Europe | 52.8, -1.8 |
| 7 | Kingdom of France | France | #1B4B8A | Western Europe | 46.8, 2.3 |
| 8 | Safavid Empire | Persia | #00827F | Middle East/Central Asia | 32.4, 53.7 |
| 9 | Roman Britain | Rome/Britain | #6B2D8B | Western Europe | 52.5, -1.5 |
| 10 | Anglo-Saxon England | Anglo-Saxon | #B8860B | Western Europe | 54.5, -1.5 |

---

# SECTION 5 — FEATURES BUILT (V2.0)

## 5.1 Map Features

**Event markers** — emoji icons by category, clustered at low zoom  
**City labels** — appear at zoom > 4, show historical names  
**Animated arcs** — Military & Conflict events draw animated arcs from origin to battle location  
**Coat of arms markers** — floating over entity territory at zoom > 3  
**WorldSnapshot cards** — floating cards over territory at zoom < 3, showing ruler + coat of arms, expandable on hover  

## 5.2 Details Panel (on event click)

Left to right:
1. **Ruler column** — entity colour dot, ruler box (coat of arms, name with ‹ › navigation arrows, title, dynasty, biography button, dynastic timeline bar, Notable Figures button)
2. **Portrait** — ruler portrait photo
3. **Event details** — category, status badge, title, year, location, event image
4. **Description** — full event text, silence narrator button, Wikipedia link

## 5.3 Biography Panel

Floating panel (top-left of map area) showing ~150 word ruler biography.
Opens on clicking "▼ Biography" button in ruler box. Closeable with ✕.

## 5.4 Notable Figures Panel

Floating panel showing historically active people at current year.
Grouped by category. Click name to see portrait + biography.
Opens on clicking "✦ Notable Figures" button in ruler box.

## 5.5 Ruler Navigation Arrows

‹ and › arrows in ruler box navigate to previous/next ruler.
Changes timeline year automatically to ruler's reign period.

## 5.6 Ambient Audio System

Dynasty-based music system. When event clicked:
1. Looks up current ruler for that entity at `currentYear`
2. Reads `dynasty` field
3. Converts to filename: `House of Tudor` → `house-of-tudor.mp3`
4. Plays from `/public/audio/`
5. Ducks volume to 8% during narration, restores after

**Audio files needed** (drop in `public/audio/`):
- `house-of-normandy.mp3` ✅
- `house-of-tudor.mp3` (needs re-encoding)
- `house-of-plantagenet.mp3` (needs re-encoding)
- `house-of-lancaster.mp3` (needs re-encoding)
- `house-of-york.mp3` (needs re-encoding)
- `house-of-blois.mp3` (needs re-encoding)
- All other dynasties TBD

**Known issue:** Some MP3 files fail with `NotSupportedError` in Chrome due to 
encoding format. Files need to be re-encoded at 128kbps standard MP3.
Working solution: use mp3smaller.com and verify file plays at 
`http://localhost:5173/audio/filename.mp3` before use.

## 5.7 Event Narration

Browser text-to-speech reads event description automatically on event click.
Prefers Daniel/Google UK English Male/Arthur voice if available.
🔇 Silence button appears during narration.

## 5.8 WorldSnapshot (zoom < 3)

Floating cards appear over each entity's territory when zoomed out:
- **Collapsed:** coat of arms + entity name + ruler name
- **Hover expanded:** portrait (48px circle), ruler name (16px), title (13px), 
  top event (13px italic)
- Cards bring to front on hover (zIndex: 9999)
- Updates automatically as timeline moves

---

# SECTION 6 — DATA STATUS (May 2026)

## 6.1 Database Record Counts

| Table | Records |
|---|---|
| Entities | 10 |
| Rulers | ~220 |
| Events | ~650 |
| Cities | ~75 |
| Notable People | 30 (England only) |

## 6.2 Entity Data Completeness

| Entity | Rulers | Events | Portraits | Coat of Arms | Cities | Bios | Notable People |
|---|---|---|---|---|---|---|---|
| Kingdom of England | ✅ Complete 1066–1600 | ✅ ~221 | ✅ All | ✅ All | ✅ | ✅ | ✅ 30 |
| Kingdom of France | ✅ Complete 1066–1610 | ✅ ~110 | ✅ All | ✅ All | ✅ | ✅ | ❌ |
| Ottoman Empire | ✅ Partial | ✅ ~37 | ❌ | ❌ | ✅ | ❌ | ❌ |
| Ming Dynasty | ✅ Partial | ✅ ~32 | ❌ | ❌ | ✅ | ❌ | ❌ |
| Crown of Castile | ✅ Partial | ✅ ~52 | ❌ | ❌ | ✅ | ❌ | ❌ |
| Aztec Empire | ✅ Partial | ✅ ~29 | ❌ | ❌ | ✅ | ❌ | ❌ |
| New Spain | ✅ Partial | ✅ ~30 | ❌ | ❌ | ✅ | ❌ | ❌ |
| Safavid Empire | ✅ Partial | ✅ ~30 | ❌ | ❌ | ✅ | ❌ | ❌ |
| Roman Britain | ✅ Partial | ✅ ~32 | ❌ | ❌ | ✅ | ❌ | ❌ |
| Anglo-Saxon England | ✅ Partial | ✅ ~32 | ❌ | ❌ | ✅ | ❌ | ❌ |

## 6.3 Timeline Range

**43 AD to 1815** (dynamic — calculated from min/max event years)

---

# SECTION 7 — AMBIENT AUDIO SYSTEM

## 7.1 Dynasty-to-Filename Convention

The `dynastyToFilename()` function converts dynasty names to MP3 filenames:
- Lowercase
- Spaces → hyphens
- Remove special characters (accents etc)
- Add `.mp3`

Examples:
- `House of Normandy` → `house-of-normandy.mp3`
- `House of Tudor` → `house-of-tudor.mp3`
- `House of Osman` → `house-of-osman.mp3`
- `House of Zhu` → `house-of-zhu.mp3`
- `Safavid Dynasty` → `safavid-dynasty.mp3`
- `Aztec Reign` → `aztec-reign.mp3`

## 7.2 Full Dynasty Audio File List

| Dynasty | File | Status |
|---|---|---|
| House of Wessex | house-of-wessex.mp3 | ❌ |
| House of Denmark | house-of-denmark.mp3 | ❌ |
| House of Godwin | house-of-godwin.mp3 | ❌ |
| House of Normandy | house-of-normandy.mp3 | ✅ |
| House of Blois | house-of-blois.mp3 | ⚠️ encoding issue |
| House of Plantagenet | house-of-plantagenet.mp3 | ⚠️ encoding issue |
| House of Lancaster | house-of-lancaster.mp3 | ⚠️ encoding issue |
| House of York | house-of-york.mp3 | ⚠️ encoding issue |
| House of Tudor | house-of-tudor.mp3 | ⚠️ encoding issue |
| House of Capet | house-of-capet.mp3 | ❌ |
| House of Valois | house-of-valois.mp3 | ❌ |
| House of Bourbon | house-of-bourbon.mp3 | ❌ |
| House of Osman | house-of-osman.mp3 | ❌ |
| House of Zhu | house-of-zhu.mp3 | ❌ |
| House of Trastamara | house-of-trastamara.mp3 | ❌ |
| House of Habsburg | house-of-habsburg.mp3 | ❌ |
| Aztec Reign | aztec-reign.mp3 | ❌ |
| Safavid Dynasty | safavid-dynasty.mp3 | ❌ |

**Source:** incompetech.com (Kevin MacLeod, CC BY 3.0) or musopen.org  
**Format:** Standard MP3 128kbps  
**Test:** File must play at `http://localhost:5173/audio/filename.mp3`

---

# SECTION 8 — NOTABLE PEOPLE SYSTEM

## 8.1 Table Structure

`notable_people` table with: name, birth/death years, active_from/active_to, 
category, title, description, portrait_url, wikipedia_url, lat/lng, significance.

## 8.2 Display Logic

- Shown in **Notable Figures** panel (accessible from ruler box)
- Filtered by `active_from <= currentYear <= active_to`
- Grouped by category with category icons
- Click name → portrait + biography + Wikipedia link
- No map markers (removed for cleanliness)

## 8.3 Current Coverage

England 1066–1600: 30 people with portraits and biographies
All other entities: ❌ not yet populated

---

# SECTION 9 — NEXT PRIORITIES

## 9.1 Immediate (Data)

1. **Ottoman Empire** — rulers (portraits, coat of arms, biographies), events top-up
2. **Ming Dynasty** — same
3. **Crown of Castile** — same  
4. **Aztec Empire** — same
5. **Safavid Empire** — same
6. **Roman Britain / Anglo-Saxon** — same
7. **Audio encoding fix** — re-encode MP3 files at 128kbps standard

## 9.2 Features (V2.0)

| Feature | Description | Priority |
|---|---|---|
| Year Snapshot | Shareable image of world in any year | Critical |
| Territory borders | GeoJSON polygons per kingdom per period | High |
| Ruler portraits — all entities | Add portrait URLs to remaining entities | High |
| Coat of arms — all entities | Add per dynasty for remaining entities | High |
| Notable people — all entities | Expand beyond England | Medium |
| Story mode | Guided narrative playback | Medium |
| AI narrative | Claude-generated year summary | Medium |
| Event images | Add Wikimedia images to major events | Low |

## 9.3 Data Expansion Plan

| Phase | Content |
|---|---|
| Now | Complete Ottoman, Ming, Castile, Aztec, Safavid, Roman, Anglo-Saxon |
| V2 | Add Portugal, Holy Roman Empire, Mughal India |
| V3 | Medieval period 500–1066 for European entities |
| V3 | Modern period 1600–1900 |
| V4 | 20th century |
| Long term | Full world history 3000 BC–present |

---

# SECTION 10 — COMPONENT REFERENCE

## 10.1 App.jsx — Global State

```jsx
const [currentYear, setCurrentYear] = useState(1500)
const [selectedEvent, setSelectedEvent] = useState(null)
const [selectedCategories, setSelectedCategories] = useState(ALL_CATEGORIES)
const [selectedEntities, setSelectedEntities] = useState(ALL_ENTITIES)
const [yearRange, setYearRange] = useState({ min: 43, max: 1815 })
```

Props passed down:
- `DetailsPanel` receives: `selectedEvent`, `currentYear`, `onYearChange={setCurrentYear}`, `onEventSelect={setSelectedEvent}`
- `WorldMap` receives: `currentYear`, `selectedCategories`, `selectedEntities`, `onEventSelect`, `selectedEvent`
- `AmbientAudio` receives: `currentYear`, `selectedEvent`

## 10.2 WorldMap.jsx — Key Features

- Fetches events, cities, entityRulers, WorldSnapshot data
- `clusterEvents()` — groups nearby events at low zoom
- `arcGeoJSON` useMemo — generates curved arc for Military events
- Arc auto-uses `territory_lat/lng` if `latitude_2` not set
- Event display duration: `year - 1` to `year` (point events show 1 year)
- Zoom > 3: shows ruler name/dates floating marker
- Zoom < 3: shows WorldSnapshot territory cards

## 10.3 DetailsPanel.jsx — Key Features

- `useCurrentRuler(entityId, currentYear)` — Supabase query for ruler at year
- `useEntityRulers(entityId)` — all rulers for dynasty timeline
- `BiographyToggle` — expandable biography floating panel
- `DynasticTimeline` — visual bar showing dynasty rulers
- `NotableFigures` — notable people panel component
- Ruler navigation: ‹ prev (reign_end) / › next (reign_start + 1)
- Speech synthesis narration on event select

## 10.4 AmbientAudio.jsx — Key Features

- `dynastyToFilename(dynasty)` — converts dynasty name to MP3 filename
- Two Audio elements for crossfading (2.5 second fade)
- Auto-starts on event click (requires user interaction first)
- Listens for `narration` custom event to duck volume to 8%
- ▶ Ambience / ⏸ Silence toggle button (bottom right)
- 🎵 ▼ expand panel shows track info and volume slider

## 10.5 WorldSnapshot.jsx — Key Features

- Renders inside `<Map>` component as MapLibre Markers
- Visible when `viewState.zoom < 3`
- Fetches rulers + entities(territory_lat, territory_lng) + top event
- Collapsed: coat of arms (20px) + entity short name + ruler name
- Hover expanded: portrait circle (48px) + ruler (16px bold) + title (13px) + event (13px italic)
- `zIndex: 9999` on hover to bring above other cards

## 10.6 NotableFigures.jsx — Key Features

- Triggered by "✦ Notable Figures" button in DetailsPanel ruler box
- Fetches `notable_people` where `active_from <= currentYear <= active_to`
- Groups by category
- Click person → shows portrait + biography + Wikipedia link
- Floating panel at `top: 410, left: 20`
- Resets on year change

---

# SECTION 11 — KNOWN ISSUES

| Issue | Status | Fix |
|---|---|---|
| MP3 encoding — Chrome NotSupportedError | Active | Re-encode at 128kbps standard MP3 |
| Ruler navigation — successor arrow needs +1 | Fixed | `reign_start + 1` |
| PGRST201 — multiple FK to entities | Fixed | Use `entities!events_entity_id_fkey` |
| Duplicate events | Fixed | Cleaned up via SQL |
| WorldSnapshot import in WorldMap | Fixed | Renders inside Map component |

---

# SECTION 12 — KEY DECISIONS LOG

| Decision | Choice | Reasoning |
|---|---|---|
| Audio trigger | Event click, not manual | More natural, uses user interaction for autoplay |
| Audio mapping | Dynasty → filename | Self-documenting, no code changes to add tracks |
| Arc origin | Auto from territory if no lat_2 | Works for all military events without data entry |
| Event display duration | 1 year (was 3) | Cleaner map, less clutter |
| Notable people display | Panel only, no map markers | Map stays clean, panel is more readable |
| Biography | Floating panel, not inline | Doesn't crowd the ruler box |
| Ruler navigation | ‹ › arrows in ruler box | Intuitive, doesn't require clicking map |
| WorldSnapshot | Inside Map component | Required for MapLibre Marker rendering |
| Coat of arms | Per dynasty on rulers table | Consistent with audio system, one source of truth |
| Territory coords | On entities table | Used for both map marker and arc origin fallback |

---

*End of Documentation v2.0*  
*Generated: May 2026*  
*Next update: When Ottoman/Ming/Castile data complete*