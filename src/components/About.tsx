import { motion } from "framer-motion";

const About = () => {
  return (
    <section id="about" className="py-24 bg-gradient-subtle">
      <div className="container px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="font-mono text-primary text-sm mb-3">// about me</p>
            <h2 className="text-3xl md:text-4xl font-bold mb-8">
              Background & Experience
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="prose prose-invert max-w-none"
          >
            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  I'm a versatile technologist with a passion for building solutions 
                  that make a real impact. My journey spans from writing clean Python code 
                  to leading complex programs and shaping product strategies.
                </p>
                <p>
                  With expertise in <span className="text-foreground font-medium">Agile/Scrum methodologies</span>, 
                  I bridge the gap between technical teams and business stakeholders, 
                  ensuring projects deliver value efficiently.
                </p>
                <p>
                  Whether it's automating workflows, managing cross-functional teams, 
                  or defining product roadmaps, I bring a unique blend of technical 
                  depth and strategic thinking to every challenge.
                </p>
              </div>

              <div className="space-y-6">
                <div className="p-4 rounded-lg bg-card border border-border">
                  <h4 className="font-mono text-sm text-primary mb-3">// tech stack</h4>
                  <div className="flex flex-wrap gap-2">
                    {["Python", "SQL", "Git", "Jira", "Confluence", "Azure DevOps"].map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 text-xs rounded bg-secondary text-muted-foreground"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-card border border-border">
                  <h4 className="font-mono text-sm text-primary mb-3">// certifications</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Certified Scrum Master</li>
                    <li>• PMP / CAPM</li>
                    <li>• Product Owner Certified</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;
