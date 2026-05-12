import { useState, useEffect } from 'react'
import Map, { Marker } from 'react-map-gl/maplibre'
import 'maplibre-gl/dist/maplibre-gl.css'
import { supabase } from '../lib/supabase'

const PASSWORD = 'wtt2024'

const CATEGORIES = [
  'Governance & Law', 'Military & Conflict', 'Built Environment',
  'Religion & Belief', 'Economy & Trade', 'Society & Demographics',
  'Science & Knowledge', 'Culture & Arts', 'Power & Succession',
  'Environment & Ecology', 'Collapse & Transformation'
]

const STATUS_OPTIONS = ['confirmed', 'debated', 'contested']

export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [password, setPassword] = useState('')
  const [entities, setEntities] = useState([])
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    entity_id: '',
    category: '',
    subtype: '',
    title: '',
    year: '',
    year_end: '',
    location_name: '',
    latitude: '',
    longitude: '',
    description: '',
    significance: 'major',
    status: 'confirmed',
    wikipedia_url: ''
  })

  const [mapState, setMapState] = useState({
    longitude: 20, latitude: 30, zoom: 1.5
  })

  useEffect(() => {
    if (!authed) return
    supabase.from('entities').select('*').order('id').then(({ data }) => {
      setEntities(data || [])
    })
  }, [authed])

  const handleLogin = () => {
    if (password === PASSWORD) setAuthed(true)
    else alert('Wrong password')
  }

  const handleMapClick = (e) => {
    setForm(f => ({
      ...f,
      latitude: e.lngLat.lat.toFixed(6),
      longitude: e.lngLat.lng.toFixed(6)
    }))
  }

  const handleChange = (field, value) => {
    setForm(f => ({ ...f, [field]: value }))
  }

  const handleSubmit = async () => {
    setError(null)
    if (!form.entity_id || !form.category || !form.title || !form.year || !form.latitude || !form.longitude) {
      setError('Please fill in: entity, category, title, year, and click a location on the map')
      return
    }
    setSaving(true)
    const { error: err } = await supabase.from('events').insert({
      entity_id: parseInt(form.entity_id),
      category: form.category,
      subtype: form.subtype || null,
      title: form.title,
      year: parseInt(form.year),
      year_end: form.year_end ? parseInt(form.year_end) : null,
      location_name: form.location_name || null,
      latitude: parseFloat(form.latitude),
      longitude: parseFloat(form.longitude),
      description: form.description || null,
      significance: form.significance,
      status: form.status,
      wikipedia_url: form.wikipedia_url || null
    })
    setSaving(false)
    if (err) {
      setError(err.message)
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      setForm(f => ({
        ...f,
        title: '', year: '', year_end: '', location_name: '',
        latitude: '', longitude: '', description: '',
        subtype: '', wikipedia_url: '', status: 'confirmed'
      }))
    }
  }

  const inputStyle = {
    width: '100%', padding: '7px 10px',
    border: '1px solid #c8a96e', borderRadius: 6,
    fontFamily: 'Georgia, serif', fontSize: 13,
    background: '#fffdf5', color: '#3a2a0a',
    boxSizing: 'border-box'
  }

  const labelStyle = {
    fontSize: 11, color: '#7a6040',
    textTransform: 'uppercase', letterSpacing: 0.5,
    marginBottom: 4, display: 'block'
  }

  if (!authed) return (
    <div style={{
      height: '100vh', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#fdf6e3', fontFamily: 'Georgia, serif'
    }}>
      <div style={{
        background: '#fff8ee', border: '2px solid #c8a96e',
        borderRadius: 12, padding: 40, width: 320, textAlign: 'center'
      }}>
        <div style={{ fontSize: 20, fontWeight: 'bold', color: '#3a2a0a', marginBottom: 6 }}>
          World Through Time
        </div>
        <div style={{ fontSize: 13, color: '#7a6040', marginBottom: 24 }}>
          Admin Access
        </div>
        <input
          type="password"
          placeholder="Enter password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          style={{ ...inputStyle, marginBottom: 12, textAlign: 'center' }}
        />
        <button onClick={handleLogin} style={{
          width: '100%', padding: '9px 0',
          background: '#3a2a0a', color: '#f5e6c8',
          border: 'none', borderRadius: 6,
          fontFamily: 'Georgia, serif', fontSize: 14,
          cursor: 'pointer'
        }}>
          Enter
        </button>
      </div>
    </div>
  )

  return (
    <div style={{
      background: '#fdf6e3', minHeight: '100vh',
      fontFamily: 'Georgia, serif', padding: 24
    }}>
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>

        {/* Header */}
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', marginBottom: 24
        }}>
          <div>
            <h1 style={{ fontSize: 22, color: '#3a2a0a', margin: 0 }}>
              World Through Time — Admin
            </h1>
            <p style={{ fontSize: 13, color: '#7a6040', margin: '4px 0 0' }}>
              Add new historical events
            </p>
          </div>
          <a href="/" style={{
            fontSize: 12, color: '#8a4caf',
            textDecoration: 'none', borderBottom: '1px solid #8a4caf'
          }}>
            ← Back to map
          </a>
        </div>

        <div style={{ display: 'flex', gap: 24 }}>

          {/* Form */}
          <div style={{
            flex: 1, background: '#fff8ee',
            border: '1px solid #c8a96e', borderRadius: 10,
            padding: 24
          }}>

            {/* Row 1 — Entity + Category */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Entity *</label>
                <select value={form.entity_id} onChange={e => handleChange('entity_id', e.target.value)} style={inputStyle}>
                  <option value="">Select entity...</option>
                  {entities.map(e => (
                    <option key={e.id} value={e.id}>{e.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Category *</label>
                <select value={form.category} onChange={e => handleChange('category', e.target.value)} style={inputStyle}>
                  <option value="">Select category...</option>
                  {CATEGORIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Subtype</label>
                <input value={form.subtype} onChange={e => handleChange('subtype', e.target.value)}
                  placeholder="e.g. Battle, Treaty..." style={inputStyle} />
              </div>
            </div>

            {/* Row 2 — Title */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Event Title *</label>
              <input value={form.title} onChange={e => handleChange('title', e.target.value)}
                placeholder="Full descriptive title..." style={inputStyle} />
            </div>

            {/* Row 3 — Years + Status + Significance */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Year *</label>
                <input value={form.year} onChange={e => handleChange('year', e.target.value)}
                  placeholder="e.g. 1453" style={inputStyle} type="number" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Year End</label>
                <input value={form.year_end} onChange={e => handleChange('year_end', e.target.value)}
                  placeholder="If duration..." style={inputStyle} type="number" />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Status *</label>
                <select value={form.status} onChange={e => handleChange('status', e.target.value)} style={inputStyle}>
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Significance</label>
                <select value={form.significance} onChange={e => handleChange('significance', e.target.value)} style={inputStyle}>
                  <option value="major">Major</option>
                  <option value="moderate">Moderate</option>
                  <option value="minor">Minor</option>
                </select>
              </div>
            </div>

            {/* Row 4 — Location */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
              <div style={{ flex: 2 }}>
                <label style={labelStyle}>Location Name</label>
                <input value={form.location_name} onChange={e => handleChange('location_name', e.target.value)}
                  placeholder="e.g. Constantinople" style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Latitude *</label>
                <input value={form.latitude} onChange={e => handleChange('latitude', e.target.value)}
                  placeholder="Click map →" style={inputStyle} />
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Longitude *</label>
                <input value={form.longitude} onChange={e => handleChange('longitude', e.target.value)}
                  placeholder="Click map →" style={inputStyle} />
              </div>
            </div>

            {/* Row 5 — Description */}
            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Description</label>
              <textarea value={form.description} onChange={e => handleChange('description', e.target.value)}
                placeholder="3-4 sentence historical description..." rows={5}
                style={{ ...inputStyle, resize: 'vertical' }} />
            </div>

            {/* Row 6 — Wikipedia */}
            <div style={{ marginBottom: 20 }}>
              <label style={labelStyle}>Wikipedia URL</label>
              <input value={form.wikipedia_url} onChange={e => handleChange('wikipedia_url', e.target.value)}
                placeholder="https://en.wikipedia.org/wiki/..." style={inputStyle} />
            </div>

            {/* Error */}
            {error && (
              <div style={{
                background: '#fce4ec', color: '#c62828',
                padding: '8px 12px', borderRadius: 6,
                fontSize: 12, marginBottom: 16
              }}>
                {error}
              </div>
            )}

            {/* Submit */}
            <button onClick={handleSubmit} disabled={saving} style={{
              width: '100%', padding: '12px 0',
              background: saving ? '#888' : '#3a2a0a',
              color: '#f5e6c8', border: 'none', borderRadius: 6,
              fontFamily: 'Georgia, serif', fontSize: 15,
              cursor: saving ? 'default' : 'pointer'
            }}>
              {saving ? 'Saving...' : 'Add Event to Database'}
            </button>

            {/* Success */}
            {saved && (
              <div style={{
                background: '#e8f5e9', color: '#2e7d32',
                padding: '8px 12px', borderRadius: 6,
                fontSize: 12, marginTop: 12, textAlign: 'center'
              }}>
                ✓ Event saved successfully
              </div>
            )}
          </div>

          {/* Map picker */}
          <div style={{ width: 380, flexShrink: 0 }}>
            <div style={{
              fontSize: 11, color: '#7a6040',
              textTransform: 'uppercase', letterSpacing: 0.5,
              marginBottom: 8
            }}>
              Click map to set coordinates
            </div>
            <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid #c8a96e' }}>
              <Map
                {...mapState}
                onMove={e => setMapState(e.viewState)}
                onClick={handleMapClick}
                style={{ width: '100%', height: 500 }}
                mapStyle={`https://api.maptiler.com/maps/aquarelle/style.json?key=${import.meta.env.VITE_MAPTILER_API_KEY}`}
              >
                {form.latitude && form.longitude && (
                  <Marker
                    longitude={parseFloat(form.longitude)}
                    latitude={parseFloat(form.latitude)}
                  >
                    <div style={{ fontSize: 24 }}>📍</div>
                  </Marker>
                )}
              </Map>
            </div>
            {form.latitude && (
              <div style={{
                fontSize: 11, color: '#7a6040',
                marginTop: 6, textAlign: 'center'
              }}>
                {parseFloat(form.latitude).toFixed(4)}, {parseFloat(form.longitude).toFixed(4)}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  )
}