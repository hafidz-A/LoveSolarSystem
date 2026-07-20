import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sphere, Line } from '@react-three/drei'
import { motion, AnimatePresence } from 'framer-motion'
import gsap from 'gsap'
import * as THREE from 'three'
import SorryPlanet, { NavArrow } from './SorryPlanet'

// ============================================================
// CONFIG
// ============================================================
const CORRECT_PASSWORD = '230526'
const PIN_LENGTH = 6

const CARD_DATA = [
  {
    id: 1,
    icon: '🏎️',
    title: 'Our First DATE',
    color: '#ff85a1',
    glow: 'rgba(255, 133, 161, 0.38)',
    light: 'rgba(255, 133, 161, 0.2)',
    textColor: '#4a2035',
    titleColor: '#1a0010',
    bgFront: 'linear-gradient(145deg, #fffcfd 0%, #fff6f9 100%)',
    bgBack: 'radial-gradient(circle, #fffdfb 0%, #f7eff2 100%)',
    borderColor: 'rgba(255, 179, 198, 0.35)',
    doubleBorderColor: 'rgba(255, 133, 161, 0.22)',
    flowerColors: ['#ff6b9d', '#ff85a1', '#ffb3c6'],
    message: 'Do you remember our first date? Go-kart racing, because we did it! Chasing each other on the track, laughing together, and realizing that life with you would be an exciting adventure. 🏎️🏁❤️',
    hasPhoto: true,
    photoUrl: `${import.meta.env.BASE_URL}firstdate.png`,
    caption: 'Our first go-kart race together! 🏎️🏁'
  },
  {
    id: 2,
    icon: '💖',
    title: 'Open Me 💌',
    color: '#ff4d6d',
    glow: 'rgba(255, 77, 109, 0.38)',
    light: 'rgba(255, 77, 109, 0.2)',
    textColor: '#4a0e17',
    titleColor: '#1f0005',
    bgFront: 'linear-gradient(145deg, #fffcfd 0%, #fff0f3 100%)',
    bgBack: 'radial-gradient(circle, #fffafb 0%, #ffe5ec 100%)',
    borderColor: 'rgba(255, 77, 109, 0.35)',
    doubleBorderColor: 'rgba(255, 77, 109, 0.22)',
    flowerColors: ['#ff0a54', '#ff477e', '#ff7096'],
    message: 'In this vast universe, you are my brightest star and my favorite place to be. I love you so much. Will you be mine? ✨💖',
    hasPhoto: false,
    isConfession: true
  },
  {
    id: 3,
    icon: '💐',
    title: 'Making Flowers with You',
    color: '#d8a2ff',
    glow: 'rgba(216, 162, 255, 0.38)',
    light: 'rgba(216, 162, 255, 0.2)',
    textColor: '#2e1c4a',
    titleColor: '#140526',
    bgFront: 'linear-gradient(145deg, #fcfaff 0%, #f4ecff 100%)',
    bgBack: 'radial-gradient(circle, #fcfaff 0%, #ede3fc 100%)',
    borderColor: 'rgba(216, 162, 255, 0.35)',
    doubleBorderColor: 'rgba(177, 159, 251, 0.22)',
    flowerColors: ['#b19ffb', '#d8a2ff', '#e8d6ff'],
    message: 'Do you remember when we made flowers together? Spending time arranging each petal with laughter, and realizing that every moment with you always blooms beautifully. 🌸💐✨',
    hasPhoto: true,
    photoUrl: `${import.meta.env.BASE_URL}flowery.gif`,
    caption: 'Sweet moments making flowers together... 🌸✨'
  },
  {
    id: 4,
    icon: '💫',
    title: 'Our Song',
    color: '#ffe082',
    glow: 'rgba(255, 224, 130, 0.38)',
    light: 'rgba(255, 224, 130, 0.2)',
    textColor: '#423712',
    titleColor: '#1f1a05',
    bgFront: 'linear-gradient(145deg, #ffffff 0%, #fffdf0 100%)',
    bgBack: 'radial-gradient(circle, #ffffff 0%, #faf8e3 100%)',
    borderColor: 'rgba(255, 224, 130, 0.35)',
    doubleBorderColor: 'rgba(255, 213, 79, 0.22)',
    flowerColors: ['#ffd54f', '#ffe082', '#fff59d'],
    message: 'Every time our favorite song plays, it feels like the melody is telling our own beautiful love story. 🎶💖',
    hasPhoto: false,
    hasMusic: true
  },
  {
    id: 5,
    icon: '🦋',
    title: 'Butterflies',
    color: '#b4ffd0',
    glow: 'rgba(180, 255, 208, 0.38)',
    light: 'rgba(180, 255, 208, 0.2)',
    textColor: '#153320',
    titleColor: '#051f0f',
    bgFront: 'linear-gradient(145deg, #f9fffb 0%, #f0faf4 100%)',
    bgBack: 'radial-gradient(circle, #f9fffb 0%, #e3f7eb 100%)',
    borderColor: 'rgba(180, 255, 208, 0.35)',
    doubleBorderColor: 'rgba(120, 240, 160, 0.22)',
    flowerColors: ['#76d7c4', '#a9dfbf', '#d4efdf'],
    message: 'Even after all this time, a single smile from you still gives me that fluttering feeling in my chest. 🦋✨',
    hasPhoto: false
  },
  {
    id: 6,
    icon: '🌸',
    title: 'Museum Walk',
    color: '#ebb5ff',
    glow: 'rgba(235, 181, 255, 0.38)',
    light: 'rgba(235, 181, 255, 0.2)',
    textColor: '#3a1b47',
    titleColor: '#1d0526',
    bgFront: 'linear-gradient(145deg, #fffafe 0%, #f8ecfa 100%)',
    bgBack: 'radial-gradient(circle, #fffafe 0%, #f3dbfa 100%)',
    borderColor: 'rgba(235, 181, 255, 0.35)',
    doubleBorderColor: 'rgba(215, 140, 250, 0.22)',
    flowerColors: ['#eb9bf5', '#f5b7b1', '#fadbd8'],
    message: 'Walking side-by-side through a majestic museum exhibition. The world was colorful, but you made it beautiful. 🌸🍃',
    hasPhoto: true,
    photoUrl: `${import.meta.env.BASE_URL}museum.png`,
    caption: 'Walking side-by-side in a majestic museum... 🌸'
  },
]

const SONGS = [
  {
    title: 'Drop Dead',
    artist: 'Acoustic Cover',
    url: `${import.meta.env.BASE_URL}track1.mp3`
  },
  {
    title: 'Kota Ini Tak Sama Tanpamu',
    artist: 'Piano Reflections',
    url: `${import.meta.env.BASE_URL}track2.mp3`
  },
  {
    title: 'Labyrinth',
    artist: 'Taylor Swift',
    url: `${import.meta.env.BASE_URL}track3.mp3`
  }
]

// Planet screen-size calculation constants
// Camera at z=15, fov=60, planet radius=1.8
const CAMERA_Z = 15
const CAMERA_FOV = 60
const PLANET_RADIUS_3D = 1.8

function getPlanetScreenSize() {
  const fovRad = (CAMERA_FOV / 2) * Math.PI / 180
  const visibleHeight = 2 * CAMERA_Z * Math.tan(fovRad)
  const fraction = (PLANET_RADIUS_3D * 2) / visibleHeight
  const baseSize = fraction * window.innerHeight
  // Cap so planet doesn't overwhelm small screens
  const maxSize = Math.min(window.innerWidth, window.innerHeight) * 0.30
  return Math.min(baseSize, maxSize)
}

// Responsive card half-dimensions for offset calculations
function getCardHalf() {
  const isMobile = window.innerWidth < 640
  return { w: isMobile ? 40 : 55, h: isMobile ? 56 : 79 }
}

// ============================================================
// FLOWER SVG COMPONENT
// ============================================================
function FlowerSVG({ color = '#e8652e', size = 40, style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`flower-ornament ${className}`}
      style={style}
    >
      {/* Petals */}
      <ellipse cx="50" cy="25" rx="14" ry="22" fill={color} opacity="0.9"
        transform="rotate(0 50 50)" />
      <ellipse cx="50" cy="25" rx="14" ry="22" fill={color} opacity="0.85"
        transform="rotate(60 50 50)" />
      <ellipse cx="50" cy="25" rx="14" ry="22" fill={color} opacity="0.8"
        transform="rotate(120 50 50)" />
      <ellipse cx="50" cy="25" rx="14" ry="22" fill={color} opacity="0.9"
        transform="rotate(180 50 50)" />
      <ellipse cx="50" cy="25" rx="14" ry="22" fill={color} opacity="0.85"
        transform="rotate(240 50 50)" />
      <ellipse cx="50" cy="25" rx="14" ry="22" fill={color} opacity="0.8"
        transform="rotate(300 50 50)" />
      {/* Center */}
      <circle cx="50" cy="50" r="10" fill="#ffd700" opacity="0.9" />
      <circle cx="50" cy="50" r="6" fill="#ffaa00" opacity="0.8" />
    </svg>
  )
}

function LeafSVG({ color = '#c0392b', size = 35, style = {}, className = '' }) {
  return (
    <svg
      width={size}
      height={size * 1.4}
      viewBox="0 0 60 84"
      className={`flower-ornament ${className}`}
      style={style}
    >
      <path
        d="M30 4 C10 20, 5 45, 30 80 C55 45, 50 20, 30 4Z"
        fill={color}
        opacity="0.85"
      />
      <path
        d="M30 15 C30 15, 30 70, 30 70"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="1.5"
        fill="none"
      />
      <path
        d="M30 30 C22 25, 18 32, 15 38"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
        fill="none"
      />
      <path
        d="M30 45 C38 40, 42 47, 45 53"
        stroke="rgba(255,255,255,0.2)"
        strokeWidth="1"
        fill="none"
      />
    </svg>
  )
}

