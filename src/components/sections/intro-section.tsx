import Image from 'next/image';
import React from 'react';

const IntroSection = () => {
  return (
    <>
      <div>
        ↳ Founder{' '}
        <span className="inline-flex items-center align-middle gap-1">
          <span className="inline-flex items-center align-middle relative -top-[1px]">
            <Image
              alt="Sonder Research Inc."
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain align-middle"
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_1.png"
            />
          </span>
          <span className="relative -top-[1px] leading-none align-middle">
            Sonder Research Inc.
          </span>
        </span>
      </div>
      <div>
        ↳ CS{' '}
        <span className="inline-flex items-center align-middle gap-1">
          <span className="inline-flex items-center align-middle relative -top-[1px]">
            <Image
              alt="Concordia University"
              width={18}
              height={18}
              className="h-[18px] w-[18px] object-contain align-middle"
              src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/38cbc1ad-46c2-44a1-9841-5d9b0339ddb7-lanceyan-tech/assets/images/images_3.png"
            />
          </span>
          <span className="relative -top-[1px] leading-none align-middle">
            <a href="https://www.concordia.ca/" className="hover-underline-nudge">
              Concordia University
            </a>
          </span>
        </span>
      </div>
    </>
  );
};

export default IntroSection;