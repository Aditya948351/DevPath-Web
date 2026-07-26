'use client';
const DEVPATH_API =
  process.env.NEXT_PUBLIC_DEVPATH_API_URL ?? 'https://api.devpath.in';
import { useEffect, useRef } from 'react';
import { useUIStore } from '@/stores/ui-store';

// Code snippets that type across the screen — dev/community themed
const CODE_LINES = [
  // Git
  'git commit -m "built something great"',
  'git push origin main',
  'git checkout -b feature/new-idea',
  'git merge --no-ff dev',
  'git rebase -i HEAD~3',
  'git stash pop',
  'git log --oneline --graph',
  'git pull upstream main',

  // JavaScript / TypeScript
  'const dev = new DevPath();',
  'import { ambition } from "devpath";',
  'export default BetterDeveloper;',
  'type Developer = Community & Code;',
  'const skills = [...learning, ...building];',
  'await openSource.push(yourIdea);',
  'if (curious) { keep.going(); }',
  'while (alive) { learn(); }',
  'console.log("you belong here");',
  'Promise.all([effort, peers]).then(grow);',
  'const [skills, setSkills] = useState([]);',
  'useEffect(() => { joinCommunity(); }, []);',
  'arr.filter(dev => dev.isActive).map(grow);',
  'Object.keys(ideas).forEach(build);',
  'async function contribute() {',
  '  const pr = await fork(repo);',
  '  return pr.merge();',
  '}',

  // Python
  'def grow(developer):',
  '    return developer.learn() + collaborate()',
  'import community as c',
  'skills = [learn() for day in career]',
  'with open("future.py") as f:',
  '    f.write(your_code)',
  'print("keep building")',
  'class Developer(Community):',
  '    def __init__(self): self.grow()',
  'if __name__ == "__main__": start()',

  // Terminal / shell
  'npm run contribute',
  'npm install ambition confidence',
  'yarn add mentorship',
  'npx create-next-app my-idea',
  'pip install knowledge',
  'docker build -t devpath .',
  'kubectl apply -f community.yaml',
  `curl -X POST ${DEVPATH_API}/join`,
  'chmod +x ./your_potential.sh',
  './launch_career.sh --mode=open-source',

  // HTML / CSS
  '<div class="developer growing">',
  '<component :is="YourIdea" />',
  'display: flex; gap: ambitious;',
  '@keyframes grow { to { level: max } }',
  'grid-template: "learn build ship" / 1fr;',

  // Comments
  '// 500+ developers and counting',
  '// TODO: ship something today',
  '/* built with community */',
  '# open source changes everything',
  '// never stop shipping',
  '/* you belong in tech */',
  '// debug, deploy, repeat',
  '# the best time to start was yesterday',

  // Misc dev
  'O(1) lookup, O(n) friendships',
  'SELECT * FROM opportunities;',
  'JOIN community ON passion = tech;',
  'fn main() { devpath::join(); }',
  'go func() { contribute() }()',
  'std::cout << "keep going" << endl;',
];

// Logo path: small DevPath "D" approximated as arc + vertical bar using canvas
function drawSpinningLogo(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  angle: number,
  color: string,
  alpha: number
) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.translate(cx, cy);
  ctx.rotate(angle);

  // Outer spinning ring
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 8]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Inner "D" letterform
  const s = radius * 0.55;
  ctx.beginPath();
  ctx.moveTo(-s * 0.35, -s);
  ctx.lineTo(-s * 0.35, s);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.beginPath();
  ctx.moveTo(-s * 0.35, -s);
  ctx.bezierCurveTo(s * 1.1, -s, s * 1.1, s, -s * 0.35, s);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Small dot on ring (like an orbit indicator)
  ctx.beginPath();
  ctx.arc(radius, 0, 3, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  ctx.restore();
}

interface TypeLine {
  text: string;
  x: number;
  y: number;
  charIndex: number;
  opacity: number;
  speed: number;
  fadeOut: boolean;
  size: number;
}

