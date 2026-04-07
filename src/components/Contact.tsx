import { motion } from "framer-motion";
import { Github, Linkedin, Mail, ArrowUpRight } from "lucide-react";

const Contact = () => {
  return (
    <section id="contact" className="py-24">
      <div className="container px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-mono text-primary text-sm mb-3">// get in touch</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Let's Connect
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-10">
              Interested in collaborating or have a question? 
              I'm always open to discussing new opportunities and ideas.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <a
              href="mailto:mannur.aniruddha@gmail.com"
              className="group flex items-center gap-3 px-6 py-3 rounded-lg bg-gradient-primary text-primary-foreground font-medium transition-all duration-300 hover:glow-primary"
            >
              <Mail className="w-5 h-5" />
              <span>Send an Email</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <a
              href="https://github.com/mannuraniruddha"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-6 py-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-all duration-300"
            >
              <Github className="w-5 h-5" />
              <span>View GitHub</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>

            <a
              href="https://www.linkedin.com/in/aniruddha-mannur/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-3 px-6 py-3 rounded-lg bg-card border border-border hover:border-primary/50 transition-all duration-300"
            >
              <Linkedin className="w-5 h-5" />
              <span>LinkedIn</span>
              <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
