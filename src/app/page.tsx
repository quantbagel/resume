"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { X, Moon, Sun } from "lucide-react";
import { RevenueChart } from "@/components/RevenueChart";

const Diamond = () => <span className="mr-2 text-foreground">◆</span>;

// Seeded random number generator (mulberry32)
const seededRandom = (seed: number) => {
  return () => {
    let t = seed += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
};

const GitHubContributionGraph = () => {
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  
  // Generate highly active contribution data with seeded randomness
  const weeks = 53;
  const days = 7;
  const random = seededRandom(42069); // Fixed seed for consistent results
  
  const data = Array.from({ length: weeks }, () => 
    Array.from({ length: days }, () => {
      // Much more active - very few empty days
      const rand = random();
      // Only ~5% chance of no activity
      if (rand < 0.05) return 0;
      // High activity most days
      if (rand > 0.85) return 4; // ~15% max intensity
      if (rand > 0.55) return 3; // ~30% high intensity
      if (rand > 0.25) return 2; // ~30% medium intensity
      return 1; // ~20% low intensity
    })
  );

  const getLevelColor = (level: number) => {
    switch (level) {
      case 0: return "bg-[#ebedf0] dark:bg-[#161b22]";
      case 1: return "bg-[#d1d5da] dark:bg-[#2d333b]";
      case 2: return "bg-[#959da5] dark:bg-[#444c56]";
      case 3: return "bg-[#586069] dark:bg-[#768390]";
      case 4: return "bg-[#24292e] dark:bg-[#adbac7]";
      default: return "bg-[#ebedf0] dark:bg-[#161b22]";
    }
  };

  return (
    <div className="my-2 overflow-hidden border border-gray-100 dark:border-gray-900 rounded-lg p-3">
      <div className="overflow-x-auto scrollbar-hide">
        <div className="min-w-[680px]">
          {/* Month labels */}
          <div className="flex mb-2 text-[10px] text-[#656d76] dark:text-[#8b949e]">
            {months.map((month) => (
              <div key={month} className="flex-1">
                {month}
              </div>
            ))}
          </div>

          {/* The Grid */}
          <div className="flex gap-[3px]">
            {data.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[3px]">
                {week.map((level, dayIndex) => (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`w-[10px] h-[10px] rounded-[2px] ${getLevelColor(level)}`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Footer info */}
          <div className="flex justify-between items-center mt-3 text-[11px] text-[#656d76] dark:text-[#8b949e]">
            <div>4,783 activities in 2024</div>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <div className="flex gap-[3px]">
                {[0, 1, 2, 3, 4].map((l) => (
                  <div key={l} className={`w-[10px] h-[10px] rounded-[2px] ${getLevelColor(l)}`} />
                ))}
              </div>
              <span>More</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const ListItem = ({ children }: { children: React.ReactNode }) => (
  <div className="tree-item flex items-start text-[15px] leading-snug relative pl-6">
    {/* Vertical connector */}
    <div className="tree-line-v absolute left-[7px] top-0 bottom-0 w-[1px] bg-foreground opacity-20" />
    {/* Horizontal connector */}
    <div className="absolute left-[7px] top-[15px] w-3 h-[1px] bg-foreground opacity-20" />
    <div className="flex-1">{children}</div>
  </div>
);

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="flex items-center text-[15px] font-medium mt-2 mb-0.5">
    <Diamond /> {children}
  </h2>
);

const Divider = () => <hr className="my-2 border-gray-100 dark:border-gray-900" />;

// Custom icons for brands
const YCIcon = () => (
  <span className="inline-flex items-center justify-center w-[18px] h-[18px] bg-[#ff6600] text-white text-[10px] font-bold rounded-[2px] mr-1 align-text-bottom">
    Y
  </span>
);

const A16zIcon = () => (
  <span className="inline-flex items-center justify-center w-[18px] h-[18px] bg-[#000000] dark:bg-white dark:text-black text-white text-[7px] font-bold rounded-[2px] mr-1 align-text-bottom">
    a16z
  </span>
);

const ThielIcon = () => (
  <span className="inline-flex items-center justify-center w-[18px] h-[18px] bg-black dark:bg-white text-white dark:text-black text-[5px] font-bold rounded-[2px] mr-1 align-text-bottom leading-[1.1] text-center px-[1px]">
    thiel<br/>fellowship
  </span>
);

const SpeedrunIcon = () => (
  <img 
    src="https://www.google.com/s2/favicons?domain=speedrun.com&sz=32" 
    alt="Speedrun" 
    className="inline-block w-[18px] h-[18px] rounded-[2px] mr-1 align-text-bottom"
  />
);

export default function Home() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [cypherActive, setCypherActive] = useState(false);
  const [nameClicks, setNameClicks] = useState(0);

  // Easter egg: click name 5 times to toggle cypher
  const handleNameClick = () => {
    const newCount = nameClicks + 1;
    if (newCount >= 5) {
      setCypherActive(!cypherActive);
      setNameClicks(0);
    } else {
      setNameClicks(newCount);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  // Caesar cipher - shift a letter by random amount
  const shiftChar = (char: string): string => {
    const lower = 'abcdefghijklmnopqrstuvwxyz';
    const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    
    if (lower.includes(char)) {
      const shift = Math.floor(Math.random() * 25) + 1; // 1-25 shift
      const idx = lower.indexOf(char);
      return lower[(idx + shift) % 26];
    }
    if (upper.includes(char)) {
      const shift = Math.floor(Math.random() * 25) + 1;
      const idx = upper.indexOf(char);
      return upper[(idx + shift) % 26];
    }
    return char; // non-alphabetic characters stay the same
  };

  useEffect(() => {
    if (!mounted) return;
    
    const mainContent = document.getElementById('main-content');
    if (!mainContent) return;

    if (cypherActive) {
      // Walk through all text nodes and wrap each character in a span
      const walker = document.createTreeWalker(
        mainContent,
        NodeFilter.SHOW_TEXT,
        null
      );

      const textNodes: Text[] = [];
      let node;
      while ((node = walker.nextNode())) {
        if (node.textContent && node.textContent.trim()) {
          textNodes.push(node as Text);
        }
      }

      textNodes.forEach((textNode) => {
        const text = textNode.textContent || '';
        const fragment = document.createDocumentFragment();
        
        for (const char of text) {
          if (char === ' ' || char === '\n' || char === '\t') {
            fragment.appendChild(document.createTextNode(char));
          } else {
            const span = document.createElement('span');
            span.className = 'cypher-char';
            span.setAttribute('data-original', char);
            span.textContent = shiftChar(char);
            fragment.appendChild(span);
          }
        }
        
        textNode.parentNode?.replaceChild(fragment, textNode);
      });
    } else {
      // Remove cypher effect - restore original characters
      const cypherChars = mainContent.querySelectorAll('.cypher-char');
      cypherChars.forEach((span) => {
        const original = span.getAttribute('data-original') || span.textContent || '';
        const text = document.createTextNode(original);
        span.parentNode?.replaceChild(text, span);
      });
      
      // Normalize text nodes (merge adjacent text nodes)
      mainContent.normalize();
    }
  }, [cypherActive, mounted]);

  if (!mounted) return null;

  return (
    <main id="main-content" className="text-foreground transition-colors duration-300">
      <header className="mb-2">
        <h1 className="text-[17px] font-semibold flex items-center mb-1">
          <Diamond /> <span 
            onClick={handleNameClick}
            className="underline decoration-1 underline-offset-4 cursor-pointer select-none"
          >Lucas Miranda</span>
        </h1>
        
        <div className="">
          <ListItem>
            Founder <a href="https://www.tryreflex.ai" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">Reflex</a>
          </ListItem>
          <ListItem>
            CS+FINA Concordia University
          </ListItem>
        </div>
      </header>

      <Divider />

      <section>
        <SectionTitle>What makes me different:</SectionTitle>
        <div className="">
          <ListItem>
            Built <a href="https://www.trysonder.ai" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">trysonder.ai</a>, a pentesting agent in your terminal, got <span className="italic font-bold">3K+</span> downloads within <span className="italic font-bold">12h</span> at hackthenorth.
          </ListItem>
          <ListItem>
            The <span className="italic font-bold">fastest</span> in Concordia's <span className="italic font-bold">entire history</span> to get flown out to San Francisco to raise venture.
          </ListItem>
          <ListItem>
            Turned down <span className="italic font-bold">$10M</span> valuation offers to pursue research with MILA.
          </ListItem>
          <ListItem>
            Received full-time interest for: <span className="italic font-bold">$300K</span> founding engineer role, but decided to go all in on winning more hackathons.
          </ListItem>
          <ListItem>
            Programming since <span className="italic font-bold">age 8</span>, entrepreneur since <span className="italic font-bold">age 14</span>.
          </ListItem>
          <ListItem>
            Co-Founder of Canada's premier quant club, QUARCC.
          </ListItem>
          <ListItem>
            made EMJCapital (now trading under SRXH, soon to be EMJX) <span className="italic font-bold">$20M+</span> and sold IP to Ripple corp.
          </ListItem>
          <ListItem>
            Mentored by some <span className="italic font-bold">amazing</span> people. Including founders from <SpeedrunIcon /> speedrun, and <ThielIcon /> Thiel Fellows.
          </ListItem>
          <ListItem>
            <span className="italic font-bold">10x</span> hackathon winner
          </ListItem>
        </div>
      </section>

      <GitHubContributionGraph />

      <section>
        <SectionTitle>Building:</SectionTitle>
        <div className="">
          <ListItem>
            <a href="https://www.trysonder.ai" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">Sonder</a>, an ai agent for pentesting and red-teaming agents.
          </ListItem>
          <ListItem>
            NERV, a BCI for learning, dream recording and sharing.
          </ListItem>
          <ListItem>
            <a href="https://www.tryreflex.ai" target="_blank" rel="noopener noreferrer" className="underline hover:opacity-70">Reflex</a>, data aggregation for humanoid robotics.
          </ListItem>
          <ListItem>
            Mentored by angels from <YCIcon /> Y Combinator, <A16zIcon /> a16z and <ThielIcon /> Thiel Fellows.
          </ListItem>
        </div>
      </section>

      <RevenueChart />

      <Divider />

      <section>
        <SectionTitle>Please reach out if you're</SectionTitle>
        <div className="">
          <ListItem>A fellow founder.</ListItem>
          <ListItem>Someone who is curious about me or what I'm doing.</ListItem>
        </div>
      </section>

      <Divider />

      <footer className="flex justify-between items-center mt-2 pb-4">
        <div className="flex items-center text-[15px]">
          <Diamond /> <span className="mr-3">Contact:</span>
          <a href="https://x.com/quantbagel" target="_blank" rel="noopener noreferrer" className="flex items-center hover:opacity-70 transition-opacity">
            <span className="bg-black dark:bg-white text-white dark:text-black p-[3px] rounded-[3px] mr-2 flex items-center justify-center">
              <X size={12} strokeWidth={3} />
            </span>
            <span>Twitter</span>
          </a>
        </div>
        
        <button 
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="flex items-center text-[15px] hover:opacity-70 transition-opacity"
        >
          {theme === "dark" ? <Sun size={14} className="mr-2" /> : <Moon size={14} className="mr-2" />}
          <span>Dark mode</span>
        </button>
      </footer>
    </main>
  );
}

