import Image from "next/image";

interface LogoTextProps {
  imgSrc: string;
  imgAlt: string;
  text: string;
  href?: string;
}

const LogoText = ({ imgSrc, imgAlt, text, href }: LogoTextProps) => {
  const textElement = href ? (
    <a href={href} className="hover-underline-nudge" target="_blank" rel="noopener noreferrer">
      {text}
    </a>
  ) : (
    <>{text}</>
  );

  return (
    <span className="inline-flex items-center align-middle gap-1">
      <span className="inline-flex items-center align-middle relative -top-[1px]">
        <Image
          alt={imgAlt}
          width={18}
          height={18}
          className="h-[18px] w-[18px] object-contain align-middle"
          src={imgSrc}
        />
      </span>
      <span className="relative -top-[1px] leading-none align-middle">{textElement}</span>
    </span>
  );
};

const BuildingSection = () => {
    return (
        <div className="text-sm sm:text-[0.95rem] leading-tight space-y-2">
            <div>◆ Building:</div>
            
            <div>
                ↳ Chipmunk, an ai agent for pentesting and red-teaming agents.
            </div>

            <div>
                ↳ NERV, a BCI for learning, dream recording and sharing.
            </div>

            <div>
                ↳ Reflex, data aggregation for humanoid robotics.
            </div>

            <div>
                ↳ Backed by angels from <LogoText 
                    imgSrc="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_10.png"
                    imgAlt="Y Combinator"
                    text="Y Combinator"
                    href="https://www.ycombinator.com/"
                />, <LogoText 
                    imgSrc="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_7.png"
                    imgAlt="a16z"
                    text="a16z"
                    href="https://a16z.com/"
                /> and <LogoText 
                    imgSrc="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_4.png"
                    imgAlt="Thiel Fellows"
                    text="Thiel Fellows"
                    href="https://thielfellowship.org/"
                />.
            </div>
        </div>
    );
};

export default BuildingSection;