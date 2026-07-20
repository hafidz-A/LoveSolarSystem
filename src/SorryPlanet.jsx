import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import { motion, AnimatePresence, useAnimationControls } from 'framer-motion'

// ============================================================
// SORRY PLANET — overlay for the pink flower planet that lives
// on the orbit next to the card planet. The planet itself is a
// 3D sphere rendered in the solar-system canvas; this overlay
// adds the doodle resident, rim flowers, gifts, and the letter.
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

// Same camera math as the solar system so the overlay hugs the 3D planet
const CAMERA_Z = 15
const CAMERA_FOV = 60
const PLANET_RADIUS_3D = 1.8

function getPlanetScreenSize() {
  const fovRad = (CAMERA_FOV / 2) * Math.PI / 180
  const visibleHeight = 2 * CAMERA_Z * Math.tan(fovRad)
  const fraction = (PLANET_RADIUS_3D * 2) / visibleHeight
  const baseSize = fraction * window.innerHeight
  const maxSize = Math.min(window.innerWidth, window.innerHeight) * 0.30
  return Math.min(baseSize, maxSize)
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
// Little doodle flowers along the planet's horizon
// ------------------------------------------------------------
function PlanetFlower({ x, y, size, color, type, rotation = 0 }) {
  if (type === 0) {
    const petals = []
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
    const r = size
    return (
      <g transform={`rotate(${rotation} ${x} ${y})`}>
        <path
          d={`M ${x - r} ${y} Q ${x - r} ${y - r * 1.25} ${x} ${y - r * 1.05} Q ${x + r} ${y - r * 1.25} ${x + r} ${y} Q ${x + r * 0.5} ${y + r * 0.85} ${x} ${y + r * 0.75} Q ${x - r * 0.5} ${y + r * 0.85} ${x - r} ${y} Z`}
          fill={color}
          stroke="#3d2438"
          strokeWidth="1.2"
        />
      </g>
    )
  }
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
    return (
      <path
        d={`M ${x - r} ${y + r * 0.3} Q ${x - r} ${y - r} ${x} ${y - r * 0.8} Q ${x + r} ${y - r} ${x + r} ${y + r * 0.3} Q ${x + r * 0.5} ${y + r} ${x} ${y + r * 0.9} Q ${x - r * 0.5} ${y + r} ${x - r} ${y + r * 0.3} Z`}
        fill={color} stroke="#3d2438" strokeWidth="1.3"
      />
    )
  }
  if (type === 2) {
    return (
      <g>
        <circle cx={x} cy={y} r={r} fill={color} stroke="#3d2438" strokeWidth="1.3" />
        <circle cx={x} cy={y} r={r * 0.6} fill="none" stroke="rgba(61,36,56,0.35)" strokeWidth="1" />
        <circle cx={x} cy={y} r={r * 0.26} fill="none" stroke="rgba(61,36,56,0.4)" strokeWidth="1" />
      </g>
    )
  }
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

export function BouquetSVG({ seed, size = 96 }) {
  const palette = BOUQUET_PALETTES[seed % 8]
  const type = Math.floor(seed / 8) % 4
  const wrap = WRAP_COLORS[(seed + Math.floor(seed / 4)) % 4]
  const count = 5 + (seed % 3)
  const heads = HEAD_SPOTS.slice(0, count)

  return (
    <svg width={size} height={size * 1.3} viewBox="0 0 100 130" style={{ overflow: 'visible' }}>
      {heads.map(([hx, hy], i) => (
        <path key={`s${i}`} d={`M 50 100 Q ${(50 + hx) / 2} ${(100 + hy) / 2 + 6} ${hx} ${hy + 8}`} fill="none" stroke="#5a8a5e" strokeWidth="2" strokeLinecap="round" />
      ))}
      <path d="M 42 70 Q 30 58 26 46" fill="none" stroke="#7cb083" strokeWidth="2" strokeLinecap="round" />
      <path d="M 58 70 Q 70 58 74 46" fill="none" stroke="#7cb083" strokeWidth="2" strokeLinecap="round" />
      <path d="M 29 60 L 47 118 Q 50 124 53 118 L 71 60 Q 50 74 29 60 Z" fill={wrap} stroke="#3d2438" strokeWidth="2" strokeLinejoin="round" />
      <path d="M 29 60 Q 50 74 71 60" fill="none" stroke="rgba(61,36,56,0.35)" strokeWidth="1.3" />
      <path d="M 50 71 L 50 112" fill="none" stroke="rgba(61,36,56,0.18)" strokeWidth="1.2" />
      <circle cx="50" cy="88" r="4.5" fill={palette[1]} stroke="#3d2438" strokeWidth="1.2" />
      <path d="M 45.5 88 Q 38 84 36 90 Q 42 93 45.5 88 Z" fill={palette[1]} stroke="#3d2438" strokeWidth="1" />
      <path d="M 54.5 88 Q 62 84 64 90 Q 58 93 54.5 88 Z" fill={palette[1]} stroke="#3d2438" strokeWidth="1" />
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
    top.push({ x: 7 + k * 12.3 + (seeded(k) - 0.5) * 3, y: 6 + seeded(k + 10) * 3.5 })
    bottom.push({ x: 7 + k * 12.3 + (seeded(k + 20) - 0.5) * 3, y: 86 + seeded(k + 30) * 4 })
    left.push({ x: 4 + seeded(k + 40) * 2.5, y: 16 + k * 9.4 })
    right.push({ x: 91 + seeded(k + 50) * 2.5, y: 16 + k * 9.4 })
  }
  const slots = []
  for (let k = 0; k < 8; k++) {
    slots.push(top[k], bottom[7 - k], left[k], right[7 - k])
  }
  return slots.map((s, i) => ({
    ...s,
    rot: (seeded(i + 60) - 0.5) * 36,
    sizeSeed: seeded(i + 70),
  }))
}

// Bigger bouquets, scaled to the viewport
function slotSize(sizeSeed) {
  const base = Math.min(window.innerWidth, window.innerHeight)
  return Math.max(64, base * 0.115 + sizeSeed * base * 0.05)
}

// ------------------------------------------------------------
// The doodle resident — natural little movements:
// blinking, swaying, breathing bob, an elbow-pivot wave,
// a happy hop + arm fling on every tap.
// ------------------------------------------------------------
function Doodle({ phase, at, drawn, bouquetCount, hopControls, onTap, onEnvelopeTap }) {
  const showLetterPose = at('letterOffer')
  const waving = phase === 'greet' || phase === 'morph'

  const strokeProps = (i) => ({
    fill: 'none',
    stroke: '#3d2438',
    strokeWidth: 5,
    strokeLinecap: 'round',
    initial: { pathLength: 0, opacity: 0 },
    animate: drawn ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 },
    transition: { duration: 0.55, delay: drawn ? 0.4 + i * 0.13 : 0, ease: 'easeInOut' },
  })

  return (
    <motion.g animate={hopControls} style={{ transformBox: 'view-box', transformOrigin: '60px 166px' }}>
      {/* gentle sway from the feet, like shifting weight */}
      <motion.g
        animate={{ rotate: [-1.4, 1.4, -1.4] }}
        transition={{ duration: 5.6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformBox: 'view-box', transformOrigin: '60px 166px' }}
      >
        {/* breathing bob */}
        <motion.g
          animate={{ y: [0, -2.5, 0] }}
          transition={{ duration: 3.1, repeat: Infinity, ease: 'easeInOut' }}
        >
          <g onClick={onTap} style={{ cursor: phase === 'gift' ? 'pointer' : 'default' }}>
            {/* generous invisible hit area */}
            <circle cx="60" cy="80" r="78" fill="transparent" />

            {/* legs + feet */}
            <motion.path d="M 60 120 Q 52 140 48 162" {...strokeProps(3)} />
            <motion.path d="M 60 120 Q 68 140 72 162" {...strokeProps(4)} />
            <motion.path d="M 48 162 Q 43 164 38 163" {...strokeProps(5)} />
            <motion.path d="M 72 162 Q 77 164 82 163" {...strokeProps(6)} />

            {/* body */}
            <motion.path d="M 60 60 Q 57 90 60 120" {...strokeProps(2)} />

            {/* head with a tiny curious tilt */}
            <motion.g
              animate={{ rotate: [0, -2.5, 0, 2.5, 0] }}
              transition={{ duration: 7.2, repeat: Infinity, ease: 'easeInOut' }}
              style={{ transformBox: 'view-box', transformOrigin: '60px 58px' }}
            >
              <motion.circle cx="60" cy="34" r="26" {...strokeProps(0)} fill="#fff8fa" />
              <motion.path d="M 50 10 Q 54 0 60 4" {...strokeProps(1)} strokeWidth={4} />
              <motion.path d="M 62 8 Q 67 -2 72 4" {...strokeProps(1)} strokeWidth={4} />

              {/* face fades in after the strokes */}
              <motion.g
                initial={{ opacity: 0 }}
                animate={{ opacity: drawn ? 1 : 0 }}
                transition={{ duration: 0.6, delay: drawn ? 1.7 : 0 }}
              >
                {/* blinking eyes — each round pupil thins into a sliver
                    around its own center and rounds back out; pure CSS so
                    nothing else on the face moves or shifts */}
                <circle className="sp-eye" cx="50" cy="31" r="3.4" fill="#3d2438" />
                <circle className="sp-eye" cx="70" cy="31" r="3.4" fill="#3d2438" />
                <path d="M 52 44 Q 60 51 68 44" fill="none" stroke="#3d2438" strokeWidth="3.2" strokeLinecap="round" />
                <circle cx="41" cy="40" r="4.5" fill="#ffb3c6" opacity="0.7" />
                <circle cx="79" cy="40" r="4.5" fill="#ffb3c6" opacity="0.7" />
              </motion.g>
            </motion.g>

            {/* ── ARMS ── */}
            {!showLetterPose && (
              <>
                {/* left arm rests at the side; holds the little bouquet while gifting */}
                <motion.path d="M 60 76 Q 47 88 42 100" {...strokeProps(7)} />
                {phase === 'gift' && bouquetCount < TOTAL_BOUQUETS && (
                  <motion.g
                    key={bouquetCount}
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: 'spring', bounce: 0.5, duration: 0.5 }}
                    style={{ transformBox: 'view-box', transformOrigin: '40px 104px' }}
                  >
                    <path d="M 34 108 L 40 94 L 46 108 Z" fill="#f5e3c2" stroke="#3d2438" strokeWidth="1.5" strokeLinejoin="round" />
                    <circle cx="35" cy="90" r="4.5" fill="#ff4f7e" stroke="#3d2438" strokeWidth="1" />
                    <circle cx="42" cy="86" r="4.5" fill="#ffd166" stroke="#3d2438" strokeWidth="1" />
                    <circle cx="47" cy="92" r="4.5" fill="#ff8fae" stroke="#3d2438" strokeWidth="1" />
                  </motion.g>
                )}

                {waving ? (
                  /* waving: native SVG animateTransform with the pivot
                     written explicitly in viewBox coords — the shoulder
                     rotates around (60,76) and the forearm+hand around the
                     elbow (88,64), so upper arm and forearm can never
                     separate. The swing only starts in the greet phase,
                     after every stroke is fully drawn. */
                  <g>
                    {phase === 'greet' && (
                      <animateTransform
                        attributeName="transform"
                        type="rotate"
                        values="0 60 76; -4 60 76; -4 60 76; 0 60 76; 0 60 76"
                        keyTimes="0; 0.15; 0.6; 0.75; 1"
                        calcMode="spline"
                        keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1"
                        dur="3.6s"
                        repeatCount="indefinite"
                      />
                    )}
                    {/* upper arm: shoulder → elbow, held wide of the head */}
                    <motion.path d="M 60 76 L 88 64" {...strokeProps(8)} />
                    {/* forearm + hand pivoting together at the elbow */}
                    <g>
                      {phase === 'greet' && (
                        <animateTransform
                          attributeName="transform"
                          type="rotate"
                          values="0 88 64; -20 88 64; 14 88 64; -20 88 64; 14 88 64; 0 88 64; 0 88 64"
                          keyTimes="0; 0.13; 0.26; 0.39; 0.52; 0.68; 1"
                          calcMode="spline"
                          keySplines="0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1; 0.45 0 0.55 1"
                          dur="3.6s"
                          repeatCount="indefinite"
                        />
                      )}
                      <motion.path d="M 88 64 Q 93 53 96 45" {...strokeProps(9)} />
                      <motion.circle cx="96.5" cy="43" r="3.6" fill="#3d2438" initial={{ opacity: 0 }} animate={{ opacity: drawn ? 1 : 0 }} transition={{ delay: drawn ? 1.6 : 0 }} />
                    </g>
                  </g>
                ) : (
                  /* resting right arm; flings up joyfully on each tap —
                     CSS rotation pinned to the shoulder so it stays attached */
                  <g
                    key={`fling-${bouquetCount}`}
                    className={phase === 'gift' && bouquetCount > 0 ? 'sp-arm-fling' : undefined}
                  >
                    <motion.path
                      d="M 60 76 Q 73 88 78 100"
                      fill="none" stroke="#3d2438" strokeWidth="5" strokeLinecap="round"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: drawn ? 1 : 0 }}
                      transition={{ duration: 0.3 }}
                    />
                  </g>
                )}
              </>
            )}

            {/* letter pose: both arms forward holding the envelope */}
            {showLetterPose && (
              <>
                <path d="M 60 76 Q 52 92 54 104" fill="none" stroke="#3d2438" strokeWidth="5" strokeLinecap="round" />
                <path d="M 60 76 Q 68 92 66 104" fill="none" stroke="#3d2438" strokeWidth="5" strokeLinecap="round" />
              </>
            )}
          </g>

          {/* the envelope gift */}
          {showLetterPose && (
            <motion.g
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.55, duration: 0.9, delay: 0.3 }}
              style={{ transformBox: 'view-box', transformOrigin: '60px 116px', cursor: 'pointer' }}
              onClick={onEnvelopeTap}
            >
              <motion.g
                animate={{ scale: [1, 1.07, 1] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                style={{ transformBox: 'view-box', transformOrigin: '60px 116px' }}
              >
                <rect x="36" y="100" width="48" height="32" rx="4" fill="#fffdf7" stroke="#3d2438" strokeWidth="3" />
                <path d="M 36 103 L 60 121 L 84 103" fill="none" stroke="#3d2438" strokeWidth="2.2" strokeLinejoin="round" />
                <path d="M 60 110 c -2.4 -4 -8 -2.4 -8 1.6 c 0 3.2 4.8 5.6 8 8 c 3.2 -2.4 8 -4.8 8 -8 c 0 -4 -5.6 -5.6 -8 -1.6 Z" fill="#ff4f7e" stroke="#3d2438" strokeWidth="1.1" />
              </motion.g>
            </motion.g>
          )}
        </motion.g>
      </motion.g>
    </motion.g>
  )
}

