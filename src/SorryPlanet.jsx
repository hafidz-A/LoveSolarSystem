import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'

// ============================================================
// SORRY PLANET — a little flower planet with a doodle resident
// ============================================================

const WELCOME_TEXT = 'welcome to sorry planet'
const TOTAL_BOUQUETS = 32

const MSG_HELLO = "Hello… I'm sorry 🥺"
const MSG_LIVE = "I live on this planet — and I'm so happy to see you here! 🌸"
const MSG_GIFTS = 'I have so many gifts for you! Tap me… 💐'
const MSG_LETTER = 'This letter is for you… tap it, please 💌'
const MSG_AGAIN = 'You can read it again anytime… I love you ♡'

const MILESTONE_MSGS = {
  8: 'Hehe… there are still more! 🌷',
  16: 'Halfway through my garden of sorry 🌼',
  24: 'Almost there, my love… 🌻',
  32: "That's all of them! But wait… I have one last thing 💌",
}

const LETTER_PARAGRAPHS = [
  'To my dearest,',
  "I'm sorry for being such a silly boyfriend — and a silly future husband, too. I'm sorry for the times I made you sad and left your little heart aching.",
  "I'm sorry for today, and for tomorrow if I ever get things wrong again — we're only human, and humans make so many mistakes. But I promise to keep becoming a better man, day by day — especially for my beloved girlfriend, my future wife.",
]
const LETTER_SIGNATURE = '— your future husband ♡'

// Deterministic pseudo-random from a seed
function seeded(seed) {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453
  return x - Math.floor(x)
}

const PHASE_ORDER = { boot: 0, welcome: 1, morph: 2, greet: 3, gift: 4, letterOffer: 5, done: 6 }

