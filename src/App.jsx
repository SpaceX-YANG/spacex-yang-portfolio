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
    
    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(5, 217, 232, 0.5); }
    
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
      background: rgba(20, 20, 22, 0.85);
      backdrop-filter: blur(40px);
      -webkit-backdrop-filter: blur(40px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 24px;
      box-shadow: 0 20px 80px rgba(0,0,0,0.9);
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

// --- Component: Interactive 3D Particle Donut ---
const AlgorithmicDonut = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });

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
        const x = (250 + 80 * Math.cos(v)) * Math.cos(u);
        const y = (250 + 80 * Math.cos(v)) * Math.sin(u);
        const z = 80 * Math.sin(v);
        particles.push({ ox: x, oy: y, oz: z, x, y, z, vx: 0, vy: 0, vz: 0 });
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
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          p.vx += (dx / dist) * 1.5;
          p.vy += (dy / dist) * 1.5;
        }
        
        p.vx += (p.ox - p.x) * 0.05; p.vy += (p.oy - p.y) * 0.05; p.vz += (p.oz - p.z) * 0.05;
        p.vx *= 0.9; p.vy *= 0.9; p.vz *= 0.9;
        p.x += p.vx; p.y += p.vy; p.z += p.vz;

        let y1 = p.y * cosX - p.z * sinX;
        let z1 = p.y * sinX + p.z * cosX;
        let x2 = p.x * cosY + z1 * sinY;
        let z2 = -p.x * sinY + z1 * cosY;

        const scale = 800 / (800 + z2);
        const screenX = width / 2 + x2 * scale;
        const screenY = height / 2 + y1 * scale;

        ctx.globalAlpha = Math.max(0.05, (scale - 0.5) * 0.6);
        ctx.fillStyle = '#05D9E8'; 
        ctx.beginPath();
        ctx.arc(screenX, screenY, Math.max(0.5, 1.5 * scale), 0, Math.PI * 2);
        ctx.fill();
      });
      animationId = requestAnimationFrame(render);
    };
    render();

    const handleResize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    const handleGlobalMouseMove = (e) => {
      mouseRef.current = {
        x: (e.clientX - width / 2), 
        y: (e.clientY - height / 2)
      };
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleGlobalMouseMove); 

    return () => { 
      window.removeEventListener('resize', handleResize); 
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      cancelAnimationFrame(animationId); 
    };
  }, []);
  
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none opacity-40 mix-blend-screen" />;
};

