"use client";

import Image from "next/image";
import { Mail, Github, Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

const FooterContact = () => {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    // Check for saved theme preference or system preference
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = savedTheme === "dark";
    
    setIsDark(prefersDark);
    if (prefersDark) {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newIsDark = !isDark;
    setIsDark(newIsDark);
    
    if (newIsDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <div className="text-sm sm:text-[0.95rem] leading-tight">
      <div className="pt-4" />
      <footer className="pb-16 sm:pb-24">
        <div className="flex items-center justify-between flex-wrap gap-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div>◆ Contact:</div>
            <div className="flex items-center gap-3 text-neutral-700">
              
                <span className="inline-flex items-center align-middle relative -top-[1px]">
                  <Image
                    alt="X"
                    width={18}
                    height={18}
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_4.png"
                    className="h-[18px] w-[18px] object-contain align-middle"
                  />
                </span>
                <span className="hover-underline-nudge">Twitter</span>
             
                
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="inline-flex items-center gap-1 text-sm sm:text-[0.95rem] text-neutral-700 dark:text-neutral-300 hover-underline-nudge whitespace-nowrap"
            aria-label="Toggle theme"
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            <span>{isDark ? "Light mode" : "Dark mode"}</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default FooterContact;