# The Story of the World (SotW)
## Complete Project Documentation
**Version:** 1.0  
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

No existing tool presents world history this way — beautifully, narratively, 
and simultaneously across all civilisations.

## 1.2 The Killer Feature

**The Year Snapshot** — freeze the timeline at any year and see a beautifully 
presented summary of everything happening across the world at that moment. 
Shareable as an image. This is the viral mechanic and the product differentiator.

## 1.3 Product Vision Statement

> "The Story of the World is the Wikipedia of world history — but visual, 
> narrative, and interactive. For the first time, anyone can see the whole 
> world as it actually was in any given year."

## 1.4 What Makes It Different from Competitors

| Product | What it does | What it lacks |
|---|---|---|
| Omniatlas | Territorial borders by year | No events, no rulers, no narrative |
| GeaCron | Interactive borders | Visually dated, no storytelling |
| Histography | Timeline of Wikipedia events | No map, no rulers |
| Civilization/CK3 | Historical games | Not educational, not accurate |
| **SotW** | All of the above combined | Nothing like it exists |

## 1.5 Target Audience

**Primary:** History enthusiasts globally — a large, passionate, underserved market
**Secondary:** Secondary and university students
**Tertiary:** Teachers who discover it and share it with students
**Long term:** Media, museums, documentary makers

## 1.6 Commercial Model

**Freemium B2C:**

- **Free tier** — full map, current period (43 AD–1815), all entities and 
  events, timeline and filters. Beautiful enough to share.
- **Pro tier £6/month or £50/year** — ruler portraits, coats of arms, 
  historical quotes, territory borders, story mode, full 0 AD–present, 
  year snapshot export.

**Break-even:** ~1,000–1,300 paying subscribers  
**Target:** 8,000 subscribers = £48,000/month recurring revenue  

## 1.7 Go-to-Market Strategy (No Social Media Required)

1. **SEO** — optimise for "what happened in [year]" searches
2. **YouTube partnerships** — history content creators use SotW as their tool
3. **Reddit** — organic posts in r/history (18m members)
4. **Teacher networks** — TES resources community, organic pull not push
5. **PR** — one article in The Guardian or BBC History Magazine at launch
6. **Hired marketing team** — founder does not need to be on social media

## 1.8 Funding and Team Plan

**Stage 1 — Validate (now–Month 4): ~£5–10k**
- Polish V1 to demo quality
- Launch quietly to history communities
- Measure: return visits, sharing, waitlist signups

**Stage 2 — First Hire (Month 4–8): ~£30–50k**
- One senior full-stack developer (Kosovo or Serbia preferred)
- One part-time content/data researcher

**Stage 3 — Build (Month 8–18): ~£80–120k**
- Senior developer: £2,000–2,500/month
- Junior developer/data researcher: £800–1,200/month
- Part-time historian/content editor: £500–1,000/month
- SEO/content marketer: £1,500–2,000/month
- PR freelancer (one-off): £3,000–5,000

**Total budget available:** £200,000 (self-funded, zero outside capital)  
**Monthly burn at full team:** £6,500–8,000  
**Founder role:** Product owner, editor-in-chief, commercial strategy. 
Not developer, not marketer.

---

# SECTION 2 — TECHNOLOGY STACK

## 2.1 Overview

| Layer | Tool | Why |
|---|---|---|
| Frontend framework | React + Vite | Industry standard, Cursor knows it extremely well |
| Map engine | MapLibre GL | Free, powerful, no usage limits |
| Map wrapper | react-map-gl | Reduces MapLibre complexity significantly |
| Map tiles | MapTiler (Aquarelle style) | Beautiful watercolour historical aesthetic, permanent free tier |
| Database | Supabase (PostgreSQL) | Free tier, visual table editor, no backend needed |
| Hosting | Vercel | Free for this scale, auto-deploys from GitHub |
| Version control | GitHub | Industry standard |
| AI coding tool | Cursor | Founder writes almost no code by hand |
| Design reference | Figma (free tier) | Mood board and reference only |

## 2.2 Why These Choices Were Made

**MapTiler over Stadia Maps:** Stadia Maps had a 14-day trial limitation. 
MapTiler's Aquarelle style is permanent free tier and arguably more beautiful.

**Supabase over flat JSON files:** JSON files cannot be queried efficiently. 
Supabase gives SQL querying, visual table editor, and real-time capabilities 
without needing a backend developer.

**react-map-gl over raw MapLibre:** Raw MapLibre is too complex for a 
non-developer. react-map-gl abstracts the complexity into React components.

**Vercel over other hosts:** Zero configuration, auto-deploys on every 
GitHub push, free at this scale.

## 2.3 Key Dependencies

```json
{
  "react": "^18.x",
  "react-dom": "^18.x",
  "vite": "^5.x",
  "react-map-gl": "^7.x",
  "maplibre-gl": "^4.x",
  "@supabase/supabase-js": "^2.x",
  "react-router-dom": "^6.x"
}
```

## 2.4 Environment Variables

The following environment variables are required in a `.env` file 
(never commit this file to GitHub):

VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_MAPTILER_API_KEY=your-maptiler-key

These same variables must be added to Vercel's Environment Variables 
settings for production deployment.

## 2.5 Project File Structure
world-through-time/
├── src/
│   ├── components/
│   │   ├── WorldMap.jsx        ← Map, markers, clustering
│   │   ├── Timeline.jsx        ← Year slider, play button, speed controls
│   │   ├── DetailsPanel.jsx    ← Event details, ruler, dynasty timeline
│   │   ├── CategoryFilter.jsx  ← Category toggle buttons
│   │   └── EntityFilter.jsx    ← Civilisation toggle buttons
│   ├── pages/
│   │   └── Admin.jsx           ← Password-protected data entry interface
│   ├── lib/
│   │   └── supabase.js         ← Supabase client connection
│   ├── App.jsx                 ← Main component, global state
│   ├── main.jsx                ← Entry point, React Router setup
│   └── index.css               ← Global styles, font imports
├── public/
├── .env                        ← Secret keys (never commit)
├── .gitignore                  ← Includes .env
├── vercel.json                 ← Routing config for React Router
├── DOCUMENTATION.md            ← This file
├── package.json
└── vite.config.js

---

# SECTION 3 — DATABASE SCHEMA

## 3.1 Overview

