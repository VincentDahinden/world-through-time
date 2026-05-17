import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const parchment = '#fdf6e3'
const dark      = '#3a2a0a'
const gold      = '#c8a96e'
const mid       = '#7a6040'

// ── Fetch family relations for a given ruler ─────────────────────────────
async function fetchFamily(rulerId) {
  // Get all relations where this ruler appears on either side
  const { data } = await supabase
    .from('ruler_relations')
    .select(`
      id, relation_type, year_start, year_end, notes,
      ruler_id_1, ruler_id_2,
      ruler1:ruler_id_1 ( id, name, reign_start, reign_end, native_entity_id, entity_id, title ),
ruler2:ruler_id_2 ( id, name, reign_start, reign_end, native_entity_id, entity_id, title )
    `)
    .or(`ruler_id_1.eq.${rulerId},ruler_id_2.eq.${rulerId}`)

  if (!data) return { spouses: [], parents: [], children: [], siblings: [] }
// Fetch entity names for native_entity_id lookups
const entityIds = [...new Set(data.flatMap(r => [r.ruler1?.native_entity_id, r.ruler2?.native_entity_id]).filter(Boolean))]
const entityNames = {}
if (entityIds.length > 0) {
  const { data: entities } = await supabase.from('entities').select('id, name').in('id', entityIds)
  ;(entities || []).forEach(e => { entityNames[e.id] = e.name })
}

  const spouses  = []
  const parents  = []
  const children = []
  const siblings = []

  data.forEach(rel => {
    const isFirst  = rel.ruler_id_1 === rulerId
    const other    = isFirst ? rel.ruler2 : rel.ruler1

    if (!other) return

    const entry = {
      id:              other.id,
      name:            other.name,
      reign_start:     other.reign_start,
      reign_end:       other.reign_end,
      native_entity_id: other.native_entity_id,
      entity_id:       other.entity_id,
      year_start:      rel.year_start,
      year_end:        rel.year_end,
      notes:           rel.notes,
      isRuler: other.reign_start !== null && !other.title?.toLowerCase().includes('consort'),
      nativeEntityName: other.native_entity_id ? (entityNames[other.native_entity_id] || null) : null,
    }

    if (rel.relation_type === 'spouse') {
      spouses.push(entry)
    } else if (rel.relation_type === 'sibling_of') {
      siblings.push(entry)
    } else if (rel.relation_type === 'parent_of') {
      if (isFirst) {
        // ruler_id_1 is parent → other is child
        children.push(entry)
      } else {
        // ruler_id_2 is this ruler → ruler_id_1 is parent
        parents.push(entry)
      }
    }
  })

  return { spouses, parents, children, siblings }
}

