import React, { useState, useEffect, useRef } from 'react';

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
    
    ::-webkit-scrollbar { width: 4px; background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(218, 32, 90, 0.5); border-radius: 4px; }
    
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

    .glass-panel {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
    }
  `}</style>
);

// --- Custom Hook: Smooth Mouse (Neon Cursor) ---
const useSmoothMouse = () => {
  const[mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
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
  },[]);

  return mousePosition;
};

// --- Component: Magnetic Button ---
const MagneticButton = ({ children, className, onClick, type = "button", disabled = false }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    if (disabled) return;
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
      type={type}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={onClick}
      disabled={disabled}
      style={{ transform: `translate(${position.x}px, ${position.y}px)`, transition: 'transform 0.1s ease-out' }}
      className={`relative px-6 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-md hover:border-[#DA205A]/50 transition-colors disabled:opacity-50 ${className}`}
    >
      {children}
    </button>
  );
};

// --- Component: Algorithmic Donut (Background Native 3D Canvas) ---
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

    const particles =[];
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

      angleX += 0.003;
      angleY += 0.004;

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
  },[]);

  return <canvas ref={canvasRef} className="fixed inset-0 z-0 touch-none pointer-events-none" />;
};

// --- Component: Input Field ---
const InputField = ({ label, type = "text", value, onChange, placeholder, options }) => (
  <div className="flex flex-col space-y-2 mb-4 relative z-20">
    <label className="text-xs text-white/60 tracking-widest uppercase font-bold">{label}</label>
    {type === "select" ? (
      <select 
        value={value} 
        onChange={onChange}
        className="bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#DA205A] transition-colors appearance-none cursor-none"
      >
        {options.map((opt) => <option key={opt.value} value={opt.value} className="bg-black text-white">{opt.label}</option>)}
      </select>
    ) : (
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="bg-black/40 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#DA205A] transition-colors placeholder:text-white/20 cursor-none"
        required
      />
    )}
  </div>
);

