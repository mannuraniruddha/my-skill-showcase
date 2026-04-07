import { motion } from "framer-motion";
import { Github, Linkedin, Mail, ChevronDown } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }} />
      </div>

      <div className="container relative z-10 px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="max-w-4xl mx-auto text-center"
        >
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="font-mono text-primary mb-4 text-sm tracking-wider"
          >
            &lt;hello world /&gt;
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6"
          >
            I'm <span className="text-gradient">Aniruddha Mannur</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto leading-relaxed"
          >
            A passionate technologist specializing in{" "}
            <span className="text-foreground font-medium">Python</span>,{" "}
            <span className="text-foreground font-medium">Project Management</span>,{" "}
            <span className="text-foreground font-medium">Agile/Scrum</span>, and{" "}
            <span className="text-foreground font-medium">Product Development</span>.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center gap-4"
          >
            <a
              href="https://github.com/mannuraniruddha"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg bg-card hover:bg-secondary border border-border transition-all duration-300 hover:glow-primary hover:border-primary/50 group"
            >
              <Github className="w-5 h-5 group-hover:text-primary transition-colors" />
            </a>
            <a
              href="https://www.linkedin.com/in/aniruddha-mannur/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-lg bg-card hover:bg-secondary border border-border transition-all duration-300 hover:glow-primary hover:border-primary/50 group"
            >
              <Linkedin className="w-5 h-5 group-hover:text-primary transition-colors" />
            </a>
            <a
              href="mailto:mannur.aniruddha@gmail.com"
              className="p-3 rounded-lg bg-card hover:bg-secondary border border-border transition-all duration-300 hover:glow-primary hover:border-primary/50 group"
            >
              <Mail className="w-5 h-5 group-hover:text-primary transition-colors" />
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <button 
            onClick={() => {
              const element = document.getElementById("skills");
              if (element) {
                const offset = 80;
                const elementPosition = element.getBoundingClientRect().top + window.scrollY;
                window.scrollTo({
                  top: elementPosition - offset,
                  behavior: "smooth",
                });
              }
            }}
            className="flex flex-col items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <span className="text-xs font-mono">scroll</span>
            <ChevronDown className="w-5 h-5 animate-bounce" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
