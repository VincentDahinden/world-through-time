import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { supabase } from '../lib/supabase'

const parchment = '#fdf6e3'
const dark      = '#3a2a0a'
const gold      = '#c8a96e'
const mid       = '#7a6040'

async function fetchFamily(rulerId) {
  const { data } = await supabase
    .from('ruler_relations')
    .select(`
      id, relation_type, year_start, year_end, notes, notes_fr,
      ruler_id_1, ruler_id_2,
      ruler1:ruler_id_1 ( id, name, reign_start, reign_end, native_entity_id, entity_id, title ),
      ruler2:ruler_id_2 ( id, name, reign_start, reign_end, native_entity_id, entity_id, title )
    `)
    .or(`ruler_id_1.eq.${rulerId},ruler_id_2.eq.${rulerId}`)

  if (!data) return { spouses: [], parents: [], children: [], siblings: [] }

  const entityIds = [...new Set(data.flatMap(r => [r.ruler1?.native_entity_id, r.ruler2?.native_entity_id]).filter(Boolean))]
  const entityNames = {}
  if (entityIds.length > 0) {
    const { data: entities } = await supabase.from('entities').select('id, name').in('id', entityIds)
    ;(entities || []).forEach(e => { entityNames[e.id] = e.name })
  }

  const spouses = [], parents = [], children = [], siblings = []

  data.forEach(rel => {
    const isFirst = rel.ruler_id_1 === rulerId
    const other   = isFirst ? rel.ruler2 : rel.ruler1
    if (!other) return

    const entry = {
      id:               other.id,
      name:             other.name,
      reign_start:      other.reign_start,
      reign_end:        other.reign_end,
      native_entity_id: other.native_entity_id,
      entity_id:        other.entity_id,
      year_start:       rel.year_start,
      year_end:         rel.year_end,
      notes:    rel.notes,
      notes_fr: rel.notes_fr,
      isRuler:          other.reign_start !== null && !other.title?.toLowerCase().includes('consort'),
      nativeEntityName: other.native_entity_id ? (entityNames[other.native_entity_id] || null) : null,
    }

    if (rel.relation_type === 'spouse') spouses.push(entry)
    else if (rel.relation_type === 'sibling_of') siblings.push(entry)
    else if (rel.relation_type === 'parent_of') {
      if (isFirst) children.push(entry)
      else parents.push(entry)
    }
  })

  return { spouses, parents, children, siblings }
}

function PersonRow({ person, label, onJump, t, language = 'en' }) {
  const isForeign = person.native_entity_id && person.native_entity_id !== person.entity_id
  const isRuler   = person.isRuler

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 0', borderBottom: `1px solid ${gold}22` }}>
      <span style={{ fontSize: 9, color: mid, minWidth: 52, fontFamily: 'Georgia, serif', textAlign: 'right', flexShrink: 0 }}>
        {label}
      </span>
      <div onClick={() => onJump(person)}
        style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer', flex: 1 }}
        onMouseEnter={e => e.currentTarget.style.color = dark}
        onMouseLeave={e => e.currentTarget.style.color = mid}
      >
        {isRuler && <span style={{ fontSize: 11 }}>👑</span>}
        {isForeign && (
          <span style={{ fontSize: 10, color: '#6a1b9a', fontFamily: 'Georgia, serif', fontStyle: 'italic', flexShrink: 0 }}>
            🌍 {person.nativeEntityName || t('foreign')}
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
        {(person.notes || person.notes_fr) && (
          <span style={{ fontSize: 9, color: mid, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
            — {language === 'fr' ? (person.notes_fr || person.notes) : person.notes}
          </span>
        )}
      </div>
    </div>
  )
}

function SectionHead({ label }) {
  return (
    <div style={{ fontSize: 9, color: mid, textTransform: 'uppercase', letterSpacing: 1.5, fontFamily: "'Cinzel', serif", marginTop: 10, marginBottom: 2, borderBottom: `1px solid ${gold}`, paddingBottom: 2 }}>
      {label}
    </div>
  )
}

export default function FamilyPanel({ rulerId, rulerName, onYearChange, language = 'en' }) {
  const { t } = useTranslation('common')
  const [open, setOpen]     = useState(false)
  const [family, setFamily] = useState(null)

  useEffect(() => { setFamily(null); setOpen(false) }, [rulerId])
  useEffect(() => { if (!open || !rulerId) return; fetchFamily(rulerId).then(setFamily) }, [open, rulerId])

  const handleJump = (person) => { if (person.reign_start) onYearChange(person.reign_start + 1) }

  const hasFamily = family && (
    family.spouses.length > 0 || family.parents.length > 0 ||
    family.children.length > 0 || family.siblings.length > 0
  )

  return (
    <div style={{ position: 'relative' }}>
      <button onClick={() => setOpen(o => !o)} style={{
        width: '100%', padding: '5px 10px',
        background: open ? dark : 'transparent',
        color: open ? '#f5e6c8' : dark,
        border: `1px solid ${gold}`, borderRadius: 4,
        fontFamily: "'Cinzel', serif", fontSize: 11,
        cursor: 'pointer', letterSpacing: 0.5,
      }}>
        ♛ {t('family')}
      </button>

      {open && (
        <div style={{ position: 'fixed', top: 420, left: 20, width: 420, maxHeight: 'calc(100vh - 380px)', background: parchment, border: `2px solid ${gold}`, borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.3)', zIndex: 100, overflowY: 'auto', fontFamily: "'Cinzel', serif" }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: dark, borderRadius: '8px 8px 0 0', position: 'sticky', top: 0, zIndex: 1 }}>
            <div>
              <div style={{ fontSize: 9, color: gold, textTransform: 'uppercase', letterSpacing: 2 }}>{t('family')}</div>
              <div style={{ fontSize: 14, color: '#f5e6c8', fontWeight: 'bold' }}>{rulerName}</div>
            </div>
            <button onClick={() => setOpen(false)} style={{ background: '#c62828', border: 'none', color: '#fff', fontSize: 16, cursor: 'pointer', lineHeight: 1, width: 28, height: 28, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>✕</button>
          </div>
          <div style={{ padding: '10px 14px' }}>
            {!family && <div style={{ fontSize: 11, color: mid, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>{t('loading')}</div>}
            {family && !hasFamily && <div style={{ fontSize: 11, color: mid, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>{t('noFamily')}</div>}
            {family && hasFamily && (
              <>
                {family.spouses.length > 0 && (
                  <><SectionHead label={t('wife')} />
                    {family.spouses.map(p => <PersonRow key={p.id} person={p} language={language} label="⚭" onJump={handleJump} t={t} />)}
                  </>
                )}
                {family.parents.length > 0 && (
                  <><SectionHead label={t('parents')} />
                    {family.parents.map(p => <PersonRow key={p.id} person={p} language={language} label={t('parent')} onJump={handleJump} t={t} />)}
                  </>
                )}
                {family.children.length > 0 && (
                  <><SectionHead label={t('children')} />
                    {family.children.map(p => <PersonRow key={p.id} person={p} language={language} label={t('child')} onJump={handleJump} t={t} />)}
                  </>
                )}
                {family.siblings.length > 0 && (
                  <><SectionHead label={t('siblings')} />
                    {family.siblings.map(p => <PersonRow key={p.id} person={p} language={language} label={t('sibling')} onJump={handleJump} t={t} />)}
                  </>
                )}
              </>
            )}
            <div style={{ marginTop: 10, fontSize: 9, color: mid, fontFamily: 'Georgia, serif', fontStyle: 'italic' }}>
              {t('ruledLegend')}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}