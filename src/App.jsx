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
    
    /* Hide scrollbar for main page, but custom for modal */
    ::-webkit-scrollbar { width: 0px; background: transparent; }
    
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(5, 217, 232, 0.5); }
    
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
      cursor: pointer;
    }
    .bento-card:hover {
      transform: translateY(-5px) scale(1.02);
      border-color: rgba(5, 217, 232, 0.4);
      box-shadow: 0 20px 40px rgba(0,0,0,0.6), inset 0 0 40px rgba(5,217,232,0.05);
    }
    
    .apple-glass {
      background: rgba(28, 28, 30, 0.7);
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.8);
    }
  `}</style>
);

// --- Custom Hook: Smooth Neon Cursor ---
const useSmoothMouse = () => {
  const[mousePosition, setMousePosition] = useState({ x: -100, y: -100 });
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
  },[]);
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

    const particles =[];
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
  },[]);
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-40" />;
};

// --- Component: Detail Modal Overlay ---
const TheoryModal = ({ theory, onClose }) => {
  if (!theory) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      {/* Blurred Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose}></div>
      
      {/* Modal Container */}
      <div className="relative w-full max-w-4xl max-h-[85vh] apple-glass flex flex-col animate-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="flex justify-between items-center p-6 sm:p-8 border-b border-white/10 bg-white/5 shrink-0 rounded-t-2xl">
          <div>
            <span className="font-mono text-sm text-[#05D9E8] font-bold tracking-widest uppercase mb-2 block">{theory.subtitle}</span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">{theory.title}</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar space-y-8 rounded-b-2xl">
          <p className="text-lg sm:text-xl text-white/80 leading-relaxed font-light">
            {theory.details.intro}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {theory.details.sections.map((sec, idx) => (
              <div key={idx} className="bg-black/30 border border-white/5 rounded-2xl p-6 hover:bg-black/50 transition-colors">
                <h4 className="text-[#FF2A6D] text-lg font-bold mb-4 flex items-center gap-2">
                  <span className="w-1.5 h-4 bg-gradient-to-b from-[#FF2A6D] to-[#05D9E8] rounded-full"></span>
                  {sec.heading}
                </h4>
                <p className="text-white/60 leading-relaxed text-sm whitespace-pre-line">
                  {sec.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Component: Bento Theory Card ---
const TheoryCard = ({ theory, onClick }) => (
  <div onClick={() => onClick(theory)} className={`bento-card p-8 md:p-10 flex flex-col justify-between group ${theory.isLarge ? 'md:col-span-2 md:row-span-2' : 'col-span-1'}`}>
    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl ${theory.colorClass} rounded-bl-full opacity-10 group-hover:opacity-30 transition-opacity blur-2xl`}></div>
    
    <div>
      <div className="flex justify-between items-start mb-6">
        <span className="font-mono text-sm text-white/30 font-bold tracking-widest uppercase">SYS_LOG {theory.id}</span>
        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/30 group-hover:text-[#05D9E8] group-hover:border-[#05D9E8]/50 group-hover:bg-white/5 transition-all">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
        </div>
      </div>
      
      <h2 className={`font-bold tracking-tight mb-2 ${theory.isLarge ? 'text-4xl md:text-5xl' : 'text-2xl md:text-3xl'}`}>{theory.title}</h2>
      <h3 className="text-[#05D9E8] font-mono text-sm md:text-base tracking-wider uppercase mb-6 opacity-80">{theory.subtitle}</h3>
    </div>
    
    <p className={`text-white/60 leading-relaxed ${theory.isLarge ? 'text-lg max-w-xl' : 'text-sm'}`}>
      {theory.desc}
    </p>
  </div>
);

