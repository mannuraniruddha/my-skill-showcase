import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";

interface SkillCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  projectCount: number;
  projects?: string[];
  delay?: number;
}

const SkillCard = ({ title, description, icon: Icon, projectCount, projects = [], delay = 0 }: SkillCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
      className="group relative p-6 rounded-xl bg-card border border-border hover:border-primary/50 transition-all duration-500 shadow-card hover:glow-primary"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative z-10">
        <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors duration-300">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        
        <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
          {title}
        </h3>
        
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          {description}
        </p>

        {projects.length > 0 && (
          <div className="mb-4">
            <p className="text-xs font-mono text-muted-foreground mb-2">Projects:</p>
            <ul className="space-y-1">
              {projects.map((project) => (
                <li key={project} className="text-sm text-foreground">
                  • {project}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
          <span className="px-2 py-1 rounded bg-secondary">
            {projectCount} {projectCount === 1 ? "project" : "projects"}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default SkillCard;
