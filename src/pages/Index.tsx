import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import About from "@/components/About";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  // Check if deployment banner is visible
  const showBanner = import.meta.env.PROD && typeof window !== "undefined" && 
    localStorage.getItem("deployment-banner-dismissed") !== "true";

  return (
    <div className={`min-h-screen bg-background ${showBanner ? "pt-10" : ""}`}>
      <Navbar />
      <main>
        <Hero />
        <Skills />
        <Projects />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