The database lives in Supabase (PostgreSQL). It has 4 core tables:
- `entities` — the civilisations (Ottoman, Ming, etc.)
- `rulers` — all rulers across all entities
- `events` — all historical events
- `cities` — key cities with historical name variants

Row Level Security (RLS) is enabled on all tables with public read access 
and admin-only write access.

## 3.2 Complete Schema SQL

```sql
-- ============================================================
-- WORLD THROUGH TIME — Supabase Schema v1
-- ============================================================

-- ------------------------------------------------------------
-- 1. ENTITIES
-- ------------------------------------------------------------
CREATE TABLE entities (
  id            SERIAL PRIMARY KEY,
  name          TEXT NOT NULL UNIQUE,
  short_name    TEXT,
  colour        TEXT,
  region        TEXT,
  successor_of  INTEGER REFERENCES entities(id),
  notes         TEXT
);

-- ------------------------------------------------------------
-- 2. RULERS
-- ------------------------------------------------------------
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
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rulers_entity ON rulers(entity_id);
CREATE INDEX idx_rulers_dates  ON rulers(reign_start, reign_end);

-- ------------------------------------------------------------
-- 3. EVENTS
-- ------------------------------------------------------------
CREATE TABLE events (
  id              SERIAL PRIMARY KEY,
  entity_id       INTEGER REFERENCES entities(id),
  entity_id_2     INTEGER REFERENCES entities(id),
  title           TEXT NOT NULL,
  year            INTEGER NOT NULL,
  year_end        INTEGER,
  category        TEXT NOT NULL CHECK (category IN (
                    'Governance & Law',
                    'Military & Conflict',
                    'Built Environment',
                    'Religion & Belief',
                    'Economy & Trade',
                    'Society & Demographics',
                    'Science & Knowledge',
                    'Culture & Arts',
                    'Power & Succession',
                    'Environment & Ecology',
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

CREATE INDEX idx_events_entity   ON events(entity_id);
CREATE INDEX idx_events_year     ON events(year);
CREATE INDEX idx_events_category ON events(category);

-- ------------------------------------------------------------
-- 4. CITIES
-- ------------------------------------------------------------
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

CREATE INDEX idx_cities_entity ON cities(entity_id);
CREATE INDEX idx_cities_active ON cities(active_from, active_to);

-- ------------------------------------------------------------
-- 5. ROW LEVEL SECURITY
-- ------------------------------------------------------------
ALTER TABLE entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE rulers   ENABLE ROW LEVEL SECURITY;
ALTER TABLE events   ENABLE ROW LEVEL SECURITY;
ALTER TABLE cities   ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access" ON entities FOR SELECT USING (true);
CREATE POLICY "Public read access" ON rulers   FOR SELECT USING (true);
CREATE POLICY "Public read access" ON events   FOR SELECT USING (true);
CREATE POLICY "Public read access" ON cities   FOR SELECT USING (true);

CREATE POLICY "Admin can insert events" ON events
FOR INSERT WITH CHECK (true);
```

## 3.3 Key Design Decisions

**Why `entity_id_2` and `latitude_2/longitude_2` on events:**
Future feature — entity arcs. When a battle involves two entities 
(e.g. Battle of Mohács between Castile and Ottoman), both entities 
and both locations can be stored, enabling animated arcs to be drawn 
between them on the map.

**Why `dynasty` on rulers:**
Enables the dynastic timeline in the details panel — showing all rulers 
of the same dynasty as a visual bar with the current ruler highlighted.

**Why `active_from/active_to` on cities:**
Cities change names and allegiances through time. Constantinople becomes 
Ottoman Constantinople in 1453. Tenochtitlan becomes Mexico City in 1521. 
The app queries cities where `active_from <= currentYear AND 
(active_to IS NULL OR active_to >= currentYear)`.

**Why events show for 3 years by default:**
Point events (no `year_end`) show for the year they happened plus 3 years. 
This gives users time to notice and click them as they slide the timeline. 
Events with explicit `year_end` show for their full duration.

---

# SECTION 4 — ENTITIES

## 4.1 Current Entities (10)

| ID | Name | Short Name | Colour | Region | Period |
|---|---|---|---|---|---|
| 1 | Ottoman Empire | Ottoman | #C0622A | Middle East/Balkans | 1400–1600 |
| 2 | Ming Dynasty | Ming | #3A6FA8 | East Asia | 1400–1600 |
| 3 | Crown of Castile/Spain | Castile | #8A4CAF | Western Europe | 1400–1600 |
| 4 | Aztec Empire | Aztec | #2A9A4A | Mesoamerica | 1400–1521 |
| 5 | New Spain | New Spain | #A07830 | Mesoamerica | 1521–1600 |
| 6 | Kingdom of England | England | #9B1B30 | Western Europe | 1400–1600 |
| 7 | Kingdom of France | France | #1B4B8A | Western Europe | 1400–1600 |
| 8 | Safavid Empire | Persia | #00827F | Middle East/Central Asia | 1501–1600 |
| 9 | Roman Britain | Rome/Britain | #6B2D8B | Western Europe | 43–410 AD |
| 10 | Anglo-Saxon England | Anglo-Saxon | #B8860B | Western Europe | 410–1066 AD |

## 4.2 Entities Seed SQL

```sql
INSERT INTO entities (id, name, short_name, colour, region, successor_of, notes) VALUES
(1, 'Ottoman Empire', 'Ottoman', '#C0622A', 'Middle East / Balkans', NULL, 
 'Founded c.1299; peak power 1520–1566 under Suleiman I'),
(2, 'Ming Dynasty', 'Ming', '#3A6FA8', 'East Asia', NULL, 
 'Ruled China 1368–1644; founded by Hongwu Emperor'),
(3, 'Crown of Castile / Spain', 'Castile', '#8A4CAF', 'Western Europe', NULL, 
 'United crowns of Castile and Aragon 1479; Habsburg from 1516'),
(4, 'Aztec Empire', 'Aztec', '#2A9A4A', 'Mesoamerica', NULL, 
 'Triple Alliance founded 1427; conquered by Spain 1521'),
(5, 'New Spain', 'New Spain', '#A07830', 'Mesoamerica', 4, 
 'Colonial successor to Aztec Empire; Viceroyalty established 1535'),
(6, 'Kingdom of England', 'England', '#9B1B30', 'Western Europe', NULL, 
 'Includes Lancastrian, Yorkist and Tudor dynasties 1400–1600'),
(7, 'Kingdom of France', 'France', '#1B4B8A', 'Western Europe', NULL, 
 'Valois and early Bourbon dynasty 1400–1600'),
(8, 'Safavid Empire', 'Persia', '#00827F', 'Middle East / Central Asia', NULL, 
 'Founded 1501 by Ismail I; Shia Islam as state religion'),
(9, 'Roman Britain', 'Rome/Britain', '#6B2D8B', 'Western Europe', NULL, 
 'Roman province of Britannia 43–410 AD'),
(10, 'Anglo-Saxon England', 'Anglo-Saxon', '#B8860B', 'Western Europe', 9, 
 'Germanic kingdoms 410–1066 AD');
```

