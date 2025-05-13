'use client'

import React, { useState, useEffect } from 'react'

interface AnimatedNumberProps {
  start: number
  end: number
  duration?: number
  decimals?: number
}

export function AnimatedNumber({
  start,
  end,
  duration = 1000,
  decimals = 0,
}: AnimatedNumberProps) {
  const [value, setValue] = useState(start)
  
  useEffect(() => {
    let startTime: number | null = null
    
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp
      
      const progress = Math.min((timestamp - startTime) / duration, 1)
      const currentValue = progress * (end - start) + start
      
      setValue(currentValue)
      
      if (progress < 1) {
        window.requestAnimationFrame(step)
      }
    }
    
    window.requestAnimationFrame(step)
    
    return () => {
      // Cleanup if needed
    }
  }, [start, end, duration])
  
  return <>{value.toFixed(decimals)}</>
}