// ------------------------------------------------------------
// Navigation arrow (shared with App for the card planet side)
// ------------------------------------------------------------
export function NavArrow({ dir, label, onClick }) {
  return (
    <motion.button
      initial={{ opacity: 0, x: dir === 'left' ? -20 : 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: dir === 'left' ? -20 : 20 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`nav-arrow ${dir === 'left' ? 'nav-arrow-left' : 'nav-arrow-right'}`}
      onClick={onClick}
      aria-label={label}
    >
      <span className="nav-arrow-circle">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          {dir === 'left'
            ? <polyline points="15 18 9 12 15 6" />
            : <polyline points="9 18 15 12 9 6" />}
        </svg>
      </span>
      <span className="nav-arrow-label">{label}</span>
    </motion.button>
  )
}

// ------------------------------------------------------------
// Little doodle flowers scattered on the planet face
// ------------------------------------------------------------
function PlanetFlower({ x, y, size, color, type, rotation = 0 }) {
  const petals = []
  if (type === 0) {
    // daisy: ring of petals + warm center
    for (let a = 0; a < 6; a++) {
      const ang = (a / 6) * Math.PI * 2
      petals.push(
        <circle
          key={a}
          cx={x + Math.cos(ang) * size * 0.72}
          cy={y + Math.sin(ang) * size * 0.72}
          r={size * 0.48}
          fill={color}
          stroke="#3d2438"
          strokeWidth="1"
        />
      )
    }
    return (
      <g transform={`rotate(${rotation} ${x} ${y})`}>
        {petals}
        <circle cx={x} cy={y} r={size * 0.42} fill="#ffd166" stroke="#3d2438" strokeWidth="1" />
      </g>
    )
  }
  if (type === 1) {
    // tulip cup
    const r = size
    return (
      <g transform={`rotate(${rotation} ${x} ${y})`}>
        <path
          d={`M ${x - r} ${y} Q ${x - r} ${y - r * 1.25} ${x} ${y - r * 1.05} Q ${x + r} ${y - r * 1.25} ${x + r} ${y} Q ${x + r * 0.5} ${y + r * 0.85} ${x} ${y + r * 0.75} Q ${x - r * 0.5} ${y + r * 0.85} ${x - r} ${y} Z`}
          fill={color}
          stroke="#3d2438"
          strokeWidth="1.2"
        />
        <path d={`M ${x} ${y - r * 1.05} L ${x} ${y + r * 0.4}`} stroke="rgba(61,36,56,0.25)" strokeWidth="1" />
      </g>
    )
  }
  // rose swirl
  return (
    <g transform={`rotate(${rotation} ${x} ${y})`}>
      <circle cx={x} cy={y} r={size} fill={color} stroke="#3d2438" strokeWidth="1.2" />
      <circle cx={x} cy={y} r={size * 0.62} fill="none" stroke="rgba(61,36,56,0.3)" strokeWidth="1" />
      <circle cx={x} cy={y} r={size * 0.28} fill="none" stroke="rgba(61,36,56,0.35)" strokeWidth="1" />
    </g>
  )
}

// ------------------------------------------------------------
// Procedural bouquet — 32 unique combos (8 palettes × 4 styles)
// ------------------------------------------------------------
const BOUQUET_PALETTES = [
  ['#ff4f7e', '#ff85a1', '#ffc3d4'],
  ['#ff6b9d', '#ffd166', '#fff3f6'],
  ['#e8557f', '#ff8fae', '#ffe9a3'],
  ['#ff8c61', '#ffb3c6', '#ffe9dc'],
  ['#f25c8a', '#7fd8a4', '#fffdf7'],
  ['#ff5c8a', '#6ec6ff', '#ffe4f0'],
  ['#d94f7e', '#ffa8c0', '#c9f2d9'],
  ['#ff7096', '#ffde8a', '#ffd0dd'],
]
const WRAP_COLORS = ['#f5e3c2', '#ffffff', '#ffd9e6', '#e6f6ec']

function BouquetHead({ x, y, r, color, type }) {
  if (type === 0) {
    // pom daisy
    const dots = []
    for (let a = 0; a < 5; a++) {
      const ang = (a / 5) * Math.PI * 2 - Math.PI / 2
      dots.push(
        <circle key={a} cx={x + Math.cos(ang) * r * 0.75} cy={y + Math.sin(ang) * r * 0.75} r={r * 0.5} fill={color} stroke="#3d2438" strokeWidth="1.1" />
      )
    }
    return <g>{dots}<circle cx={x} cy={y} r={r * 0.45} fill="#ffd166" stroke="#3d2438" strokeWidth="1.1" /></g>
  }
  if (type === 1) {
    // tulip
    return (
      <path
        d={`M ${x - r} ${y + r * 0.3} Q ${x - r} ${y - r} ${x} ${y - r * 0.8} Q ${x + r} ${y - r} ${x + r} ${y + r * 0.3} Q ${x + r * 0.5} ${y + r} ${x} ${y + r * 0.9} Q ${x - r * 0.5} ${y + r} ${x - r} ${y + r * 0.3} Z`}
        fill={color} stroke="#3d2438" strokeWidth="1.3"
      />
    )
  }
  if (type === 2) {
    // rose swirl
    return (
      <g>
        <circle cx={x} cy={y} r={r} fill={color} stroke="#3d2438" strokeWidth="1.3" />
        <circle cx={x} cy={y} r={r * 0.6} fill="none" stroke="rgba(61,36,56,0.35)" strokeWidth="1" />
        <circle cx={x} cy={y} r={r * 0.26} fill="none" stroke="rgba(61,36,56,0.4)" strokeWidth="1" />
      </g>
    )
  }
  // bell cluster
  return (
    <g>
      <circle cx={x} cy={y - r * 0.5} r={r * 0.55} fill={color} stroke="#3d2438" strokeWidth="1.1" />
      <circle cx={x - r * 0.55} cy={y + r * 0.25} r={r * 0.48} fill={color} stroke="#3d2438" strokeWidth="1.1" />
      <circle cx={x + r * 0.55} cy={y + r * 0.25} r={r * 0.48} fill={color} stroke="#3d2438" strokeWidth="1.1" />
    </g>
  )
}

const HEAD_SPOTS = [
  [50, 26], [32, 40], [68, 40], [40, 14], [60, 14], [24, 26], [76, 26],
]

export function BouquetSVG({ seed, size = 72 }) {
  const palette = BOUQUET_PALETTES[seed % 8]
  const type = Math.floor(seed / 8) % 4
  const wrap = WRAP_COLORS[(seed + Math.floor(seed / 4)) % 4]
  const count = 5 + (seed % 3)
  const heads = HEAD_SPOTS.slice(0, count)

  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 100 130" style={{ overflow: 'visible' }}>
      {/* stems */}
      {heads.map(([hx, hy], i) => (
        <path key={`s${i}`} d={`M 50 100 Q ${(50 + hx) / 2} ${(100 + hy) / 2 + 6} ${hx} ${hy + 8}`} fill="none" stroke="#5a8a5e" strokeWidth="2" strokeLinecap="round" />
      ))}
      {/* greenery */}
      <path d="M 42 70 Q 30 58 26 46" fill="none" stroke="#7cb083" strokeWidth="2" strokeLinecap="round" />
      <path d="M 58 70 Q 70 58 74 46" fill="none" stroke="#7cb083" strokeWidth="2" strokeLinecap="round" />
      {/* wrap cone */}
      <path d="M 29 60 L 47 118 Q 50 124 53 118 L 71 60 Q 50 74 29 60 Z" fill={wrap} stroke="#3d2438" strokeWidth="2" strokeLinejoin="round" />
      <path d="M 29 60 Q 50 74 71 60" fill="none" stroke="rgba(61,36,56,0.35)" strokeWidth="1.3" />
      <path d="M 50 71 L 50 112" fill="none" stroke="rgba(61,36,56,0.18)" strokeWidth="1.2" />
      {/* ribbon */}
      <circle cx="50" cy="88" r="4.5" fill={palette[1]} stroke="#3d2438" strokeWidth="1.2" />
      <path d="M 45.5 88 Q 38 84 36 90 Q 42 93 45.5 88 Z" fill={palette[1]} stroke="#3d2438" strokeWidth="1" />
      <path d="M 54.5 88 Q 62 84 64 90 Q 58 93 54.5 88 Z" fill={palette[1]} stroke="#3d2438" strokeWidth="1" />
      {/* flower heads */}
      {heads.map(([hx, hy], i) => (
        <BouquetHead key={`h${i}`} x={hx} y={hy} r={9 + (i % 3) * 1.6} color={palette[i % 3]} type={type} />
      ))}
    </svg>
  )
}

