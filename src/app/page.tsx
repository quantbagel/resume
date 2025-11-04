import FluidCanvasBackground from "@/components/sections/fluid-canvas-background";
import MainContainer from "@/components/layout/main-container";
import HeaderNavigation from "@/components/sections/header-navigation";
import IntroSection from "@/components/sections/intro-section";
import AchievementsSection from "@/components/sections/achievements-section";
import BuildingSection from "@/components/sections/building-section";
import CallToActionSection from "@/components/sections/call-to-action-section";
import FooterContact from "@/components/sections/footer-contact";
import Divider from "@/components/sections/divider";

export default function Home() {
  return (
    <>
      <FluidCanvasBackground />
      <MainContainer>
        <div className="text-sm sm:text-[0.95rem] leading-tight space-y-2">
          <HeaderNavigation />
          <div className="pt-2" />
          <IntroSection />
        </div>
        
        <Divider />
        
        <AchievementsSection />
        
        <Divider />
        
        <BuildingSection />
        
        <Divider />
        
        <CallToActionSection />
        
        <Divider />
        
        <FooterContact />
      </MainContainer>
    </>
  );
}