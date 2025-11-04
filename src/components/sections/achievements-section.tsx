import Image from "next/image";

const ASSETS = {
  RMC: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_17.png",
  UWATERLOO: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_3.png",
  CLICE: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_1.png",
  ICON: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_6.png",
  KALSHI: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_9.png",
  WATAI: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_10.png",
  FOUNDERS_FUND: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_18.png",
  YC: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_12.png",
  SPEEDRUN: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_13.png",
  ZFELLOWS: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_14.png",
  THIEL: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_15.png",
  LINKEDIN: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_16.png",
  X: "https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_4.png",
};

const AchievementsSection = () => {
  return (
    <div className="text-sm sm:text-[0.95rem] leading-tight space-y-2">
      <div>◆ What makes me different:</div>

      <div>
        ↳ Built{" "}
        <span className="inline-flex items-center align-middle gap-1">
          <span className="inline-flex items-center align-middle relative -top-[1px]">
            <Image
              alt="ratemycompany.ca"
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain align-middle"
              src={ASSETS.RMC}
            />
          </span>
          <span className="relative -top-[1px] leading-none align-middle">
            <a href="https://www.ratemycompany.ca/" target="_blank" rel="noopener noreferrer" className="hover-underline-nudge">
              ratemycompany.ca
            </a>
          </span>
        </span>
        , got <span className="font-bold slight-italic">40K+</span> users and{" "}
        <span className="font-bold slight-italic">2.5M+</span> votes within{" "}
        <span className="font-bold slight-italic">48h</span>.
      </div>
      
      <div className="ml-4">
        ↳ Implemented measures to prevent <span className="font-bold slight-italic">1K+</span> bots from getting their fav
        company on the podium (<span className="font-bold slight-italic">4M+</span> edge requests in{" "}
        <span className="font-bold slight-italic">12h</span>).
      </div>

      <div>
        ↳ The <span className="font-bold slight-italic">fastest</span> in{" "}
        <span className="inline-flex items-center align-middle gap-1">
          <span className="inline-flex items-center align-middle relative -top-[1px]">
            <Image
              alt="UWaterloo"
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain align-middle"
              src={ASSETS.UWATERLOO}
            />
          </span>
          <span className="relative -top-[1px] leading-none align-middle">
            <a href="https://uwaterloo.ca/" target="_blank" rel="noopener noreferrer" className="hover-underline-nudge">
              UWaterloo
            </a>
          </span>
        </span>
        's <span className="font-bold slight-italic">entire history</span> to get flown out to San Francisco to raise
        venture.
      </div>

      <div className="ml-4">
        ↳ Turned down <span className="font-bold slight-italic">$7M</span> valuation offers to build{" "}
        <span className="inline-flex items-center align-middle gap-1">
          <span className="inline-flex items-center align-middle relative -top-[1px]">
            <Image
              alt="Clice"
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain align-middle"
              src={ASSETS.CLICE}
            />
          </span>
          <span className="relative -top-[1px] leading-none align-middle">Clice</span>
        </span>{" "}
        heads-down in Waterloo.
      </div>

      <div>
        ↳ Received full-time interest for: <span className="font-bold slight-italic">$300K</span> founding engineer role and
        another at{" "}
        <span className="inline-flex items-center align-middle gap-1">
          <span className="inline-flex items-center align-middle relative -top-[1px]">
            <Image
              alt="Icon"
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain align-middle"
              src={ASSETS.ICON}
            />
          </span>
          <span className="relative -top-[1px] leading-none align-middle">
            <a href="https://icon.com/" target="_blank" rel="noopener noreferrer" className="hover-underline-nudge">Icon</a>
          </span>
        </span>
        , but decided to go all in on building{" "}
        <span className="inline-flex items-center align-middle gap-1">
          <span className="inline-flex items-center align-middle relative -top-[1px]">
            <Image
              alt="Clice"
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain align-middle"
              src={ASSETS.CLICE}
            />
          </span>
          <span className="relative -top-[1px] leading-none align-middle">Clice</span>
        </span>.
      </div>

      <div>
        ↳ Programming since <span className="font-bold slight-italic">age 5</span>, entrepreneur since{" "}
        <span className="font-bold slight-italic">age 11</span>.
      </div>

      <div>
        ↳ Software Engineer/Builder at{" "}
        <span className="inline-flex items-center align-middle gap-1">
          <span className="inline-flex items-center align-middle relative -top-[1px]">
            <Image
              alt="Kalshi"
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain align-middle"
              src={ASSETS.KALSHI}
            />
          </span>
          <span className="relative -top-[1px] leading-none align-middle">
            <a href="https://kalshi.com/" target="_blank" rel="noopener noreferrer" className="hover-underline-nudge">Kalshi</a>
          </span>
        </span>.
      </div>

      <div className="ml-4">↳ Project dropping soon!</div>

      <div>
        ↳ Lead Software engineer at{" "}
        <span className="inline-flex items-center align-middle gap-1">
          <span className="inline-flex items-center align-middle relative -top-[1px]">
            <Image
              alt="UWaterloo"
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain align-middle"
              src={ASSETS.UWATERLOO}
            />
          </span>
          <span className="relative -top-[1px] leading-none align-middle">
            <a href="https://uwaterloo.ca/" target="_blank" rel="noopener noreferrer" className="hover-underline-nudge">UWaterloo</a>
          </span>
        </span>
        's AI organization,{" "}
        <span className="inline-flex items-center align-middle gap-1">
          <span className="inline-flex items-center align-middle relative -top-[1px]">
            <Image
              alt="wat.ai"
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain align-middle"
              src={ASSETS.WATAI}
            />
          </span>
          <span className="relative -top-[1px] leading-none align-middle">
            <a href="https://watai.ca/" target="_blank" rel="noopener noreferrer" className="hover-underline-nudge">wat.ai</a>
          </span>
        </span>.
      </div>
      
      <div>
        ↳ Growth at{" "}
        <a href="https://www.symbal.ai/" target="_blank" rel="noopener noreferrer" className="hover-underline-nudge">
          Symbal
        </a>
        , backed by Peter Thiel and{" "}
        <span className="inline-flex items-center align-middle gap-1">
          <span className="inline-flex items-center align-middle relative -top-[1px]">
            <Image
              alt="Founders Fund"
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain align-middle"
              src={ASSETS.FOUNDERS_FUND}
            />
          </span>
          <span className="relative -top-[1px] leading-none align-middle">
            <a href="https://foundersfund.com/" target="_blank" rel="noopener noreferrer" className="hover-underline-nudge">
              Founders Fund
            </a>
          </span>
        </span>.
      </div>

      <div>
        ↳ Fellow at{" "}
        <a href="https://www.boardy.ai/" target="_blank" rel="noopener noreferrer" className="hover-underline-nudge">
          Boardy
        </a>
        , Fall 2025 Cohort.
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
        ,{" "}
        <span className="inline-flex items-center align-middle gap-1">
          <span className="inline-flex items-center align-middle relative -top-[1px]">
            <Image
              alt="Z Fellows"
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain align-middle"
              src={ASSETS.ZFELLOWS}
            />
          </span>
          <span className="relative -top-[1px] leading-none align-middle">
            <a href="https://www.zfellows.com/" target="_blank" rel="noopener noreferrer" className="hover-underline-nudge">
              Z Fellows
            </a>
          </span>
        </span>{" "}
        and{" "}
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
              Thiel Fellowship
            </a>
          </span>
        </span>.
      </div>
      
      <div>
        ↳ <span className="font-bold slight-italic">3000+</span> followers on{" "}
        <span className="inline-flex items-center align-middle gap-1">
          <span className="inline-flex items-center align-middle relative -top-[1px]">
            <Image
              alt="LinkedIn"
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain align-middle"
              src={ASSETS.LINKEDIN}
            />
          </span>
          <span className="relative -top-[1px] leading-none align-middle">
            <a
              href="https://www.linkedin.com/in/lance-yan/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover-underline-nudge"
            >
              LinkedIn
            </a>
          </span>
        </span>
        , <span className="font-bold slight-italic">1400+</span> followers on{" "}
        <span className="inline-flex items-center align-middle gap-1">
          <span className="relative -top-[1px]">
            <span className="inline-flex items-center align-middle relative -top-[1px]">
              <Image
                alt="X"
                width={18}
                height={18}
                className="h-[18px] w-[18px] object-contain align-middle"
                src={ASSETS.X}
              />
            </span>
          </span>
        </span>
        , with posts totaling <span className="font-bold slight-italic">1.6M+</span> views.
      </div>
    </div>
  );
};

export default AchievementsSection;