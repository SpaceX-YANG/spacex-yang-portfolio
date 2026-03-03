import React, { useState, useEffect, useRef, useCallback } from 'react';

// --- Global Styles & Fonts ---
const GlobalStyles = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&family=JetBrains+Mono:wght@400;700&display=swap');
    
    :root {
      --bg-dark: #050505;
      --magenta: #DA205A;
    }
    body {
      margin: 0;
      background-color: var(--bg-dark);
      color: white;
      font-family: 'JetBrains Mono', monospace;
      overflow-x: hidden;
      cursor: none; 
    }
    h1, h2, h3, h4, h5, h6, .font-inter {
      font-family: 'Inter', sans-serif;
    }
    
    ::-webkit-scrollbar { width: 0px; background: transparent; }
    
    @keyframes blink { 50% { opacity: 0; } }
    .caret { animation: blink 1s step-end infinite; }
    
    .glow-bg {
      position: absolute;
      width: 100%; height: 100%;
      background: conic-gradient(from 180deg at 50% 50%, rgba(218, 32, 90, 0.1) 0deg, rgba(5, 5, 5, 0) 180deg, rgba(218, 32, 90, 0.1) 360deg);
      filter: blur(80px);
      z-index: -1;
      pointer-events: none;
    }
  `}</style>
);

// --- Custom Hook: Smooth Mouse (Neon Cursor) ---
const useSmoothMouse = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const targetPosition = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      targetPosition.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener('mousemove', handleMouseMove);

    let animationFrameId;
    const render = () => {
      setMousePosition((prev) => ({
        x: prev.x + (targetPosition.current.x - prev.x) * 0.15,
        y: prev.y + (targetPosition.current.y - prev.y) * 0.15,
      }));
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return mousePosition;
};

// --- Component: Magnetic Button ---
const MagneticButton = ({ children, className, onClick }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.3, y: y * 0.3 });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <button
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      style={{ transform: `translate(${position.x}px, ${position.y}px)`, transition: 'transform 0.1s ease-out' }}
      className={`relative px-6 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-md hover:border-[#DA205A]/50 transition-colors ${className}`}
    >
      {children}
    </button>
  );
};

// --- Component: Algorithmic Donut (Native 3D Canvas) ---
const AlgorithmicDonut = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, isHovering: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const particles = [];
    const R = 180; 
    const r = 60;  
    const density = 40;

    for (let i = 0; i < density; i++) {
      for (let j = 0; j < density; j++) {
        const u = (i / density) * Math.PI * 2;
        const v = (j / density) * Math.PI * 2;
        const x = (R + r * Math.cos(v)) * Math.cos(u);
        const y = (R + r * Math.cos(v)) * Math.sin(u);
        const z = r * Math.sin(v);
        particles.push({ ox: x, oy: y, oz: z, x, y, z, vx: 0, vy: 0, vz: 0 });
      }
    }

    let angleX = 0;
    let angleY = 0;
    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      
      const scrollY = window.scrollY;
      const opacity = Math.max(0, 1 - scrollY / 500);
      ctx.fillStyle = `rgba(218, 32, 90, ${opacity * 0.8})`;

      angleX += 0.005;
      angleY += 0.007;

      const cosX = Math.cos(angleX); const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY); const sinY = Math.sin(angleY);

      particles.forEach(p => {
        if (mouseRef.current.isHovering) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            p.vx += (dx / dist) * 2;
            p.vy += (dy / dist) * 2;
          }
        }
        
        p.vx += (p.ox - p.x) * 0.05;
        p.vy += (p.oy - p.y) * 0.05;
        p.vz += (p.oz - p.z) * 0.05;
        p.vx *= 0.85; p.vy *= 0.85; p.vz *= 0.85;
        p.x += p.vx; p.y += p.vy; p.z += p.vz;

        let y1 = p.y * cosX - p.z * sinX;
        let z1 = p.y * sinX + p.z * cosX;
        let x2 = p.x * cosY + z1 * sinY;
        let z2 = -p.x * sinY + z1 * cosY;

        const fov = 600;
        const scale = fov / (fov + z2);
        const screenX = width / 2 + x2 * scale;
        const screenY = height / 2 + y1 * scale;

        const size = Math.max(0.5, 2 * scale);
        ctx.globalAlpha = Math.max(0.1, scale - 0.5) * opacity;
        ctx.beginPath();
        ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e) => {
      mouseRef.current = {
        x: (e.clientX - width / 2) / (600 / 600), 
        y: (e.clientY - height / 2) / (600 / 600),
        isHovering: true
      };
    };
    const handleMouseLeave = () => { mouseRef.current.isHovering = false; };
    
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="absolute inset-0 z-0 touch-none" />;
};

