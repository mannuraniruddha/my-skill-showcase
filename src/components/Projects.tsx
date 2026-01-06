import { motion } from "framer-motion";
import { FolderOpen } from "lucide-react";

// Example projects - you'll replace these with your real projects
const projects = [
  // Add your projects here following this structure:
  // {
  //   title: "Project Name",
  //   description: "Brief description of what the project does.",
  //   tags: ["Python", "API", "Automation"],
  //   githubUrl: "https://github.com/yourusername/project",
  //   liveUrl: "https://project-demo.com",
  //   category: "python" // or "pm", "scrum", "product"
  // },
];

const Projects = () => {
  const isEmpty = projects.length === 0;

  return (
    <section id="projects" className="py-24">
      <div className="container px-6">
        <div className="max-w-2xl mb-16">
          <p className="font-mono text-primary text-sm mb-3">// portfolio</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Projects & Case Studies
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            Explore my work across development, project management, and product leadership.
            Each project demonstrates practical application of my skills.
          </p>
        </div>

        {isEmpty ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center justify-center py-20 px-6 rounded-xl border border-dashed border-border bg-card/50"
          >
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-6">
              <FolderOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold mb-2 text-center">
              Projects Coming Soon
            </h3>
            <p className="text-muted-foreground text-center max-w-md">
              This is where your projects and case studies will appear. 
              Connect your GitHub to start showcasing your work.
            </p>
            <div className="mt-6 font-mono text-xs text-muted-foreground bg-secondary px-4 py-2 rounded-lg">
              // Add projects in src/components/Projects.tsx
            </div>
          </motion.div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Projects will be mapped here */}
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;