---

# SECTION 5 — 11 CATEGORIES

All events are classified into one of these 11 categories:

| # | Category | Icon | Description |
|---|---|---|---|
| 1 | Governance & Law | ⚖️ | Legal codes, administrative reforms, colonial legislation |
| 2 | Military & Conflict | ⚔️ | Battles, sieges, wars, conquests |
| 3 | Built Environment | 🏛️ | Palaces, temples, cathedrals, cities, infrastructure |
| 4 | Religion & Belief | ✝️ | Religious institutions, reforms, persecutions, conversions |
| 5 | Economy & Trade | 💰 | Trade routes, monetary reforms, commercial institutions |
| 6 | Society & Demographics | 👥 | Population, migration, social structure, famines |
| 7 | Science & Knowledge | 🔭 | Astronomy, medicine, cartography, philosophy, education |
| 8 | Culture & Arts | 🎨 | Literature, painting, music, architecture as art |
| 9 | Power & Succession | 👑 | Dynastic events, marriages, executions, coups |
| 10 | Environment & Ecology | 🌿 | Climate, famines, pandemics, ecological change |
| 11 | Collapse & Transformation | 💥 | Systemic crises, civilisational collapse, major turning points |

**Note:** Exploration and expansion events are classified as subtypes 
of Economy & Trade (trade missions) or Military & Conflict (military 
expansion), using the subtype field "Exploration & Contact".

---

# SECTION 6 — EVENT STATUS SYSTEM

All events have one of three status values:

| Status | Meaning | Map Marker Colour |
|---|---|---|
| confirmed | Broad scholarly consensus | Green #43A047 |
| debated | Historians disagree on scale, cause, or interpretation | Amber #FFB300 |
| contested | Date, authorship, or occurrence disputed | Red #E53935 |

---

# SECTION 7 — COMPLETE COMPONENT CODE

## 7.1 src/lib/supabase.js

```javascript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

## 7.2 src/main.jsx

```jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import Admin from './pages/Admin'
import './index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
```

## 7.3 src/index.css

```css
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;600;700&family=Cinzel+Decorative:wght@400;700&family=IM+Fell+English:ital@0;1&display=swap');

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  overflow: hidden;
}

.parchment {
  background-color: #fdf6e3;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='400' height='400' filter='url(%23noise)' opacity='0.04'/%3E%3C/svg%3E");
  background-repeat: repeat;
}
```

## 7.4 src/App.jsx

```jsx
import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import WorldMap from './components/WorldMap'
import Timeline from './components/Timeline'
import DetailsPanel from './components/DetailsPanel'
import CategoryFilter from './components/CategoryFilter'
import EntityFilter from './components/EntityFilter'

const ALL_CATEGORIES = [
  'Governance & Law', 'Military & Conflict', 'Built Environment',
  'Religion & Belief', 'Economy & Trade', 'Society & Demographics',
  'Science & Knowledge', 'Culture & Arts', 'Power & Succession',
  'Environment & Ecology', 'Collapse & Transformation'
]

const ALL_ENTITIES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

function App() {
  const [currentYear, setCurrentYear] = useState(1500)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedCategories, setSelectedCategories] = useState(ALL_CATEGORIES)
  const [selectedEntities, setSelectedEntities] = useState(ALL_ENTITIES)
  const [yearRange, setYearRange] = useState({ min: 43, max: 1815 })

  useEffect(() => {
    async function fetchYearRange() {
      const { data, error } = await supabase
        .from('events')
        .select('year, year_end')
      if (error) return
      const years = data.flatMap(e => [e.year, e.year_end].filter(Boolean))
      const min = Math.min(...years)
      const max = Math.max(...years)
      setYearRange({ min, max })
    }
    fetchYearRange()
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0,
        zIndex: 30, padding: '0 16px',
        height: 35, display: 'flex', alignItems: 'center',
        background: '#3a2a0a', pointerEvents: 'none'
      }}>
        <span style={{
          fontFamily: "'Cinzel Decorative', serif",
          fontSize: 16, fontWeight: 'bold',
          color: '#f5e6c8', letterSpacing: 2,
          textShadow: '0 1px 3px rgba(0,0,0,0.5)',
          flex: 1, textAlign: 'center'
        }}>
          The World Through Time
        </span>
      </div>

      <WorldMap
        currentYear={currentYear}
        selectedCategories={selectedCategories}
        selectedEntities={selectedEntities}
        onEventSelect={setSelectedEvent}
      />
      <EntityFilter
        selectedEntities={selectedEntities}
        onEntityChange={setSelectedEntities}
      />
      <Timeline
        currentYear={currentYear}
        onYearChange={setCurrentYear}
        minYear={yearRange.min}
        maxYear={yearRange.max}
      />
      <DetailsPanel
        selectedEvent={selectedEvent}
        currentYear={currentYear}
      />
      <CategoryFilter
        selectedCategories={selectedCategories}
        onCategoryChange={setSelectedCategories}
      />
    </div>
  )
}

export default App
```

## 7.5 src/components/WorldMap.jsx

```jsx
import { useState, useEffect } from 'react'
import Map, { Marker } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { supabase } from '../lib/supabase'

const categoryIcons = {
  'Governance & Law':          '⚖️',
  'Military & Conflict':       '⚔️',
  'Built Environment':         '🏛️',
  'Religion & Belief':         '✝️',
  'Economy & Trade':           '💰',
  'Society & Demographics':    '👥',
  'Science & Knowledge':       '🔭',
  'Culture & Arts':            '🎨',
  'Power & Succession':        '👑',
  'Environment & Ecology':     '🌿',
  'Collapse & Transformation': '💥',
}

