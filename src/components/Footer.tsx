import { Github, Linkedin, Mail } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-12 border-t border-border">
      <div className="container px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">
              © {currentYear} <span className="text-primary">Aniruddha Mannur</span>
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/mannuraniruddha"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://www.linkedin.com/in/aniruddha-mannur/"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Linkedin className="w-5 h-5" />
            </a>
            <a
              href="mailto:mannur.aniruddha@gmail.com"
              className="p-2 text-muted-foreground hover:text-primary transition-colors"
            >
              <Mail className="w-5 h-5" />
            </a>
          </div>

          <p className="text-xs text-muted-foreground font-mono">
            Built with React & TypeScript
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
