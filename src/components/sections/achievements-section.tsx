import Image from "next/image";

const ASSETS = {
  RMC: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_17.png",
  UWATERLOO: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_3.png",
  WATAI: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_10.png",
  YC: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_12.png",
  SPEEDRUN: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_13.png",
  THIEL: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_15.png",
};

const AchievementsSection = () => {
  return (
    <div className="text-sm sm:text-[0.95rem] leading-tight space-y-2">
      <div>◆ What makes me different:</div>

      <div>
        ↳ Built{" "}
        <a href="https://www.ratemycompany.ca/" target="_blank" rel="noopener noreferrer" className="hover-underline-nudge">
          chipmunk.ai
        </a>
        , a pentesting agent in your terminal, got <span className="font-bold slight-italic">3K+</span> users within{" "}
        <span className="font-bold slight-italic">12h</span> at{" "}
        <a href="https://hackthenorth.com/" target="_blank" rel="noopener noreferrer" className="hover-underline-nudge">
          hackthenorth
        </a>.
      </div>

      <div>
        ↳ The <span className="font-bold slight-italic">fastest</span> in{" "}
        <a href="https://www.concordia.ca/" target="_blank" rel="noopener noreferrer" className="hover-underline-nudge">
          Concordia
        </a>
        's <span className="font-bold slight-italic">entire history</span> to get flown out to San Francisco to raise venture.
      </div>

      <div>
        ↳ Turned down <span className="font-bold slight-italic">$10M</span> valuation offers to pursue research at{" "}
        <a href="https://mila.quebec/en" target="_blank" rel="noopener noreferrer" className="hover-underline-nudge">
          MILA
        </a>.
      </div>

      <div>
        ↳ Received full-time interest for: <span className="font-bold slight-italic">$300K</span> founding engineer role, but decided to go all in on winning more hackathons.
      </div>

      <div>
        ↳ Programming since <span className="font-bold slight-italic">age 8</span>, entrepreneur since{" "}
        <span className="font-bold slight-italic">age 14</span>.
      </div>

      <div>
        ↳ Co-Founder of Canada's premier quant club,{" "}
        <span className="inline-flex items-center align-middle gap-1">
          <span className="inline-flex items-center align-middle relative -top-[1px]">
            <Image
              alt="QUARCC"
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain align-middle"
              src={ASSETS.WATAI}
            />
          </span>
          <span className="relative -top-[1px] leading-none align-middle">
            <a href="https://quarcc.com/" target="_blank" rel="noopener noreferrer" className="hover-underline-nudge">
              QUARCC
            </a>
          </span>
        </span>.
      </div>

      <div>
        ↳ made EMJCapital <span className="font-bold slight-italic">$100M+</span> and sold IP to Ripple corp.
      </div>

      <div className="leading-[1.4]">
        ↳ Mentored by some <span className="font-bold slight-italic">amazing</span> people. Including founders from{" "}
        <span className="inline-flex items-center align-middle gap-1">
          <span className="inline-flex items-center align-middle relative -top-[1px]">
            <Image
              alt="YC"
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain align-middle"
              src={ASSETS.YC}
            />
          </span>
          <span className="relative -top-[1px] leading-none align-middle">
            <a href="https://www.ycombinator.com/" target="_blank" rel="noopener noreferrer" className="hover-underline-nudge">
              Y Combinator
            </a>
          </span>
        </span>
        ,{" "}
        <span className="inline-flex items-center align-middle gap-1">
          <span className="inline-flex items-center align-middle relative -top-[1px]">
            <Image
              alt="speedrun"
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain align-middle"
              src={ASSETS.SPEEDRUN}
            />
          </span>
          <span className="relative -top-[1px] leading-none align-middle">
            <a href="https://speedrun.a16z.com/" target="_blank" rel="noopener noreferrer" className="hover-underline-nudge">
              speedrun
            </a>
          </span>
        </span>
        , and{" "}
        <span className="inline-flex items-center align-middle gap-1">
          <span className="inline-flex items-center align-middle relative -top-[1px]">
            <Image
              alt="Thiel Fellows"
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain align-middle"
              src={ASSETS.THIEL}
            />
          </span>
          <span className="relative -top-[1px] leading-none align-middle">
            <a href="https://thielfellowship.org/" target="_blank" rel="noopener noreferrer" className="hover-underline-nudge">
              Thiel Fellows
            </a>
          </span>
        </span>.
      </div>

      <div>
        ↳ <span className="font-bold slight-italic">10x</span> hackathon winner
      </div>
    </div>
  );
};

export default AchievementsSection;