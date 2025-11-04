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
                ↳ <LogoText 
                    imgSrc="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_2.png" 
                    imgAlt="Clice" 
                    text="Clice" 
                   />. AI agents for the lending industry.
            </div>

            <div className="ml-4">
                ↳ Backed by angels from <LogoText 
                    imgSrc="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_14.png"
                    imgAlt="Y Combinator"
                    text="Y Combinator"
                    href="https://www.ycombinator.com/"
                />, <LogoText 
                    imgSrc="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_7.png"
                    imgAlt="a16z"
                    text="a16z"
                    href="https://a16z.com/"
                />, and <LogoText 
                    imgSrc="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_1.png"
                    imgAlt="Soma Capital"
                    text="Soma Capital"
                    href="https://somacap.com/featured"
                />.
            </div>
            
            <div className="ml-4">
                 ↳ Backed by my own school, <LogoText 
                    imgSrc="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_3.png"
                    imgAlt="UWaterloo"
                    text="UWaterloo"
                    href="https://uwaterloo.ca/"
                />'s <LogoText 
                    imgSrc="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_8.png"
                    imgAlt="Velocity Fund"
                    text="Velocity Fund"
                    href="https://velocity.fund/"
                />.
            </div>

            <div className="ml-8">
                 ↳ Invited to <LogoText 
                    imgSrc="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_8.png"
                    imgAlt="Velocity Incubator"
                    text="Velocity Incubator"
                    href="https://www.velocityincubator.com/"
                />'s Winter 2025 cohort.
            </div>

            <div>
                ↳ <LogoText 
                    imgSrc="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_12.png"
                    imgAlt="ratemycompany.ca"
                    text="ratemycompany.ca"
                    href="https://www.ratemycompany.ca/"
                />. Startups leaderboard coming soon. 👀
            </div>

            <div className="ml-4">
                ↳ If you want your high-growth startup added please contact me!
            </div>
        </div>
    );
};

export default BuildingSection;