// ── Single person row ────────────────────────────────────────────────────
function PersonRow({ person, label, onJump }) {
  const isForeign = person.native_entity_id && person.native_entity_id !== person.entity_id
  const isRuler   = person.isRuler

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 6,
      padding: '4px 0',
      borderBottom: `1px solid ${gold}22`,
    }}>
      <span style={{ fontSize: 9, color: mid, minWidth: 52, fontFamily: 'Georgia, serif', textAlign: 'right', flexShrink: 0 }}>
        {label}
      </span>
      <div
        onClick={() => onJump(person)}
        style={{
          display: 'flex', alignItems: 'center', gap: 4,
          cursor: 'pointer', flex: 1,
        }}
        onMouseEnter={e => e.currentTarget.style.color = dark}
        onMouseLeave={e => e.currentTarget.style.color = mid}
      >
        {isRuler && <span style={{ fontSize: 11 }}>👑</span>}
        {isForeign && (
        <span style={{ fontSize: 10, color: '#6a1b9a', fontFamily: 'Georgia, serif', fontStyle: 'italic', flexShrink: 0 }}>
          🌍 {person.nativeEntityName || 'foreign'}
        </span>
      )}
        <span style={{ fontSize: 12, color: '#2a1a0a', fontFamily: "'Cinzel', serif", fontWeight: isRuler ? 'bold' : 'normal' }}>
          {person.name}
        </span>
        {person.reign_start && (
          <span style={{ fontSize: 9, color: mid, fontFamily: 'Georgia, serif' }}>
            ({person.reign_start}–{person.reign_end})
          </span>
        )}
        {person.notes && (
          <span style={{ fontSize: 9, color: mid, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            — {person.notes}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Section header ───────────────────────────────────────────────────────
function SectionHead({ label }) {
  return (
    <div style={{
      fontSize: 9, color: mid, textTransform: 'uppercase',
      letterSpacing: 1.5, fontFamily: "'Cinzel', serif",
      marginTop: 10, marginBottom: 2,
      borderBottom: `1px solid ${gold}`,
      paddingBottom: 2,
    }}>
      {label}
    </div>
  )
}

// ── Main FamilyPanel component ───────────────────────────────────────────
export default function FamilyPanel({ rulerId, rulerName, onYearChange }) {
  const [open, setOpen]     = useState(false)
  const [family, setFamily] = useState(null)

  useEffect(() => {
    setFamily(null)
    setOpen(false)
  }, [rulerId])

  useEffect(() => {
    if (!open || !rulerId) return
    fetchFamily(rulerId).then(setFamily)
  }, [open, rulerId])

  const handleJump = (person) => {
    if (person.reign_start) {
      onYearChange(person.reign_start + 1)
    }
  }

  const hasFamily = family && (
    family.spouses.length > 0 ||
    family.parents.length > 0 ||
    family.children.length > 0 ||
    family.siblings.length > 0
  )

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          marginTop: 6,
          padding: '3px 10px',
          background: open ? dark : 'transparent',
          color: open ? '#f5e6c8' : mid,
          border: `1px solid ${gold}`,
          borderRadius: 4,
          fontFamily: "'Cinzel', serif",
          fontSize: 10,
          cursor: 'pointer',
          letterSpacing: 0.5,
        }}
      >
        ♛ Family
      </button>

      {/* Floating panel */}
      {open && (
        <div style={{
          position: 'fixed',
          top: 420,
          left: 20,
          width: 420,
          maxHeight: 'calc(100vh - 380px)',
          background: parchment,
          border: `2px solid ${gold}`,
          borderRadius: 10,
          boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          zIndex: 100,
          overflowY: 'auto',
          fontFamily: "'Cinzel', serif",
        }}>
          {/* Header */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 14px',
            background: dark,
            borderRadius: '8px 8px 0 0',
            position: 'sticky', top: 0, zIndex: 1,
          }}>
            <div>
              <div style={{ fontSize: 9, color: gold, textTransform: 'uppercase', letterSpacing: 2 }}>Family</div>
              <div style={{ fontSize: 14, color: '#f5e6c8', fontWeight: 'bold' }}>{rulerName}</div>
            </div>
            <button
              onClick={() => setOpen(false)}
              style={{
                background: '#c62828', border: 'none',
                color: '#fff', fontSize: 16, cursor: 'pointer',
                lineHeight: 1, width: 28, height: 28,
                borderRadius: 4, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>✕</button>
          </div>

          {/* Body */}
          <div style={{ padding: '10px 14px' }}>
            {!family && (
              <div style={{ fontSize: 11, color: mid, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>Loading…</div>
            )}

            {family && !hasFamily && (
              <div style={{ fontSize: 11, color: mid, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
                No family relations recorded yet.
              </div>
            )}

            {family && hasFamily && (
              <>
                {family.spouses.length > 0 && (
                  <>
                    <SectionHead label="Wife" />
                    {family.spouses.map(p => (
                      <PersonRow key={p.id} person={p} label="⚭" onJump={handleJump} />
                    ))}
                  </>
                )}

                {family.parents.length > 0 && (
                  <>
                    <SectionHead label="Parents" />
                    {family.parents.map(p => (
                      <PersonRow key={p.id} person={p} label="parent" onJump={handleJump} />
                    ))}
                  </>
                )}

                {family.children.length > 0 && (
                  <>
                    <SectionHead label="Children" />
                    {family.children.map(p => (
                      <PersonRow key={p.id} person={p} label="child" onJump={handleJump} />
                    ))}
                  </>
                )}

                {family.siblings.length > 0 && (
                  <>
                    <SectionHead label="Siblings" />
                    {family.siblings.map(p => (
                      <PersonRow key={p.id} person={p} label="sibling" onJump={handleJump} />
                    ))}
                  </>
                )}
              </>
            )}

            <div style={{ marginTop: 10, fontSize: 9, color: mid, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
              👑 = ruled · 🌍 = foreign born · click a name to jump to their reign
            </div>
          </div>
        </div>
      )}
    </div>
  )
}