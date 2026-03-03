import React, { useState, useEffect, useRef } from 'react';

// --- Global Styles & Apple-esque Fonts ---
const GlobalStyles = () => (
  <style>{`
    :root {
      --bg-dark: #000000;
      --magenta: #FF2A6D;
      --cyan: #05D9E8;
    }
    body {
      margin: 0;
      background-color: var(--bg-dark);
      color: #f5f5f7;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Helvetica Neue", Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
      cursor: none; 
    }
    .font-mono {
      font-family: 'SF Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    ::-webkit-scrollbar { width: 0px; background: transparent; }
    
    /* Apple Glassmorphism Bento Box Style */
    .bento-card {
      background: rgba(28, 28, 30, 0.4);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 32px;
      transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      overflow: hidden;
      position: relative;
    }
    .bento-card:hover {
      transform: translateY(-5px) scale(1.02);
      border-color: rgba(5, 217, 232, 0.4);
      box-shadow: 0 20px 40px rgba(0,0,0,0.6), inset 0 0 40px rgba(5,217,232,0.05);
    }
    
    /* Subtle Glow text */
    .glow-text {
      text-shadow: 0 0 20px rgba(255, 42, 109, 0.6);
    }
  `}</style>
);

// --- Custom Hook: Smooth Neon Cursor ---
const useSmoothMouse = () => {
  const [mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
  const targetPosition = useRef({ x: -100, y: -100 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      targetPosition.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);
    let animationId;
    const render = () => {
      setMousePosition((prev) => ({
        x: prev.x + (targetPosition.current.x - prev.x) * 0.15,
        y: prev.y + (targetPosition.current.y - prev.y) * 0.15,
      }));
      animationId = requestAnimationFrame(render);
    };
    render();
    return () => { window.removeEventListener('mousemove', handleMouseMove); cancelAnimationFrame(animationId); };
  }, []);
  return mousePosition;
};

// --- Component: Elegant 3D Particle Space ---
const AlgorithmicDonut = () => {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth; let height = window.innerHeight;
    canvas.width = width; canvas.height = height;

    const particles = [];
    const density = 40;
    for (let i = 0; i < density; i++) {
      for (let j = 0; j < density; j++) {
        const u = (i / density) * Math.PI * 2;
        const v = (j / density) * Math.PI * 2;
        const x = (250 + 80 * Math.cos(v)) * Math.cos(u);
        const y = (250 + 80 * Math.cos(v)) * Math.sin(u);
        const z = 80 * Math.sin(v);
        particles.push({ x, y, z });
      }
    }

    let angleX = 0; let angleY = 0;
    let animationId;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angleX += 0.0015; angleY += 0.002;
      const cosX = Math.cos(angleX); const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY); const sinY = Math.sin(angleY);

      particles.forEach(p => {
        let y1 = p.y * cosX - p.z * sinX;
        let z1 = p.y * sinX + p.z * cosX;
        let x2 = p.x * cosY + z1 * sinY;
        let z2 = -p.x * sinY + z1 * cosY;

        const scale = 800 / (800 + z2);
        const screenX = width / 2 + x2 * scale;
        const screenY = height / 2 + y1 * scale;

        ctx.globalAlpha = Math.max(0.05, (scale - 0.5) * 0.4);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(screenX, screenY, Math.max(0.5, 1.5 * scale), 0, Math.PI * 2);
        ctx.fill();
      });
      animationId = requestAnimationFrame(render);
    };
    render();

    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); cancelAnimationFrame(animationId); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-40" />;
};

