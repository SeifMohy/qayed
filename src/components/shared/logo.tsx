'use client'

import { clsx } from 'clsx'
import { motion } from 'framer-motion'

export function Logo({ className }: { className?: string }) {
  let transition = {
    duration: 0.5,
    ease: 'easeInOut',
  }

  return (
    <motion.div
      className={clsx(className, 'overflow-visible')}
      initial="idle"
      whileHover="active"
      variants={{
        idle: { scale: 1, opacity: 1 },
        active: {
          scale: [1, 1.1, 1],
          opacity: [1, 0.75, 1],
          transition: { ...transition, delay: 0 },
        },
      }}
    >
      <svg
        width="250"
        height="90"
        viewBox="0 0 200 60"
        xmlns="http://www.w3.org/2000/svg"
      >
        <style>
          {`
          url('https://fonts.googleapis.com/css2?family=Kanit&display=swap');
          `}
        </style>

        <text
          x="50%"
          y="50%"
          dominant-baseline="middle"
          text-anchor="middle"
          fill="#333"
          font-family="Kanit, 500"
          font-size="32"
          font-weight="bold"
        >
          SKUFLOW
        </text>
      </svg>
    </motion.div>
  )
}