const categoryColors = {
  'Governance & Law':          '#1565c0',
  'Military & Conflict':       '#b71c1c',
  'Built Environment':         '#4e342e',
  'Religion & Belief':         '#6a1b9a',
  'Economy & Trade':           '#2e7d32',
  'Society & Demographics':    '#00695c',
  'Science & Knowledge':       '#283593',
  'Culture & Arts':            '#e65100',
  'Power & Succession':        '#4a148c',
  'Environment & Ecology':     '#558b2f',
  'Collapse & Transformation': '#c62828',
}

function clusterEvents(events, radius) {
  const clusters = []
  const used = new Set()

  events.forEach((event, i) => {
    if (used.has(i)) return
    const group = [event]
    used.add(i)

    events.forEach((other, j) => {
      if (used.has(j)) return
      const dlat = Math.abs(event.latitude - other.latitude)
      const dlng = Math.abs(event.longitude - other.longitude)
      if (dlat < radius && dlng < radius) {
        group.push(other)
        used.add(j)
      }
    })

    const lat = group.reduce((s, e) => s + e.latitude, 0) / group.length
    const lng = group.reduce((s, e) => s + e.longitude, 0) / group.length

    const catCount = {}
    group.forEach(e => { catCount[e.category] = (catCount[e.category] || 0) + 1 })
    const dominantCat = Object.entries(catCount).sort((a, b) => b[1] - a[1])[0][0]

    clusters.push({ lat, lng, events: group, dominantCat })
  })

  return clusters
}

