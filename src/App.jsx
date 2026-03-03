import React, { useState, useEffect, useRef } from 'react';

// --- Global Styles & Apple-esque Fonts ---
const GlobalStyles = () => (
  <style>{`
    :root {
      --bg-dark: #000000;
      --apple-gray: #1d1d1f;
      --magenta: #FF2A6D;
      --cyan: #05D9E8;
    }
    body {
      margin: 0;
      background-color: var(--bg-dark);
      color: #f5f5f7;
      /* Apple Official Font Stack */
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      overflow-x: hidden;
      cursor: none; 
    }
    .font-mono {
      font-family: 'SF Mono', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    }
    
    ::-webkit-scrollbar { width: 0px; background: transparent; }
    
    @keyframes blink { 50% { opacity: 0; } }
    .caret { animation: blink 1s step-end infinite; }
    
    /* Apple Glassmorphism Widget Style */
    .apple-glass {
      background: rgba(28, 28, 30, 0.4);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-radius: 24px;
      box-shadow: 0 10px 40px rgba(0,0,0,0.5);
    }

    /* Siri/Apple Intelligence Glow Effect */
    .ai-glow {
      position: absolute;
      width: 300px; height: 300px;
      background: radial-gradient(circle, rgba(255,42,109,0.4) 0%, rgba(5,217,232,0.2) 40%, rgba(0,0,0,0) 70%);
      filter: blur(40px);
      animation: breathe 4s infinite ease-in-out alternate;
      z-index: 0;
      pointer-events: none;
    }
    @keyframes breathe {
      0% { transform: scale(1); opacity: 0.6; }
      100% { transform: scale(1.3); opacity: 1; }
    }
  `}</style>
);

// --- Custom Hook: Smooth Neon Cursor ---
const useSmoothMouse = () => {
  const [mousePosition, setMousePosition] = useState({ x: window.innerWidth/2, y: window.innerHeight/2 });
  const targetPosition = useRef({ x: window.innerWidth/2, y: window.innerHeight/2 });

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

// --- Component: Apple Magnetic Button ---
const MagneticButton = ({ children, className, onClick, type = "button" }) => {
  const ref = useRef(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const { clientX, clientY } = e;
    const { width, height, left, top } = ref.current.getBoundingClientRect();
    const x = clientX - (left + width / 2);
    const y = clientY - (top + height / 2);
    setPosition({ x: x * 0.2, y: y * 0.2 });
  };

  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });

  return (
    <button
      type={type} ref={ref}
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={onClick}
      style={{ transform: `translate(${position.x}px, ${position.y}px)`, transition: 'transform 0.15s ease-out' }}
      className={`relative px-8 py-4 rounded-full border border-white/10 bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all text-sm font-semibold tracking-wide uppercase shadow-lg ${className}`}
    >
      {children}
    </button>
  );
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
    const density = 45;
    for (let i = 0; i < density; i++) {
      for (let j = 0; j < density; j++) {
        const u = (i / density) * Math.PI * 2;
        const v = (j / density) * Math.PI * 2;
        const x = (220 + 80 * Math.cos(v)) * Math.cos(u);
        const y = (220 + 80 * Math.cos(v)) * Math.sin(u);
        const z = 80 * Math.sin(v);
        particles.push({ x, y, z });
      }
    }

    let angleX = 0; let angleY = 0;
    let animationId;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      angleX += 0.002; angleY += 0.003;
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

        ctx.globalAlpha = Math.max(0.05, (scale - 0.5) * 0.5);
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(screenX, screenY, Math.max(0.5, 1.5 * scale), 0, Math.PI * 2);
        ctx.fill();
      });
      animationId = requestAnimationFrame(render);
    };
    render();

    const handleResize = () => {
      canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);
    return () => { window.removeEventListener('resize', handleResize); cancelAnimationFrame(animationId); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-60" />;
};

