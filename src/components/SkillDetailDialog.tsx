import { Link } from "react-router-dom";
import { LucideIcon, ArrowRight, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface Project {
  id: string;
  title: string;
  slug: string;
}

interface SkillDetailDialogProps {
  isOpen: boolean;
  onClose: () => void;
  skill: {
    title: string;
    description: string;
    icon: LucideIcon;
    projects: Project[];
  } | null;
}

const SkillDetailDialog = ({ isOpen, onClose, skill }: SkillDetailDialogProps) => {
  if (!skill) return null;

  const Icon = skill.icon;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-lg bg-primary/10 flex items-center justify-center">
              <Icon className="w-7 h-7 text-primary" />
            </div>
            <DialogTitle className="text-2xl font-bold">{skill.title}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-4">
          <p className="text-muted-foreground leading-relaxed">
            {skill.description}
          </p>

          {skill.projects.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-mono text-primary">// related projects</h4>
              <div className="space-y-2">
                {skill.projects.map((project, index) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={`/projects/${project.slug}`}
                      onClick={onClose}
                      className="group flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
                    >
                      <span className="font-medium group-hover:text-primary transition-colors">
                        {project.title}
                      </span>
                      <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </Link>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {skill.projects.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No projects linked to this skill yet.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SkillDetailDialog;