export default function WorldMap({ currentYear, selectedCategories, selectedEntities, onEventSelect }) {
  const [cities, setCities] = useState([])
  const [events, setEvents] = useState([])
  const [hoveredEvent, setHoveredEvent] = useState(null)
  const [hoveredCluster, setHoveredCluster] = useState(null)
  const [viewState, setViewState] = useState({
    longitude: 20, latitude: 25, zoom: 2.5
  })

  const fontSize = viewState.zoom < 4 ? 0 : Math.max(6, Math.min(18, (viewState.zoom - 2) * 4))
  const showIndividual = viewState.zoom >= 5
  const clusterRadius = viewState.zoom < 3 ? 5 : showIndividual ? 0.3 : 4

  useEffect(() => {
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from('cities')
        .select('*')
        .lte('active_from', currentYear)
        .or(`active_to.is.null,active_to.gte.${currentYear}`)
      if (error) console.error('Cities error:', error)
      else setCities(data)
    }, 50)
    return () => clearTimeout(timer)
  }, [currentYear])

  useEffect(() => {
    const timer = setTimeout(async () => {
      const { data, error } = await supabase
        .from('events')
        .select('*, entities(name, colour)')
        .lte('year', currentYear)
        .or(`year_end.gte.${currentYear},and(year_end.is.null,year.gte.${currentYear - 3},year.lte.${currentYear})`)
        .in('category', selectedCategories.length > 0 ? selectedCategories : ['none'])
        .in('entity_id', selectedEntities.length > 0 ? selectedEntities : [0])
      if (error) console.error('Events error:', error)
      else setEvents(data)
    }, 50)
    return () => clearTimeout(timer)
  }, [currentYear, selectedCategories, selectedEntities])

  const clusters = clusterEvents(
    events.filter(e => e.longitude && e.latitude),
    clusterRadius
  )

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh' }}>
      <Map
        {...viewState}
        onMove={e => setViewState(e.viewState)}
        style={{ width: '100vw', height: 'calc(100vh - 410px)', marginTop: 410 }}
        mapStyle={`https://api.maptiler.com/maps/aquarelle/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
      >
        {cities.map(city => (
          <Marker key={city.id} longitude={city.longitude} latitude={city.latitude}>
            <div style={{
              fontFamily: 'Georgia, serif',
              fontSize: `${fontSize}px`,
              color: '#3a2a0a',
              textShadow: '1px 1px 2px #fff, -1px -1px 2px #fff',
              fontWeight: 'bold',
              whiteSpace: 'nowrap',
              cursor: 'default',
              pointerEvents: 'none',
              letterSpacing: '0.5px',
              opacity: viewState.zoom < 4 ? 0 : 1,
            }}>
              {city.historical_name || city.modern_name}
            </div>
          </Marker>
        ))}

        {clusters.map((cluster, i) => {
          const isCluster = cluster.events.length > 1 && !showIndividual

          if (isCluster) {
            const color = cluster.events.every(e => e.category === cluster.events[0].category)
              ? categoryColors[cluster.dominantCat] || '#3a2a0a'
              : '#3a2a0a'
            const size = Math.min(14 + cluster.events.length * 2, 32)

            return (
              <Marker key={`cluster-${i}`} longitude={cluster.lng} latitude={cluster.lat}>
                <div
                  onMouseEnter={() => setHoveredCluster(i)}
                  onMouseLeave={() => setHoveredCluster(null)}
                  style={{ position: 'relative', cursor: 'pointer' }}
                >
                  <div style={{
                    width: size, height: size,
                    borderRadius: '50%',
                    background: color,
                    border: '2px solid #c8a96e',
                    color: '#f5e6c8',
                    fontFamily: 'Georgia, serif',
                    fontSize: 11, fontWeight: 'bold',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
                    opacity: 0.85
                  }}>
                    {cluster.events.length}
                  </div>

                  {hoveredCluster === i && (
                    <div style={{
                      position: 'absolute',
                      bottom: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: 'rgba(58, 42, 10, 0.92)',
                      color: '#f5e6c8',
                      fontFamily: 'Georgia, serif',
                      fontSize: 11,
                      padding: '6px 10px',
                      borderRadius: 5,
                      whiteSpace: 'nowrap',
                      pointerEvents: 'none',
                      zIndex: 100,
                      marginBottom: 4,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 4
                    }}>
                      {cluster.events.map(ev => (
                        <div key={ev.id}>
                          <span style={{ marginRight: 5 }}>
                            {categoryIcons[ev.category] || '📍'}
                          </span>
                          {ev.title}
                          <span style={{ color: '#c8a96e', marginLeft: 5, fontSize: 10 }}>
                            {ev.year}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Marker>
            )
          }

          return cluster.events.map(event => (
            <Marker
              key={event.id}
              longitude={event.longitude}
              latitude={event.latitude}
              onClick={() => onEventSelect && onEventSelect(event)}
            >
              <div
                onMouseEnter={() => setHoveredEvent(event)}
                onMouseLeave={() => setHoveredEvent(null)}
                style={{
                  fontSize: Math.max(10, Math.min(20, viewState.zoom * 3)),
                  cursor: 'pointer',
                  filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.4))',
                  userSelect: 'none',
                  lineHeight: 1
                }}
              >
                {categoryIcons[event.category] || '📍'}
              </div>
            </Marker>
          ))
        })}

        {hoveredEvent && (
          <Marker longitude={hoveredEvent.longitude} latitude={hoveredEvent.latitude}>
            <div style={{
              position: 'absolute',
              bottom: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(58, 42, 10, 0.92)',
              color: '#f5e6c8',
              fontFamily: 'Georgia, serif',
              fontSize: 11,
              padding: '5px 9px',
              borderRadius: 5,
              whiteSpace: 'nowrap',
              pointerEvents: 'none',
              zIndex: 100,
              marginBottom: 4,
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
            }}>
              {hoveredEvent.title}
              <div style={{ fontSize: 10, color: '#c8a96e', marginTop: 2 }}>
                {hoveredEvent.year}{hoveredEvent.year_end ? `–${hoveredEvent.year_end}` : ''}
              </div>
            </div>
          </Marker>
        )}
      </Map>
    </div>
  )
}
```

## 7.6 src/components/Timeline.jsx

```jsx
import { useState, useEffect, useRef } from 'react'

const SPEEDS = [
  { label: 'Slow', value: 1500 },
  { label: 'Normal', value: 800 },
  { label: 'Fast', value: 300 },
]

export default function Timeline({ currentYear, onYearChange, minYear = 43, maxYear = 1815 }) {
  const [playing, setPlaying] = useState(false)
  const [speedIndex, setSpeedIndex] = useState(1)
  const intervalRef = useRef(null)

  const decrease = () => onYearChange(Math.max(minYear, currentYear - 1))
  const increase = () => onYearChange(Math.min(maxYear, currentYear + 1))

  useEffect(() => {
    if (playing) {
      intervalRef.current = setInterval(() => {
        onYearChange(prev => {
          if (prev >= maxYear) {
            setPlaying(false)
            return maxYear
          }
          return prev + 1
        })
      }, SPEEDS[speedIndex].value)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [playing, speedIndex, maxYear])

  const btnStyle = {
    background: '#3a2a0a', color: '#f5e6c8',
    border: 'none', borderRadius: 6,
    width: 32, height: 32, fontSize: 18,
    cursor: 'pointer', flexShrink: 0
  }

  return (
    <div style={{
      position: 'fixed', top: 340, left: 0, right: 0,
      height: 70, background: '#f5e6c8',
      borderBottom: '2px solid #8b6914',
      padding: '8px 24px 0', fontFamily: 'Georgia, serif',
      zIndex: 15
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 13, color: '#7a6040', whiteSpace: 'nowrap', flexShrink: 0, minWidth: 35, textAlign: 'right' }}>
          {minYear}
        </div>

        <div style={{ flex: 1, position: 'relative' }}>
          <input type="range"
            min={minYear} max={maxYear}
            value={currentYear}
            onChange={e => onYearChange(Number(e.target.value))}
            style={{ width: '100%', cursor: 'pointer' }}
          />
        </div>

        <div style={{ fontSize: 13, color: '#7a6040', whiteSpace: 'nowrap', flexShrink: 0, minWidth: 35 }}>
          {maxYear}
        </div>

        <div style={{ display: 'flex', gap: 4, alignItems: 'center', flexShrink: 0 }}>
          {SPEEDS.map((speed, idx) => (
            <button key={speed.label} onClick={() => setSpeedIndex(idx)} style={{
              padding: '3px 8px',
              background: speedIndex === idx ? '#3a2a0a' : '#fff8ee',
              color: speedIndex === idx ? '#fff' : '#5a3e1b',
              border: '1px solid #c8a96e', borderRadius: 4,
              fontFamily: 'Georgia, serif', fontSize: 10,
              cursor: 'pointer', flexShrink: 0
            }}>
              {speed.label}
            </button>
          ))}
          <button onClick={decrease} style={btnStyle}>‹</button>
          <button onClick={increase} style={btnStyle}>›</button>
          <button onClick={() => setPlaying(p => !p)} style={{
            ...btnStyle, width: 42,
            background: playing ? '#8b1a1a' : '#2a6e2a',
            fontSize: 14
          }}>
            {playing ? '■' : '▶'}
          </button>
        </div>
      </div>

      <div style={{
        position: 'absolute', left: '50%', top: 0,
        transform: 'translateX(-50%)',
        fontSize: 22, fontWeight: 'bold',
        color: '#3a2a0a', pointerEvents: 'none',
        fontFamily: 'Georgia, serif'
      }}>
        {currentYear}
      </div>
    </div>
  )
}
```

## 7.7 src/components/EntityFilter.jsx

```jsx
const entities = [
  { id: 1,  name: 'Ottoman Empire',           short: 'Ottoman',    colour: '#C0622A' },
  { id: 2,  name: 'Ming Dynasty',             short: 'Ming',       colour: '#3A6FA8' },
  { id: 3,  name: 'Crown of Castile / Spain', short: 'Castile',    colour: '#8A4CAF' },
  { id: 4,  name: 'Aztec Empire',             short: 'Aztec',      colour: '#2A9A4A' },
  { id: 5,  name: 'New Spain',                short: 'New Spain',  colour: '#A07830' },
  { id: 6,  name: 'Kingdom of England',       short: 'England',    colour: '#9B1B30' },
  { id: 7,  name: 'Kingdom of France',        short: 'France',     colour: '#1B4B8A' },
  { id: 8,  name: 'Safavid Empire',           short: 'Persia',     colour: '#00827F' },
  { id: 9,  name: 'Roman Britain',            short: 'Rome/Britain', colour: '#6B2D8B' },
  { id: 10, name: 'Anglo-Saxon England',      short: 'Anglo-Saxon', colour: '#B8860B' },
]

export default function EntityFilter({ selectedEntities, onEntityChange }) {
  const toggleEntity = (id) => {
    if (selectedEntities.includes(id)) {
      onEntityChange(selectedEntities.filter(e => e !== id))
    } else {
      onEntityChange([...selectedEntities, id])
    }
  }

  const allSelected = selectedEntities.length === entities.length

  return (
    <div style={{
      position: 'fixed', top: 35, left: 0, right: 0,
      height: 40, background: '#3a2a0a',
      borderBottom: '2px solid #c8a96e',
      fontFamily: 'Georgia, serif',
      display: 'flex', alignItems: 'center',
      padding: '0 16px', gap: 8, zIndex: 20
    }}>
      <span style={{
        fontSize: 10, color: '#f5e6c8', letterSpacing: 1,
        textTransform: 'uppercase', marginRight: 8, whiteSpace: 'nowrap',
        fontFamily: "'Cinzel', serif"
      }}>
        Civilisations
      </span>

      {entities.map(entity => {
        const active = selectedEntities.includes(entity.id)
        return (
          <button key={entity.id} onClick={() => toggleEntity(entity.id)}
            style={{
              padding: '3px 12px',
              background: active ? entity.colour : 'transparent',
              color: active ? '#fff' : entity.colour,
              border: `1px solid ${entity.colour}`,
              borderRadius: 4,
              fontFamily: "'Cinzel', serif", fontSize: 11,
              cursor: 'pointer', whiteSpace: 'nowrap',
              fontWeight: 'bold'
            }}>
            {entity.short}
          </button>
        )
      })}

      <button
        onClick={() => onEntityChange(
          allSelected ? [] : entities.map(e => e.id)
        )}
        style={{
          marginLeft: 'auto',
          padding: '3px 10px',
          background: 'transparent',
          color: '#f5e6c8',
          border: '1px solid #c8a96e', borderRadius: 4,
          fontFamily: "'Cinzel', serif", fontSize: 10,
          cursor: 'pointer'
        }}>
        {allSelected ? 'Deselect All' : 'Select All'}
      </button>
    </div>
  )
}
```

## 7.8 src/components/CategoryFilter.jsx

```jsx
const categories = [
  { name: 'Governance & Law',          icon: '⚖️' },
  { name: 'Military & Conflict',       icon: '⚔️' },
  { name: 'Built Environment',         icon: '🏛️' },
  { name: 'Religion & Belief',         icon: '✝️' },
  { name: 'Economy & Trade',           icon: '💰' },
  { name: 'Society & Demographics',    icon: '👥' },
  { name: 'Science & Knowledge',       icon: '🔭' },
  { name: 'Culture & Arts',            icon: '🎨' },
  { name: 'Power & Succession',        icon: '👑' },
  { name: 'Environment & Ecology',     icon: '🌿' },
  { name: 'Collapse & Transformation', icon: '💥' },
]

export default function CategoryFilter({ selectedCategories, onCategoryChange }) {
  const toggleCategory = (name) => {
    if (selectedCategories.includes(name)) {
      onCategoryChange(selectedCategories.filter(c => c !== name))
    } else {
      onCategoryChange([...selectedCategories, name])
    }
  }

  const allSelected = selectedCategories.length === categories.length

  return (
    <div style={{
      position: 'fixed', top: 300, left: 0, right: 0,
      height: 50, background: '#f5edd8',
      borderBottom: '2px solid #c8a96e',
      fontFamily: 'Georgia, serif',
      display: 'flex', alignItems: 'center',
      padding: '0 16px', gap: 6, zIndex: 15,
      overflowX: 'auto'
    }}>
      <button
        onClick={() => onCategoryChange(
          allSelected ? [] : categories.map(c => c.name)
        )}
        style={{
          padding: '3px 10px', flexShrink: 0,
          background: allSelected ? '#3a2a0a' : '#fff8ee',
          color: allSelected ? '#fff' : '#5a3e1b',
          border: '1px solid #c8a96e', borderRadius: 4,
          fontFamily: "'Cinzel', serif", fontSize: 10,
          cursor: 'pointer'
        }}>
        {allSelected ? 'All ✓' : 'All'}
      </button>

      {categories.map(cat => {
        const active = selectedCategories.includes(cat.name)
        return (
          <button key={cat.name} onClick={() => toggleCategory(cat.name)}
            style={{
              display: 'flex', alignItems: 'center', gap: 3,
              padding: '3px 8px', flexShrink: 0,
              background: active ? '#3a2a0a' : '#fff8ee',
              color: active ? '#fff' : '#5a3e1b',
              border: '1px solid #c8a96e', borderRadius: 4,
              fontFamily: "'Cinzel', serif", fontSize: 10,
              cursor: 'pointer', whiteSpace: 'nowrap'
            }}>
            <span>{cat.icon}</span>
            <span>{cat.name}</span>
          </button>
        )
      })}
    </div>
  )
}
```

## 7.9 src/components/DetailsPanel.jsx

```jsx
import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const statusConfig = {
  confirmed: { label: 'Confirmed', color: '#2e7d32', bg: '#e8f5e9' },
  debated:   { label: 'Debated',   color: '#f57f17', bg: '#fff8e1' },
  contested: { label: 'Contested', color: '#c62828', bg: '#fce4ec' },
}

const entityColors = {
  'Ottoman Empire':           '#C0622A',
  'Ming Dynasty':             '#3A6FA8',
  'Crown of Castile / Spain': '#8A4CAF',
  'Aztec Empire':             '#2A9A4A',
  'New Spain':                '#A07830',
  'Kingdom of England':       '#9B1B30',
  'Kingdom of France':        '#1B4B8A',
  'Safavid Empire':           '#00827F',
  'Roman Britain':            '#6B2D8B',
  'Anglo-Saxon England':      '#B8860B',
}

function DynasticTimeline({ rulers, currentRuler, entityColor }) {
  if (!rulers || rulers.length === 0 || !currentRuler) return null
  const dynastyRulers = rulers.filter(r => r.dynasty === currentRuler.dynasty)
  if (dynastyRulers.length === 0) return null
  const minYear = Math.min(...dynastyRulers.map(r => r.reign_start))
  const maxYear = Math.max(...dynastyRulers.map(r => r.reign_end))
  const totalSpan = maxYear - minYear

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{
        fontSize: 10, color: '#a08050', marginBottom: 4,
        textTransform: 'uppercase', letterSpacing: 1,
        fontFamily: "'Cinzel', serif"
      }}>
        {currentRuler.dynasty} ({minYear}–{maxYear})
      </div>
      <div style={{
        position: 'relative', height: 20,
        background: '#e8d8b0', borderRadius: 4, overflow: 'hidden'
      }}>
        {dynastyRulers.map(ruler => {
          const left = ((ruler.reign_start - minYear) / totalSpan) * 100
          const width = ((ruler.reign_end - ruler.reign_start) / totalSpan) * 100
          const isCurrent = ruler.id === currentRuler.id
          const isDisputed = ruler.status === 'disputed'
          return (
            <div key={ruler.id}
              title={`${ruler.name} (${ruler.reign_start}–${ruler.reign_end})`}
              style={{
                position: 'absolute',
                left: `${left}%`, width: `${width}%`, height: '100%',
                background: isCurrent ? entityColor : isDisputed ? '#c8a96e' : `${entityColor}66`,
                borderRight: '1px solid #fff', boxSizing: 'border-box'
              }}
            />
          )
        })}
      </div>
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontSize: 9, color: '#a08050', marginTop: 2,
        fontFamily: 'Georgia, serif'
      }}>
        <span>{minYear}</span>
        <span>{Math.round((minYear + maxYear) / 2)}</span>
        <span>{maxYear}</span>
      </div>
    </div>
  )
}

function useEntityRulers(entityId) {
  const [rulers, setRulers] = useState([])
  useEffect(() => {
    if (!entityId) return
    async function fetchRulers() {
      const { data } = await supabase
        .from('rulers').select('*')
        .eq('entity_id', entityId)
        .order('reign_start', { ascending: true })
      setRulers(data || [])
    }
    fetchRulers()
  }, [entityId])
  return rulers
}

function useCurrentRuler(entityId, currentYear) {
  const [ruler, setRuler] = useState(null)
  useEffect(() => {
    if (!entityId || !currentYear) return
    async function fetchRuler() {
      const { data } = await supabase
        .from('rulers').select('*, entities(name)')
        .eq('entity_id', entityId)
        .lte('reign_start', currentYear)
        .gte('reign_end', currentYear)
        .limit(1).single()
      setRuler(data)
    }
    fetchRuler()
  }, [entityId, currentYear])
  return ruler
}

export default function DetailsPanel({ selectedEvent, currentYear }) {
  const ruler = useCurrentRuler(selectedEvent?.entity_id, currentYear)
  const allRulers = useEntityRulers(selectedEvent?.entity_id)

  const outerStyle = {
    position: 'fixed', top: 75, left: 0, right: 0,
    height: 255,
    backgroundColor: '#fdf6e3',
    borderLeft: '2px solid #c8a96e',
    borderRight: '2px solid #c8a96e',
    borderBottom: '2px solid #c8a96e',
    zIndex: 15,
    boxSizing: 'border-box'
  }

  const innerStyle = {
    position: 'absolute',
    top: 4, left: 4, right: 4, bottom: 4,
    border: '1px solid #8b6914',
    pointerEvents: 'none',
    zIndex: 16
  }

  const scrollStyle = {
    display: 'flex', alignItems: 'flex-start',
    gap: 20, padding: '8px 20px',
    overflowX: 'auto', height: '100%'
  }

  if (!selectedEvent) return (
    <div style={{
      ...outerStyle,
      display: 'flex', alignItems: 'center', justifyContent: 'center'
    }}>
      <div style={innerStyle} />
      <span style={{
        fontFamily: 'Georgia, serif', color: '#a08050',
        fontSize: 13, letterSpacing: 1
      }}>
        Click a marker on the map to explore history
      </span>
    </div>
  )

  const st = statusConfig[selectedEvent.status] || statusConfig.confirmed
  const entityName = selectedEvent.entities?.name
  const entityColor = entityColors[entityName] || '#999'

  return (
    <div style={outerStyle}>
      <div style={innerStyle} />
      <div style={scrollStyle}>
        <div style={{ flexShrink: 0, minWidth: 220 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: entityColor, flexShrink: 0 }} />
            <span style={{ fontSize: 11, color: '#a08050', fontFamily: "'Cinzel', serif", letterSpacing: 0.5 }}>
              {entityName}
            </span>
          </div>

          {ruler && (
            <div style={{
              background: '#f0e6cc', borderRadius: 6,
              padding: '8px 12px', marginBottom: 8,
              borderLeft: `3px solid ${entityColor}`
            }}>
              <div style={{ fontSize: 10, color: '#a08050', marginBottom: 2, fontFamily: "'Cinzel', serif", letterSpacing: 0.5, textTransform: 'uppercase' }}>
                Current Ruler
              </div>
              <div style={{ fontSize: 14, fontWeight: 'bold', color: '#2a1a0a', fontFamily: "'Cinzel', serif" }}>
                {ruler.name}
              </div>
              <div style={{ fontSize: 11, color: '#7a6040', fontFamily: 'Georgia, serif' }}>
                {ruler.title} · {ruler.reign_start}–{ruler.reign_end}
              </div>
              {ruler.dynasty && (
                <div style={{ fontSize: 11, color: entityColor, marginTop: 2, fontStyle: 'italic', fontFamily: 'Georgia, serif' }}>
                  {ruler.dynasty}
                </div>
              )}
            </div>
          )}
          <DynasticTimeline rulers={allRulers} currentRuler={ruler} entityColor={entityColor} />
        </div>

        <div style={{ width: 1, background: '#e8d8b0', alignSelf: 'stretch', flexShrink: 0 }} />

        <div style={{ flex: 1, minWidth: 250 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{ fontSize: 11, color: '#a08050', fontFamily: "'Cinzel', serif", letterSpacing: 0.5 }}>
              {selectedEvent.category}
            </span>
            <span style={{ background: st.bg, color: st.color, borderRadius: 4, padding: '1px 6px', fontSize: 10, fontFamily: 'Georgia, serif' }}>
              {st.label}
            </span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 'bold', color: '#2a1a0a', marginBottom: 4, lineHeight: 1.3, fontFamily: "'Cinzel', serif" }}>
            {selectedEvent.title}
          </div>
          <div style={{ fontSize: 12, color: '#7a6040', marginBottom: 8, fontFamily: 'Georgia, serif' }}>
            {selectedEvent.year}{selectedEvent.year_end ? ` — ${selectedEvent.year_end}` : ''}{' · '}{selectedEvent.location_name}
          </div>
        </div>

        <div style={{ width: 1, background: '#e8d8b0', alignSelf: 'stretch', flexShrink: 0 }} />

        <div style={{
          fontSize: 12, color: '#3a2a0a', lineHeight: 1.7,
          flex: 2, minWidth: 300, overflowY: 'auto', maxHeight: 220,
          fontFamily: "'IM Fell English', serif"
        }}>
          {selectedEvent.description}
          {selectedEvent.wikipedia_url && (
            <a href={selectedEvent.wikipedia_url} target="_blank" rel="noopener noreferrer"
              style={{ display: 'inline-block', marginTop: 8, fontSize: 11, color: '#8a4caf', textDecoration: 'none', borderBottom: '1px solid #8a4caf', fontFamily: 'Georgia, serif' }}>
              Read more on Wikipedia →
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
```

## 7.10 vercel.json

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/" }
  ]
}
```

---

# SECTION 8 — ADMIN INTERFACE

## 8.1 Overview

A password-protected data entry interface at `/admin` allows the founder 
to add new events without touching SQL.

**URL:** https://world-through-time.vercel.app/admin  
**Password:** wtt2024 (change this before public launch)

## 8.2 Features
- Entity dropdown (pulls from Supabase)
- Category dropdown
- Title, year, year_end, location name fields
- Status selector (confirmed/debated/contested)
- Significance selector (major/moderate/minor)
- Interactive map picker — click to set coordinates
- Writes directly to Supabase events table

---

# SECTION 9 — CURRENT DATA SUMMARY

## 9.1 Database Record Counts (as of May 2026)

| Table | Records |
|---|---|
| Entities | 10 |
| Rulers | ~150 |
| Events | ~350 |
| Cities | ~55 |

## 9.2 Timeline Range
**43 AD to 1815** (dynamic — calculated from min/max event years)

## 9.3 Event Counts by Entity

| Entity | Events |
|---|---|
| Crown of Castile / Spain | ~52 |
| Kingdom of England | ~32 |
| Safavid Empire | ~31 |
| Ming Dynasty | ~30 |
| New Spain | ~29 |
| Aztec Empire | ~29 |
| Ottoman Empire | ~27 |
| Kingdom of France | ~25 |
| Roman Britain | ~32 |
| Anglo-Saxon England | ~32 |

---

# SECTION 10 — FUTURE ROADMAP

## 10.1 Immediate Next Features (V1.5)

| Feature | Description | Priority |
|---|---|---|
| Ruler portraits | `portrait_url` column on rulers, displayed in details panel | High |
| Historical quotes | `quote` and `quote_attribution` columns on events | High |
| Entity arcs | Animated curved lines between two entities for cross-entity events | High |
| Territory borders | GeoJSON polygons per kingdom per time period | High |
| Year Snapshot | Freeze-frame shareable image of world in any given year | Critical |

## 10.2 V2 Features

| Feature | Description |
|---|---|
| Story mode | Guided narrative playback — like a documentary |
| Event images | `image_url` on events, thumbnail in details panel |
| Coat of arms | `coat_of_arms_url` on entities, heraldic badges in UI |
| Population circles | Proportional circles on cities showing population |
| Comparative panel | Side-by-side view of two entities in same year |
| Animated timeline feed | Scrolling event feed alongside map during playback |

## 10.3 Data Expansion Plan

| Phase | Content |
|---|---|
| V1.5 | Fill all entities to 15 events per category |
| V2 | Add Portugal, Holy Roman Empire, Mughal India |
| V2 | Extend England 0 AD–present (full civilisation arc) |
| V3 | Medieval period 1066–1400 for all European entities |
| V3 | Modern period 1600–1900 |
| V4 | 20th century |
| Long term | Full world history 3000 BC–present |

## 10.4 Hiring Plan

| Role | Location | Cost/month | When |
|---|---|---|---|
| Senior full-stack developer | Kosovo/Serbia | £2,000–2,500 | Month 4–6 |
| Data/content researcher | Remote | £800–1,200 | Month 4–6 |
| SEO/content marketer | UK freelance | £1,500–2,000 | Month 6–8 |
| PR freelancer | UK, one-off | £3,000–5,000 | Month 8–10 |

## 10.5 Commercial Milestones

| Milestone | Target |
|---|---|
| Public launch | Month 8–10 |
| 100 subscribers | Month 10–12 |
| Break-even (~1,200 subscribers) | Month 14–18 |
| 5,000 subscribers | Month 24 |
| Press article placed | Month 8 |

---

# SECTION 11 — KEY DECISIONS LOG

This section records the major product and technical decisions made 
and the reasoning behind them.

| Decision | Choice | Reasoning |
|---|---|---|
| Historical period for V1 | 1400–1600 | Enough geographic spread to validate concept across Europe, Asia, Americas |
| Number of entities | 5 initially, now 10 | Started tight, expanded as architecture proved scalable |
| Events per category | 5 initially, expanding to 15+ | Enough to feel alive without overwhelming the build |
| Data source | Wikipedia + academic consensus | Free, reliable enough for V1, cited per event |
| Map provider | MapTiler Aquarelle | Beautiful watercolour style, permanent free tier |
| Clustering approach | Custom React clustering | MapLibre clustering had emoji font rendering issues |
| Event display duration | 3 years for point events | Long enough to notice while sliding, short enough to prevent clutter |
| Category system | 11 categories | Revised from original 12 — removed overlap between Science and Ideas |
| Exploration as subtype | Subtype of Military or Economy | Not a top-level category — works better as a subtype |
| Dynasty display | Per-dynasty timeline bar | Shows where current ruler sits within their dynasty's history |
| Typography | Cinzel + IM Fell English | Cinzel = Roman inscriptions feel; IM Fell = historical manuscript feel |
| Commercial model | B2C Freemium | Maximum reach, minimum institutional negotiation, hire marketing |

---

*End of Documentation v1.0*  
*Generated: May 2026*  
*Next update: When V1.5 features are complete*

