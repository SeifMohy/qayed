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
        width="400"
        height="100"
        viewBox="0 0 400 100"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto"
      >
        <text
          x="0"
          y="75"
          fontFamily="Georgia, Times, 'Times New Roman', serif"
          fontSize="80"
          fontWeight="bold"
          fill="#000"
        >
          Qayed
        </text>
      </svg>
    </motion.div>
  )
}