// ============================================================
// FLOWER BOUQUET BACKGROUND COMPONENT
// ============================================================
// ============================================================
// UNIQUE FLOWER GROUP COMPONENTS
// ============================================================
function RoseGroup({ colors }) {
  const renderRose = (cx, cy, scale = 1, delay = 0) => (
    <motion.g
      key={`${cx}-${cy}`}
      initial={{ scale: 0, rotate: -35, opacity: 0 }}
      animate={{ scale, rotate: 0, opacity: 0.9 }}
      transition={{ delay, duration: 1.2, type: 'spring', stiffness: 50 }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      <circle cx={cx} cy={cy} r="9" fill={colors[0]} />
      <path d={`M ${cx-5},${cy-5} C ${cx-10},${cy+1} ${cx-5},${cy+6} ${cx},${cy}`} fill={colors[1]} />
      <path d={`M ${cx+5},${cy-5} C ${cx+10},${cy+1} ${cx+5},${cy+6} ${cx},${cy}`} fill={colors[1]} />
      <path d={`M ${cx-5},${cy+5} C ${cx},${cy+10} ${cx+5},${cy+5} ${cx},${cy}`} fill={colors[1]} />
      <path d={`M ${cx-5},${cy-5} C ${cx},${cy-10} ${cx+5},${cy-5} ${cx},${cy}`} fill={colors[1]} />
      <circle cx={cx} cy={cy} r="4.5" fill={colors[0]} />
      <circle cx={cx} cy={cy} r="2" fill="#ffd700" />
    </motion.g>
  )
  return (
    <>
      {renderRose(50, 40, 1.05, 1.2)}
      {renderRose(35, 45, 0.9, 1.3)}
      {renderRose(65, 45, 0.9, 1.4)}
      {renderRose(20, 50, 0.8, 1.5)}
      {renderRose(80, 50, 0.8, 1.6)}
      {renderRose(42, 48, 0.75, 1.7)}
      {renderRose(58, 48, 0.75, 1.8)}
    </>
  )
}

function TulipGroup({ colors }) {
  const renderTulip = (cx, cy, scale = 1, delay = 0) => (
    <motion.g
      key={`${cx}-${cy}`}
      initial={{ scale: 0, y: 12, opacity: 0 }}
      animate={{ scale, y: 0, opacity: 0.9 }}
      transition={{ delay, duration: 1.2, type: 'spring' }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      <path d={`M ${cx-7},${cy+5} C ${cx-11},${cy-9} ${cx-3},${cy-11} ${cx},${cy+5}`} fill={colors[0]} />
      <path d={`M ${cx+7},${cy+5} C ${cx+12},${cy-9} ${cx+3},${cy-11} ${cx},${cy+5}`} fill={colors[0]} />
      <path d={`M ${cx-4},${cy+5} C ${cx},${cy-14} ${cx},${cy-14} ${cx+4},${cy+5}`} fill={colors[1]} />
      <circle cx={cx} cy={cy} r="1.8" fill="#ffd700" />
    </motion.g>
  )
  return (
    <>
      {renderTulip(50, 40, 1.05, 1.2)}
      {renderTulip(35, 45, 0.9, 1.3)}
      {renderTulip(65, 45, 0.9, 1.4)}
      {renderTulip(20, 50, 0.8, 1.5)}
      {renderTulip(80, 50, 0.8, 1.6)}
      {renderTulip(42, 48, 0.75, 1.7)}
      {renderTulip(58, 48, 0.75, 1.8)}
    </>
  )
}

function LavenderGroup({ colors }) {
  const renderLavender = (cx, cy, scale = 1, delay = 0, angle = 0) => (
    <motion.g
      key={`${cx}-${cy}`}
      initial={{ scale: 0, rotate: angle, opacity: 0 }}
      animate={{ scale, rotate: angle, opacity: 0.85 }}
      transition={{ delay, duration: 1.2, type: 'spring' }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      <ellipse cx={cx} cy={cy} rx="4" ry="7" fill={colors[0]} />
      <ellipse cx={cx-4} cy={cy-6} rx="3" ry="5" fill={colors[1]} />
      <ellipse cx={cx+4} cy={cy-6} rx="3" ry="5" fill={colors[1]} />
      <ellipse cx={cx} cy={cy-11} rx="2.5" ry="4" fill={colors[2]} />
      <ellipse cx={cx} cy={cy-15} rx="1.5" ry="2.5" fill="#ffffff" />
    </motion.g>
  )
  return (
    <>
      {renderLavender(50, 40, 1.1, 1.2, 0)}
      {renderLavender(35, 45, 0.95, 1.3, -15)}
      {renderLavender(65, 45, 0.95, 1.4, 15)}
      {renderLavender(20, 50, 0.85, 1.5, -30)}
      {renderLavender(80, 50, 0.85, 1.6, 30)}
      {renderLavender(42, 48, 0.8, 1.7, -10)}
      {renderLavender(58, 48, 0.8, 1.8, 10)}
    </>
  )
}

function SunflowerGroup({ colors }) {
  const renderSunflower = (cx, cy, scale = 1, delay = 0) => (
    <motion.g
      key={`${cx}-${cy}`}
      initial={{ scale: 0, rotate: -45, opacity: 0 }}
      animate={{ scale, rotate: 0, opacity: 0.9 }}
      transition={{ delay, duration: 1.3, type: 'spring' }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      {Array.from({ length: 8 }).map((_, i) => {
        const rot = i * 45
        return (
          <ellipse
            key={i}
            cx={cx}
            cy={cy - 8}
            rx="3"
            ry="7"
            fill={colors[1]}
            transform={`rotate(${rot} ${cx} ${cy})`}
          />
        )
      })}
      <circle cx={cx} cy={cy} r="4.5" fill="#4e342e" />
      <circle cx={cx} cy={cy} r="2.5" fill="#2d1500" />
    </motion.g>
  )
  return (
    <>
      {renderSunflower(50, 40, 1.05, 1.2)}
      {renderSunflower(35, 45, 0.9, 1.3)}
      {renderSunflower(65, 45, 0.9, 1.4)}
      {renderSunflower(20, 50, 0.8, 1.5)}
      {renderSunflower(80, 50, 0.8, 1.6)}
      {renderSunflower(42, 48, 0.75, 1.7)}
      {renderSunflower(58, 48, 0.75, 1.8)}
    </>
  )
}

function LilyGroup({ colors }) {
  const renderLily = (cx, cy, scale = 1, delay = 0, angle = 0) => (
    <motion.g
      key={`${cx}-${cy}`}
      initial={{ scale: 0, rotate: angle - 30, opacity: 0 }}
      animate={{ scale, rotate: angle, opacity: 0.85 }}
      transition={{ delay, duration: 1.2, type: 'spring' }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const rot = i * 72 + angle
        return (
          <path
            key={i}
            d={`M ${cx},${cy} C ${cx-3},${cy-9} ${cx+3},${cy-9} ${cx},${cy}`}
            fill={colors[2]}
            stroke={colors[1]}
            strokeWidth="0.5"
            transform={`rotate(${rot} ${cx} ${cy})`}
          />
        )
      })}
      <circle cx={cx} cy={cy} r="1.8" fill="#ffd700" />
    </motion.g>
  )
  return (
    <>
      {renderLily(50, 40, 1.05, 1.2, 0)}
      {renderLily(35, 45, 0.9, 1.3, 15)}
      {renderLily(65, 45, 0.9, 1.4, -15)}
      {renderLily(20, 50, 0.8, 1.5, 30)}
      {renderLily(80, 50, 0.8, 1.6, -30)}
      {renderLily(42, 48, 0.75, 1.7, 10)}
      {renderLily(58, 48, 0.75, 1.8, -10)}
    </>
  )
}

function SakuraGroup({ colors }) {
  const renderSakura = (cx, cy, scale = 1, delay = 0, angle = 0) => (
    <motion.g
      key={`${cx}-${cy}`}
      initial={{ scale: 0, rotate: angle + 25, opacity: 0 }}
      animate={{ scale, rotate: angle, opacity: 0.9 }}
      transition={{ delay, duration: 1.3, type: 'spring' }}
      style={{ transformOrigin: `${cx}px ${cy}px` }}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const rot = i * 72 + angle
        return (
          <path
            key={i}
            d={`M ${cx},${cy} C ${cx-5},${cy-10} ${cx},${cy-12} ${cx},${cy-8} C ${cx},${cy-12} ${cx+5},${cy-10} ${cx},${cy}`}
            fill={colors[1]}
            opacity="0.9"
            transform={`rotate(${rot} ${cx} ${cy})`}
          />
        )
      })}
      <circle cx={cx} cy={cy} r="2.2" fill="#ffd700" />
    </motion.g>
  )
  return (
    <>
      {renderSakura(50, 40, 1.05, 1.2, 12)}
      {renderSakura(35, 45, 0.9, 1.3, -8)}
      {renderSakura(65, 45, 0.9, 1.4, 22)}
      {renderSakura(20, 50, 0.8, 1.5, -18)}
      {renderSakura(80, 50, 0.8, 1.6, 32)}
      {renderSakura(42, 48, 0.75, 1.7, 5)}
      {renderSakura(58, 48, 0.75, 1.8, -15)}
    </>
  )
}

// ============================================================
// FLOWER BOUQUET BACKGROUND COMPONENT
// ============================================================
function BouquetBackground({ cardId, colors }) {
  let FlowerComponent = RoseGroup
  if (cardId === 2) FlowerComponent = TulipGroup
  else if (cardId === 3) FlowerComponent = LavenderGroup
  else if (cardId === 4) FlowerComponent = SunflowerGroup
  else if (cardId === 5) FlowerComponent = LilyGroup
  else if (cardId === 6) FlowerComponent = SakuraGroup

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0" style={{ opacity: 0.16 }}>
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full max-w-[280px] max-h-[280px] sm:max-w-[340px] sm:max-h-[340px]"
      >
        {/* 5-stem Symmetrical Fan */}
        <motion.path
          d="M 50,85 C 44,70 32,58 20,53"
          fill="none"
          stroke="#5c8a5e"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.3 }}
        />
        <motion.path
          d="M 50,85 C 46,70 38,58 35,46"
          fill="none"
          stroke="#5c8a5e"
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.15 }}
        />
        <motion.path
          d="M 50,85 C 50,70 50,55 50,40"
          fill="none"
          stroke="#5c8a5e"
          strokeWidth="1.8"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: 'easeInOut' }}
        />
        <motion.path
          d="M 50,85 C 54,70 62,58 65,46"
          fill="none"
          stroke="#5c8a5e"
          strokeWidth="1.6"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.15 }}
        />
        <motion.path
          d="M 50,85 C 56,70 68,58 80,53"
          fill="none"
          stroke="#5c8a5e"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: 'easeInOut', delay: 0.3 }}
        />

        {/* 8 Leaves growing along stems */}
        <motion.path
          d="M 28,62 C 20,62 18,54 26,56 C 26,56 28,62 28,62 Z"
          fill="#76a078"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.85 }}
          transition={{ delay: 1.1, duration: 0.8, type: 'spring' }}
          style={{ transformOrigin: '28px 62px' }}
        />
        <motion.path
          d="M 41,55 C 34,51 35,44 41,47 C 41,47 41,55 41,55 Z"
          fill="#76a078"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.85 }}
          transition={{ delay: 0.9, duration: 0.8, type: 'spring' }}
          style={{ transformOrigin: '41px 55px' }}
        />
        <motion.path
          d="M 50,60 C 43,56 44,48 51,51 C 51,51 50,60 50,60 Z"
          fill="#76a078"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.85 }}
          transition={{ delay: 0.8, duration: 0.8, type: 'spring' }}
          style={{ transformOrigin: '50px 60px' }}
        />
        <motion.path
          d="M 50,52 C 57,48 56,40 50,43 C 50,43 50,52 50,52 Z"
          fill="#76a078"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.85 }}
          transition={{ delay: 1.0, duration: 0.8, type: 'spring' }}
          style={{ transformOrigin: '50px 52px' }}
        />
        <motion.path
          d="M 59,55 C 66,51 65,44 59,47 C 59,47 59,55 59,55 Z"
          fill="#76a078"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.85 }}
          transition={{ delay: 0.95, duration: 0.8, type: 'spring' }}
          style={{ transformOrigin: '59px 55px' }}
        />
        <motion.path
          d="M 72,62 C 80,62 82,54 74,56 C 74,56 72,62 72,62 Z"
          fill="#76a078"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.85 }}
          transition={{ delay: 1.15, duration: 0.8, type: 'spring' }}
          style={{ transformOrigin: '72px 62px' }}
        />
        <motion.path
          d="M 38,70 C 30,72 29,66 36,66 C 36,66 38,70 38,70 Z"
          fill="#76a078"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.85 }}
          transition={{ delay: 1.3, duration: 0.8, type: 'spring' }}
          style={{ transformOrigin: '38px 70px' }}
        />
        <motion.path
          d="M 62,70 C 70,72 71,66 64,66 C 64,66 62,70 62,70 Z"
          fill="#76a078"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.85 }}
          transition={{ delay: 1.35, duration: 0.8, type: 'spring' }}
          style={{ transformOrigin: '62px 70px' }}
        />

        {/* Dynamic Flower Group */}
        <FlowerComponent colors={colors} />

        {/* Ribbon tied around the stem bunch */}
        <motion.g
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.95 }}
          transition={{ delay: 1.7, duration: 0.8, type: 'spring' }}
          style={{ transformOrigin: '50px 77px' }}
        >
          <path d="M 50,77 C 42,72 42,82 50,77 Z" fill={colors[1]} stroke={colors[0]} strokeWidth="0.5" />
          <path d="M 50,77 C 58,72 58,82 50,77 Z" fill={colors[1]} stroke={colors[0]} strokeWidth="0.5" />
          <circle cx="50" cy="77" r="2.5" fill={colors[0]} />
          <path d="M 50,77 Q 46,83 44,87" fill="none" stroke={colors[0]} strokeWidth="1" strokeLinecap="round" />
          <path d="M 50,77 Q 54,83 56,87" fill="none" stroke={colors[0]} strokeWidth="1" strokeLinecap="round" />
        </motion.g>
      </svg>
    </div>
  )
}