export default function InteractiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resolvedTheme = useUIStore((state) => state.resolvedTheme);
  const themeRef = useRef(resolvedTheme);

  useEffect(() => {
    themeRef.current = resolvedTheme;
  }, [resolvedTheme]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lines: TypeLine[] = [];
    const logoAngle = 0;
    let frame = 0;

    // Logo instances — scattered, slow spin, very subtle
    const logos = [
      { cx: 0.06, cy: 0.15, radius: 28, speed: 0.004 },
      { cx: 0.18, cy: 0.55, radius: 22, speed: -0.003 },
      { cx: 0.08, cy: 0.85, radius: 18, speed: 0.005 },
      { cx: 0.92, cy: 0.2, radius: 24, speed: -0.004 },
      { cx: 0.82, cy: 0.6, radius: 20, speed: 0.003 },
      { cx: 0.94, cy: 0.88, radius: 16, speed: -0.005 },
    ];
    const logoAngles = logos.map((l) => Math.random() * Math.PI * 2);

    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      ctx.scale(dpr, dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    };

    const spawnLine = () => {
      const isMobile = window.innerWidth < 768;
      const size = isMobile ? Math.random() * 8 + 9 : Math.random() * 9 + 10;

      const side = Math.random() < 0.5 ? 'left' : 'right';

      // Left strip: 0% to 22% of screen width
      // Right strip: 72% to 94% of screen width
      // This clears the entire centre where hero content sits
      let x: number;
      if (side === 'left') {
        x = Math.random() * window.innerWidth * 0.22;
      } else {
        x =
          window.innerWidth * 0.72 + Math.random() * (window.innerWidth * 0.22);
      }

      // Also avoid the vertical middle band on mobile where content stacks taller
      const y = isMobile
        ? Math.random() * window.innerHeight * 0.35 +
          (Math.random() < 0.5 ? 0 : window.innerHeight * 0.65)
        : Math.random() * window.innerHeight;

      lines.push({
        text: CODE_LINES[Math.floor(Math.random() * CODE_LINES.length)],
        x,
        y,
        charIndex: 0,
        opacity: 0,
        speed: Math.random() * 0.6 + 0.3,
        fadeOut: false,
        size,
      });
    };

    // Seed initial lines staggered
    for (let i = 0; i < 14; i++) spawnLine();

    let charAccumulator: number[] = [];

    const draw = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const isDark = themeRef.current === 'dark';
      const codeColor = isDark
        ? 'rgba(0, 212, 255, 1)' // cyan in dark
        : 'rgba(14, 116, 144, 1)'; // teal-700 in light
      const logoColor = isDark
        ? 'rgba(0, 212, 255, 1)'
        : 'rgba(14, 165, 233, 1)'; // sky-500 in light

      frame++;

      // Spawn a new line every ~120 frames
      if (frame % 90 === 0 && lines.length < 22) spawnLine();
      // Draw code lines
      lines.forEach((line, idx) => {
        if (charAccumulator[idx] === undefined) charAccumulator[idx] = 0;

        // Fade in
        if (!line.fadeOut && line.opacity < 0.55)
          line.opacity = Math.min(line.opacity + 0.015, 0.55);

        // Advance characters
        charAccumulator[idx] += line.speed;
        if (charAccumulator[idx] >= 1) {
          const steps = Math.floor(charAccumulator[idx]);
          line.charIndex = Math.min(line.charIndex + steps, line.text.length);
          charAccumulator[idx] -= steps;
        }

        // Once fully typed, wait then fade out
        if (line.charIndex >= line.text.length) {
          if (!line.fadeOut) {
            // hold for ~2 seconds then start fading
            if (!('holdTimer' in line)) (line as any).holdTimer = frame;
            if (frame - (line as any).holdTimer > 120) line.fadeOut = true;
          }
        }

        if (line.fadeOut) {
          line.opacity = Math.max(line.opacity - 0.008, 0);
        }

        if (line.opacity <= 0 && line.fadeOut) return; // skip draw, will be removed below

        ctx.save();
        ctx.globalAlpha = line.opacity;
        ctx.font = `${line.size}px "Fira Code", "Cascadia Code", monospace`;
        ctx.fillStyle = codeColor;
        ctx.fillText(line.text.slice(0, line.charIndex), line.x, line.y);
        // Blinking cursor
        if (!line.fadeOut && line.charIndex < line.text.length) {
          const measured = ctx.measureText(line.text.slice(0, line.charIndex));
          ctx.fillStyle = codeColor;
          ctx.globalAlpha = Math.sin(frame * 0.15) > 0 ? line.opacity : 0;
          ctx.fillText('|', line.x + measured.width + 1, line.y);
        }
        ctx.restore();
      });

      // Remove dead lines and reseed
      const before = lines.length;
      lines = lines.filter((l) => !(l.fadeOut && l.opacity <= 0));
      charAccumulator = charAccumulator.slice(0, lines.length);
      if (lines.length < before) {
        // Replace removed lines
        for (let i = lines.length; i < before; i++) spawnLine();
      }

      // Draw spinning logos
      logos.forEach((logo, i) => {
        logoAngles[i] += logo.speed;
        const cx = logo.cx * window.innerWidth;
        const cy = logo.cy * window.innerHeight;
        drawSpinningLogo(
          ctx,
          cx,
          cy,
          logo.radius,
          logoAngles[i],
          logoColor,
          isDark ? 0.18 : 0.14
        );
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      resizeCanvas();
    };

    window.addEventListener('resize', handleResize);
    resizeCanvas();
    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ opacity: 1 }}
    />
  );
}
