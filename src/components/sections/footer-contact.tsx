"use client";

import Image from "next/image";
import { Mail, Github, Moon } from "lucide-react";

const FooterContact = () => {
  return (
    <div className="text-sm sm:text-[0.95rem] leading-tight">
      <div className="pt-4" />
      <footer className="pb-16 sm:pb-24">
        <div className="flex items-center justify-between flex-wrap gap-y-4">
          <div className="flex items-center gap-3 flex-wrap">
            <div>◆ Contact:</div>
            <div className="flex items-center gap-3 text-neutral-700">
              <a
                className="inline-flex items-center gap-1"
                href="mailto:lance.yan.business@gmail.com"
              >
                <Mail size={14} />
                <span className="hover-underline-nudge">Email</span>
              </a>
              <a
                className="inline-flex items-center gap-1"
                href="https://github.com/lance116"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Github size={14} />
                <span className="hover-underline-nudge">GitHub</span>
              </a>
              <a
                className="inline-flex items-center gap-1"
                href="https://x.com/cnnguan/"
                target="_blank"
                rel="noopener noreferrer"
              >
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
              </a>
              <a
                className="inline-flex items-center gap-1"
                href="https://www.linkedin.com/in/lance-yan/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="inline-flex items-center align-middle relative -top-[1px]">
                  <Image
                    alt="LinkedIn"
                    width={18}
                    height={18}
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_18.png"
                    className="h-[18px] w-[18px] object-contain align-middle"
                  />
                </span>
                <span className="hover-underline-nudge">LinkedIn</span>
              </a>
            </div>
          </div>
          <button
            className="inline-flex items-center gap-1 text-sm sm:text-[0.95rem] text-neutral-700 hover-underline-nudge whitespace-nowrap"
            aria-label="Toggle theme"
          >
            <Moon size={14} />
            <span>Dark mode</span>
          </button>
        </div>
      </footer>
    </div>
  );
};

export default FooterContact;