// ============================================================
// THREE.JS COMPONENTS
// ============================================================

// Custom particle field that can change color
function ParticleField({ colorMode }) {
  const pointsRef = useRef()
  const count = 2000

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 200
      pos[i * 3 + 1] = (Math.random() - 0.5) * 200
      pos[i * 3 + 2] = (Math.random() - 0.5) * 200
    }
    return pos
  }, [])

  const colorRef = useRef(new THREE.Color('#ffffff'))
  const targetColor = useRef(new THREE.Color('#ffffff'))

  useEffect(() => {
    if (colorMode === 'pink') {
      targetColor.current.set('#1a0010')
    } else {
      targetColor.current.set('#ffffff')
    }
  }, [colorMode])

  useFrame(() => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.00005
      pointsRef.current.rotation.x += 0.00003
      colorRef.current.lerp(targetColor.current, 0.02)
      pointsRef.current.material.color.copy(colorRef.current)
    }
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.3}
        sizeAttenuation
        transparent
        opacity={0.6}
        color="#ffffff"
      />
    </points>
  )
}

// ============================================================
// SOLAR SYSTEM — viewed from our planet's reference frame
// Our planet stays at origin; the whole system moves around us.
// ============================================================

// Single orbit ring line
function OrbitRing({ radius, highlight = false, visible }) {
  const lineRef = useRef()
  const fadeRef = useRef(0)

  const points = useMemo(() => {
    const segments = 200
    const pts = []
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2
      pts.push([Math.cos(angle) * radius, 0, Math.sin(angle) * radius])
    }
    return pts
  }, [radius])

  useFrame(() => {
    const targetFade = visible ? 1 : 0
    fadeRef.current = THREE.MathUtils.lerp(fadeRef.current, targetFade, 0.02)
    if (lineRef.current && lineRef.current.material) {
      lineRef.current.material.opacity = (highlight ? 0.75 : 0.45) * fadeRef.current
    }
  })

  return (
    <Line
      ref={lineRef}
      points={points}
      color={highlight ? '#d8a2ff' : '#b37ee5'}
      opacity={0}
      transparent
      lineWidth={highlight ? 2.0 : 1.2}
    />
  )
}

// Helper to create a procedural texture on a canvas and return a CanvasTexture
function createPlanetTexture(baseColor, stripeColor = null, spotColor = null) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  
  // Base color
  ctx.fillStyle = baseColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Stripes
  if (stripeColor) {
    ctx.fillStyle = stripeColor
    const numStripes = 4 + Math.floor(Math.random() * 4)
    for (let i = 0; i < numStripes; i++) {
      const h = 8 + Math.random() * 24
      const y = Math.random() * (canvas.height - h)
      ctx.fillRect(0, y, canvas.width, h)
    }
  }
  
  // Spots
  if (spotColor) {
    ctx.fillStyle = spotColor
    const numSpots = 8 + Math.floor(Math.random() * 12)
    for (let i = 0; i < numSpots; i++) {
      const r = 6 + Math.random() * 18
      const x = Math.random() * canvas.width
      const y = Math.random() * canvas.height
      
      // Draw spot
      ctx.beginPath()
      ctx.arc(x, y, r, 0, Math.PI * 2)
      ctx.fill()
      
      // Wrap spots across edges for simple wrap
      if (x < r) {
        ctx.beginPath()
        ctx.arc(x + canvas.width, y, r, 0, Math.PI * 2)
        ctx.fill()
      } else if (x > canvas.width - r) {
        ctx.beginPath()
        ctx.arc(x - canvas.width, y, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }
  }
  
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}

function createCloudTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)'
  const numClouds = 12
  for (let i = 0; i < numClouds; i++) {
    const w = 50 + Math.random() * 90
    const h = 8 + Math.random() * 18
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    
    ctx.beginPath()
    ctx.roundRect(x, y, w, h, h / 2)
    ctx.fill()
    
    // wrap around
    if (x + w > canvas.width) {
      ctx.beginPath()
      ctx.roundRect(x - canvas.width, y, w, h, h / 2)
      ctx.fill()
    }
  }
  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}

