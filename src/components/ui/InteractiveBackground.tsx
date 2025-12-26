"use client";

import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    symbol: string;
    opacity: number;
}

export default function InteractiveBackground() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: 0, y: 0 });
    const isMouseMoving = useRef(false);
    const mouseTimeout = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];

        // More visible, "hacker" style symbols
        const symbols = [
            '{ }', '< />', '=>', '&&', '||', '[]', '()', '*', ';',
            'func', 'const', 'let', 'var', 'await', 'import', 'export',
            '0', '1', 'if', 'else', 'return'
        ];

        const resizeCanvas = () => {
            const dpr = window.devicePixelRatio || 1;
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${window.innerWidth}px`;
            canvas.style.height = `${window.innerHeight}px`;
        };

        const createParticles = () => {
            // Reduce density: divide by 15000 instead of 10000
            const density = 15000;
            const calculatedCount = Math.floor((window.innerWidth * window.innerHeight) / density);
            // Cap at 100 particles max to ensure performance
            const particleCount = Math.min(calculatedCount, 100);

            particles = [];

            for (let i = 0; i < particleCount; i++) {
                particles.push({
                    x: Math.random() * window.innerWidth,
                    y: Math.random() * window.innerHeight,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 14 + 10,
                    symbol: symbols[Math.floor(Math.random() * symbols.length)],
                    opacity: Math.random() * 0.5 + 0.2
                });
            }
        };

        const draw = () => {
            if (!ctx || !canvas) return;
            ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            particles.forEach((p, i) => {
                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Very low friction so they keep moving
                p.vx *= 0.995;
                p.vy *= 0.995;

                // Boost speed if too slow to ensure constant movement
                if (Math.abs(p.vx) < 0.2) p.vx += (Math.random() - 0.5) * 0.02;
                if (Math.abs(p.vy) < 0.2) p.vy += (Math.random() - 0.5) * 0.02;

                // Mouse interaction
                const dx = mouseRef.current.x - p.x;
                const dy = mouseRef.current.y - p.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                const maxDist = 400;

                if (distance < maxDist) {
                    const force = (maxDist - distance) / maxDist;
                    const angle = Math.atan2(dy, dx);

                    // Push away
                    p.vx -= Math.cos(angle) * force * 0.05;
                    p.vy -= Math.sin(angle) * force * 0.05;

                    // Brighten
                    ctx.globalAlpha = Math.min(p.opacity + force * 0.8, 1);
                } else {
                    ctx.globalAlpha = p.opacity;
                }

                // Wrap edges
                if (p.x < -50) p.x = window.innerWidth + 50;
                if (p.x > window.innerWidth + 50) p.x = -50;
                if (p.y < -50) p.y = window.innerHeight + 50;
                if (p.y > window.innerHeight + 50) p.y = -50;

                // Draw Symbol
                ctx.font = `bold ${p.size}px monospace`;
                ctx.fillStyle = '#60A5FA';
                ctx.fillText(p.symbol, p.x, p.y);

                // Draw Connections
                for (let j = i + 1; j < particles.length; j++) {
                    const p2 = particles[j];
                    const dx2 = p.x - p2.x;
                    const dy2 = p.y - p2.y;
                    const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                    if (dist2 < 120) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(96, 165, 250, ${0.2 * (1 - dist2 / 120)})`;
                        ctx.lineWidth = 1;
                        ctx.moveTo(p.x, p.y);
                        ctx.lineTo(p2.x, p2.y);
                        ctx.stroke();
                    }
                }
            });

            animationFrameId = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouseRef.current = {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
            isMouseMoving.current = true;

            if (mouseTimeout.current) clearTimeout(mouseTimeout.current);
            mouseTimeout.current = setTimeout(() => {
                isMouseMoving.current = false;
            }, 100);
        };

        const handleResize = () => {
            resizeCanvas();
            createParticles();
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);

        resizeCanvas();
        createParticles();
        draw();

        return () => {
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            cancelAnimationFrame(animationFrameId);
            if (mouseTimeout.current) clearTimeout(mouseTimeout.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full pointer-events-none z-0"
            style={{ opacity: 0.8 }}
        />
    );
}
