import { FolderOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useProjects } from "@/hooks/useProjects";
import ProjectCard from "./ProjectCard";

const Projects = () => {
  const { data: projects, isLoading } = useProjects();

  return (
    <section id="projects" className="py-24">
      <div className="container px-6">
        <div className="max-w-2xl mb-16">
          <p className="font-mono text-primary text-sm mb-3">// portfolio</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Featured Projects
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A collection of projects showcasing my skills and experience across
            different domains.
          </p>
        </div>

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-64 bg-card border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : projects && projects.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <Link key={project.id} to={`/projects/${project.slug}`}>
                <ProjectCard
                  title={project.title}
                  description={project.description}
                  tags={project.skills.map((s) => s.title)}
                  githubUrl={project.github_url || undefined}
                  liveUrl={project.live_url || undefined}
                  imageUrl={project.image_url || undefined}
                  delay={index * 0.1}
                />
              </Link>
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
              <FolderOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Projects Coming Soon</h3>
            <p className="text-muted-foreground max-w-md">
              I'm currently working on some exciting projects. Check back soon
              to see what I've been building!
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Projects;