// Pink flower texture for the Sorry Planet
function createSorryPlanetTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 256
  const ctx = canvas.getContext('2d')

  // Soft pink base with vertical shading
  const grad = ctx.createLinearGradient(0, 0, 0, canvas.height)
  grad.addColorStop(0, '#ffc3d6')
  grad.addColorStop(0.5, '#ff9fbe')
  grad.addColorStop(1, '#f77fa6')
  ctx.fillStyle = grad
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Lighter meadow patches
  for (let i = 0; i < 14; i++) {
    const r = 18 + Math.random() * 40
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    ctx.fillStyle = 'rgba(255, 224, 235, 0.5)'
    ctx.beginPath()
    ctx.ellipse(x, y, r, r * 0.55, 0, 0, Math.PI * 2)
    ctx.fill()
  }

  // Doodle flowers — dominant pinks with colorful accents
  const pinks = ['#ff4f7e', '#e8557f', '#ff6b9d', '#d94f7e']
  const accents = ['#ffd166', '#ff8c61', '#7fd8a4', '#6ec6ff', '#fffdf7']
  const drawFlower = (x, y, size, color) => {
    for (let p = 0; p < 5; p++) {
      const a = (p / 5) * Math.PI * 2
      ctx.fillStyle = color
      ctx.beginPath()
      ctx.arc(x + Math.cos(a) * size * 0.8, y + Math.sin(a) * size * 0.8, size * 0.55, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.fillStyle = '#ffe9a3'
    ctx.beginPath()
    ctx.arc(x, y, size * 0.45, 0, Math.PI * 2)
    ctx.fill()
  }
  for (let i = 0; i < 46; i++) {
    const x = Math.random() * canvas.width
    const y = 12 + Math.random() * (canvas.height - 24)
    const size = 4 + Math.random() * 7
    const color = Math.random() < 0.68
      ? pinks[Math.floor(Math.random() * pinks.length)]
      : accents[Math.floor(Math.random() * accents.length)]
    drawFlower(x, y, size, color)
    if (x < 20) drawFlower(x + canvas.width, y, size, color)
    if (x > canvas.width - 20) drawFlower(x - canvas.width, y, size, color)
  }

  // Tiny greenery dots
  ctx.fillStyle = 'rgba(106, 168, 112, 0.55)'
  for (let i = 0; i < 60; i++) {
    ctx.beginPath()
    ctx.arc(Math.random() * canvas.width, Math.random() * canvas.height, 1.5 + Math.random() * 2, 0, Math.PI * 2)
    ctx.fill()
  }

  const texture = new THREE.CanvasTexture(canvas)
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.ClampToEdgeWrapping
  return texture
}

// Sorry Planet orbital parameters — the ring right next to ours
const SORRY_ORBIT = 36
const SORRY_SPEED = 0.022
const SORRY_START_ANGLE = 2.1
const TRAVEL_SECONDS = 3

function SolarSystem({ visible, focus = 0 }) {
  const systemRef = useRef()
  const planetMeshRefs = useRef([])
  
  const ourPlanetRef = useRef()
  const ourPlanetMeshRef = useRef()
  const ourCloudsMeshRef = useRef()

  const sorryPlanetRef = useRef()
  const sorryMeshRef = useRef()
  const sorryCloudsMeshRef = useRef()
  const focusProgRef = useRef(0)

  // Refs for smooth fading of the Sun using shader uniforms
  const sunShaderRef = useRef()
  const coronaShaderRef = useRef()
  const sunLightRef = useRef()
  const fadeRef = useRef(0)

  // Our planet's orbital parameters around the sun
  const OUR_ORBIT = 28
  const OUR_SPEED = 0.03 // radians/sec — one "year"

  const SUN_RADIUS = 5

  // Shader uniforms for smooth fade and gradient mapping
  const sunUniforms = useMemo(() => ({
    uOpacity: { value: 0 },
    colorCenter: { value: new THREE.Color('#ffffff') },
    colorEdge: { value: new THREE.Color('#ffcc44') }
  }), [])

  const coronaUniforms = useMemo(() => ({
    uOpacity: { value: 0 },
    colorInner: { value: new THREE.Color('#ffaa22') },
    colorOuter: { value: new THREE.Color('#ff3b00') }
  }), [])

  // Other planets: orbit = distance from sun, speed = angular speed
  const otherPlanets = useMemo(() => [
    // Inner — small & fast
    { r: 0.25, orbit: 8,  speed: 0.20, color: '#b0b0b8', emissive: '#555558', startAngle: 0.8 },
    { r: 0.5,  orbit: 16, speed: 0.11, color: '#e8a040', emissive: '#744e20', startAngle: 2.5 },
    // Outer — bigger & slower
    { r: 0.4,  orbit: 40, speed: 0.018, color: '#c04428', emissive: '#602210', startAngle: 4.2 },
    { r: 1.4,  orbit: 56, speed: 0.008, color: '#d4a06a', emissive: '#6a5035', startAngle: 1.0 },
    { r: 1.1,  orbit: 74, speed: 0.004, color: '#e8d8a8', emissive: '#746c54', startAngle: 3.5 },
  ], [])

  // All orbit radii (including ours and the Sorry Planet's) for ring lines
  const orbitRadii = useMemo(() => [8, 16, OUR_ORBIT, SORRY_ORBIT, 40, 56, 74], [])

  // Cache planet textures
  const planetTextures = useMemo(() => {
    return otherPlanets.map((p, idx) => {
      if (idx === 0) return createPlanetTexture(p.color, '#8a8a90')
      if (idx === 1) return createPlanetTexture(p.color, '#c88020', '#fcd090')
      if (idx === 2) return createPlanetTexture(p.color, '#a03418', '#802210')
      if (idx === 3) return createPlanetTexture(p.color, '#a67848', '#f0d0a0')
      if (idx === 4) return createPlanetTexture(p.color, '#c6b686')
      return createPlanetTexture(p.color)
    })
  }, [otherPlanets])

  const ourPlanetTexture = useMemo(() => {
    return createPlanetTexture('#613788', '#8759b8', '#d8a2ff')
  }, [])

  const cloudsTexture = useMemo(() => {
    return createCloudTexture()
  }, [])

  const sorryPlanetTexture = useMemo(() => {
    return createSorryPlanetTexture()
  }, [])

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime

    // Smoothly update the fade value
    const targetFade = visible ? 1 : 0
    fadeRef.current = THREE.MathUtils.lerp(fadeRef.current, targetFade, 0.02)

    // Update material opacities via shader uniforms and light intensity
    if (sunShaderRef.current) {
      sunShaderRef.current.uniforms.uOpacity.value = fadeRef.current
    }
    if (coronaShaderRef.current) {
      coronaShaderRef.current.uniforms.uOpacity.value = fadeRef.current
    }
    if (sunLightRef.current) {
      sunLightRef.current.intensity = 4 * fadeRef.current
    }

    planetMeshRefs.current.forEach((ref) => {
      if (ref) {
        ref.traverse((child) => {
          if (child.isMesh && child.material) {
            child.material.opacity = fadeRef.current
          }
        })
      }
    })

    if (ourPlanetMeshRef.current && ourPlanetMeshRef.current.material) {
      ourPlanetMeshRef.current.material.opacity = fadeRef.current
    }
    if (ourCloudsMeshRef.current && ourCloudsMeshRef.current.material) {
      ourCloudsMeshRef.current.material.opacity = fadeRef.current * 0.8
    }
    if (sorryMeshRef.current && sorryMeshRef.current.material) {
      sorryMeshRef.current.material.opacity = fadeRef.current
    }
    if (sorryCloudsMeshRef.current && sorryCloudsMeshRef.current.material) {
      sorryCloudsMeshRef.current.material.opacity = fadeRef.current * 0.55
    }

    // Animate our central planet
    if (ourPlanetMeshRef.current) {
      ourPlanetMeshRef.current.rotation.y += 0.002
    }
    if (ourCloudsMeshRef.current) {
      ourCloudsMeshRef.current.rotation.y += 0.003
    }
    if (sorryMeshRef.current) {
      sorryMeshRef.current.rotation.y += 0.0022
    }
    if (sorryCloudsMeshRef.current) {
      sorryCloudsMeshRef.current.rotation.y += 0.0032
    }

    if (!systemRef.current) return

    // Our planet's absolute position on its orbit
    const ourAngle = t * OUR_SPEED
    const ourX = Math.cos(ourAngle) * OUR_ORBIT
    const ourZ = Math.sin(ourAngle) * OUR_ORBIT

    // Sorry Planet's absolute position on the neighboring orbit
    const sorryAngle = SORRY_START_ANGLE + t * SORRY_SPEED
    const sorryX = Math.cos(sorryAngle) * SORRY_ORBIT
    const sorryZ = Math.sin(sorryAngle) * SORRY_ORBIT

    if (ourPlanetRef.current) {
      ourPlanetRef.current.position.set(ourX, 0, ourZ)
    }
    if (sorryPlanetRef.current) {
      sorryPlanetRef.current.position.set(sorryX, 0, sorryZ)
    }

    // Travel between the two planets: ease the focus from one orbit to the other
    const dir = focus === 1 ? 1 : -1
    focusProgRef.current = Math.max(0, Math.min(1, focusProgRef.current + (dir * delta) / TRAVEL_SECONDS))
    const p = focusProgRef.current
    const eased = p * p * p * (p * (p * 6 - 15) + 10) // smootherstep

    const focusX = ourX + (sorryX - ourX) * eased
    const focusZ = ourZ + (sorryZ - ourZ) * eased

    // Shift the entire solar system so the focused planet maps to origin
    // (in the tilted group's local coordinates)
    systemRef.current.position.x = -focusX
    systemRef.current.position.z = -focusZ

    // Animate each planet on its own orbit (absolute coords in solar system)
    planetMeshRefs.current.forEach((ref, i) => {
      if (!ref) return
      const p = otherPlanets[i]
      const angle = p.startAngle + t * p.speed
      ref.position.x = Math.cos(angle) * p.orbit
      ref.position.y = 0
      ref.position.z = Math.sin(angle) * p.orbit
      ref.rotation.y += 0.004
    })
  })

  // We keep the system rendering while it transitions out
  const isCurrentlyInvisible = !visible && fadeRef.current < 0.001
  if (isCurrentlyInvisible) return null

  return (
    // Outer group: tilt the orbital plane for 3D perspective
    <group rotation={[-0.58, 0.12, 0.05]}>
      {/* Inner group: translates each frame to our reference frame */}
      <group ref={systemRef}>

        {/* ── SUN CORE ── */}
        <mesh>
          <sphereGeometry args={[SUN_RADIUS, 64, 64]} />
          <shaderMaterial
            ref={sunShaderRef}
            transparent
            depthWrite={true}
            vertexShader={`
              varying vec3 vNormal;
              varying vec3 vViewPosition;
              void main() {
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
              }
            `}
            fragmentShader={`
              varying vec3 vNormal;
              varying vec3 vViewPosition;
              uniform float uOpacity;
              uniform vec3 colorCenter;
              uniform vec3 colorEdge;
              
              void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);
                float dotProduct = max(0.0, dot(normal, viewDir));
                
                // Exponent creates a bright center that falls off slightly at the edge
                float factor = pow(dotProduct, 1.8);
                vec3 finalColor = mix(colorEdge, colorCenter, factor);
                
                gl_FragColor = vec4(finalColor, uOpacity);
              }
            `}
            uniforms={sunUniforms}
          />
        </mesh>

        {/* ── SUN CORONA GLOW ── */}
        <mesh>
          <sphereGeometry args={[SUN_RADIUS * 2.3, 64, 64]} />
          <shaderMaterial
            ref={coronaShaderRef}
            transparent
            depthWrite={false}
            vertexShader={`
              varying vec3 vNormal;
              varying vec3 vViewPosition;
              void main() {
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
              }
            `}
            fragmentShader={`
              varying vec3 vNormal;
              varying vec3 vViewPosition;
              uniform float uOpacity;
              uniform vec3 colorInner;
              uniform vec3 colorOuter;
              
              void main() {
                vec3 normal = normalize(vNormal);
                vec3 viewDir = normalize(vViewPosition);
                float dotProduct = max(0.0, dot(normal, viewDir));
                
                // Exponential falloff for a soft gradient corona
                float glowFactor = pow(dotProduct, 3.2);
                
                // Soft color mix from inner yellow-orange to outer reddish-orange glow
                vec3 glowColor = mix(colorOuter, colorInner, glowFactor);
                
                gl_FragColor = vec4(glowColor, glowFactor * uOpacity);
              }
            `}
            uniforms={coronaUniforms}
          />
        </mesh>

        {/* Sun light */}
        <pointLight ref={sunLightRef} intensity={0} color="#ffcc66" distance={160} decay={1.5} />

        {/* ── ORBIT RINGS ── */}
        {orbitRadii.map((r, i) => (
          <OrbitRing key={`orbit-${i}`} radius={r} highlight={r === OUR_ORBIT} visible={visible} />
        ))}

        {/* ── OTHER PLANETS ── */}
        {otherPlanets.map((p, i) => (
          <group key={`planet-group-${i}`} ref={el => (planetMeshRefs.current[i] = el)}>
            <mesh>
              <sphereGeometry args={[p.r, 32, 32]} />
              <meshStandardMaterial
                map={planetTextures[i]}
                emissive={p.emissive}
                emissiveIntensity={0.4}
                roughness={0.6}
                metalness={0.15}
                transparent
                opacity={0}
              />
            </mesh>
            
            {/* Saturn ring (index 4) */}
            {i === 4 && (
              <mesh rotation={[Math.PI / 2.2, 0.2, 0]}>
                <ringGeometry args={[p.r * 1.4, p.r * 2.3, 64]} />
                <meshStandardMaterial
                  color="#c6b686"
                  transparent
                  opacity={0}
                  side={THREE.DoubleSide}
                  roughness={0.8}
                />
              </mesh>
            )}
          </group>
        ))}

        {/* ── CENTRAL PLANET (OUR PLANET) — carried on its orbit ── */}
        <group ref={ourPlanetRef}>
          {/* Core */}
          <mesh ref={ourPlanetMeshRef}>
            <sphereGeometry args={[1.8, 64, 64]} />
            <meshStandardMaterial
              map={ourPlanetTexture}
              roughness={0.5}
              metalness={0.1}
              transparent
              opacity={0}
            />
          </mesh>
          {/* Clouds */}
          <mesh ref={ourCloudsMeshRef}>
            <sphereGeometry args={[1.82, 64, 64]} />
            <meshStandardMaterial
              map={cloudsTexture}
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.NormalBlending}
            />
          </mesh>
        </group>

        {/* ── SORRY PLANET — pink flower planet on the neighboring orbit ── */}
        <group ref={sorryPlanetRef}>
          <mesh ref={sorryMeshRef}>
            <sphereGeometry args={[1.8, 64, 64]} />
            <meshStandardMaterial
              map={sorryPlanetTexture}
              emissive="#b0476b"
              emissiveIntensity={0.38}
              roughness={0.55}
              metalness={0.05}
              transparent
              opacity={0}
            />
          </mesh>
          <mesh ref={sorryCloudsMeshRef}>
            <sphereGeometry args={[1.83, 64, 64]} />
            <meshStandardMaterial
              map={cloudsTexture}
              color="#ffe4ef"
              transparent
              opacity={0}
              depthWrite={false}
              blending={THREE.NormalBlending}
            />
          </mesh>
        </group>

      </group>
    </group>
  )
}

