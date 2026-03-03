import React, { useState, useEffect, useRef } from 'react';

// --- 全局样式与字体注入 (极暗黑洋红极客风) ---
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
    .custom-scrollbar::-webkit-scrollbar { width: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(218, 32, 90, 0.5); border-radius: 10px; }
    
    @keyframes blink { 50% { opacity: 0; } }
    .caret { animation: blink 1s step-end infinite; }
    
    .glow-bg {
      position: fixed;
      width: 100vw; height: 100vh;
      background: conic-gradient(from 180deg at 50% 50%, rgba(218, 32, 90, 0.1) 0deg, rgba(5, 5, 5, 0) 180deg, rgba(218, 32, 90, 0.1) 360deg);
      filter: blur(80px);
      z-index: -1;
      pointer-events: none;
    }
  `}</style>
);

// --- Custom Hook: Neon Cursor ---
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
    return () => { window.removeEventListener('mousemove', handleMouseMove); cancelAnimationFrame(animationFrameId); };
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
  const handleMouseLeave = () => setPosition({ x: 0, y: 0 });

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

// --- Component: Algorithmic Donut (Mobile Fixed Version) ---
const AlgorithmicDonut = () => {
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0, isHovering: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth; let height = window.innerHeight;
    canvas.width = width; canvas.height = height;

    const particles = [];
    const R = 180; const r = 60; const density = 40;

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

    let angleX = 0; let angleY = 0;
    let animationFrameId;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      const scrollY = window.scrollY;
      const opacity = Math.max(0, 1 - scrollY / 600);
      ctx.fillStyle = `rgba(218, 32, 90, ${opacity * 0.8})`;

      angleX += 0.005; angleY += 0.007;
      const cosX = Math.cos(angleX); const sinX = Math.sin(angleX);
      const cosY = Math.cos(angleY); const sinY = Math.sin(angleY);

      particles.forEach(p => {
        if (mouseRef.current.isHovering) {
          const dx = p.x - mouseRef.current.x;
          const dy = p.y - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) { p.vx += (dx / dist) * 2; p.vy += (dy / dist) * 2; }
        }
        p.vx += (p.ox - p.x) * 0.05; p.vy += (p.oy - p.y) * 0.05; p.vz += (p.oz - p.z) * 0.05;
        p.vx *= 0.85; p.vy *= 0.85; p.vz *= 0.85;
        p.x += p.vx; p.y += p.vy; p.z += p.vz;

        let y1 = p.y * cosX - p.z * sinX; let z1 = p.y * sinX + p.z * cosX;
        let x2 = p.x * cosY + z1 * sinY; let z2 = -p.x * sinY + z1 * cosY;

        const fov = 600; const scale = fov / (fov + z2);
        const screenX = width / 2 + x2 * scale; const screenY = height / 2 + y1 * scale;
        const size = Math.max(0.5, 2 * scale);
        
        ctx.globalAlpha = Math.max(0.1, scale - 0.5) * opacity;
        ctx.beginPath(); ctx.arc(screenX, screenY, size, 0, Math.PI * 2); ctx.fill();
      });
      animationFrameId = requestAnimationFrame(render);
    };
    render();

    const handleResize = () => { width = window.innerWidth; height = window.innerHeight; canvas.width = width; canvas.height = height; };
    
    // 全局事件监听，解决手机端滚动与交互冲突问题
    const handleGlobalMouseMove = (e) => { 
      mouseRef.current = { x: e.clientX - width / 2, y: e.clientY - height / 2, isHovering: true }; 
    };
    const handleGlobalTouchMove = (e) => {
      if (e.touches.length > 0) {
        mouseRef.current = { x: e.touches[0].clientX - width / 2, y: e.touches[0].clientY - height / 2, isHovering: true };
      }
    };
    const handleMouseLeave = () => { mouseRef.current.isHovering = false; };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: true });
    window.addEventListener('mouseleave', handleMouseLeave);
    window.addEventListener('touchend', handleMouseLeave);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('touchmove', handleGlobalTouchMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchend', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // 使用 fixed 和 pointer-events-none，彻底释放底层滚动权限
  return <canvas ref={canvasRef} className="fixed inset-0 z-0 pointer-events-none" />;
};

// --- Component: 3D Parallax Theory Card ---
const TheoryCard = ({ theory, onClick }) => {
  const cardRef = useRef(null);
  const [transform, setTransform] = useState('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  const [spotlight, setSpotlight] = useState({ x: '50%', y: '50%', opacity: 0 });

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left; const y = e.clientY - rect.top;
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
      onClick={() => onClick(theory)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ transform, transition: 'transform 0.1s ease-out' }}
      className="relative group cursor-pointer h-80 rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
    >
      <div 
        className="absolute inset-0 z-0 transition-opacity duration-300 pointer-events-none"
        style={{ opacity: spotlight.opacity, background: `radial-gradient(circle 200px at ${spotlight.x} ${spotlight.y}, rgba(218,32,90,0.15), transparent 80%)` }}
      />
      
      <div className="relative z-10 p-6 flex flex-col h-full justify-between pointer-events-none">
        <div>
          <span className="font-mono text-xs text-[#DA205A] tracking-widest uppercase mb-2 block">{theory.subtitle}</span>
          <h3 className="text-2xl font-inter font-bold text-white group-hover:text-[#DA205A] transition-colors">{theory.title}</h3>
          <p className="text-white/50 mt-2 text-sm leading-relaxed">{theory.desc}</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {theory.tags.map(tag => (
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
const TheoryModal = ({ theory, onClose }) => {
  if (!theory) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-8 bg-black/80 backdrop-blur-lg animate-in fade-in duration-300">
      <div className="relative w-full max-w-5xl h-full max-h-[90vh] bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden flex flex-col shadow-[0_0_50px_rgba(218,32,90,0.1)]">
        
        <div className="flex justify-between items-center p-6 border-b border-white/10 bg-white/5">
          <div>
            <span className="font-mono text-sm text-[#DA205A] tracking-widest uppercase block mb-1">{theory.subtitle}</span>
            <h2 className="text-2xl sm:text-3xl font-inter font-bold text-white">{theory.title}</h2>
          </div>
          <MagneticButton onClick={onClose} className="px-4 py-2 text-sm shrink-0">
            [ X ] CLOSE
          </MagneticButton>
        </div>

        <div className="flex-1 overflow-y-auto p-6 sm:p-10 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* 左侧：简介 */}
            <div className="md:col-span-1 space-y-6">
              <p className="text-sm md:text-base text-white/80 leading-relaxed font-light border-l-2 border-[#DA205A] pl-4">
                {theory.details.intro}
              </p>
            </div>
            
            {/* 右侧：详细协议 */}
            <div className="md:col-span-2 space-y-6">
              {theory.details.sections.map((sec, idx) => (
                <div key={idx} className="bg-white/5 border border-white/5 rounded-xl p-6 hover:bg-white/10 transition-colors">
                  <h4 className="text-[#DA205A] font-inter font-bold mb-3">{sec.heading}</h4>
                  <div className="text-white/60 leading-relaxed text-sm space-y-2 font-mono">
                    {sec.body.split('\n').map((line, i) => (
                      <p key={i} className={line.startsWith('•') ? 'ml-2' : ''}>
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
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const { x, y } = useSmoothMouse();
  const [activeTheory, setActiveTheory] = useState(null);

  const theories = [
    {
      id: "01", title: "五行理论", subtitle: "Wu Xing State Machine",
      desc: "The fundamental state machine of the cosmos. It dictates the Generation and Overcoming protocols.", tags: ['Logic', 'State Machine', 'Balance'],
      details: {
        intro: "五行（木、火、土、金、水）是中国古代哲学体系的核心基本运行协议。它们并非指代具象的物理材质，而是描述宇宙能量在时间与空间中的五种动态演变阶段。一切算法皆源于此。",
        sections: [
          { heading: "相生协议 (Generation Loop)", body: "木生火：扩张的能量被点燃转化为辐射。\n火生土：燃烧殆尽后能量沉淀为灰烬物质。\n土生金：沉淀的物质内部孕育出高密度结构。\n金生水：高密度结构在冷凝中转化为流体。\n水生木：流体滋养出新的生命扩张。" },
          { heading: "相克协议 (Overcoming Loop)", body: "木克土：扩张的根系穿透并约束松散物质。\n土克水：致密的物质堤坝阻挡流体漫延。\n水克火：绝对的冷量扑灭辐射热能。\n火克金：高能热量破坏并融化高密度结构。\n金克木：高密度锐器切断并抑制扩张能量。" }
        ]
      }
    },
    {
      id: "02", title: "十天干理论", subtitle: "10 Heavenly Vectors",
      desc: "Ten spatial vectors representing the surface-level logic and explicit manifestations of cosmic energy.", tags: ['API', 'Vectors', 'Yin-Yang'],
      details: {
        intro: "十天干（甲、乙、丙、丁、戊、己、庚、辛、壬、癸）是命理中表层显性数据的载体。如果五行是底层协议，天干就是具象化的 API 接口，直接定义个体的底层逻辑。",
        sections: [
          { heading: "五行与阴阳的具象化", body: "木系协议：甲（阳木/刚直向上），乙（阴木/柔韧适应）。\n火系协议：丙（阳火/猛烈辐射），丁（阴火/精准聚焦）。\n土系协议：戊（阳土/稳固承载），己（阴土/孕育包容）。\n金系协议：庚（阳金/破坏重组），辛（阴金/精密切割）。\n水系协议：壬（阳水/奔腾冲刷），癸（阴水/渗透滋养）。" },
          { heading: "日元核心 (Day Master CPU)", body: "出生日的天干被称为“日主”，它是整个八字架构的中央处理器。日主的五行属性直接决定了个体的底层行为默认指令集 。" },
          { heading: "天干五合 (Combination Logic)", body: "天干间存在化合反应（如甲己合土，乙庚合金等）。在系统中表现为能量的羁绊、联姻或资源的深度绑定，往往决定重大合作与情感走向。" }
        ]
      }
    },
    {
      id: "03", title: "十二地支", subtitle: "12 Earthly Matrices",
      desc: "Chronobiological matrices tracking Earth's rotational phases, storing hidden elemental data.", tags: ['Database', 'Time', 'Space'],
      details: {
        intro: "十二地支（子丑寅卯辰巳午未申酉戌亥）代表地球自转与公转的时空刻度。它们不仅记录时间，更是复杂环境与隐藏资源的底层物理容器。",
        sections: [
          { heading: "时空四维映射", body: "时间维度精确映射了一天中的12个时辰与一年中的12个月份；空间维度严密对应着罗盘上的十二个地理方位（如子为正北，午为正南） 。" },
          { heading: "藏干加密机制 (Hidden Stems)", body: "每个地支内部隐藏着1到3个天干能量，分为本气、中气和副气。例如“子”只藏“癸”水，纯粹且智慧；而“丑”作为冻土，内部却藏有“己(本气)、癸(中气)、辛(副气)”，代表了极其复杂的潜在资源库。" },
          { heading: "地支交互算法 (刑冲会合)", body: "地支间会触发特定的物理反应：\n三合局（如申子辰合水）：代表资源的深度联盟与能量增强。\n六冲（如子午冲）：水火相冲，性格矛盾且情绪起伏大，代表旧系统的强制重组。\n六合（如子丑合）：代表聪明务实，理论与实践并重，资源互补。" }
        ]
      }
    },
    {
      id: "04", title: "六十甲子与纳音", subtitle: "60-Hash Cycle & Na Yin",
      desc: "The 60-unit base cycle of the calendar, generating symbolic elemental attributes through stem-branch permutations.", tags: ['Cycle', 'Hash', 'Attributes'],
      details: {
        intro: "六十甲子由十天干和十二地支相配而成。10和12的最小公倍数是60，构成了时间循环的底层哈希表。每两个相邻的组合还会生成一种象征性的“纳音五行”。",
        sections: [
          { heading: "空亡理论 (Null Pointers)", body: "每个甲子旬包含10个甲子，但地支有12个，因此每旬必有2个地支“轮空”（如甲子旬缺戌、亥）。空亡代表系统该区块的力量减弱、变化无常，但也可能孕育着跳出常规的潜在机遇。" },
          { heading: "纳音五行 (Symbolic Elements)", body: "不同于基础的干支五行，纳音是高维的物理意象，共计30种（如甲子/乙丑为【海中金】，丙寅/丁卯为【炉中火】）。在命理学中，常用于判断性格特点与事业方向。" },
          { heading: "纳音的系统意象", body: "海中金：海底珍藏的金子，象征深藏不露的才华和潜力。\n炉中火：天地为炉，阴阳为炭，温暖有力。\n剑锋金：白帝司权，百炼成钢，锋利且刚强有力。" }
        ]
      }
    },
    {
      id: "05", title: "十神理论", subtitle: "Relational Dynamics",
      desc: "Socio-psychological variables calculating human interaction models (Wealth, Power, Output, Resources).", tags: ['Psychology', 'Middleware', 'Roles'],
      details: {
        intro: "十神是基于“日主(CPU)”与其他干支发生五行生克关系后，衍生出的 10 种社会角色变量。它是将底层代码转化为真实人生事件的“中间件协议”。",
        sections: [
          { heading: "同我者：比肩 / 劫财 (并发线程)", body: "同五行属性。比肩(同性)代表平等的合作、朋友与团队协作；劫财(异性)代表激烈的竞争、争夺与极强的行动冒险力。" },
          { heading: "生我者：正印 / 偏印 (数据输入)", body: "正印(异性)代表正统学识、长辈庇护与深邃的理解力；偏印/枭神(同性)代表非传统直觉、神秘事物与独特的创新思维。" },
          { heading: "我生者：食神 / 伤官 (数据输出)", body: "食神(同性)代表温和的才华展示、表达与生活享受；伤官(异性)代表激进的才华倾泻、批判精神与打破规则的叛逆创新。" },
          { heading: "克我者：正官 / 七杀 (系统控制)", body: "正官(异性)代表责任心、正当权威与管理规则；七杀(同性)代表极限压力、强烈的竞争挑战与激进的行动力。" },
          { heading: "我克者：正财 / 偏财 (资源占有)", body: "正财(异性)代表正当收入、稳重理财与劳动转化；偏财(同性)代表对意外财富的敏锐嗅觉、风投眼光与交际手腕。" }
        ]
      }
    },
    {
      id: "06", title: "八字格局", subtitle: "Architectural Archetypes",
      desc: "Top-level design patterns used to classify human destiny frameworks and life path integrity.", tags: ['Architecture', 'Patterns', 'Optimization'],
      details: {
        intro: "格局是命理的高层架构模式。通过分析系统核心环境变量（主要参考月令），判断出该命局的最佳运行方式和商业变现路径。",
        sections: [
          { heading: "正格 (Standard Architectures)", body: "包含正官格、财格、印格、食伤格等。这类架构运行稳定，遵循社会主流行事逻辑，讲究阴阳平衡与中庸之道。适合在成熟的体系、企业体制内稳步攀升，属于长期复利型的优质系统结构。" },
          { heading: "外格 / 从格 (Specialized Architectures)", body: "当系统中某一种五行能量形成绝对垄断，且其他能量无法制衡时，系统会自动触发异常处理，完全放弃中庸，转而“顺从”这股极端能量（如从杀格、从财格、润下格等）。" },
          { heading: "高阶运维建议", body: "外格的风险极高，大起大落，但往往具备打破现有阶层壁垒、颠覆行业规则、创造极致成就的惊人爆发力。不走寻常路，是其核心主频。" }
        ]
      }
    }
  ];

  return (
    <>
      <GlobalStyles />
      
      {/* 极简发光鼠标 (移动端通过媒体查询隐藏，不干扰视线) */}
      <div 
        className="fixed top-0 left-0 w-8 h-8 rounded-full pointer-events-none z-[100] mix-blend-screen hidden md:block"
        style={{ transform: `translate(${x - 16}px, ${y - 16}px)`, background: 'radial-gradient(circle, rgba(218,32,90,0.8) 0%, rgba(218,32,90,0) 70%)', boxShadow: '0 0 20px 5px rgba(218,32,90,0.4)' }}
      />

      <div className="glow-bg" />
      
      {/* 3D 背景层 (彻底修复滚动与交互冲突) */}
      <AlgorithmicDonut />

      <main className="relative z-10 w-full min-h-screen">
        {/* --- HERO AREA --- */}
        <section className="relative w-full h-screen flex items-center justify-center">
          <div className="text-center pointer-events-none mix-blend-difference">
            <h1 className="text-6xl sm:text-7xl md:text-9xl font-inter font-black tracking-tighter uppercase text-transparent [-webkit-text-stroke:2px_white] leading-none mb-6">
              SpaceX<br/><span className="text-white [-webkit-text-stroke:0px]">YANG</span>
            </h1>
            <p className="mt-4 text-lg md:text-2xl text-white/80 uppercase tracking-[0.2em] font-bold">
              Metaphysics, <span className="text-[#DA205A]">Deconstructed.</span><span className="caret">_</span>
            </p>
            <p className="mt-4 text-xs md:text-sm text-white/50 tracking-[0.1em] font-mono px-4">
              Bazi Architecture // Ziwei Systems // Logical Destiny
            </p>
          </div>
          
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center animate-bounce text-white/50 text-sm">
            <span>SCROLL</span>
            <div className="w-[1px] h-8 bg-gradient-to-b from-white/50 to-transparent mt-2" />
          </div>
        </section>

        {/* --- ABOUT AREA --- */}
        <section className="max-w-7xl mx-auto px-6 py-20 md:py-32 grid grid-cols-1 md:grid-cols-3 gap-16">
          <div className="md:col-span-1">
            <div className="md:sticky top-32 space-y-8">
              {/* 蓝圈：相机照片头像区域 */}
              <div className="relative w-28 h-28 md:w-32 md:h-32 rounded-full overflow-hidden border-2 border-white/20 group cursor-pointer filter grayscale hover:grayscale-0 transition-all duration-500 shadow-[0_0_30px_rgba(218,32,90,0)] hover:shadow-[0_0_30px_rgba(218,32,90,0.3)] hover:border-[#DA205A]">
                <img src="/avatar_camera.jpg" alt="Camera Avatar" className="w-full h-full object-cover" />
              </div>
              
              <div>
                {/* 红圈：大标题直接替换为 SpaceX-YANG */}
                <h2 className="text-3xl font-inter font-bold mb-4">SpaceX-YANG.</h2>
                <p className="text-white/60 text-sm leading-relaxed mb-6 font-mono">
                  Bridging the ancient calculation of the cosmos with modern logic frameworks. Rejecting pure fatalism in favor of actionable, psychological optimization.
                </p>
                
                <div className="flex flex-wrap gap-2">
                  {['Bazi Logic', 'Ziwei Matrices', 'System Architecture', 'Rational Planning'].map(skill => (
                    <span key={skill} className="px-3 py-1 bg-[#DA205A]/10 text-[#DA205A] text-xs border border-[#DA205A]/30 rounded-sm font-mono whitespace-nowrap">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-2 border-l border-white/10 pl-6 md:pl-8 space-y-12 md:space-y-16">
            {[
              { year: 'Phase III - Synthesis', role: 'Architect of Fate', desc: 'Integrating Bazi elemental interactions with Ziwei star palaces to formulate deep, rational analyses for career alignment.' },
              { year: 'Phase II - Logistics', role: 'Systems Analyst', desc: 'Mapping potential life paths against environmental variables to maximize personal and professional output.' },
              { year: 'Phase I - Foundation', role: 'Data Collection', desc: 'Deconstructing traditional metaphysical texts into logical rule sets, rejecting fatalism for dynamic probability.' }
            ].map((job, i) => (
              <div key={i} className="relative group">
                <div className="absolute -left-[33px] md:-left-[41px] top-1 w-3 h-3 bg-[#050505] border-2 border-white/30 rounded-full group-hover:border-[#DA205A] group-hover:shadow-[0_0_10px_rgba(218,32,90,0.8)] transition-all" />
                <div className="bg-white/5 backdrop-blur-md border border-white/10 p-5 md:p-6 rounded-xl hover:-translate-y-2 hover:bg-white/10 transition-all duration-300">
                  <span className="text-[#DA205A] text-xs md:text-sm font-bold font-mono">{job.year}</span>
                  <h3 className="text-lg md:text-xl font-inter font-bold text-white mt-1 mb-2 md:mb-3">{job.role}</h3>
                  <p className="text-xs md:text-sm text-white/70 font-mono">{job.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* --- KNOWLEDGE BASE --- */}
        <section className="max-w-7xl mx-auto px-6 py-20 md:py-32">
          <h2 className="text-4xl md:text-5xl font-inter font-black mb-12 md:mb-16 uppercase tracking-tight">System<br/><span className="text-[#DA205A]">Logs_</span></h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            {theories.map(theory => (
              <TheoryCard key={theory.id} theory={theory} onClick={setActiveTheory} />
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <MagneticButton onClick={() => alert('Initiating Deep Analysis...')} className="text-sm md:text-lg font-mono">
              CALCULATE TRAJECTORY
            </MagneticButton>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="border-t border-white/10 py-10 md:py-12 text-center text-white/40 text-xs md:text-sm font-mono">
          <p>© {new Date().getFullYear()} SPACEX—YANG. LOGIC GATES INITIALIZED.</p>
        </footer>
      </main>

      {/* --- DETAILS MODAL --- */}
      <TheoryModal theory={activeTheory} onClose={() => setActiveTheory(null)} />
    </>
  );
}