// --- Component: AI Loading / Calculating State ---
const AnalyzingState = () => {
  const [text, setText] = useState('');
  const logs =[
    "Initializing BaZi Engine...",
    "Parsing Heavenly Stems and Earthly Branches...",
    "Calculating Day Master strength...",
    "Querying Ziwei Doushu Palaces...",
    "Aligning 10-Year Da Yun logic gates...",
    "Generating AI destiny matrix...",
    "Finalizing predictions..."
  ];

  useEffect(() => {
    let currentLog = 0;
    const interval = setInterval(() => {
      setText(logs[currentLog]);
      currentLog++;
      if (currentLog >= logs.length) clearInterval(interval);
    }, 600);
    return () => clearInterval(interval);
  },[]);

  return (
    <div className="flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500 relative z-20">
      <div className="relative w-32 h-32 flex items-center justify-center">
        <div className="absolute inset-0 border-t-2 border-b-2 border-[#DA205A] rounded-full animate-spin"></div>
        <div className="absolute inset-4 border-l-2 border-r-2 border-white/30 rounded-full animate-spin reverse-spin"></div>
        <div className="text-[#DA205A] text-2xl font-bold font-inter animate-pulse">AI</div>
      </div>
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold font-inter">Quantum Divination in Progress</h3>
        <p className="text-[#DA205A] font-mono text-sm h-6">{text}<span className="caret">_</span></p>
      </div>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const { x, y } = useSmoothMouse();
  
  // App States: 'INPUT', 'ANALYZING', 'RESULT'
  const [appState, setAppState] = useState('INPUT');
  const[formData, setFormData] = useState({
    name: '',
    gender: 'Male',
    birthDate: '',
    birthTime: '12:00'
  });

  const timeOptions =[
    { label: "子时 (23:00-00:59)", value: "Zi" },
    { label: "丑时 (01:00-02:59)", value: "Chou" },
    { label: "寅时 (03:00-04:59)", value: "Yin" },
    { label: "卯时 (05:00-06:59)", value: "Mao" },
    { label: "辰时 (07:00-08:59)", value: "Chen" },
    { label: "巳时 (09:00-10:59)", value: "Si" },
    { label: "午时 (11:00-12:59)", value: "Wu" },
    { label: "未时 (13:00-14:59)", value: "Wei" },
    { label: "申时 (15:00-16:59)", value: "Shen" },
    { label: "酉时 (17:00-18:59)", value: "You" },
    { label: "戌时 (19:00-20:59)", value: "Xu" },
    { label: "亥时 (21:00-22:59)", value: "Hai" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if(!formData.name || !formData.birthDate) return;
    
    setAppState('ANALYZING');
    // Simulate API Call / Deep Calculation
    setTimeout(() => {
      setAppState('RESULT');
    }, 4500);
  };

  const handleReset = () => {
    setFormData({ name: '', gender: 'Male', birthDate: '', birthTime: '12:00' });
    setAppState('INPUT');
  };

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
      <AlgorithmicDonut />

      <main className="relative min-h-screen flex flex-col items-center justify-center px-4 py-20 z-10">
        
        {/* Header / Logo */}
        <div className="absolute top-8 left-8">
          <h1 className="text-2xl font-inter font-black tracking-tighter uppercase text-white">
            SpaceX<span className="text-[#DA205A]">YANG</span> AI
          </h1>
        </div>

        {/* State: INPUT FORM */}
        {appState === 'INPUT' && (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-12 items-center animate-in fade-in zoom-in-95 duration-500">
            {/* Left: Hero Copy */}
            <div className="text-left space-y-6 pointer-events-none">
              <h1 className="text-5xl md:text-7xl font-inter font-black tracking-tighter uppercase leading-tight">
                Decode Your<br/>
                <span className="text-transparent[-webkit-text-stroke:1px_#DA205A]">Destiny</span> Code
              </h1>
              <p className="text-white/60 text-lg leading-relaxed font-inter">
                Combining traditional BaZi matrix algorithms with cutting-edge AI logic models. Input your genesis parameters to initialize your personal fate architecture.
              </p>
            </div>

            {/* Right: Input Form */}
            <form onSubmit={handleSubmit} className="glass-panel p-8 relative z-20 shadow-[0_0_50px_rgba(218,32,90,0.05)]">
              <h2 className="text-2xl font-bold font-inter mb-6 text-white border-b border-white/10 pb-4">Initialize Parameters</h2>
              
              <InputField 
                label="Identity / Name" 
                placeholder="Enter your name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
              />
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col space-y-2 mb-4">
                  <label className="text-xs text-white/60 tracking-widest uppercase font-bold">Gender</label>
                  <div className="flex bg-black/40 border border-white/10 rounded-lg overflow-hidden">
                    {['Male', 'Female'].map(g => (
                      <button
                        key={g} type="button"
                        onClick={() => setFormData({...formData, gender: g})}
                        className={`flex-1 py-3 text-sm font-bold transition-colors cursor-none ${formData.gender === g ? 'bg-[#DA205A] text-white' : 'text-white/40 hover:text-white/80'}`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </div>

                <InputField 
                  label="Birth Date" 
                  type="date" 
                  value={formData.birthDate} 
                  onChange={(e) => setFormData({...formData, birthDate: e.target.value})} 
                />
              </div>

              <InputField 
                label="Birth Time (Hour)" 
                type="select" 
                options={timeOptions}
                value={formData.birthTime} 
                onChange={(e) => setFormData({...formData, birthTime: e.target.value})} 
              />

              <MagneticButton type="submit" className="w-full mt-6 flex justify-center py-4 bg-white/10 text-lg font-bold">
                GENERATE AI REPORT
              </MagneticButton>
            </form>
          </div>
        )}

        {/* State: ANALYZING */}
        {appState === 'ANALYZING' && (
           <AnalyzingState />
        )}

        {/* State: RESULT DASHBOARD */}
        {appState === 'RESULT' && (
          <div className="w-full max-w-6xl animate-in slide-in-from-bottom-10 fade-in duration-700 relative z-20">
            <div className="flex justify-between items-end mb-8 border-b border-white/10 pb-4">
              <div>
                <h2 className="text-4xl font-inter font-black uppercase text-white">System Output</h2>
                <p className="text-[#DA205A] text-sm mt-1 tracking-widest">SUBJECT: {formData.name.toUpperCase()} // GENDER: {formData.gender.toUpperCase()}</p>
              </div>
              <MagneticButton onClick={handleReset} className="text-xs px-4 py-2 border-[#DA205A]/30 text-[#DA205A]">
                [ RECALCULATE ]
              </MagneticButton>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Pillar Matrix (BaZi) */}
              <div className="lg:col-span-1 glass-panel p-6 space-y-6">
                <h3 className="text-sm text-white/50 tracking-[0.2em] font-bold uppercase mb-4">Four Pillars Matrix</h3>
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div className="space-y-2">
                    <div className="text-xs text-white/40">Year</div>
                    <div className="text-xl font-bold text-white border border-white/10 bg-black/50 py-3 rounded">癸</div>
                    <div className="text-xl font-bold text-white border border-white/10 bg-black/50 py-3 rounded">卯</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-white/40">Month</div>
                    <div className="text-xl font-bold text-white border border-white/10 bg-black/50 py-3 rounded">甲</div>
                    <div className="text-xl font-bold text-white border border-white/10 bg-black/50 py-3 rounded">寅</div>
                  </div>
                  <div className="space-y-2 relative">
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] text-[#DA205A] whitespace-nowrap">Day Master</div>
                    <div className="text-xs text-white/40">Day</div>
                    <div className="text-xl font-bold text-[#DA205A] border border-[#DA205A]/50 bg-[#DA205A]/10 py-3 rounded shadow-[0_0_15px_rgba(218,32,90,0.2)]">丁</div>
                    <div className="text-xl font-bold text-white border border-white/10 bg-black/50 py-3 rounded">亥</div>
                  </div>
                  <div className="space-y-2">
                    <div className="text-xs text-white/40">Hour</div>
                    <div className="text-xl font-bold text-white border border-white/10 bg-black/50 py-3 rounded">庚</div>
                    <div className="text-xl font-bold text-white border border-white/10 bg-black/50 py-3 rounded">子</div>
                  </div>
                </div>

                <div className="pt-6 border-t border-white/10">
                   <h3 className="text-sm text-white/50 tracking-[0.2em] font-bold uppercase mb-3">Elemental Balance</h3>
                   <div className="space-y-3 text-xs font-mono">
                     <div className="flex justify-between items-center"><span className="text-red-400">Fire (Fire)</span> <div className="flex-1 h-1 bg-white/10 mx-3 rounded"><div className="w-[80%] h-full bg-red-400 rounded"></div></div> <span>80%</span></div>
                     <div className="flex justify-between items-center"><span className="text-green-400">Wood (Wood)</span> <div className="flex-1 h-1 bg-white/10 mx-3 rounded"><div className="w-[60%] h-full bg-green-400 rounded"></div></div> <span>60%</span></div>
                     <div className="flex justify-between items-center"><span className="text-blue-400">Water (Water)</span> <div className="flex-1 h-1 bg-white/10 mx-3 rounded"><div className="w-[40%] h-full bg-blue-400 rounded"></div></div> <span>40%</span></div>
                     <div className="flex justify-between items-center"><span className="text-yellow-400">Earth (Earth)</span> <div className="flex-1 h-1 bg-white/10 mx-3 rounded"><div className="w-[20%] h-full bg-yellow-400 rounded"></div></div> <span>20%</span></div>
                     <div className="flex justify-between items-center"><span className="text-gray-400">Metal (Metal)</span> <div className="flex-1 h-1 bg-white/10 mx-3 rounded"><div className="w-[10%] h-full bg-gray-400 rounded"></div></div> <span>10%</span></div>
                   </div>
                </div>
              </div>

              {/* AI Report Texts */}
              <div className="lg:col-span-2 space-y-6">
                
                <div className="glass-panel p-8 relative overflow-hidden group">
                  <div className="absolute top-0 left-0 w-1 h-full bg-[#DA205A]"></div>
                  <h3 className="text-xl font-inter font-bold text-white mb-3">Core Identity & Personality</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Based on your "Ding Fire" (丁火) Day Master, you possess the nature of a flickering candle or starlight—illuminating, insightful, and highly adaptable. Unlike a raging forest fire, your intellect is precise and focused. The strong presence of Wood in your chart acts as fuel, granting you a profound capacity for continuous learning and extreme resilience. However, you must guard against intellectual burnout.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="glass-panel p-6">
                    <h3 className="text-lg font-inter font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-[#DA205A]">↳</span> Wealth & Career
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Metal represents your wealth element. While currently sparse in the base chart, your upcoming Da Yun (10-year luck pillars) indicates a surge in Metal energy starting 2027. Roles involving bridging technology with human interaction (like PM or FAE) align perfectly with your chart's need to "illuminate" complex logic for others.
                    </p>
                  </div>

                  <div className="glass-panel p-6">
                    <h3 className="text-lg font-inter font-bold text-white mb-3 flex items-center gap-2">
                      <span className="text-[#DA205A]">↳</span> Relationships & Network
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      Water elements signify authority and discipline in your chart. You naturally attract mentors who are older or hold structured positions. In partnerships, you seek someone who can provide grounding Earth energy to stabilize your rapid, fire-driven thought processes.
                    </p>
                  </div>
                </div>
                
                <div className="text-center pt-4">
                  <span className="text-xs text-white/30 font-mono">* AI generated analysis based on traditional Bazi algorithms. For entertainment and psychological guidance.</span>
                </div>
              </div>

            </div>
          </div>
        )}
      </main>
    </>
  );
}