// --- Component: Bento Theory Card ---
const TheoryCard = ({ id, title, subtitle, desc, isLarge, colorClass }) => (
  <div className={`bento-card p-8 md:p-10 flex flex-col justify-between group ${isLarge ? 'md:col-span-2 md:row-span-2' : 'col-span-1'}`}>
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${colorClass} rounded-bl-full opacity-10 group-hover:opacity-30 transition-opacity blur-2xl`}></div>
    
    <div>
      <div className="flex justify-between items-start mb-6">
        <span className="font-mono text-sm text-white/30 font-bold tracking-widest uppercase">SYS_LOG {id}</span>
        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/30 group-hover:text-[#05D9E8] group-hover:border-[#05D9E8]/50 transition-colors">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      </div>
      
      <h2 className={`font-bold tracking-tight mb-2 ${isLarge ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl'}`}>{title}</h2>
      <h3 className="text-[#05D9E8] font-mono text-sm md:text-base tracking-wider uppercase mb-6 opacity-80">{subtitle}</h3>
    </div>
    
    <p className={`text-white/60 leading-relaxed ${isLarge ? 'text-lg max-w-xl' : 'text-sm'}`}>
      {desc}
    </p>
  </div>
);

// --- Main App Component ---
export default function App() {
  const { x, y } = useSmoothMouse();

  const theories = [
    {
      id: "01",
      title: "五行理论",
      subtitle: "Wu Xing State Machine",
      desc: "The fundamental state machine of the cosmos. It dictates the Generation (生) and Overcoming (克) protocols governing energy transformation.",
      isLarge: true,
      colorClass: "from-[#FF2A6D] to-transparent"
    },
    {
      id: "02",
      title: "十天干理论",
      subtitle: "10 Heavenly Vectors",
      desc: "Ten spatial vectors representing the surface-level logic and explicit manifestations of cosmic energy in real-time.",
      isLarge: false,
      colorClass: "from-[#05D9E8] to-transparent"
    },
    {
      id: "03",
      title: "十二地支",
      subtitle: "12 Earthly Matrices",
      desc: "Chronobiological matrices tracking Earth's rotational phases. They store hidden elemental data (Hidden Stems) within complex temporal arrays.",
      isLarge: false,
      colorClass: "from-[#FF2A6D] to-transparent"
    },
    {
      id: "04",
      title: "十神理论",
      subtitle: "Ten Gods Relational Dynamics",
      desc: "Socio-psychological variables that calculate human interaction models, determining algorithms for Wealth, Power, Output, and Resources.",
      isLarge: false,
      colorClass: "from-[#05D9E8] to-transparent"
    },
    {
      id: "05",
      title: "刑冲会合",
      subtitle: "Collision & Combine Protocols",
      desc: "Strict rulesets dictating how elemental objects conflict (Clash), merge (Combine), or penalize each other within the destiny matrix.",
      isLarge: false,
      colorClass: "from-[#FF2A6D] to-transparent"
    },
    {
      id: "06",
      title: "八字格局",
      subtitle: "Architectural Archetypes",
      desc: "Top-level design patterns used to classify human destiny frameworks. It evaluates the structural integrity and operational mode of a life path.",
      isLarge: true,
      colorClass: "from-[#05D9E8] to-transparent"
    }
  ];

  return (
    <>
      <GlobalStyles />
      
      {/* Neon Cursor */}
      <div className="fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none z-[100] mix-blend-screen hidden md:block"
        style={{ transform: `translate(${x - 12}px, ${y - 12}px)`, background: 'radial-gradient(circle, #05D9E8 0%, transparent 80%)', boxShadow: '0 0 15px 2px rgba(5,217,232,0.4)' }}
      />

      <AlgorithmicDonut />

      {/* Dynamic Glow Background */}
      <div className="fixed inset-0 flex justify-center items-center pointer-events-none z-0">
        <div className="w-[100vw] h-[50vh] bg-gradient-to-b from-[#FF2A6D]/10 to-transparent absolute top-0 blur-[100px] mix-blend-screen"></div>
      </div>

      <main className="relative min-h-screen z-10 px-6 py-20 md:px-16 lg:px-24">
        
        {/* Header Area */}
        <header className="max-w-7xl mx-auto mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-block px-4 py-1.5 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-xs font-mono tracking-widest text-[#05D9E8] mb-6">
            KNOWLEDGE BASE // V 2.0
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.05] mb-6">
            Metaphysics,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A6D] to-[#05D9E8]">Deconstructed.</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/50 font-light max-w-2xl leading-relaxed">
            Translating ancient Chinese metaphysical theorems into modern computational architecture. A logical repository by SpaceX-YANG.
          </p>
        </header>

        {/* Bento Grid Area */}
        <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
          {theories.map((theory, index) => (
            <TheoryCard key={index} {...theory} />
          ))}
        </section>

        {/* Footer Area */}
        <footer className="max-w-7xl mx-auto mt-24 border-t border-white/10 pt-8 pb-12 flex flex-col md:flex-row justify-between items-center text-sm text-white/30 font-mono">
          <p>© {new Date().getFullYear()} SPACEX-YANG AI ENGINE.</p>
          <p className="mt-4 md:mt-0 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#05D9E8] animate-pulse"></span>
            SYSTEM ONLINE
          </p>
        </footer>

      </main>
    </>
  );
}