// Ambient scene lighting
function SceneLighting({ scene }) {
  const ambientRef = useRef()
  const light1Ref = useRef()
  const light2Ref = useRef()
  const light3Ref = useRef()

  // Target values based on scene
  const targets = useMemo(() => {
    const isS2 = scene >= 2
    return {
      ambientIntensity: isS2 ? 0.6 : 0.15,
      light1Intensity: isS2 ? 1.2 : 0.3,
      light1Color: new THREE.Color(isS2 ? '#ffb3c6' : '#ffffff'),
      light2Intensity: isS2 ? 0.5 : 0.1,
      light3Intensity: isS2 ? 0.8 : 0.0,
    }
  }, [scene])

  useFrame(() => {
    // Smooth lerp factor
    const speed = 0.02

    if (ambientRef.current) {
      ambientRef.current.intensity = THREE.MathUtils.lerp(
        ambientRef.current.intensity,
        targets.ambientIntensity,
        speed
      )
    }

    if (light1Ref.current) {
      light1Ref.current.intensity = THREE.MathUtils.lerp(
        light1Ref.current.intensity,
        targets.light1Intensity,
        speed
      )
      light1Ref.current.color.lerp(targets.light1Color, speed)
    }

    if (light2Ref.current) {
      light2Ref.current.intensity = THREE.MathUtils.lerp(
        light2Ref.current.intensity,
        targets.light2Intensity,
        speed
      )
    }

    if (light3Ref.current) {
      light3Ref.current.intensity = THREE.MathUtils.lerp(
        light3Ref.current.intensity,
        targets.light3Intensity,
        speed
      )
    }
  })

  return (
    <>
      <ambientLight ref={ambientRef} intensity={0.15} />
      <pointLight ref={light1Ref} position={[10, 10, 10]} intensity={0.3} color="#ffffff" />
      <pointLight ref={light2Ref} position={[-10, -5, -10]} intensity={0.1} color="#ff85a1" />
      <pointLight ref={light3Ref} position={[0, 0, 5]} intensity={0.0} color="#e8b4d8" />
    </>
  )
}