// --- Component: Apple Style Input ---
const AppleInput = ({ label, type = "text", value, onChange, placeholder, options }) => (
  <div className="flex flex-col mb-6 relative group">
    <label className="text-[11px] font-semibold text-white/50 tracking-widest uppercase mb-2 pl-1 transition-colors group-focus-within:text-[#05D9E8]">
      {label}
    </label>
    {type === "select" ? (
      <select value={value} onChange={onChange} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-[#05D9E8]/50 focus:bg-white/10 transition-all appearance-none cursor-none backdrop-blur-md">
        {options.map((opt) => <option key={opt.value} value={opt.value} className="bg-[#1c1c1e] text-white">{opt.label}</option>)}
      </select>
    ) : (
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} required
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-lg focus:outline-none focus:border-[#05D9E8]/50 focus:bg-white/10 transition-all placeholder:text-white/20 cursor-none backdrop-blur-md"
      />
    )}
  </div>
);

// --- Helper: Dynamic Bazi Hash Generator ---
const generateBazi = (name, dateStr) => {
  // Easter Egg: Your exact birthdate!
  if (dateStr === '2002-12-19') {
    return {
      pillars: [
        { name: 'Year', stem: '壬', branch: '午', color: '#4A90E2' },
        { name: 'Month', stem: '壬', branch: '子', color: '#4A90E2' },
        { name: 'Day', stem: '辛', branch: '未', color: '#F8E71C', isDayMaster: true },
        { name: 'Hour', stem: '癸', branch: '巳', color: '#4A90E2' }
      ],
      dayMaster: '辛金 (Xin Metal)'
    };
  }

  // Pseudo-random generation based on input string for other users
  const stems = ['甲','乙','丙','丁','戊','己','庚','辛','壬','癸'];
  const branches = ['子','丑','寅','卯','辰','巳','午','未','申','酉','戌','亥'];
  const colors = ['#50E3C2', '#FF2A6D', '#F8E71C', '#E6E6E6', '#4A90E2']; // Wood, Fire, Earth, Metal, Water

  let hash = 0;
  const str = name + dateStr;
  for (let i = 0; i < str.length; i++) { hash = str.charCodeAt(i) + ((hash << 5) - hash); }
  hash = Math.abs(hash);

  return {
    pillars: [
      { name: 'Year', stem: stems[hash % 10], branch: branches[hash % 12], color: colors[hash % 5] },
      { name: 'Month', stem: stems[(hash+1) % 10], branch: branches[(hash+1) % 12], color: colors[(hash+1) % 5] },
      { name: 'Day', stem: stems[(hash+2) % 10], branch: branches[(hash+2) % 12], color: colors[(hash+2) % 5], isDayMaster: true },
      { name: 'Hour', stem: stems[(hash+3) % 10], branch: branches[(hash+3) % 12], color: colors[(hash+3) % 5] }
    ],
    dayMaster: `${stems[(hash+2) % 10]} Day Master`
  };
};

// --- Main App Component ---
export default function App() {
  const { x, y } = useSmoothMouse();
  const [appState, setAppState] = useState('INPUT'); // INPUT, ANALYZING, RESULT
  const [formData, setFormData] = useState({ name: '', gender: 'Male', birthDate: '', birthTime: '12:00' });
  const [baziResult, setBaziResult] = useState(null);

  const timeOptions = [
    { label: "子时 (23:00-00:59)", value: "Zi" }, { label: "丑时 (01:00-02:59)", value: "Chou" },
    { label: "寅时 (03:00-04:59)", value: "Yin" }, { label: "卯时 (05:00-06:59)", value: "Mao" },
    { label: "辰时 (07:00-08:59)", value: "Chen" }, { label: "巳时 (09:00-10:59)", value: "Si" },
    { label: "午时 (11:00-12:59)", value: "Wu" }, { label: "未时 (13:00-14:59)", value: "Wei" },
    { label: "申时 (15:00-16:59)", value: "Shen" }, { label: "酉时 (17:00-18:59)", value: "You" },
    { label: "戌时 (19:00-20:59)", value: "Xu" }, { label: "亥时 (21:00-22:59)", value: "Hai" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.birthDate) return;
    setAppState('ANALYZING');
    
    setTimeout(() => {
      setBaziResult(generateBazi(formData.name, formData.birthDate));
      setAppState('RESULT');
    }, 4000);
  };

  return (
    <>
      <GlobalStyles />
      
      {/* Neon Cursor */}
      <div className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[100] mix-blend-screen hidden md:block"
        style={{ transform: `translate(${x - 16}px, ${y - 16}px)`, background: 'radial-gradient(circle, #05D9E8 0%, transparent 70%)', boxShadow: '0 0 20px 2px rgba(5,217,232,0.3)' }}
      />

      <AlgorithmicDonut />

      {/* Dynamic Glow Background */}
      <div className="fixed inset-0 flex justify-center items-center pointer-events-none z-0">
        <div className="w-[80vw] h-[80vh] bg-gradient-to-br from-[#FF2A6D]/10 to-[#05D9E8]/10 rounded-full blur-[100px] opacity-50 mix-blend-screen"></div>
      </div>

      <main className="relative min-h-screen flex flex-col items-center justify-center p-6 z-10">
        
        {/* Top Header */}
        <div className="absolute top-8 left-8 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#FF2A6D] to-[#05D9E8] animate-pulse shadow-[0_0_15px_rgba(5,217,232,0.5)]"></div>
          <h1 className="text-xl font-bold tracking-tight text-white">SPACEX<span className="opacity-50">YANG</span></h1>
        </div>

        {/* STATE: INPUT FORM */}
        {appState === 'INPUT' && (
          <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-16 items-center animate-in fade-in zoom-in-95 duration-700">
            <div className="space-y-6">
              <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-[1.1]">
                Destiny,<br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A6D] to-[#05D9E8]">Decoded.</span>
              </h1>
              <p className="text-xl text-white/50 font-light leading-relaxed max-w-md">
                Experience the intersection of ancient metaphysical architecture and modern AI logic engines.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="apple-glass p-10 w-full relative group">
              <h2 className="text-2xl font-bold mb-8">Initialize Engine</h2>
              <AppleInput label="Identity" placeholder="Your name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex flex-col">
                  <label className="text-[11px] font-semibold text-white/50 tracking-widest uppercase mb-2 pl-1">Gender</label>
                  <div className="flex bg-white/5 border border-white/10 rounded-xl overflow-hidden p-1 backdrop-blur-md">
                    {['Male', 'Female'].map(g => (
                      <button key={g} type="button" onClick={() => setFormData({...formData, gender: g})}
                        className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all cursor-none ${formData.gender === g ? 'bg-white text-black shadow-md' : 'text-white/50 hover:text-white'}`}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <AppleInput label="Genesis Date" type="date" value={formData.birthDate} onChange={e => setFormData({...formData, birthDate: e.target.value})} />
              </div>

              <AppleInput label="Temporal Coordinates" type="select" options={timeOptions} value={formData.birthTime} onChange={e => setFormData({...formData, birthTime: e.target.value})} />

              <MagneticButton type="submit" className="w-full mt-4 text-[#000000] bg-white hover:bg-white/90 border-transparent shadow-[0_0_20px_rgba(255,255,255,0.2)]">
                Initialize Computation
              </MagneticButton>
            </form>
          </div>
        )}

        {/* STATE: ANALYZING (Apple Intelligence Style) */}
        {appState === 'ANALYZING' && (
          <div className="flex flex-col items-center justify-center space-y-12 animate-in fade-in duration-700">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <div className="ai-glow"></div>
              <div className="absolute inset-0 rounded-full border border-white/10 bg-white/5 backdrop-blur-sm animate-pulse"></div>
              <div className="text-white text-3xl font-black tracking-tighter z-10">AI</div>
            </div>
            <div className="text-center space-y-3">
              <h3 className="text-3xl font-bold tracking-tight">Synthesizing Matrix</h3>
              <p className="text-[#05D9E8] font-mono text-sm uppercase tracking-widest animate-pulse">Running Neural Divination Model...</p>
            </div>
          </div>
        )}

        {/* STATE: RESULT */}
        {appState === 'RESULT' && baziResult && (
          <div className="w-full max-w-6xl animate-in slide-in-from-bottom-10 fade-in duration-700">
            <div className="flex justify-between items-center mb-10">
              <div>
                <h2 className="text-4xl font-black tracking-tight">System Output</h2>
                <p className="text-white/50 text-sm mt-2 tracking-wide">ID: {formData.name} &nbsp;|&nbsp; DOB: {formData.birthDate}</p>
              </div>
              <MagneticButton onClick={() => setAppState('INPUT')} className="px-6 py-2 text-xs text-white bg-transparent">
                Reset Matrix
              </MagneticButton>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Pillars Widget */}
              <div className="lg:col-span-5 apple-glass p-8 flex flex-col justify-center">
                <h3 className="text-xs text-white/50 tracking-widest font-bold uppercase mb-8">Four Pillars Architecture</h3>
                <div className="grid grid-cols-4 gap-4 text-center">
                  {baziResult.pillars.map((pillar, idx) => (
                    <div key={idx} className="space-y-3 relative group">
                      {pillar.isDayMaster && (
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 text-[10px] font-bold text-[#FF2A6D] whitespace-nowrap bg-[#FF2A6D]/10 px-2 py-1 rounded-full border border-[#FF2A6D]/30">Day Master</div>
                      )}
                      <div className="text-xs text-white/40 font-mono">{pillar.name}</div>
                      <div className="text-2xl font-bold p-4 rounded-2xl bg-black/40 border border-white/5 transition-all group-hover:scale-105" style={{ color: pillar.color, boxShadow: `0 0 20px ${pillar.color}20` }}>{pillar.stem}</div>
                      <div className="text-2xl font-bold p-4 rounded-2xl bg-black/40 border border-white/5 transition-all group-hover:scale-105">{pillar.branch}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Analysis Widgets */}
              <div className="lg:col-span-7 grid grid-cols-1 gap-6">
                <div className="apple-glass p-8 relative overflow-hidden">
                  <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-[#FF2A6D] to-[#05D9E8]"></div>
                  <h3 className="text-xl font-bold mb-4">Core Algorithm: {baziResult.dayMaster}</h3>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Based on the computational analysis of your Day Master, your architectural baseline is highly analytical and resilient. You function optimally in environments requiring extreme precision and logical structuring. The algorithm detects a high capacity for learning (Input elements) and an impending surge in execution energy (Output/Wealth elements) in your upcoming life cycles. 
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                  <div className="apple-glass p-6 hover:bg-white/10 transition-colors">
                    <h4 className="text-sm font-bold text-[#05D9E8] mb-2 uppercase tracking-wide">Career Vector</h4>
                    <p className="text-white/60 text-sm leading-relaxed">Highly suited for roles bridging hard engineering with abstract product strategy (PM/FAE). Your code executes best when translating tech into human value.</p>
                  </div>
                  <div className="apple-glass p-6 hover:bg-white/10 transition-colors">
                    <h4 className="text-sm font-bold text-[#FF2A6D] mb-2 uppercase tracking-wide">Optimization</h4>
                    <p className="text-white/60 text-sm leading-relaxed">Avoid infinite loops in intellectual pursuits. Ground your computational power in physical execution and market feedback to unlock maximum ROI.</p>
                  </div>
                </div>
              </div>
            </div>
            
            <p className="text-center mt-12 text-xs text-white/30 font-mono">Powered by SpaceX-YANG AI Engine v2.0</p>
          </div>
        )}
      </main>
    </>
  );
}