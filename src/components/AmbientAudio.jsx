import { useState, useEffect, useRef } from 'react'
import { supabase } from '../lib/supabase'

function dynastyToFilename(dynasty) {
  return dynasty
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '') + '.mp3'
}

const FADE_MS = 2500
const FADE_STEPS = 50

export default function AmbientAudio({ currentYear, selectedEvent }) {
  const [enabled, setEnabled]         = useState(false)
  const [volume, setVolume]           = useState(0.35)
  const [expanded, setExpanded]       = useState(false)
  const [activeTrack, setActiveTrack] = useState(null)
  const [isLoading, setIsLoading]     = useState(false)

  const audioA      = useRef(null)
  const audioB      = useRef(null)
  const currentSlot = useRef('A')
  const activeFile  = useRef(null)
  const fadeTimer   = useRef(null)

  const getActive = () => currentSlot.current === 'A' ? audioA.current : audioB.current
  const getNext   = () => currentSlot.current === 'A' ? audioB.current : audioA.current

  useEffect(() => {
    audioA.current = new Audio()
    audioB.current = new Audio()
    audioA.current.loop = true
    audioB.current.loop = true
    return () => {
      clearInterval(fadeTimer.current)
      audioA.current?.pause()
      audioB.current?.pause()
    }
  }, [])

  function playFile(filename, label, vol) {
    if (!filename || filename === activeFile.current) return
    const outEl = getActive()
    const inEl  = getNext()
    inEl.src    = `/audio/${filename}`
    inEl.volume = 0
    setIsLoading(true)
    inEl.play()
      .then(() => {
        setIsLoading(false)
        setActiveTrack({ label, filename })
        activeFile.current = filename
        currentSlot.current = currentSlot.current === 'A' ? 'B' : 'A'
        clearInterval(fadeTimer.current)
        let step = 0
        fadeTimer.current = setInterval(() => {
          step++
          const p = step / FADE_STEPS
          outEl.volume = Math.max(0, vol * (1 - p))
          inEl.volume  = Math.min(vol, vol * p)
          if (step >= FADE_STEPS) {
            clearInterval(fadeTimer.current)
            outEl.pause()
            outEl.src = ''
          }
        }, FADE_MS / FADE_STEPS)
      })
      .catch(err => {
        console.log('playFile error:', err)
        setIsLoading(false)
      })
  }

  useEffect(() => {
    if (!selectedEvent?.entity_id) return

    async function fetchAndPlay() {
      console.log('entity_id:', selectedEvent.entity_id)
      console.log('currentYear:', currentYear)

      const { data, error } = await supabase
        .from('rulers')
        .select('dynasty, name')
        .eq('entity_id', selectedEvent.entity_id)
        .lte('reign_start', currentYear)
        .gte('reign_end', currentYear)
        .limit(1)
        .single()

      console.log('ruler data:', data)
      console.log('error:', error)

      if (!data?.dynasty) return

      const filename = dynastyToFilename(data.dynasty)
      console.log('filename:', filename)
      console.log('enabled:', enabled)

      if (!enabled) {
        setEnabled(true)
        const el = audioA.current
        currentSlot.current = 'A'
        el.src = `/audio/${filename}`
        el.volume = 0
        setIsLoading(true)
        console.log('attempting play:', el.src)
        el.play()
          .then(() => {
            console.log('playing successfully')
            setIsLoading(false)
            setActiveTrack({ label: data.dynasty, filename })
            activeFile.current = filename
            let v = 0
            const stepSize = volume / FADE_STEPS
            const fade = setInterval(() => {
              v = Math.min(volume, v + stepSize)
              el.volume = v
              if (v >= volume) clearInterval(fade)
            }, FADE_MS / FADE_STEPS)
          })
          .catch(err => {
            console.log('play error:', err)
            setIsLoading(false)
            setEnabled(false)
          })
      } else {
        playFile(filename, data.dynasty, volume)
      }
    }

    fetchAndPlay()
  }, [selectedEvent]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handleNarration = (e) => {
      const el = getActive()
      if (!el) return
      if (e.detail.active) {
        el.volume = Math.min(el.volume, 0.08) // duck to 8%
      } else {
        el.volume = volume // restore
      }
    }
    window.addEventListener('narration', handleNarration)
    return () => window.removeEventListener('narration', handleNarration)
  }, [volume]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const el = getActive()
    if (el && el.volume > 0) el.volume = volume
  }, [volume]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggle = () => {
    if (enabled) {
      setEnabled(false)
      setActiveTrack(null)
      activeFile.current = null
      clearInterval(fadeTimer.current)
      ;[audioA.current, audioB.current].forEach(el => {
        if (!el || el.paused) return
        let v = el.volume
        const fade = setInterval(() => {
          v = Math.max(0, v - 0.03)
          el.volume = v
          if (v <= 0) { clearInterval(fade); el.pause(); el.src = '' }
        }, 50)
      })
    }
  }

  const parchment = '#fdf6e3'
  const dark      = '#3a2a0a'
  const gold      = '#c8a96e'
  const mid       = '#7a6040'
  const light     = '#f5e6c8'

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 20, zIndex: 50, fontFamily: "'Cinzel', serif" }}>
      {expanded && (
        <div style={{ background: parchment, border: `2px solid ${gold}`, borderRadius: 10, padding: '14px 16px', marginBottom: 10, width: 244, boxShadow: '0 4px 20px rgba(0,0,0,0.28)' }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 9, color: mid, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 4 }}>Now Playing</div>
            {activeTrack ? (
              <>
                <div style={{ fontSize: 13, color: dark, fontWeight: 'bold' }}>🎵 {activeTrack.label}</div>
                <div style={{ fontSize: 10, color: mid, fontFamily: 'Georgia, serif', fontStyle: 'italic', marginTop: 3 }}>{activeTrack.filename}</div>
              </>
            ) : (
              <div style={{ fontSize: 11, color: mid, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                {isLoading ? 'Loading…' : '— click an event on the map —'}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, borderTop: `1px solid ${gold}`, paddingTop: 10 }}>
            <span style={{ fontSize: 12, color: mid }}>🔈</span>
            <input type="range" min={0} max={1} step={0.01} value={volume}
              onChange={e => setVolume(Number(e.target.value))}
              style={{ flex: 1, cursor: 'pointer', accentColor: dark }} />
            <span style={{ fontSize: 12, color: mid }}>🔊</span>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
        <button onClick={() => setExpanded(e => !e)} style={{ background: parchment, border: `2px solid ${gold}`, borderRadius: 8, padding: '5px 10px', cursor: 'pointer', color: dark, fontFamily: "'Cinzel', serif", fontSize: 13, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
          🎵 {expanded ? '▲' : '▼'}
        </button>
        {enabled ? (
          <button onClick={handleToggle} style={{ background: dark, border: `2px solid ${gold}`, borderRadius: 8, padding: '5px 14px', cursor: 'pointer', color: light, fontFamily: "'Cinzel', serif", fontSize: 11, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', minWidth: 96 }}>
            ⏸ Silence
          </button>
        ) : (
          <div style={{ background: parchment, border: `2px solid ${gold}`, borderRadius: 8, padding: '5px 14px', color: mid, fontFamily: "'Cinzel', serif", fontSize: 11, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', minWidth: 96, textAlign: 'center' }}>
            {isLoading ? '⏳ Loading…' : '🎵 Click a map event'}
          </div>
        )}
      </div>
    </div>
  )
}