// --- Component: Detail Modal Overlay ---
const TheoryModal = ({ theory, onClose }) => {
  if (!theory) return null;

  return (
    <div className="fixed inset-0 z-[9000] flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-300">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={onClose}></div>
      
      <div className="relative w-full max-w-5xl max-h-[85vh] apple-glass flex flex-col animate-in zoom-in-95 duration-500">
        <div className="flex justify-between items-center p-6 sm:p-8 border-b border-white/10 bg-white/5 shrink-0 rounded-t-2xl">
          <div>
            <span className="font-mono text-sm text-[#05D9E8] font-bold tracking-widest uppercase mb-2 block">{theory.subtitle}</span>
            <h2 className="text-3xl sm:text-5xl font-black tracking-tight text-white">{theory.title}</h2>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors shrink-0 border border-white/20">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="p-6 sm:p-10 overflow-y-auto custom-scrollbar space-y-10 rounded-b-2xl">
          <p className="text-lg sm:text-xl text-white/80 leading-relaxed font-light border-l-4 border-[#FF2A6D] pl-4">
            {theory.details.intro}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {theory.details.sections.map((sec, idx) => (
              <div key={idx} className={`bg-white/5 border border-white/5 rounded-2xl p-6 hover:bg-white/10 transition-colors shadow-lg ${sec.fullWidth ? 'md:col-span-2' : ''}`}>
                <h4 className="text-[#05D9E8] text-xl font-bold mb-4 flex items-center gap-3">
                  <span className="w-2 h-6 bg-gradient-to-b from-[#05D9E8] to-[#FF2A6D] rounded-full"></span>
                  {sec.heading}
                </h4>
                <div className="text-white/70 leading-relaxed text-sm space-y-2">
                  {sec.body.split('\n').map((line, i) => (
                    <p key={i} className={line.startsWith('•') || line.includes('：') ? 'ml-2' : ''}>
                      {line.includes('：') ? (
                        <>
                          <strong className="text-white">{line.split('：')[0]}：</strong>
                          {line.split('：')[1]}
                        </>
                      ) : line}
                    </p>
                  ))}
                </div>
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
        <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/30 group-hover:text-[#05D9E8] group-hover:border-[#05D9E8]/50 group-hover:bg-[#05D9E8]/10 transition-all">
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

  // Content Knowledge Base
  const theories = [
    {
      id: "01",
      title: "五行理论",
      subtitle: "Wu Xing State Machine",
      desc: "The fundamental state machine of the cosmos. It dictates the Generation (生) and Overcoming (克) protocols governing energy transformation.",
      isLarge: true,
      colorClass: "from-[#FF2A6D] to-transparent",
      details: {
        intro: "五行（木、火、土、金、水）是中国古代哲学体系的核心基本运行协议。它们并非指代具象的物理材质，而是描述宇宙能量在时间与空间中的五种动态演变阶段（Phases of Energy）。一切算法皆源于此。",
        sections: [
          { 
            heading: "五大基本状态 (Energy Phases)", 
            body: "木 (Wood)：扩张与生发，代表向上向外的能量，对应春天与底层生长逻辑。\n火 (Fire)：释放与巅峰，代表能量的极速辐射与最高活跃度，对应夏天。\n土 (Earth)：稳固与转化，代表能量的缓冲、承载与中转，属于过渡期枢纽。\n金 (Metal)：收敛与肃杀，代表能量的向内收缩、沉淀与提纯，对应秋天。\n水 (Water)：潜藏与休眠，代表能量的极度静止、内敛与孕育，对应冬天。" 
          },
          { 
            heading: "相生协议 (Generation Loop)", 
            body: "系统内部的正反馈驱动链（Positive Feedback Loop），推动万物演进：\n木生火：扩张的能量被点燃转化为辐射。\n火生土：燃烧殆尽后能量沉淀为灰烬物质。\n土生金：沉淀的物质内部孕育出高密度结构。\n金生水：高密度结构在冷凝中转化为流体。\n水生木：流体滋养出新的生命扩张。" 
          },
          { 
            heading: "相克协议 (Overcoming Loop)", 
            body: "系统内部的负反馈制衡链（Negative Feedback Loop），防止单一能量过载崩盘：\n木克土：扩张的根系穿透并约束松散物质。\n土克水：致密的物质堤坝阻挡流体漫延。\n水克火：绝对的冷量扑灭辐射热能。\n火克金：高能热量破坏并融化高密度结构。\n金克木：高密度锐器切断并抑制扩张能量。" 
          },
          { 
            heading: "系统级应用 (Architectural Application)", 
            body: "在命运矩阵（八字）中，五行力量的绝对平衡是不存在的。系统分析师（命理师）通过计算原局五行的权重，找出系统的性能瓶颈（病），并推导出能让系统恢复动态平衡的干预参数（药，即“用神”）。" 
          }
        ]
      }
    },
    {
      id: "02",
      title: "十天干理论",
      subtitle: "10 Heavenly Vectors",
      desc: "Ten spatial vectors representing the surface-level logic and explicit manifestations of cosmic energy. The 'API' of destiny.",
      isLarge: false,
      colorClass: "from-[#05D9E8] to-transparent",
      details: {
        intro: "十天干（甲、乙、丙、丁、戊、己、庚、辛、壬、癸）是八字命理中表层显性数据的载体。如果五行是底层协议，天干就是具象化的 API 接口。它们不仅代表天体运行对地球产生的直接能量场，更是定义个体社会属性与外部行为模式的核心代码。",
        sections: [
          { 
            heading: "五行与阴阳的具象化 (Yin & Yang Protocols)", 
            body: "木系协议 (Wood)：甲（阳木/参天大树/刚直向上），乙（阴木/藤蔓花草/柔韧适应）。\n火系协议 (Fire)：丙（阳火/太阳之光/猛烈辐射），丁（阴火/星光烛火/精准聚焦）。\n土系协议 (Earth)：戊（阳土/高山城墙/稳固承载），己（阴土/田园沃土/孕育包容）。\n金系协议 (Metal)：庚（阳金/剑戟矿石/破坏重组），辛（阴金/珠宝首饰/精密切割）。\n水系协议 (Water)：壬（阳水/江河湖海/奔腾冲刷），癸（阴水/雨露云雾/渗透滋养）。",
            fullWidth: true
          },
          { 
            heading: "日元核心 (Day Master CPU)", 
            body: "出生日的天干被称为“日主”或“日元”，它是整个八字架构的中央处理器 (CPU)。日主的五行属性直接决定了个体的底层逻辑、先天的性格底色以及与周围环境交互的默认指令集。" 
          },
          { 
            heading: "天干五合 (Combination Logic)", 
            body: "天干之间存在特定的化合反应（如：甲己合土，乙庚合金，丙辛合水，丁壬合木，戊癸合火）。这在系统中表现为能量的羁绊、妥协、联姻或资源的深度绑定。它往往决定了人生轨迹中的重大合作与情感走向。" 
          }
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
        sections: [
          { heading: "时空四维映射", body: "在时间维度，十二地支精确映射了一天中的12个时辰与一年中的12个月份；在空间维度，它们严密对应着罗盘上的十二个地理方位（如子为正北，午为正南）。" },
          { heading: "藏干加密机制", body: "与天干纯粹的能量不同，地支如同一个“加密数据库”。每个地支内部隐藏着1到3个天干能量（藏干），代表了人生中错综复杂的隐藏剧本与潜在资源。" }
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
        intro: "十神是基于“日主”（核心自我）与其他干支发生五行生克关系后，衍生出的 10 种社会角色变量。它是将底层代码转化为真实人生事件的“中间件协议”。",
        sections: [
          { heading: "输出与反馈 (食伤/财星)", body: "食伤系统：日主生出的能量。代表才华展示、创新表达与商业嗅觉。\n财星系统：日主克制的能量。代表对物质的支配欲、现金流转化能力与劳动成果。" },
          { heading: "输入与压力 (印星/官杀)", body: "印星系统：生扶日主的能量。代表学历背景、系统庇护、信息摄入与精神深度。\n官杀系统：克制日主的能量。代表外部压力、事业阶层、管理规则与执行力。" }
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
        intro: "刑冲会合是八字命盘中干支相互作用的动态触发算法。它们决定了静态的命运架构在遭遇外部时间流（流年大运）时，会发生怎样的状态突变。",
        sections: [
          { heading: "合并协议 (合与会)", body: "包含天干五合、地支六合、三合局等。代表能量的羁绊、合作与资源的深度整合。在现实中常触发结盟、投资到位或婚恋关系的建立。" },
          { heading: "冲突协议 (冲与刑)", body: "包含地支六冲、相刑等。代表能量的剧烈碰撞与旧系统的强制重组。虽然常伴随变动与阵痛，但这往往是打破阶层壁垒、实现跃迁的唯一途径。" }
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
        intro: "格局（Pattern）是八字命理的高层架构模式。通过分析日主与出生月令（系统核心环境变量）的相对关系，判断出该命局的最佳运行方式和商业变现路径。",
        sections: [
          { heading: "正格 (Standard Architectures)", body: "包括正官格、财格、印格等。这类架构运行稳定，遵循社会主流行事逻辑，讲究阴阳平衡与中庸之道，适合在成熟的企业体制内稳步攀升，属于长期复利型结构。" },
          { heading: "变格/从格 (Specialized Architectures)", body: "当某一种五行能量形成绝对垄断且无法平衡时，系统会放弃中庸，转而“顺从”这股极端能量（如从杀格、从财格）。这类架构风险极高，大起大落，但往往具备颠覆行业、创造极致成就的爆发力。" }
        ]
      }
    }
  ];

  return (
    <>
      <GlobalStyles />
      
      {/* Neon Cursor */}
      <div className="fixed top-0 left-0 w-6 h-6 rounded-full pointer-events-none z-[9999] mix-blend-screen hidden md:block"
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
          {/* 这里直接替换成了 SpaceX-YANG 大标题 */}
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-black tracking-tighter leading-[0.9] mb-8">
            SpaceX<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF2A6D] to-[#05D9E8]">-YANG</span>
          </h1>
          
          <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-white/90 whitespace-nowrap">
              Metaphysics, Deconstructed.
            </h2>
            <div className="hidden md:block w-px h-12 bg-white/20"></div>
            <p className="text-lg md:text-xl text-white/50 font-light max-w-xl leading-relaxed">
              Translating ancient Chinese metaphysical theorems into modern computational architecture. Click any module to explore the underlying logic.
            </p>
          </div>
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