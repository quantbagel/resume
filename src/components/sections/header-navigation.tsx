import Link from 'next/link';

const HeaderNavigation = () => {
  return (
    <div className="flex items-center justify-between">
      <h1 className="underline underline-offset-[3px] font-extralight">
        ◆ Lance Yan
      </h1>
      <div className="flex items-center gap-2 font-extralight">
        <Link href="/projects" className="hover-underline-nudge nav-bounce">
          Projects
        </Link>
        <span className="text-neutral-400">|</span>
        <Link href="/about" className="hover-underline-nudge nav-bounce-delayed-1">
          About me
        </Link>
        <span className="text-neutral-400">|</span>
        <Link href="/photography" className="hover-underline-nudge nav-bounce-delayed-2">
          Photos
        </Link>
      </div>
    </div>
  );
};

export default HeaderNavigation;