// --- Main App Component ---
export default function App() {
  const { x, y } = useSmoothMouse();
  const [activeTheory, setActiveTheory] = useState(null);

  // Content Knowledge Base from Fatemaster.ai logic
  const theories =[
    {
      id: "01",
      title: "五行理论",
      subtitle: "Wu Xing State Machine",
      desc: "The fundamental state machine of the cosmos. It dictates the Generation (生) and Overcoming (克) protocols governing energy transformation.",
      isLarge: true,
      colorClass: "from-[#FF2A6D] to-transparent",
      details: {
        intro: "五行（金、木、水、火、土）是中国古代哲学体系的核心基本运行协议。它并非指代具体的物理材质，而是描述宇宙能量状态和运动方式的五种底层抽象逻辑。",
        sections:[
          { heading: "相生协议 (Generation Loop)", body: "一种能量对另一种能量的促进、滋生关系：木生火，火生土，土生金，金生水，水生木。如同系统中的正反馈循环，推动万物生长。" },
          { heading: "相克协议 (Overcoming Loop)", body: "一种能量对另一种能量的抑制、约束关系：木克土，土克水，水克火，火克金，金克木。如同系统中的负反馈制衡，确保系统不会过载崩盘。" },
          { heading: "生态应用", body: "在八字中，五行失衡会导致系统的 Bug（如健康问题或事业阻碍）。命理分析的本质，就是寻找用神（Patch 补丁）来重构五行平衡。" }
        ]
      }
    },
    {
      id: "02",
      title: "十天干理论",
      subtitle: "10 Heavenly Vectors",
      desc: "Ten spatial vectors representing the surface-level logic and explicit manifestations of cosmic energy in real-time.",
      isLarge: false,
      colorClass: "from-[#05D9E8] to-transparent",
      details: {
        intro: "十天干是八字命理中表层显性数据的载体，代表天体运行对地球产生的直接能量场。按顺序分为：甲、乙、丙、丁、戊、己、庚、辛、壬、癸。",
        sections:[
          { heading: "阴阳五行映射", body: "甲乙同属木（甲阳乙阴）；丙丁同属火；戊己同属土；庚辛同属金；壬癸同属水。阳干如猛烈之势，阴干如内敛之能。" },
          { heading: "日主核心 (Day Master)", body: "出生日的天干被称为“日主”，是整个八字架构的“CPU”，代表个体的绝对核心自我、基础性格与底层指令集。" }
        ]
      }
    },
    {
      id: "03",
      title: "十二地支",
      subtitle: "12 Earthly Matrices",
      desc: "Chronobiological matrices tracking Earth's rotational phases. They store hidden elemental data (Hidden Stems).",
      isLarge: false,
      colorClass: "from-[#FF2A6D] to-transparent",
      details: {
        intro: "十二地支（子丑寅卯辰巳午未申酉戌亥）代表地球自转与公转的时空刻度。它们不仅记录时间，更是复杂环境与隐藏资源的底层物理容器。",
        sections:[
          { heading: "时空维度", body: "在时间上，十二地支精确映射了一天中的12个时辰与一年中的12个月份；在空间上，它们严密对应着罗盘上的各个地理方位。" },
          { heading: "藏干机制 (Hidden Stems)", body: "与天干纯粹的能量不同，地支如同一个“加密数据库”，每个地支内部隐藏着1到3个天干能量（藏干），代表了人生中错综复杂的隐藏剧本。" }
        ]
      }
    },
    {
      id: "04",
      title: "十神理论",
      subtitle: "Relational Dynamics",
      desc: "Socio-psychological variables that calculate human interaction models, determining algorithms for Wealth, Power, Output, and Resources.",
      isLarge: false,
      colorClass: "from-[#05D9E8] to-transparent",
      details: {
        intro: "十神是基于“日主”（核心自我）与其他干支发生生克关系后，衍生出的10种社会角色变量。它是将底层代码转化为真实人生事件（财富、权力、性格）的中间件协议。",
        sections:[
          { heading: "官杀系统 (Power)", body: "克制日主的能量。代表事业发展、抗压能力、管理权威，以及女命中的异性缘分。" },
          { heading: "财星系统 (Wealth)", body: "日主克制的能量。代表对物质的支配欲、现金流转化能力，以及男命中的异性缘分。" },
          { heading: "食伤系统 (Output)", body: "日主生出的能量。代表才华展示、创新表达、反叛精神与商业嗅觉。" },
          { heading: "印星系统 (Resource)", body: "生扶日主的能量。代表学历背景、长辈贵人、系统庇护与精神世界的深度。" }
        ]
      }
    },
    {
      id: "05",
      title: "刑冲会合",
      subtitle: "Collision & Combine Protocols",
      desc: "Strict rulesets dictating how elemental objects conflict, merge, or penalize each other within the destiny matrix.",
      isLarge: false,
      colorClass: "from-[#FF2A6D] to-transparent",
      details: {
        intro: "刑冲会合是八字命盘中干支相互作用的动态触发算法。它们决定了静态的命运架构在遭遇流年大运时，会发生怎样的剧烈状态演变。",
        sections:[
          { heading: "合并协议 (合/会)", body: "包含天干五合、地支六合、三合局等。代表能量的羁绊、合作与资源的深度整合。在现实中常触发结盟、投资或婚恋事件。" },
          { heading: "冲突协议 (冲/刑)", body: "包含地支六冲、相刑、相害等。代表能量的剧烈碰撞与系统重组。虽然常带来变动与阵痛，但也是打破阶层壁垒、实现跨越式突破的先决条件。" }
        ]
      }
    },
    {
      id: "06",
      title: "八字格局",
      subtitle: "Architectural Archetypes",
      desc: "Top-level design patterns used to classify human destiny frameworks. It evaluates the structural integrity and operational mode of a life path.",
      isLarge: true,
      colorClass: "from-[#05D9E8] to-transparent",
      details: {
        intro: "格局（Pattern）是八字的高层架构模式。它主要通过分析日主与出生月令（核心环境变量）的相对关系，判断出该命局的最佳运行方式和商业变现路径。",
        sections:[
          { heading: "正格 (Standard Architectures)", body: "包括正官格、财格、印格等。这类架构运行稳定，遵循社会主流行事逻辑，讲究阴阳平衡与中庸之道，适合在成熟的企业体制内稳步攀升。" },
          { heading: "变格 / 从格 (Specialized Architectures)", body: "当某一种五行能量形成绝对垄断且无法平衡时，系统会放弃中庸，转而“顺从”这股极端能量（如从杀格、从财格）。这类架构风险极高，但往往具备颠覆行业、创造极致成就的爆发力。" }
        ]
      }
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
            KNOWLEDGE BASE // V 3.0
          </div>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[1.05] mb-6">
            Metaphysics,<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A6D] to-[#05D9E8]">Deconstructed.</span>
          </h1>
          <p className="text-xl md:text-2xl text-white/50 font-light max-w-2xl leading-relaxed">
            Translating ancient Chinese metaphysical theorems into modern computational architecture. Click any module to explore the underlying logic.
          </p>
        </header>

        {/* Bento Grid Area */}
        <section className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-150">
          {theories.map((theory) => (
            <TheoryCard key={theory.id} theory={theory} onClick={setActiveTheory} />
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

      {/* Render Modal if a theory is selected */}
      <TheoryModal theory={activeTheory} onClose={() => setActiveTheory(null)} />
    </>
  );
}