// --- Component: 3D Parallax Project Card ---
const ProjectCard = ({ project, onClick }) => {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  const [spotlight, setSpotlight] = useState({ x: '50%', y: '50%', opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const rotateX = ((y / rect.height) - 0.5) * -15; 
    const rotateY = ((x / rect.width) - 0.5) * 15;
    
    setTransform(`perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`);
    setSpotlight({ x: `${x}px`, y: `${y}px`, opacity: 1 });
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg)');
    setSpotlight({ ...spotlight, opacity: 0 });
  };

  return (
    <div
      ref={cardRef}
      onClick={() => onClick(project)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition: 'transform 0.1s ease-out' }}
      className="relative group cursor-pointer h-80 rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
    >
      <div 
        className="absolute inset-0 z-0 transition-opacity duration-300 pointer-events-none"
        style={{
          opacity: spotlight.opacity,
          background: `radial-gradient(circle 200px at ${spotlight.x} ${spotlight.y}, rgba(218,32,90,0.15), transparent 80%)`
        }}
      />
      
      <div className="relative z-10 p-6 flex flex-col h-full justify-between pointer-events-none">
        <div>
          <h3 className="text-2xl font-inter font-bold text-white group-hover:text-[#DA205A] transition-colors">{project.title}</h3>
          <p className="text-white/50 mt-2 text-sm">{project.desc}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {project.tags.map(tag => (
            <span key={tag} className="text-xs px-2 py-1 bg-white/10 rounded-md backdrop-blur-md border border-white/5">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- Component: Detail Modal ---
const ProjectModal = ({ project, onClose }) => {
  if (!project) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-lg animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl h-full max-h-[90vh] bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(218,32,90,0.1)]">
        
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
          <h2 className="text-3xl font-inter font-bold text-[#DA205A]">{project.title}</h2>
          <MagneticButton onClick={onClose} className="px-4 py-2 text-sm">
            [ X ] CLOSE
          </MagneticButton>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            <div className="md:col-span-1 space-y-6 text-sm text-white/70">
              <div>
                <strong className="block text-white mb-1">Challenge</strong>
                <p>{project.details.challenge}</p>
              </div>
              <div>
                <strong className="block text-white mb-1">Solution</strong>
                <p>{project.details.solution}</p>
              </div>
              <div>
                <strong className="block text-white mb-1">Metrics</strong>
                <ul className="list-disc pl-4 space-y-1">
                  {project.details.metrics.map((metric, i) => (
                    <li key={i}>{metric}</li>
                  ))}
                </ul>
              </div>
            </div>
            
            <div className="md:col-span-2 space-y-8">
              <div className="w-full h-64 bg-gradient-to-br from-white/10 to-transparent rounded-xl border border-white/5 flex items-center justify-center text-white/30">
                [ Lazy Loaded Bazi/Ziwei Chart Vis ]
              </div>
              <div className="w-full h-96 bg-gradient-to-tr from-[#DA205A]/20 to-transparent rounded-xl border border-white/5 flex items-center justify-center text-white/30">
                [ Lazy Loaded System Architecture ]
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const { x, y } = useSmoothMouse();
  const [selectedProject, setSelectedProject] = useState(null);

  const projects = [
    { 
      id: 1, 
      title: 'Bazi Algorithmic Matrix', 
      desc: 'Decoding destiny through Four Pillars data structures.', 
      tags: ['Data Architecture', 'Bazi Logic', 'React'],
      details: {
        challenge: 'Structuring the complex, multi-layered relationships (Stems and Branches, Clashes, Combinations) of traditional Bazi into a computable dataset.',
        solution: 'Developed a custom matrix algorithm to map elemental strengths and calculate life cycles (Da Yun) dynamically.',
        metrics: ['Parsed 100+ years of charts', 'O(1) calculation for daily pillars', 'Dynamic visual mapping']
      }
    },
    { 
      id: 2, 
      title: 'Ziwei Star Mapping HUD', 
      desc: 'Interactive visualization of the 12 Palaces and Major Stars.', 
      tags: ['Ziwei Doushu', 'Canvas', 'Interaction'],
      details: {
        challenge: 'Translating the esoteric 12-palace grid of Ziwei Doushu into an intuitive, modern cybernetic interface.',
        solution: 'Built a glassmorphic HUD that allows users to rotate and zoom into different life sectors (Wealth, Career, Destiny) using Canvas.',
        metrics: ['60fps rotational rendering', 'Real-time star interactions', 'Responsive multi-device layout']
      }
    },
    { 
      id: 3, 
      title: 'Orbital Path Analysis', 
      desc: 'Calculating trajectories for theoretical payload deliveries.', 
      tags: ['Aerospace', 'Math', 'Physics Engine'],
      details: {
        challenge: 'Visualizing complex orbital mechanics and Hohmann transfer orbits without relying on heavy WebGL libraries.',
        solution: 'Implemented pure mathematical projections onto a 2D canvas context, simulating 3D space and gravitational pull.',
        metrics: ['Zero WebGL dependencies', 'Accurate apogee/perigee modeling', '< 50kb bundle size']
      }
    },
    { 
      id: 4, 
      title: 'Destiny Data Pipeline', 
      desc: 'Merging astrological frameworks with predictive career modeling.', 
      tags: ['System Design', 'Logic Gates', 'Psychology'],
      details: {
        challenge: 'Bridging the gap between the deterministic nature of traditional charts and actionable, psychological career planning.',
        solution: 'Created a decision-tree system that weights traits from Bazi/Ziwei to suggest optimal professional environments.',
        metrics: ['Integrated dual-system logic', 'Rejecting pure fatalism', 'Actionable output generation']
      }
    },
  ];

  return (
    <>
      <GlobalStyles />
      
      {/* Neon Cursor */}
      <div 
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[100] mix-blend-screen hidden md:block"
        style={{ 
          transform: `translate(${x - 16}px, ${y - 16}px)`,
          background: 'radial-gradient(circle, rgba(218,32,90,0.8) 0%, rgba(218,32,90,0) 70%)',
          boxShadow: '0 0 20px 5px rgba(218,32,90,0.4)'
        }}
      />

      <div className="glow-bg top-0" />
      
      {/* --- HERO AREA --- */}
      <section className="relative w-full h-screen flex items-center justify-center overflow-hidden">
        <AlgorithmicDonut />
        
        <div className="relative z-10 text-center pointer-events-none mix-blend-difference mt-[-5vh]">
          {/* Replaced PORTFOLIO FOR GUEST with SpaceX—YANG */}
          <h1 className="text-6xl md:text-9xl font-inter font-black tracking-tighter uppercase text-transparent [-webkit-text-stroke:2px_white] leading-none mb-4">
            SpaceX<br/><span className="text-white [-webkit-text-stroke:0px]">YANG</span>
          </h1>
          <p className="mt-8 text-xl text-white/80 uppercase tracking-[0.2em] font-bold">
            Decoding Destiny <span className="text-[#DA205A]">|</span> Engineering the Future<span className="caret">_</span>
          </p>
          <p className="mt-2 text-sm text-white/50 tracking-[0.1em] font-mono">
            Bazi Architecture // Ziwei Systems // Orbital Logic
          </p>
        </div>
        
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce text-white/50 text-sm">
          <span>SCROLL</span>
          <div className="w-[1px] h-8 bg-gradient-to-b from-white/50 to-transparent mt-2" />
        </div>
      </section>

      {/* --- ABOUT AREA --- */}
      <section className="max-w-7xl mx-auto px-6 py-32 grid grid-cols-1 md:grid-cols-3 gap-16 relative">
        <div className="md:col-span-1">
          <div className="sticky top-32 space-y-8">
            <div className="relative w-32 h-32 rounded-full overflow-hidden border-2 border-white/20 group cursor-pointer filter grayscale hover:grayscale-0 transition-all duration-500 shadow-[0_0_30px_rgba(218,32,90,0)] hover:shadow-[0_0_30px_rgba(218,32,90,0.3)] hover:border-[#DA205A]">
              <div className="absolute inset-0 bg-white/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                <span className="text-xs font-bold">UPLOAD</span>
              </div>
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Yang&backgroundColor=050505" alt="Avatar" className="w-full h-full object-cover" />
            </div>
            
            <div>
              <h2 className="text-3xl font-inter font-bold mb-4">DESTINY<br/>ENGINEER.</h2>
              <p className="text-white/60 text-sm leading-relaxed mb-6">
                Bridging the ancient calculation of the cosmos with modern logic frameworks. I approach Bazi and Ziwei not as fatalistic prophecies, but as psychological and environmental datasets to optimize life trajectories and career payloads.
              </p>
              
              <div className="flex flex-wrap gap-2">
                {['Bazi Analysis', 'Ziwei Matrices', 'System Architecture', 'Rational Planning', 'Data Logic'].map(skill => (
                  <span key={skill} className="px-3 py-1 bg-[#DA205A]/10 text-[#DA205A] text-xs border border-[#DA205A]/30 rounded-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 border-l border-white/10 pl-8 space-y-16">
          {[
            { year: 'Phase III - Synthesis', role: 'Architect of Fate', company: 'Self-Directed Research', desc: 'Integrating Bazi elemental interactions with Ziwei star palaces to formulate deep, rational analyses for career and psychological alignment.' },
            { year: 'Phase II - Logistics', role: 'Systems Analyst', company: 'Trajectory Planning', desc: 'Mapping potential life paths (Da Yun) against environmental variables (e.g., location logistics like Shenzhen vs. Nanjing) to maximize output.' },
            { year: 'Phase I - Foundation', role: 'Data Collection', company: 'Astrological Frameworks', desc: 'Deconstructing traditional metaphysical texts into logical rule sets, rejecting fatalism in favor of dynamic probability.' }
          ].map((job, i) => (
            <div key={i} className="relative group">
              <div className="absolute -left-[37px] top-1 w-3 h-3 bg-[#050505] border-2 border-white/30 rounded-full group-hover:border-[#DA205A] group-hover:shadow-[0_0_10px_rgba(218,32,90,0.8)] transition-all" />
              
              <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-xl hover:-translate-y-2 hover:bg-white/10 transition-all duration-300">
                <span className="text-[#DA205A] text-sm font-bold">{job.year}</span>
                <h3 className="text-xl font-inter font-bold text-white mt-1">{job.role}</h3>
                <span className="text-white/50 text-xs block mb-4">{job.company}</span>
                <p className="text-sm text-white/70">{job.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- WORK AREA --- */}
      <section className="max-w-7xl mx-auto px-6 py-32 relative">
        <div className="glow-bg bottom-0 rotate-180" />
        
        <h2 className="text-5xl font-inter font-black mb-16 uppercase tracking-tight">System<br/><span className="text-[#DA205A]">Logs_</span></h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {projects.map(project => (
            <ProjectCard key={project.id} project={project} onClick={setSelectedProject} />
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <MagneticButton onClick={() => alert('Initiating Deep Analysis...')} className="text-lg">
            CALCULATE TRAJECTORY
          </MagneticButton>
        </div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="border-t border-white/10 py-12 text-center text-white/40 text-sm">
        <p>© {new Date().getFullYear()} SPACEX—YANG. LOGIC GATES INITIALIZED.</p>
      </footer>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </>
  );
}