// ------------------------------------------------------------
// Main overlay — stays mounted after first visit so progress
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
  const [planetSize, setPlanetSize] = useState(getPlanetScreenSize)
  const hopControls = useAnimationControls()
  const milestoneTimer = useRef(null)
  const heartTimer = useRef(null)
  // ids of bouquets whose landing spring already finished — they render
  // statically afterwards instead of re-running the flight animation
  const landedRef = useRef(new Set())

  const at = useCallback(p => PHASE_ORDER[phase] >= PHASE_ORDER[p], [phase])
  const slots = useMemo(buildSlots, [])

  useEffect(() => {
    const onResize = () => setPlanetSize(getPlanetScreenSize())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Doodle sizing anchored to the 3D planet
  const doodleW = Math.max(100, Math.min(160, planetSize * 0.62))
  const doodleH = doodleW * (170 / 120)

  // Rim flowers along the planet's horizon (viewBox is a constant
  // mapping: planet radius = 142.8 units inside a 400-unit box)
  const rimFlora = useMemo(() => {
    const pinks = ['#ff4f7e', '#ff6b9d', '#e8557f', '#ff8fae', '#ff85a1']
    const accents = ['#ffd166', '#ff8c61', '#7fd8a4', '#6ec6ff', '#fffdf7']
    const rim = []
    for (let i = 0; i < 11; i++) {
      const deg = -168 + i * 15.5
      if (deg > -112 && deg < -68) continue // leave room for the doodle
      const ang = (deg * Math.PI) / 180
      const isPink = seeded(i * 11 + 6) < 0.65
      rim.push({
        bx: 200 + Math.cos(ang) * 140,
        by: 200 + Math.sin(ang) * 140,
        tx: 200 + Math.cos(ang) * (156 + seeded(i * 13 + 7) * 12),
        ty: 200 + Math.sin(ang) * (156 + seeded(i * 13 + 7) * 12),
        size: 8 + seeded(i * 17 + 8) * 5,
        color: isPink ? pinks[i % 5] : accents[(i + 2) % 5],
        type: i % 3,
      })
    }
    return rim
  }, [])

  // Morph targets for each character of the welcome text
  const charTargets = useMemo(() => {
    const chars = WELCOME_TEXT.split('')
    const mid = (chars.length - 1) / 2
    const H = typeof window !== 'undefined' ? window.innerHeight : 800
    const headingY = H * 0.15
    const doodleCenterY = H * 0.5 - planetSize / 2 - doodleH * 0.5
    return chars.map((c, i) => ({
      char: c,
      tx: (mid - i) * 15 + (seeded(i + 90) - 0.5) * 36,
      ty: (doodleCenterY - headingY) + (seeded(i + 110) - 0.5) * 44,
      rot: (seeded(i + 130) - 0.5) * 220,
    }))
  }, [planetSize, doodleH])

  // Timeline: boot (waits for arrival) → welcome → morph → greet → gift
  useEffect(() => {
    if (phase === 'boot') {
      if (!active) return
      const t = setTimeout(() => setPhase('welcome'), 700)
      return () => clearTimeout(t)
    }
    if (phase === 'welcome') {
      const t = setTimeout(() => setPhase('morph'), 6200)
      return () => clearTimeout(t)
    }
    if (phase === 'morph') {
      const t = setTimeout(() => setPhase('greet'), 4200)
      return () => clearTimeout(t)
    }
    if (phase === 'greet') {
      setBubble(MSG_HELLO)
      const a = setTimeout(() => setBubble(MSG_LIVE), 4200)
      const b = setTimeout(() => {
        setBubble(MSG_GIFTS)
        setPhase('gift')
      }, 9800)
      return () => { clearTimeout(a); clearTimeout(b) }
    }
  }, [phase, active])

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

    // happy hop + joyful arm fling
    hopControls.start({ y: [0, -13, 0], scaleY: [1, 1.05, 0.95, 1], transition: { duration: 0.45, ease: 'easeOut' } })

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
        }, 5200)
      } else {
        milestoneTimer.current = setTimeout(() => setBubble(null), 4200)
      }
    } else {
      setBubble(null)
    }
  }, [phase, bouquets.length, hopControls])

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
      milestoneTimer.current = setTimeout(() => setBubble(null), 6500)
    }
  }, [hasReadLetter])

  const replay = useCallback(() => {
    clearTimeout(milestoneTimer.current)
    clearTimeout(heartTimer.current)
    landedRef.current.clear()
    setBouquets([])
    setHearts([])
    setBubble(null)
    setLetterOpen(false)
    setHasReadLetter(false)
    setPhase('boot')
  }, [])

  const drawn = at('morph')
  const planetTop = `calc(50% - ${planetSize / 2}px)`

  return (
    <div
      className="fixed inset-0 z-30 overflow-hidden"
      style={{
        opacity: active ? 1 : 0,
        visibility: active ? 'visible' : 'hidden',
        transition: active
          ? 'opacity 0.9s ease'
          : 'opacity 0.5s ease, visibility 0s linear 0.5s',
        pointerEvents: active ? 'auto' : 'none',
      }}
    >
      {/* soft glow hugging the 3D planet */}
      <div
        className="sp-planet-glow"
        style={{ width: planetSize * 2, height: planetSize * 2 }}
      />

      {/* rim flowers peeking over the 3D planet's horizon */}
      <motion.svg
        viewBox="0 0 400 400"
        className="sp-rim-flora"
        style={{ width: planetSize * 1.4, height: planetSize * 1.4 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: active ? 1 : 0 }}
        transition={{ duration: 1.2, delay: 0.3 }}
      >
        {rimFlora.map((f, i) => (
          <g key={`rim${i}`}>
            <path d={`M ${f.bx} ${f.by} L ${f.tx} ${f.ty}`} stroke="#5a8a5e" strokeWidth="2.5" strokeLinecap="round" />
            <PlanetFlower x={f.tx} y={f.ty} size={f.size} color={f.color} type={f.type} />
          </g>
        ))}
      </motion.svg>

      {/* ── THE DOODLE RESIDENT standing on the planet ── */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          top: planetTop,
          width: doodleW,
          height: doodleH,
          marginLeft: -doodleW / 2,
          marginTop: -doodleH + 8,
          zIndex: 5,
        }}
      >
        <svg viewBox="0 0 120 170" width="100%" height="100%" style={{ overflow: 'visible' }}>
          {/* tap hint ring until the flow is learned */}
          {phase === 'gift' && bouquets.length < 3 && (
            <motion.circle
              cx="60" cy="80" r="70" fill="none" stroke="#ff5c8a" strokeWidth="2.5"
              style={{ transformBox: 'view-box', transformOrigin: '60px 80px' }}
              animate={{ scale: [0.85, 1.25], opacity: [0.55, 0] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
            />
          )}
          <Doodle
            phase={phase}
            at={at}
            drawn={drawn}
            bouquetCount={bouquets.length}
            hopControls={hopControls}
            onTap={handleDoodleTap}
            onEnvelopeTap={openLetter}
          />
        </svg>
      </div>

      {/* clear tap invitation so she knows the doodle is pressable */}
      <AnimatePresence>
        {phase === 'gift' && bouquets.length < 3 && !letterOpen && (
          <motion.div
            key="tap-hint"
            className="sp-tap-hint"
            style={{ top: `calc(50% - ${planetSize / 2 + doodleH + 46}px)` }}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            👇 tap me for a gift!
          </motion.div>
        )}
      </AnimatePresence>

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
                  ? { duration: 1.1, delay: 0.5 + i * 0.17, ease: 'easeOut' }
                  : { duration: 2.4, delay: i * 0.06, ease: 'easeInOut' }
              }
            >
              {c.char === ' ' ? ' ' : c.char}
            </motion.span>
          ))}
        </div>
      )}

      {/* ── SPEECH BUBBLE next to the doodle's head ── */}
      <AnimatePresence mode="wait">
        {bubble && !letterOpen && (
          <motion.div
            key={bubble}
            className="sp-bubble"
            style={{
              left: `calc(50% + ${doodleW * 0.42}px)`,
              top: `calc(50% - ${planetSize / 2 + doodleH * 1.02}px)`,
            }}
            initial={{ opacity: 0, scale: 0.7, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -8 }}
            transition={{ type: 'spring', bounce: 0.35, duration: 0.8 }}
          >
            {bubble.split(' ').map((w, i) => (
              <motion.span
                key={i}
                className="inline-block"
                style={{ marginRight: '0.28em' }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 + i * 0.16, duration: 0.55 }}
              >
                {w}
              </motion.span>
            ))}
            <span className="sp-bubble-tail" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── COLLECTED BOUQUETS framing the screen ──
          Perf: flight is transform-only (no left/top layout thrash, no
          per-bouquet drop-shadow filter layers), bouquets that already
          landed render statically, and the whole layer stops painting
          while the letter is open. */}
      <div style={{ visibility: letterOpen ? 'hidden' : 'visible' }}>
        {bouquets.map(id => {
          const slot = slots[id]
          const size = slotSize(slot.sizeSeed)
          const landed = landedRef.current.has(id)
          const dx = ((50 - slot.x) / 100) * window.innerWidth
          const dy = ((28 - slot.y) / 100) * window.innerHeight
          return (
            <motion.div
              key={id}
              className="fixed pointer-events-none"
              style={{
                zIndex: 35,
                left: `${slot.x}%`,
                top: `${slot.y}%`,
                marginLeft: -size / 2,
                marginTop: -size * 0.65,
              }}
              initial={landed ? false : { x: dx, y: dy, scale: 0.15, opacity: 0, rotate: 0 }}
              animate={{ x: 0, y: 0, scale: 1, opacity: 1, rotate: slot.rot }}
              transition={landed ? { duration: 0 } : { type: 'spring', stiffness: 55, damping: 13, mass: 0.9 }}
              onAnimationComplete={() => landedRef.current.add(id)}
            >
              <BouquetSVG seed={id} size={size} />
            </motion.div>
          )
        })}
      </div>

      {/* little hearts popping on each tap */}
      <AnimatePresence>
        {hearts.map(h => (
          <motion.div
            key={h.id}
            className="fixed pointer-events-none text-2xl"
            style={{ left: '50%', top: `calc(50% - ${planetSize / 2 + doodleH}px)`, zIndex: 36 }}
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
                      const delay = 1.0 + gi * 0.05
                      gi += 1
                      if (letterInstant) return <span key={`i${ci}`}>{ch}</span>
                      // plain CSS animation — hundreds of JS-driven spans
                      // made low-end phones stutter
                      return (
                        <span key={ci} className="sp-letter-ch" style={{ animationDelay: `${delay}s` }}>
                          {ch}
                        </span>
                      )
                    })}
                  </p>
                ))
              })()}

              {letterInstant ? (
                <p className="sp-letter-sign">{LETTER_SIGNATURE}</p>
              ) : (
                <p
                  className="sp-letter-sign sp-letter-sign-anim"
                  style={{ animationDelay: `${1.0 + (LETTER_PARAGRAPHS.join('').length) * 0.05 + 0.7}s` }}
                >
                  {LETTER_SIGNATURE}
                </p>
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