// ------------------------------------------------------------
// 32 landing slots framing the screen edges (center stays clear)
// ------------------------------------------------------------
function buildSlots() {
  const top = [], bottom = [], left = [], right = []
  for (let k = 0; k < 8; k++) {
    top.push({ x: 7 + k * 12.3 + (seeded(k) - 0.5) * 3, y: 5 + seeded(k + 10) * 3.5 })
    bottom.push({ x: 7 + k * 12.3 + (seeded(k + 20) - 0.5) * 3, y: 88 + seeded(k + 30) * 4 })
    left.push({ x: 3.5 + seeded(k + 40) * 2.5, y: 15 + k * 9.6 })
    right.push({ x: 92 + seeded(k + 50) * 2.5, y: 15 + k * 9.6 })
  }
  // interleave edges so the frame fills evenly all around
  const slots = []
  for (let k = 0; k < 8; k++) {
    slots.push(top[k], bottom[7 - k], left[k], right[7 - k])
  }
  return slots.map((s, i) => ({
    ...s,
    rot: (seeded(i + 60) - 0.5) * 36,
    size: 54 + seeded(i + 70) * 26,
  }))
}

// ------------------------------------------------------------
// Main component — stays mounted after first visit so progress
// is preserved; the replay button resets everything.
// ------------------------------------------------------------
export default function SorryPlanet({ active, onBack }) {
  const [phase, setPhase] = useState('boot')
  const [bubble, setBubble] = useState(null)
  const [bouquets, setBouquets] = useState([])
  const [hearts, setHearts] = useState([])
  const [letterOpen, setLetterOpen] = useState(false)
  const [letterInstant, setLetterInstant] = useState(false)
  const [hasReadLetter, setHasReadLetter] = useState(false)
  const doodleControls = useAnimationControls()
  const milestoneTimer = useRef(null)
  const heartTimer = useRef(null)

  const at = useCallback(p => PHASE_ORDER[phase] >= PHASE_ORDER[p], [phase])
  const slots = useMemo(buildSlots, [])

  // Interior + rim flowers on the planet face (dominant pink, colorful accents)
  const planetFlora = useMemo(() => {
    const pinks = ['#ff4f7e', '#ff6b9d', '#e8557f', '#ff8fae', '#ff85a1']
    const accents = ['#ffd166', '#ff8c61', '#7fd8a4', '#6ec6ff', '#fffdf7']
    const inner = []
    for (let i = 0; i < 30; i++) {
      const ang = seeded(i * 3 + 1) * Math.PI * 2
      const rad = 150 * Math.sqrt(seeded(i * 3 + 2)) * 0.86
      const isPink = seeded(i * 3 + 3) < 0.7
      inner.push({
        x: 200 + Math.cos(ang) * rad,
        y: 300 + Math.sin(ang) * rad,
        size: 7 + seeded(i * 5 + 4) * 9,
        color: isPink ? pinks[i % 5] : accents[i % 5],
        type: i % 3,
        rotation: seeded(i * 7 + 5) * 360,
      })
    }
    const rim = []
    for (let i = 0; i < 9; i++) {
      const deg = -158 + i * 16.5
      const ang = (deg * Math.PI) / 180
      const isPink = seeded(i * 11 + 6) < 0.65
      rim.push({
        deg,
        bx: 200 + Math.cos(ang) * 148,
        by: 300 + Math.sin(ang) * 148,
        tx: 200 + Math.cos(ang) * (166 + seeded(i * 13 + 7) * 12),
        ty: 300 + Math.sin(ang) * (166 + seeded(i * 13 + 7) * 12),
        size: 8 + seeded(i * 17 + 8) * 5,
        color: isPink ? pinks[i % 5] : accents[(i + 2) % 5],
        type: i % 3,
      })
    }
    return { inner, rim }
  }, [])

  // Morph targets for each character of the welcome text
  const charTargets = useMemo(() => {
    const chars = WELCOME_TEXT.split('')
    const mid = (chars.length - 1) / 2
    return chars.map((c, i) => ({
      char: c,
      tx: (mid - i) * 15 + (seeded(i + 90) - 0.5) * 36,
      ty: (typeof window !== 'undefined' ? window.innerHeight : 800) * 0.16 + (seeded(i + 110) - 0.5) * 44,
      rot: (seeded(i + 130) - 0.5) * 220,
    }))
  }, [])

  // Timeline: boot → welcome → morph → greet → gift
  useEffect(() => {
    if (phase === 'boot') {
      const t = setTimeout(() => setPhase('welcome'), 1100)
      return () => clearTimeout(t)
    }
    if (phase === 'welcome') {
      const t = setTimeout(() => setPhase('morph'), 3700)
      return () => clearTimeout(t)
    }
    if (phase === 'morph') {
      const t = setTimeout(() => setPhase('greet'), 2800)
      return () => clearTimeout(t)
    }
    if (phase === 'greet') {
      setBubble(MSG_HELLO)
      const a = setTimeout(() => setBubble(MSG_LIVE), 2800)
      const b = setTimeout(() => {
        setBubble(MSG_GIFTS)
        setPhase('gift')
      }, 6600)
      return () => { clearTimeout(a); clearTimeout(b) }
    }
  }, [phase])

  useEffect(() => () => {
    clearTimeout(milestoneTimer.current)
    clearTimeout(heartTimer.current)
  }, [])

  const handleDoodleTap = useCallback(() => {
    if (phase !== 'gift') return
    if (bouquets.length >= TOTAL_BOUQUETS) return
    const id = bouquets.length
    const n = id + 1

    setBouquets(prev => (prev.length >= TOTAL_BOUQUETS ? prev : [...prev, prev.length]))
    doodleControls.start({ scale: [1, 1.13, 1], transition: { duration: 0.35 } })
    setHearts(h => [...h.slice(-4).filter(x => x.id !== id), { id }])
    clearTimeout(heartTimer.current)
    heartTimer.current = setTimeout(() => setHearts([]), 1300)

    clearTimeout(milestoneTimer.current)
    if (MILESTONE_MSGS[n]) {
      setBubble(MILESTONE_MSGS[n])
      if (n === TOTAL_BOUQUETS) {
        milestoneTimer.current = setTimeout(() => {
          setPhase('letterOffer')
          setBubble(MSG_LETTER)
        }, 3200)
      } else {
        milestoneTimer.current = setTimeout(() => setBubble(null), 2400)
      }
    } else {
      setBubble(null)
    }
  }, [phase, bouquets.length, doodleControls])

  const openLetter = useCallback(() => {
    setLetterInstant(false)
    setLetterOpen(true)
  }, [])

  const closeLetter = useCallback(() => {
    setLetterOpen(false)
    if (!hasReadLetter) {
      setHasReadLetter(true)
      setPhase('done')
      setBubble(MSG_AGAIN)
      clearTimeout(milestoneTimer.current)
      milestoneTimer.current = setTimeout(() => setBubble(null), 4200)
    }
  }, [hasReadLetter])

  const replay = useCallback(() => {
    clearTimeout(milestoneTimer.current)
    clearTimeout(heartTimer.current)
    setBouquets([])
    setHearts([])
    setBubble(null)
    setLetterOpen(false)
    setHasReadLetter(false)
    setPhase('boot')
  }, [])

  const showLetterPose = at('letterOffer')
  const doodleDrawn = at('morph')

  return (
    <div
      className="fixed inset-0 z-30 overflow-hidden"
      style={{
        transform: active ? 'translateX(0)' : 'translateX(-100vw)',
        transition: 'transform 1.15s cubic-bezier(0.65, 0, 0.35, 1)',
        pointerEvents: active ? 'auto' : 'none',
      }}
    >
      {/* soft glow behind the planet so it pops against the pink-purple atmosphere */}
      <div className="sp-planet-glow" />

      {/* ── PLANET + DOODLE ── */}
      <div className="sp-planet-wrap">
        <motion.svg
          viewBox="0 0 400 460"
          className="w-full h-auto"
          style={{ overflow: 'visible' }}
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 1.4, ease: 'easeOut', delay: 0.4 }}
        >
          <defs>
            <radialGradient id="sp-planet-grad" cx="42%" cy="34%" r="80%">
              <stop offset="0%" stopColor="#fff0f4" />
              <stop offset="45%" stopColor="#ffd3e0" />
              <stop offset="100%" stopColor="#ffaac4" />
            </radialGradient>
          </defs>

          {/* rim flowers peeking over the horizon */}
          {planetFlora.rim.map((f, i) => (
            <g key={`rim${i}`}>
              <path d={`M ${f.bx} ${f.by} L ${f.tx} ${f.ty}`} stroke="#5a8a5e" strokeWidth="2.5" strokeLinecap="round" />
              <PlanetFlower x={f.tx} y={f.ty} size={f.size} color={f.color} type={f.type} />
            </g>
          ))}

          {/* planet body */}
          <circle cx="200" cy="300" r="150" fill="url(#sp-planet-grad)" stroke="#e0537f" strokeWidth="4" />
          {/* lower shading for depth */}
          <path d="M 68 360 A 150 150 0 0 0 332 360 A 190 170 0 0 1 68 360 Z" fill="rgba(216, 64, 120, 0.14)" />
          {/* grass tufts along the top curve */}
          {[-140, -115, -68, -40, -12].map((deg, i) => {
            const ang = (deg * Math.PI) / 180
            const gx = 200 + Math.cos(ang) * 147
            const gy = 300 + Math.sin(ang) * 147
            return (
              <path
                key={`grass${i}`}
                d={`M ${gx - 5} ${gy + 3} Q ${gx - 3} ${gy - 7} ${gx - 1} ${gy + 2} M ${gx} ${gy + 2} Q ${gx + 2} ${gy - 9} ${gx + 4} ${gy + 1}`}
                stroke="#6aa870" strokeWidth="2" fill="none" strokeLinecap="round"
              />
            )
          })}
          {/* interior flowers */}
          {planetFlora.inner.map((f, i) => (
            <PlanetFlower key={`in${i}`} {...f} />
          ))}

          {/* ── DOODLE RESIDENT ── */}
          <motion.g animate={doodleControls} style={{ transformBox: 'view-box', transformOrigin: '200px 150px' }}>
            <motion.g
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {/* tap hint ring before the first bouquet */}
              {phase === 'gift' && bouquets.length === 0 && (
                <motion.circle
                  cx="200" cy="85" r="66" fill="none" stroke="#ff5c8a" strokeWidth="2.5"
                  style={{ transformBox: 'view-box', transformOrigin: '200px 85px' }}
                  animate={{ scale: [0.82, 1.22], opacity: [0.55, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                />
              )}

              <g
                onClick={handleDoodleTap}
                style={{ cursor: phase === 'gift' ? 'pointer' : 'default' }}
              >
                {/* generous invisible hit area for tapping */}
                <circle cx="200" cy="85" r="82" fill="transparent" />

                {/* body strokes draw themselves in during the morph */}
                {[
                  { el: 'circle', cx: 200, cy: 52, r: 30 },
                  { d: 'M 188 24 Q 192 12 200 16' },
                  { d: 'M 202 22 Q 208 10 214 18' },
                  { d: 'M 200 82 Q 197 102 200 122' },
                  { d: 'M 200 122 Q 194 138 189 150' },
                  { d: 'M 200 122 Q 206 138 211 150' },
                  { d: 'M 189 150 Q 184 152 180 151' },
                  { d: 'M 211 150 Q 216 152 220 151' },
                ].map((s, i) => {
                  const common = {
                    fill: 'none',
                    stroke: '#3d2438',
                    strokeWidth: 5,
                    strokeLinecap: 'round',
                    initial: { pathLength: 0, opacity: 0 },
                    animate: doodleDrawn ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 },
                    transition: { duration: 0.55, delay: doodleDrawn ? 0.5 + i * 0.14 : 0, ease: 'easeInOut' },
                  }
                  return s.el === 'circle'
                    ? <motion.circle key={i} cx={s.cx} cy={s.cy} r={s.r} {...common} fill="#fff8fa" />
                    : <motion.path key={i} d={s.d} {...common} />
                })}

                {/* face fades in after the strokes */}
                <motion.g
                  initial={{ opacity: 0 }}
                  animate={{ opacity: doodleDrawn ? 1 : 0 }}
                  transition={{ duration: 0.6, delay: doodleDrawn ? 1.8 : 0 }}
                >
                  <path d="M 186 48 Q 191 53 196 48" fill="none" stroke="#3d2438" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M 204 48 Q 209 53 214 48" fill="none" stroke="#3d2438" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M 191 62 Q 200 70 209 62" fill="none" stroke="#3d2438" strokeWidth="3.5" strokeLinecap="round" />
                  <circle cx="178" cy="59" r="5" fill="#ffb3c6" opacity="0.7" />
                  <circle cx="222" cy="59" r="5" fill="#ffb3c6" opacity="0.7" />
                </motion.g>

                {/* normal pose: left arm + waving right arm */}
                {!showLetterPose && (
                  <>
                    <motion.path
                      d="M 200 95 Q 186 106 176 114"
                      fill="none" stroke="#3d2438" strokeWidth="5" strokeLinecap="round"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={doodleDrawn ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                      transition={{ duration: 0.5, delay: doodleDrawn ? 1.3 : 0 }}
                    />
                    {/* small bouquet in hand while gifting */}
                    {phase === 'gift' && bouquets.length < TOTAL_BOUQUETS && (
                      <motion.g
                        key={bouquets.length}
                        initial={{ scale: 0.4, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: 'spring', bounce: 0.5, duration: 0.5 }}
                        style={{ transformBox: 'view-box', transformOrigin: '172px 118px' }}
                      >
                        <path d="M 166 122 L 172 108 L 178 122 Z" fill="#f5e3c2" stroke="#3d2438" strokeWidth="1.5" strokeLinejoin="round" />
                        <circle cx="167" cy="104" r="4.5" fill="#ff4f7e" stroke="#3d2438" strokeWidth="1" />
                        <circle cx="174" cy="100" r="4.5" fill="#ffd166" stroke="#3d2438" strokeWidth="1" />
                        <circle cx="179" cy="106" r="4.5" fill="#ff8fae" stroke="#3d2438" strokeWidth="1" />
                      </motion.g>
                    )}
                    <motion.g
                      style={{ transformBox: 'view-box', transformOrigin: '200px 95px' }}
                      animate={at('greet') ? { rotate: [0, -16, 6, -16, 0] } : { rotate: 0 }}
                      transition={at('greet') ? { duration: 1.6, repeat: Infinity, repeatDelay: 1.4, ease: 'easeInOut' } : {}}
                    >
                      <motion.path
                        d="M 200 95 Q 214 90 226 76 Q 230 71 234 66"
                        fill="none" stroke="#3d2438" strokeWidth="5" strokeLinecap="round"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={doodleDrawn ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                        transition={{ duration: 0.5, delay: doodleDrawn ? 1.45 : 0 }}
                      />
                    </motion.g>
                  </>
                )}

                {/* letter pose: both arms forward holding the envelope */}
                {showLetterPose && (
                  <>
                    <path d="M 200 95 Q 188 112 191 124" fill="none" stroke="#3d2438" strokeWidth="5" strokeLinecap="round" />
                    <path d="M 200 95 Q 212 112 209 124" fill="none" stroke="#3d2438" strokeWidth="5" strokeLinecap="round" />
                  </>
                )}
              </g>

              {/* the envelope gift */}
              {showLetterPose && (
                <motion.g
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', bounce: 0.55, duration: 0.9, delay: 0.3 }}
                  style={{ transformBox: 'view-box', transformOrigin: '200px 140px', cursor: 'pointer' }}
                  onClick={openLetter}
                >
                  <motion.g
                    animate={{ scale: [1, 1.07, 1] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                    style={{ transformBox: 'view-box', transformOrigin: '200px 140px' }}
                  >
                    <rect x="170" y="120" width="60" height="40" rx="5" fill="#fffdf7" stroke="#3d2438" strokeWidth="3" />
                    <path d="M 170 124 L 200 146 L 230 124" fill="none" stroke="#3d2438" strokeWidth="2.5" strokeLinejoin="round" />
                    <path d="M 200 132 c -3 -5 -10 -3 -10 2 c 0 4 6 7 10 10 c 4 -3 10 -6 10 -10 c 0 -5 -7 -7 -10 -2 Z" fill="#ff4f7e" stroke="#3d2438" strokeWidth="1.2" />
                  </motion.g>
                </motion.g>
              )}
            </motion.g>
          </motion.g>
        </motion.svg>
      </div>

      {/* ── WELCOME TEXT → morphs into the doodle ── */}
      {(phase === 'welcome' || phase === 'morph') && (
        <div className="sp-welcome">
          {charTargets.map((c, i) => (
            <motion.span
              key={i}
              className="inline-block"
              initial={{ opacity: 0, y: 16, filter: 'blur(6px)' }}
              animate={
                phase === 'welcome'
                  ? { opacity: 1, y: 0, filter: 'blur(0px)' }
                  : { opacity: [1, 1, 0], x: c.tx, y: c.ty, scaleY: 0.12, rotate: c.rot, filter: 'blur(1px)' }
              }
              transition={
                phase === 'welcome'
                  ? { duration: 0.6, delay: 0.4 + i * 0.08, ease: 'easeOut' }
                  : { duration: 1.6, delay: i * 0.04, ease: 'easeInOut' }
              }
            >
              {c.char === ' ' ? ' ' : c.char}
            </motion.span>
          ))}
        </div>
      )}

      {/* ── SPEECH BUBBLE ── */}
      <AnimatePresence mode="wait">
        {bubble && !letterOpen && (
          <motion.div
            key={bubble}
            className="sp-bubble"
            initial={{ opacity: 0, scale: 0.7, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -8 }}
            transition={{ type: 'spring', bounce: 0.4, duration: 0.5 }}
          >
            {bubble.split(' ').map((w, i) => (
              <motion.span
                key={i}
                className="inline-block"
                style={{ marginRight: '0.28em' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15 + i * 0.07, duration: 0.25 }}
              >
                {w}
              </motion.span>
            ))}
            <span className="sp-bubble-tail" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── COLLECTED BOUQUETS framing the screen ── */}
      {bouquets.map(id => {
        const slot = slots[id]
        return (
          <motion.div
            key={id}
            className="fixed pointer-events-none"
            style={{
              zIndex: 35,
              marginLeft: -slot.size / 2,
              marginTop: -slot.size * 0.65,
              filter: 'drop-shadow(0 4px 10px rgba(216, 64, 120, 0.25))',
            }}
            initial={{ left: '50%', top: '30%', scale: 0.15, opacity: 0, rotate: 0 }}
            animate={{ left: `${slot.x}%`, top: `${slot.y}%`, scale: 1, opacity: 1, rotate: slot.rot }}
            transition={{ type: 'spring', stiffness: 55, damping: 13, mass: 0.9 }}
          >
            <BouquetSVG seed={id} size={slot.size} />
          </motion.div>
        )
      })}

      {/* little hearts popping on each tap */}
      <AnimatePresence>
        {hearts.map(h => (
          <motion.div
            key={h.id}
            className="fixed pointer-events-none text-2xl"
            style={{ left: '50%', top: '26%', zIndex: 36 }}
            initial={{ opacity: 1, y: 0, x: (seeded(h.id + 200) - 0.5) * 90, scale: 0.6 }}
            animate={{ opacity: 0, y: -70, scale: 1.15 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.1, ease: 'easeOut' }}
          >
            💗
          </motion.div>
        ))}
      </AnimatePresence>

      {/* ── THE HANDWRITTEN LETTER ── */}
      <AnimatePresence>
        {letterOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center"
            style={{ zIndex: 60 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="sp-letter"
              initial={{ scale: 0.55, y: 60, rotate: -7, opacity: 0 }}
              animate={{ scale: 1, y: 0, rotate: -1.5, opacity: 1 }}
              exit={{ scale: 0.6, y: 40, opacity: 0 }}
              transition={{ type: 'spring', bounce: 0.35, duration: 0.9 }}
              onClick={() => setLetterInstant(true)}
            >
              <button className="sp-letter-close" onClick={(e) => { e.stopPropagation(); closeLetter() }}>✕</button>

              {(() => {
                let gi = 0
                return LETTER_PARAGRAPHS.map((para, pi) => (
                  <p key={pi} className="sp-letter-para">
                    {para.split('').map((ch, ci) => {
                      const delay = 0.8 + gi * 0.022
                      gi += 1
                      if (letterInstant) return <span key={`i${ci}`}>{ch}</span>
                      return (
                        <motion.span
                          key={ci}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay, duration: 0.06 }}
                        >
                          {ch}
                        </motion.span>
                      )
                    })}
                  </p>
                ))
              })()}

              {letterInstant ? (
                <p className="sp-letter-sign">{LETTER_SIGNATURE}</p>
              ) : (
                <motion.p
                  className="sp-letter-sign"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8 + (LETTER_PARAGRAPHS.join('').length) * 0.022 + 0.5, duration: 0.9 }}
                >
                  {LETTER_SIGNATURE}
                </motion.p>
              )}

              {!letterInstant && <span className="sp-letter-hint">tap the letter to finish writing ✎</span>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONTROLS ── */}
      <AnimatePresence>
        {!letterOpen && (
          <NavArrow key="back-arrow" dir="right" label="our planet" onClick={onBack} />
        )}
      </AnimatePresence>

      {at('gift') && !letterOpen && (
        <motion.button
          className="sp-replay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          onClick={replay}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          <span>replay</span>
        </motion.button>
      )}
    </div>
  )
}
