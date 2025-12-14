"use client"

import type React from "react"
import { useRef, useState, useCallback, useEffect } from "react"
import { cn } from "@/lib/utils"

interface MagneticTextProps {
    text: string
    hoverText?: string
    className?: string
}

export function MagneticText({ text = "CREATIVE", hoverText = "EXPLORE", className }: MagneticTextProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const overlayRef = useRef<HTMLDivElement>(null)


    const mousePos = useRef({ x: 0, y: 0 })
    const currentPos = useRef({ x: 0, y: 0 })
    const currentRadius = useRef(0)
    const targetRadius = useRef(0)
    const animationFrameRef = useRef<number>(0)

    // Smooth animation loop
    useEffect(() => {
        const lerp = (start: number, end: number, factor: number) => start + (end - start) * factor

        const animate = () => {
            // Lerp position
            currentPos.current.x = lerp(currentPos.current.x, mousePos.current.x, 0.25)
            currentPos.current.y = lerp(currentPos.current.y, mousePos.current.y, 0.25)

            // Lerp radius
            currentRadius.current = lerp(currentRadius.current, targetRadius.current, 0.2)

            // Update clip-path
            if (overlayRef.current && containerRef.current) {
                const overlayRect = overlayRef.current.getBoundingClientRect()
                const containerRect = containerRef.current.getBoundingClientRect()

                // Calculate mouse position relative to the overlay
                // Overlay is centered, so we need to offset by the difference in top/left
                const xRelative = currentPos.current.x + (overlayRect.width / 2 - containerRect.width / 2)
                const yRelative = currentPos.current.y + (overlayRect.height / 2 - containerRect.height / 2)

                overlayRef.current.style.clipPath = `circle(${currentRadius.current}px at ${xRelative}px ${yRelative}px)`
            }

            animationFrameRef.current = requestAnimationFrame(animate)
        }

        animationFrameRef.current = requestAnimationFrame(animate)
        return () => {
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current)
        }
    }, [])

    // Track mouse position
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        mousePos.current = {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        }
    }, [])

    const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return
        const rect = containerRef.current.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        mousePos.current = { x, y }
        currentPos.current = { x, y }
        targetRadius.current = 75 // 150px diameter

    }, [])

    const handleMouseLeave = useCallback(() => {

        targetRadius.current = 0
    }, [])

    // Accessibility focus
    const handleFocus = useCallback(() => {

        targetRadius.current = 75
        if (containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect()
            mousePos.current = { x: rect.width / 2, y: rect.height / 2 }
            currentPos.current = { x: rect.width / 2, y: rect.height / 2 }
        }
    }, [])

    const handleBlur = useCallback(() => {

        targetRadius.current = 0
    }, [])

    // Mobile check
    const [isMobile, setIsMobile] = useState(false)
    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onFocus={handleFocus}
            onBlur={handleBlur}
            tabIndex={0}
            className={cn(
                "relative inline-flex items-center justify-center select-none",
                !isMobile && "cursor-none",
                "focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-black rounded-lg",
                className
            )}
        >
            {/* Base text layer */}
            <span className="text-5xl font-bold tracking-tighter text-foreground tracking-wide">{text}</span>

            {/* Overlay layer with clip-path */}
            <div
                ref={overlayRef}
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%+300px)] h-[calc(100%+300px)] bg-foreground flex items-center justify-center pointer-events-none"
                style={{
                    willChange: "clip-path",
                    clipPath: "circle(0px at 50% 50%)"
                }}
            >
                <span className="text-5xl font-bold tracking-tighter text-background whitespace-nowrap tracking-wide">
                    {hoverText}
                </span>
            </div>
        </div>
    )
}