// ============================================================
// SCENE 1 — PASSWORD GATE
// ============================================================
function PasswordGate({ onCorrect }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const containerRef = useRef(null)
  const bobRef = useRef(null)

  // Bobbing / levitation animation
  useEffect(() => {
    if (containerRef.current) {
      bobRef.current = gsap.to(containerRef.current, {
        y: -8,
        duration: 2.5,
        ease: 'sine.inOut',
        yoyo: true,
        repeat: -1,
      })
    }
    return () => {
      if (bobRef.current) bobRef.current.kill()
    }
  }, [])

  const handleDigit = useCallback((digit) => {
    if (pin.length >= PIN_LENGTH) return

    const newPin = pin + digit
    setPin(newPin)
    setError(false)

    if (newPin.length === PIN_LENGTH) {
      if (newPin === CORRECT_PASSWORD) {
        setTimeout(() => onCorrect(), 500)
      } else {
        setError(true)
        setTimeout(() => {
          setPin('')
          setError(false)
        }, 800)
      }
    }
  }, [pin, onCorrect])

  const handleDelete = useCallback(() => {
    setPin(prev => prev.slice(0, -1))
    setError(false)
  }, [])

  // Keyboard support
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key)
      } else if (e.key === 'Backspace') {
        handleDelete()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleDigit, handleDelete])

  const numpadLayout = [
    ['1', '2', '3'],
    ['4', '5', '6'],
    ['7', '8', '9'],
    [null, '0', '⌫'],
  ]

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.8 }}
      className="fixed inset-0 z-20 flex items-center justify-center"
    >
      <div ref={containerRef} className="flex flex-col items-center gap-8">
        {/* Subtle title */}
        <motion.p
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 1 }}
          className="text-white/20 text-sm tracking-[0.4em] uppercase"
          style={{ fontFamily: 'var(--font-family-romantic)' }}
        >
          enter the code
        </motion.p>

        {/* PIN display */}
        <div className={`flex gap-5 mb-2 ${error ? 'shake' : ''}`}>
          {Array.from({ length: PIN_LENGTH }).map((_, i) => (
            <motion.div
              key={i}
              className={`pin-dot ${i < pin.length ? (error ? 'error' : 'filled') : ''}`}
              animate={i < pin.length ? { scale: [1, 1.3, 1] } : {}}
              transition={{ duration: 0.2 }}
            />
          ))}
        </div>

        {/* Numpad */}
        <div className="flex flex-col gap-3">
          {numpadLayout.map((row, rowIdx) => (
            <div key={rowIdx} className="flex gap-3 justify-center">
              {row.map((key, keyIdx) => {
                if (key === null) return <div key={keyIdx} className="numpad-spacer" />
                if (key === '⌫') {
                  return (
                    <motion.button
                      key={keyIdx}
                      className="numpad-btn"
                      whileTap={{ scale: 0.9 }}
                      onClick={handleDelete}
                      aria-label="Delete"
                    >
                      <span className="text-lg">⌫</span>
                    </motion.button>
                  )
                }
                return (
                  <motion.button
                    key={keyIdx}
                    className="numpad-btn"
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleDigit(key)}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (rowIdx * 3 + keyIdx), duration: 0.5 }}
                  >
                    {key}
                  </motion.button>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}

// ============================================================
// HTML PLANET (for z-index occlusion with cards)
// ============================================================
function HtmlPlanet({ visible }) {
  const [size, setSize] = useState(getPlanetScreenSize)

  useEffect(() => {
    const onResize = () => setSize(getPlanetScreenSize())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  if (!visible) return null

  return (
    <>
      {/* Atmospheric glow behind planet */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 2.2, ease: 'easeOut', delay: 0.1 }}
        className="planet-glow planet-glow-behind"
        style={{
          position: 'absolute',
          left: `calc(50% - ${size * 0.9}px)`,
          top: `calc(50% - ${size * 0.9}px)`,
          width: size * 1.8,
          height: size * 1.8,
          borderRadius: '50%',
          zIndex: 49,
          pointerEvents: 'none',
        }}
      />
    </>
  )
}

// ============================================================
// SCENE 2 & 3 — ORBIT CARDS (HTML overlay)
// ============================================================
function OrbitCards({ active, onCardClick, isConfessionUnlocked }) {
  const cardsContainerRef = useRef(null)
  const cardsRef = useRef([])
  const animationRef = useRef(null)
  const orbitAngleRef = useRef(0)
  const startTimeRef = useRef(null)

  // Pre-calculate randomized starting angles and distances for the cards
  // so they fly in from different directions in deep space
  const startPositions = useMemo(() => {
    return CARD_DATA.map((_, i) => {
      // Scatter angles around the circle
      const angle = (i / CARD_DATA.length) * Math.PI * 2 + 1.2
      // Large distance off-screen
      const dist = Math.max(window.innerWidth, window.innerHeight) * 1.3
      return { angle, dist }
    })
  }, [])

  // Single unified animation loop — orbit starts immediately,
  // cards chase the moving planet from deep space and settle into orbit
  useEffect(() => {
    if (!active) {
      // Reset for next activation
      startTimeRef.current = null
      orbitAngleRef.current = 0
      return
    }

    startTimeRef.current = performance.now()

    const animate = () => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000
      const centerX = window.innerWidth / 2
      const centerY = window.innerHeight / 2

      // Increment orbit angle (this runs continuously so the target is always moving)
      orbitAngleRef.current += 0.004

      const planetSize = getPlanetScreenSize()
      const cardHalf = getCardHalf()
      const smallDim = Math.min(window.innerWidth, window.innerHeight)
      const minX = planetSize / 2 + cardHalf.w + 15
      const radii = {
        x: Math.max(minX, smallDim * 0.30),
        y: Math.max(minX * 0.28, smallDim * 0.09),
      }

      cardsRef.current.forEach((card, i) => {
        if (!card) return

        // Target coordinates in active orbit
        const targetAngle = orbitAngleRef.current + (i / CARD_DATA.length) * Math.PI * 2
        const targetX = centerX + Math.cos(targetAngle) * radii.x
        const targetY = centerY + Math.sin(targetAngle) * radii.y

        // Starting coordinates in deep space
        const start = startPositions[i]
        const startX = centerX + Math.cos(start.angle) * start.dist
        const startY = centerY + Math.sin(start.angle) * start.dist

        // Flight transition progress (staggered delay, ease-out curve)
        const flightDelay = i * 0.22
        const flightDuration = 2.0
        let p = 0
        if (elapsed > flightDelay) {
          p = Math.min(1, (elapsed - flightDelay) / flightDuration)
        }

        // Quartic ease out for a smooth landing
        const easeP = 1 - Math.pow(1 - p, 4)

        // Interpolated position: chasing the target coordinate
        const x = startX + (targetX - startX) * easeP - cardHalf.w
        const y = startY + (targetY - startY) * easeP - cardHalf.h

        // depth: -1 = fully behind planet, +1 = fully in front (relative to target orbit)
        const depth = Math.sin(targetAngle)

        // Calculate card distance from viewport center to apply smooth occlusion
        let overlapOpacity = 1
        if (depth < 0) {
          const dx = (x + cardHalf.w) - centerX
          const dy = (y + cardHalf.h) - centerY
          const dist = Math.sqrt(dx * dx + dy * dy)
          
          const fadeStart = planetSize / 2 + cardHalf.w * 0.75
          const fadeEnd = planetSize / 2 - cardHalf.w * 0.2
          if (dist < fadeStart) {
            overlapOpacity = Math.max(0, Math.min(1, (dist - fadeEnd) / (fadeStart - fadeEnd)))
          }
        }

        // Scale: starts small in deep space, grows to depth-based scale in orbit
        const baseScale = 0.55 + (1 + depth) * 0.275
        const scale = baseScale * (0.15 + 0.85 * easeP)

        // z-index: behind planet (<50) or in front (>50)
        const zIndex = Math.round((1 + depth) * 50)

        // Opacity: starts at 0, fades in during the flight
        const baseOpacity = 0.35 + (1 + depth) * 0.325
        const opacity = baseOpacity * easeP * overlapOpacity

        gsap.set(card, { x, y, scale, zIndex, opacity })
      })

      animationRef.current = requestAnimationFrame(animate)
    }

    animationRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [active, startPositions])

  if (!active) return null

  return (
    <div ref={cardsContainerRef} className="fixed inset-0 z-30 pointer-events-none">
      {/* HTML Planet for proper z-index occlusion */}
      <HtmlPlanet visible={active} />

      {/* Orbit cards */}
      {CARD_DATA.map((card, i) => {
        const isLocked = card.id === 2 && !isConfessionUnlocked
        const displayIcon = isLocked ? '🔒' : card.icon
        const displayTitle = isLocked ? 'Locked Memory' : card.title
        const displayColor = isLocked ? '#95a5a6' : card.color
        const displayGlow = isLocked ? 'rgba(149, 165, 166, 0.38)' : card.glow
        const displayLight = isLocked ? 'rgba(149, 165, 166, 0.2)' : card.light

        return (
          <div
            key={card.id}
            ref={(el) => (cardsRef.current[i] = el)}
            className={`orbit-card pointer-events-auto ${isLocked ? 'card-locked' : ''}`}
            style={{
              '--card-color': displayColor,
              '--card-color-glow': displayGlow,
              '--card-color-light': displayLight,
            }}
            onClick={() => onCardClick(card)}
          >
            <div className="card-inner">
              <span className="card-icon">{displayIcon}</span>
              <span className="card-title" style={{ color: isLocked ? '#7f8c8d' : card.textColor }}>{displayTitle}</span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// Golden Wax Seal SVG decoration
function WaxSealSVG({ size = 52, className = '' }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      className={`wax-seal ${className}`}
      style={{ filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.15))' }}
    >
      {/* Outer irregular wax path */}
      <path
        d="M 50,10 
           C 64,8 75,13 83,21 
           C 91,29 88,43 91,53 
           C 94,63 93,75 83,83 
           C 73,91 58,88 48,91 
           C 38,94 24,93 16,83 
           C 8,73 11,58 10,48 
           C 9,38 7,24 17,16 
           C 27,8 36,12 50,10 Z"
        fill="url(#goldGrad)"
      />
      {/* Pressed inner circle */}
      <circle cx="50" cy="50" r="30" fill="url(#goldInner)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      {/* Inner heart design */}
      <path
        d="M 50,37 
           C 50,37 43,29 36,33 
           C 29,37 31,48 38,55 
           C 43,60 50,68 50,68 
           C 50,68 57,60 62,55 
           C 69,48 71,37 64,33 
           C 57,29 50,37 50,37 Z"
        fill="#8a1e2f"
        opacity="0.8"
      />
      <defs>
        <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#e5c060" />
          <stop offset="30%" stopColor="#b58a25" />
          <stop offset="50%" stopColor="#f3d98c" />
          <stop offset="70%" stopColor="#b58a25" />
          <stop offset="100%" stopColor="#8a6410" />
        </linearGradient>
        <linearGradient id="goldInner" x1="100%" y1="100%" x2="0%" y2="0%">
          <stop offset="0%" stopColor="#aa7c11" />
          <stop offset="50%" stopColor="#d4af37" />
          <stop offset="100%" stopColor="#f3d98c" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// ============================================================
// 3D GROWING BOUQUET COMPONENT
// ============================================================
function GrowingBouquet({ onComplete }) {
  const stemsRef = useRef([])
  const flowersRef = useRef([])

  useEffect(() => {
    const tl = gsap.timeline({
      onComplete: () => {
        if (onComplete) onComplete()
      }
    })

    // Grow stems sequentially
    stemsRef.current.forEach((stem, idx) => {
      if (stem) {
        tl.to(stem.scale, {
          y: 1,
          duration: 1.4,
          ease: 'power2.out'
        }, idx * 0.3)
      }
    })

    // Bloom flowers after stems grow
    flowersRef.current.forEach((flower, idx) => {
      if (flower) {
        tl.to(flower.scale, {
          x: 1,
          y: 1,
          z: 1,
          duration: 1.0,
          ease: 'back.out(1.5)'
        }, idx * 0.3 + 0.9)
      }
    })
  }, [onComplete])

  const bouquetData = [
    { stemRot: [0, 0, 0], length: 1.5, color: '#ff0a54' },       // Center
    { stemRot: [0.1, 0, 0.22], length: 1.4, color: '#ff477e' },  // Left
    { stemRot: [-0.1, 0, -0.22], length: 1.4, color: '#ff7096' }, // Right
    { stemRot: [0.18, 0, 0.1], length: 1.35, color: '#ff85a1' },  // Front
    { stemRot: [-0.18, 0, -0.1], length: 1.35, color: '#ffb3c6' } // Back
  ]

  return (
    <group position={[0, -0.85, 0]}>
      {/* Bouquet wrap ribbon */}
      <mesh position={[0, 0.08, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.04, 8, 24]} />
        <meshStandardMaterial color="#ff0a54" roughness={0.4} />
      </mesh>
      
      {bouquetData.map((data, idx) => (
        <group key={idx} rotation={data.stemRot}>
          {/* Stem */}
          <group ref={el => stemsRef.current[idx] = el} scale={[1, 0, 1]}>
            <mesh position={[0, data.length / 2, 0]}>
              <cylinderGeometry args={[0.02, 0.032, data.length, 12]} />
              <meshStandardMaterial color="#3e6341" roughness={0.9} />
            </mesh>
            {/* Small leaves sprouting along the stem */}
            <mesh position={[0.07, data.length * 0.45, 0]} rotation={[0, 0, 0.5]}>
              <sphereGeometry args={[0.08, 8, 8]} scale={[1.8, 0.18, 0.8]} />
              <meshStandardMaterial color="#4f7e53" roughness={0.8} />
            </mesh>
            <mesh position={[-0.07, data.length * 0.7, 0]} rotation={[0, 0, -0.5]}>
              <sphereGeometry args={[0.08, 8, 8]} scale={[1.8, 0.18, 0.8]} />
              <meshStandardMaterial color="#4f7e53" roughness={0.8} />
            </mesh>
          </group>

          {/* Blooming Flower Head at the top */}
          <group ref={el => flowersRef.current[idx] = el} position={[0, data.length, 0]} scale={[0, 0, 0]}>
            {/* Flower Center */}
            <mesh>
              <sphereGeometry args={[0.13, 16, 16]} />
              <meshStandardMaterial color="#ffc300" roughness={0.8} />
            </mesh>
            {/* Petals */}
            {Array.from({ length: 6 }).map((_, petalIdx) => {
              const angle = (petalIdx / 6) * Math.PI * 2
              const r = 0.14
              const px = Math.cos(angle) * r
              const pz = Math.sin(angle) * r
              return (
                <mesh key={petalIdx} position={[px, 0.02 * (petalIdx % 2 ? 1 : -1), pz]} rotation={[0.2, -angle, 0.35]}>
                  <sphereGeometry args={[0.13, 16, 16]} scale={[1.2, 0.38, 0.75]} />
                  <meshStandardMaterial color={data.color} roughness={0.6} />
                </mesh>
              )
            })}
          </group>
        </group>
      ))}
    </group>
  )
}

// ============================================================
// HEART CONFETTI COMPONENT
// ============================================================
function HeartConfetti() {
  const hearts = useMemo(() => {
    return Array.from({ length: 35 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // percentage
      size: 14 + Math.random() * 20, // px
      delay: Math.random() * 4, // seconds
      duration: 3 + Math.random() * 3, // seconds
      rotation: Math.random() * 360,
    }))
  }, [])

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-50">
      {hearts.map(h => (
        <div
          key={h.id}
          className="absolute text-pink-500/80 animate-fall"
          style={{
            left: `${h.x}%`,
            top: `-40px`,
            fontSize: `${h.size}px`,
            animationDelay: `${h.delay}s`,
            animationDuration: `${h.duration}s`,
            transform: `rotate(${h.rotation}deg)`,
          }}
        >
          ❤️
        </div>
      ))}
    </div>
  )
}

// ============================================================
// CONFESSION PROPOSAL COMPONENT
// ============================================================
function ConfessionProposal({ card, onClose, onPlayTrack, currentTrackIndex, isPlaying, songs }) {
  const [bloomComplete, setBloomComplete] = useState(false)
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 })
  const [accepted, setAccepted] = useState(false)

  const handleYes = () => {
    setAccepted(true)
    if (songs && songs[2]) {
      onPlayTrack(2)
    }
  }

  const handleNoHover = () => {
    const maxRange = 100
    const rx = (Math.random() - 0.5) * maxRange * 2
    const ry = (Math.random() - 0.5) * maxRange * 2
    
    // Minimum jump
    const dx = rx + (rx >= 0 ? 30 : -30)
    const dy = ry + (ry >= 0 ? 20 : -20)
    
    setNoOffset({ x: dx, y: dy })
  }

  return (
    <div className="flex flex-col items-center justify-between w-full h-full relative z-10 p-6 text-center select-none">
      {accepted ? (
        <div className="flex flex-col items-center justify-center w-full h-full gap-6 animate-fade-in relative z-20">
          <HeartConfetti />
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
            className="text-6xl mb-2"
          >
            💖👑🌹
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-bold text-pink-600 font-romantic italic"
            style={{ fontFamily: 'var(--font-family-romantic)' }}
          >
            I Love You!
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-neutral-600 max-w-[280px] leading-relaxed font-romantic"
            style={{ fontFamily: 'var(--font-family-romantic)' }}
          >
            Our most beautiful date starts from today. Thank you for being mine! ✨❤️
          </motion.p>
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="memory-btn mt-4 pointer-events-auto"
            style={{
              background: 'linear-gradient(135deg, #ff477e 0%, #ff0a54 100%)',
              boxShadow: '0 4px 15px rgba(255, 10, 84, 0.4)'
            }}
            onClick={onClose}
          >
            Close 🌸
          </motion.button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="w-full">
            <h3 className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-semibold mb-1" style={{ fontFamily: 'var(--font-family-romantic)' }}>
              Last Memory 💌
            </h3>
            <div className="w-12 h-px bg-pink-200 mx-auto" />
          </div>

          {/* 3D Bouquet Container */}
          <div className="w-full flex-grow relative overflow-hidden rounded-2xl bg-gradient-to-b from-pink-50/50 to-white/40 border border-pink-100/30 my-4" style={{ height: '240px' }}>
            <Canvas camera={{ position: [0, 0.25, 2.8], fov: 45 }} className="w-full h-full">
              <ambientLight intensity={0.7} />
              <pointLight position={[5, 10, 5]} intensity={1.2} color="#ffd2e0" />
              <directionalLight position={[-5, 5, -2]} intensity={0.4} />
              <GrowingBouquet onComplete={() => setBloomComplete(true)} />
            </Canvas>
            {!bloomComplete && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none bg-white/10 backdrop-blur-[1px]">
                <span className="text-xs text-neutral-400 animate-pulse font-romantic" style={{ fontFamily: 'var(--font-family-romantic)' }}>
                  Creating 3D Flower Bouquet... 🌹
                </span>
              </div>
            )}
          </div>

          {/* Proposal Form */}
          <div className="w-full flex flex-col items-center gap-4 transition-all duration-700" style={{ opacity: bloomComplete ? 1 : 0.2, transform: bloomComplete ? 'translateY(0)' : 'translateY(10px)', pointerEvents: bloomComplete ? 'auto' : 'none' }}>
            <h2 className="text-2xl font-semibold text-pink-700 italic font-romantic leading-tight" style={{ fontFamily: 'var(--font-family-romantic)' }}>
              Will you be mine? 💖
            </h2>
            <p className="text-xs text-neutral-500 max-w-[260px]" style={{ fontFamily: 'var(--font-family-romantic)' }}>
              Let's write the rest of our stories together.
            </p>

            {/* Buttons */}
            <div className="flex gap-4 items-center justify-center w-full relative h-16 mt-2">
              <button
                className="memory-btn px-8 pointer-events-auto"
                style={{
                  background: 'linear-gradient(135deg, #ff477e 0%, #ff0a54 100%)',
                  boxShadow: '0 4px 15px rgba(255, 10, 84, 0.4)'
                }}
                onClick={handleYes}
              >
                Yes! 💖
              </button>

              <button
                className="back-btn px-6 border-neutral-300 text-neutral-500 hover:bg-neutral-50 pointer-events-auto transition-transform duration-200"
                style={{
                  transform: `translate(${noOffset.x}px, ${noOffset.y}px)`,
                  position: noOffset.x !== 0 || noOffset.y !== 0 ? 'absolute' : 'relative',
                  zIndex: 40
                }}
                onMouseEnter={handleNoHover}
                onTouchStart={handleNoHover}
                onClick={handleNoHover}
              >
                No 😢
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function OpenedCard({ card, onClose, currentTrackIndex, isPlaying, onPlayTrack, songs }) {
  if (!card) return null

  const [isFlipped, setIsFlipped] = useState(false)

  const colors = card.flowerColors || ['#ff6b9d', '#ff85a1', '#ffb3c6']
  const leftFlowers = [
    { Component: FlowerSVG, props: { color: colors[0], size: 38 } },
    { Component: LeafSVG, props: { color: colors[1], size: 28 } },
    { Component: FlowerSVG, props: { color: colors[2], size: 32 } },
    { Component: LeafSVG, props: { color: colors[1], size: 24 } },
    { Component: FlowerSVG, props: { color: colors[0], size: 36 } },
    { Component: LeafSVG, props: { color: colors[1], size: 30 } },
    { Component: FlowerSVG, props: { color: colors[2], size: 34 } },
  ]

  const rightFlowers = [
    { Component: LeafSVG, props: { color: colors[1], size: 30 } },
    { Component: FlowerSVG, props: { color: colors[0], size: 36 } },
    { Component: LeafSVG, props: { color: colors[2], size: 26 } },
    { Component: FlowerSVG, props: { color: colors[0], size: 34 } },
    { Component: LeafSVG, props: { color: colors[1], size: 28 } },
    { Component: FlowerSVG, props: { color: colors[2], size: 32 } },
    { Component: LeafSVG, props: { color: colors[1], size: 30 } },
  ]

  return (
    <AnimatePresence>
      <motion.div
        className="card-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        onClick={onClose}
      >
        <motion.div
          className="card-opened"
          initial={{ scale: 0.3, opacity: 0, rotateY: -90 }}
          animate={{ scale: 1, opacity: 1, rotateY: 0 }}
          exit={{ scale: 0.3, opacity: 0, rotateY: 90 }}
          transition={{ duration: 0.8, type: 'spring', bounce: 0.3 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            className="close-btn"
            style={{
              zIndex: 15,
              color: card.color,
              borderColor: `${card.color}40`,
              background: `${card.color}0d`
            }}
            onClick={onClose}
          >
            ✕
          </button>

          <div className="flip-container">
            <div className={`flip-card-inner ${isFlipped ? 'is-flipped' : ''}`}>
              
              {/* FRONT FACE: The Romantic Love Letter */}
              <div
                className="flip-card-front"
                style={{
                  background: card.bgFront,
                  borderColor: card.borderColor,
                  boxShadow: `0 30px 90px ${card.glow}, 0 10px 30px rgba(0, 0, 0, 0.04), inset 0 0 20px rgba(255, 255, 255, 0.6)`,
                  '--double-border-color': card.doubleBorderColor,
                }}
              >
                {/* Bouquet assembling in background behind texts */}
                <BouquetBackground cardId={card.id} colors={colors} />

                {/* Left flower border decorations */}
                <div className="absolute left-3 top-0 bottom-0 flex flex-col items-center justify-around py-6 pointer-events-none z-10">
                  {leftFlowers.map((f, i) => (
                    <f.Component
                      key={`left-${i}`}
                      {...f.props}
                      style={{ animationDelay: `${i * 0.3}s` }}
                    />
                  ))}
                </div>

                {/* Right flower border decorations */}
                <div className="absolute right-3 top-0 bottom-0 flex flex-col items-center justify-around py-6 pointer-events-none z-10">
                  {rightFlowers.map((f, i) => (
                    <f.Component
                      key={`right-${i}`}
                      {...f.props}
                      style={{ animationDelay: `${i * 0.25 + 0.1}s` }}
                    />
                  ))}
                </div>

                {/* Center content container */}
                <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 px-12 sm:px-16 text-center relative z-10 w-full h-full">
                  {/* Elegant wax seal at top */}
                  <motion.div
                    initial={{ scale: 0, rotate: -45 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ delay: 0.3, duration: 0.6, type: 'spring' }}
                    className="mb-1"
                  >
                    <WaxSealSVG size={52} />
                  </motion.div>

                  <motion.div
                    className="text-4xl sm:text-5xl mb-1 sm:mb-2"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    {card.icon}
                  </motion.div>

                  <motion.h2
                    className="floating-text"
                    style={{
                      fontFamily: 'var(--font-family-romantic)',
                      fontSize: 'clamp(1.4rem, 5vw, 2.0rem)',
                      fontWeight: 600,
                      fontStyle: 'italic',
                      color: card.titleColor || '#1a0010',
                      lineHeight: 1.2,
                    }}
                  >
                    {card.title}
                  </motion.h2>

                  <motion.div
                    className="w-12 sm:w-16 h-px mt-1 sm:mt-2"
                    style={{ background: `linear-gradient(90deg, transparent, ${card.color || '#ff85a1'}, transparent)` }}
                    animate={{ scaleX: [0, 1], opacity: [0, 1] }}
                    transition={{ delay: 0.5, duration: 1 }}
                  />

                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    style={{
                      fontFamily: 'var(--font-family-romantic)',
                      fontSize: 'clamp(0.85rem, 3vw, 1.05rem)',
                      color: card.textColor || '#4a2035',
                      lineHeight: 1.7,
                      maxWidth: '280px',
                    }}
                  >
                    {card.message}
                  </motion.p>

                  {/* 📸 Memory button - only if card contains photo */}
                  {card.hasPhoto && (
                    <motion.button
                      className="memory-btn mt-3 sm:mt-4 pointer-events-auto"
                      style={{
                        background: `linear-gradient(135deg, ${colors[1]} 0%, ${colors[0]} 100%)`,
                        boxShadow: `0 4px 15px ${colors[0]}4d`
                      }}
                      onClick={() => setIsFlipped(true)}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 }}
                    >
                      📸 Memory
                    </motion.button>
                  )}

                  {/* 🎵 Music Box button - only if card has music */}
                  {card.hasMusic && (
                    <motion.button
                      className="memory-btn mt-3 sm:mt-4 pointer-events-auto"
                      style={{
                        background: `linear-gradient(135deg, ${colors[1]} 0%, ${colors[0]} 100%)`,
                        boxShadow: `0 4px 15px ${colors[0]}4d`
                      }}
                      onClick={() => {
                        setIsFlipped(true)
                        if (currentTrackIndex === null) {
                          onPlayTrack(0)
                        } else if (!isPlaying) {
                          onPlayTrack(currentTrackIndex)
                        }
                      }}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 1.2 }}
                    >
                      🎵 Music Box
                    </motion.button>
                  )}
                </div>
              </div>

              {/* BACK FACE: Polaroid, Music Player or Confession */}
              <div
                className="flip-card-back"
                style={{
                  background: card.bgBack,
                  borderColor: card.borderColor,
                  boxShadow: `0 30px 90px ${card.glow}, 0 10px 30px rgba(0, 0, 0, 0.04), inset 0 0 20px rgba(255, 255, 255, 0.6)`,
                  '--double-border-color': card.doubleBorderColor,
                }}
              >
                {card.isConfession ? (
                  <ConfessionProposal
                    card={card}
                    onClose={onClose}
                    onPlayTrack={onPlayTrack}
                    currentTrackIndex={currentTrackIndex}
                    isPlaying={isPlaying}
                    songs={songs}
                  />
                ) : card.hasPhoto ? (
                  <div className="flex flex-col items-center justify-center w-full h-full relative z-10 px-8">
                    {/* Washi tape decoration */}
                    <div
                      className="polaroid-washi"
                      style={{
                        backgroundColor: `${card.color}55`
                      }}
                    />

                    {/* Polaroid paper frame */}
                    <div className="polaroid-frame">
                      <div className="polaroid-photo">
                        <img
                          src={card.photoUrl}
                          alt={card.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="polaroid-caption">
                        {card.caption}
                      </div>
                    </div>

                    {/* Back Button */}
                    <button
                      className="back-btn"
                      style={{
                        color: colors[0],
                        borderColor: `${colors[0]}40`,
                        background: `${colors[0]}0d`
                      }}
                      onClick={() => setIsFlipped(false)}
                    >
                      Back ✍️
                    </button>
                  </div>
                ) : card.hasMusic ? (
                  <div className="flex flex-col items-center justify-center w-full h-full relative z-10 px-6 py-4">
                    {/* Vinyl turntable container */}
                    <div className="relative flex items-center justify-center w-36 h-36 sm:w-40 sm:h-40 mb-4 mt-2">
                      {/* Turntable plate background */}
                      <div className="absolute inset-0 rounded-full bg-black/5 border border-black/10 shadow-inner" />
                      
                      {/* Vinyl disk */}
                      <div className={`vinyl-disk ${isPlaying ? 'rotating' : ''}`} style={{
                        '--vinyl-theme-color': colors[0]
                      }}>
                        <div className="vinyl-grooves" />
                        {/* Center label */}
                        <div className="vinyl-label" style={{ backgroundColor: colors[0] }}>
                          <span className="text-[8px] font-sans font-bold text-white uppercase tracking-wider text-center px-1 truncate max-w-full">{card.title}</span>
                          <div className="vinyl-center-hole" />
                        </div>
                      </div>
                      
                      {/* Tonearm */}
                      <div className={`vinyl-tonearm ${isPlaying ? 'active' : ''}`}>
                        <div className="vinyl-tonearm-needle" />
                      </div>
                    </div>

                    {/* Tracklist title */}
                    <h3 className="text-sm font-semibold tracking-wider uppercase mb-3 text-black/50" style={{ fontFamily: 'var(--font-family-romantic)' }}>
                      Select a Song
                    </h3>

                    {/* Tracklist */}
                    <div className="flex flex-col gap-2 w-full max-w-[280px] mb-4">
                      {songs.map((song, idx) => {
                        const isCurrent = currentTrackIndex === idx
                        return (
                          <button
                            key={idx}
                            onClick={() => onPlayTrack(idx)}
                            className={`track-item flex items-center justify-between p-2 rounded-xl transition-all duration-300 border text-left cursor-pointer ${
                              isCurrent 
                                ? 'bg-pink-50 border-pink-200/60 shadow-sm text-pink-700 font-semibold' 
                                : 'bg-white/40 hover:bg-white/70 border-black/5 text-neutral-700'
                            }`}
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {/* Small play status indicator */}
                              <div className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-black/5 text-xs">
                                {isCurrent && isPlaying ? (
                                  <span className="flex gap-0.5 items-end h-2.5">
                                    <span className="w-0.5 bg-current animate-music-bar-1" />
                                    <span className="w-0.5 bg-current animate-music-bar-2" />
                                    <span className="w-0.5 bg-current animate-music-bar-3" />
                                  </span>
                                ) : (
                                  <span>{idx + 1}</span>
                                )}
                              </div>
                              <div className="truncate">
                                <p className="text-xs truncate leading-tight" style={{ fontFamily: 'var(--font-family-romantic)' }}>{song.title}</p>
                                <p className="text-[10px] text-neutral-400 truncate mt-0.5" style={{ fontFamily: 'var(--font-family-romantic)' }}>{song.artist}</p>
                              </div>
                            </div>
                            
                            {/* Play/Pause Action Icon */}
                            <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                              isCurrent ? 'bg-pink-400 text-white' : 'bg-black/5 text-neutral-600 hover:bg-black/10'
                            }`}>
                              {isCurrent && isPlaying ? (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                  <line x1="18" y1="20" x2="18" y2="4"></line>
                                  <line x1="6" y1="20" x2="6" y2="4"></line>
                                </svg>
                              ) : (
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" className="ml-0.5">
                                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                              )}
                            </div>
                          </button>
                        )
                      })}
                    </div>

                    {/* Back Button */}
                    <button
                      className="back-btn mt-1"
                      style={{
                        color: colors[0],
                        borderColor: `${colors[0]}40`,
                        background: `${colors[0]}0d`
                      }}
                      onClick={() => setIsFlipped(false)}
                    >
                      Back ✍️
                    </button>
                  </div>
                ) : null}
              </div>

            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [scene, setScene] = useState(1)
  const [openedCard, setOpenedCard] = useState(null)
  const [openedCardIds, setOpenedCardIds] = useState([])

  // Planet navigation: 0 = card planet, 1 = sorry planet.
  // Travelling covers the flight across the solar system between orbits.
  const [planetIndex, setPlanetIndex] = useState(0)
  const [sorryVisited, setSorryVisited] = useState(false)
  const [travelling, setTravelling] = useState(false)
  const travelTimerRef = useRef(null)

  const startTravel = useCallback((target) => {
    clearTimeout(travelTimerRef.current)
    setTravelling(true)
    setPlanetIndex(target)
    travelTimerRef.current = setTimeout(() => setTravelling(false), 3300)
  }, [])

  const handleGoToSorryPlanet = useCallback(() => {
    setSorryVisited(true)
    startTravel(1)
  }, [startTravel])

  const handleBackToCardPlanet = useCallback(() => {
    startTravel(0)
  }, [startTravel])

  useEffect(() => () => clearTimeout(travelTimerRef.current), [])

  const isConfessionUnlocked = useMemo(() => {
    const required = [1, 3, 4, 5, 6]
    return required.every(id => openedCardIds.includes(id))
  }, [openedCardIds])

  // Music Player States
  const [currentTrackIndex, setCurrentTrackIndex] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioError, setAudioError] = useState(null)
  const audioRef = useRef(null)

  // Clear audio error after a few seconds
  useEffect(() => {
    if (audioError) {
      const timer = setTimeout(() => setAudioError(null), 5000)
      return () => clearTimeout(timer)
    }
  }, [audioError])

  const handlePlayTrack = useCallback((index) => {
    if (!audioRef.current) return
    setAudioError(null)

    if (currentTrackIndex === index) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(e => {
            console.log("Play error:", e)
            setAudioError("Browser memblokir pemutaran otomatis. Silakan coba lagi atau klik layar.")
            setIsPlaying(false)
          })
      }
    } else {
      audioRef.current.pause()
      audioRef.current.src = SONGS[index].url
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true)
          setCurrentTrackIndex(index)
        })
        .catch(e => {
          console.log("Play error:", e)
          setAudioError("Gagal memutar lagu. Pastikan file lagu tersedia.")
          setIsPlaying(false)
        })
    }
  }, [currentTrackIndex, isPlaying])

  const handleTogglePlay = useCallback(() => {
    if (!audioRef.current) return
    setAudioError(null)
    if (currentTrackIndex === null) {
      handlePlayTrack(0)
    } else {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
          .then(() => setIsPlaying(true))
          .catch(e => {
            console.log("Play error:", e)
            setAudioError("Browser blocked autoplay. Please click the screen and try again.")
            setIsPlaying(false)
          })
      }
    }
  }, [currentTrackIndex, isPlaying, handlePlayTrack])

  // Handle password correct → transition to scene 2/3
  const handlePasswordCorrect = useCallback(() => {
    setScene(2)

    // After entry animation, it's scene 3 (orbiting)
    setTimeout(() => setScene(3), 4000)
  }, [])

  // Card click handler
  const handleCardClick = useCallback((card) => {
    if (card.id === 2 && !isConfessionUnlocked) {
      setAudioError("🔒 This memory is locked... Open all other memory cards first!")
      return
    }
    setOpenedCard(card)
    setOpenedCardIds(prev => prev.includes(card.id) ? prev : [...prev, card.id])
  }, [isConfessionUnlocked])

  const handleCloseCard = useCallback(() => {
    setOpenedCard(null)
  }, [])

  const colorMode = scene >= 2 ? 'pink' : 'dark'

  return (
    <div className="w-full h-full relative overflow-hidden">
      {/* HTML5 Audio Element */}
      <audio
        ref={audioRef}
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="auto"
      />

      {/* Background layer 1: Cosmic Dark Space */}
      <div
        className="scene-bg"
        style={{
          background: 'radial-gradient(circle at center, #18122b 0%, #0f0c1b 50%, #050409 100%)',
          opacity: scene >= 2 ? 0 : 1,
          transition: 'opacity 3.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* Background layer 2: Pink Nebula */}
      <div
        className="scene-bg"
        style={{
          background: 'linear-gradient(135deg, #fff2f6 0%, #ffdbea 35%, #f6cce4 70%, #dcb8dc 100%)',
          opacity: scene >= 2 ? 1 : 0,
          transition: 'opacity 3.5s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />

      {/* Floating animated blobs for rich depth */}
      <div className={`bg-blob bg-blob-1 ${scene >= 2 ? 'visible' : ''}`} />
      <div className={`bg-blob bg-blob-2 ${scene >= 2 ? 'visible' : ''}`} />
      <div className={`bg-blob bg-blob-3 ${scene >= 2 ? 'visible' : ''}`} />

      {/* Three.js Canvas — particles + solar system (both planets live here) */}
      <Canvas
        className="!fixed inset-0 z-10"
        camera={{ position: [0, 0, CAMERA_Z], fov: CAMERA_FOV }}
        dpr={[1, 1.5]}
        gl={{ powerPreference: 'high-performance' }}
        style={{ pointerEvents: 'none' }}
      >
        <SceneLighting scene={scene} />
        <ParticleField colorMode={colorMode} />
        <SolarSystem visible={scene >= 2} focus={planetIndex} />
      </Canvas>

      {/* Scene 2 & 3: Orbiting Cards + Planet — fades out while visiting the Sorry Planet.
          The card planet itself is untouched; only this wrapper fades. */}
      <div
        className="card-planet-layer"
        style={{
          opacity: planetIndex === 0 ? 1 : 0,
          visibility: planetIndex === 1 && !travelling ? 'hidden' : 'visible',
          transition: planetIndex === 1 ? 'opacity 0.9s ease' : 'opacity 1.2s ease 1.8s',
        }}
      >
        <OrbitCards
          active={scene >= 2}
          onCardClick={handleCardClick}
          isConfessionUnlocked={isConfessionUnlocked}
        />
      </div>

      {/* Scene 1: Password Gate */}
      <AnimatePresence mode="wait">
        {scene === 1 && (
          <PasswordGate
            key="password-gate"
            onCorrect={handlePasswordCorrect}
          />
        )}
      </AnimatePresence>

      {/* Sorry Planet overlay — mounted after first visit so progress is preserved */}
      {sorryVisited && (
        <SorryPlanet active={planetIndex === 1 && !travelling} onBack={handleBackToCardPlanet} />
      )}

      {/* Left arrow: only shown on the card planet, pointing to the Sorry Planet */}
      <AnimatePresence>
        {scene >= 3 && planetIndex === 0 && !travelling && !openedCard && (
          <NavArrow key="sorry-arrow" dir="left" label="sorry planet" onClick={handleGoToSorryPlanet} />
        )}
      </AnimatePresence>

      {/* Scene 4: Opened Card */}
      <AnimatePresence>
        {openedCard && (
          <OpenedCard
            key="opened-card"
            card={openedCard}
            onClose={handleCloseCard}
            currentTrackIndex={currentTrackIndex}
            isPlaying={isPlaying}
            onPlayTrack={handlePlayTrack}
            songs={SONGS}
          />
        )}
      </AnimatePresence>

      {/* Floating mini-player controller */}
      <AnimatePresence>
        {currentTrackIndex !== null && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-2.5 rounded-full border border-white/20 bg-white/10 backdrop-blur-md shadow-lg pointer-events-auto"
            style={{
              boxShadow: '0 8px 32px rgba(26, 0, 16, 0.15)',
            }}
          >
            {/* Spinning vinyl/disk icon */}
            <div className={`w-8 h-8 rounded-full border border-white/30 flex items-center justify-center bg-zinc-950 relative overflow-hidden ${isPlaying ? 'rotating' : ''}`} style={{ animationDuration: '3s' }}>
              <div className="w-2.5 h-2.5 rounded-full bg-pink-300 absolute" />
              <div className="w-full h-full border border-zinc-800 rounded-full opacity-40" />
            </div>
            
            <div className="flex flex-col text-left">
              <span className="text-[11px] uppercase tracking-wider text-black/40 font-medium font-sans">Now Playing</span>
              <span className="text-xs font-semibold text-neutral-800 truncate max-w-[120px]" style={{ fontFamily: 'var(--font-family-romantic)' }}>
                {SONGS[currentTrackIndex].title}
              </span>
            </div>

            {/* Play/Pause Button */}
            <button
              onClick={handleTogglePlay}
              className="w-8 h-8 rounded-full flex items-center justify-center bg-pink-400 hover:bg-pink-500 text-white transition-colors duration-200 cursor-pointer shadow-sm"
            >
              {isPlaying ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="4"></line>
                  <line x1="6" y1="20" x2="6" y2="4"></line>
                </svg>
              ) : (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-0.5">
                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
              )}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Audio Error Toast */}
      <AnimatePresence>
        {audioError && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 rounded-full border border-pink-200/50 bg-white/80 backdrop-blur-md shadow-lg pointer-events-auto text-xs text-pink-600 font-medium"
            style={{
              fontFamily: 'var(--font-family-romantic)',
              boxShadow: '0 8px 32px rgba(255, 133, 161, 0.15)',
            }}
          >
            ⚠️ {audioError}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
