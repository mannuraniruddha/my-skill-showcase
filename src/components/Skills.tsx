import { Code2, FolderKanban, Users, Package } from "lucide-react";
import SkillCard from "./SkillCard";

const skills = [
  {
    title: "Python Development",
    description: "Building robust applications, automation scripts, data analysis tools, and APIs using Python ecosystem.",
    icon: Code2,
    projectCount: 1,
    projects: ["Learn Python"],
  },
  {
    title: "Project/Program Management",
    description: "Leading cross-functional teams, managing timelines, budgets, and delivering complex projects on schedule.",
    icon: FolderKanban,
    projectCount: 0,
  },
  {
    title: "Scrum & Agile",
    description: "Implementing agile methodologies, facilitating ceremonies, and driving continuous improvement.",
    icon: Users,
    projectCount: 0,
  },
  {
    title: "Product Management",
    description: "Defining product vision, roadmaps, gathering requirements, and delivering customer-centric solutions.",
    icon: Package,
    projectCount: 0,
  },
];

const Skills = () => {
  return (
    <section id="skills" className="py-24 bg-gradient-subtle">
      <div className="container px-6">
        <div className="max-w-2xl mb-16">
          <p className="font-mono text-primary text-sm mb-3">// expertise</p>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Skills & Expertise
          </h2>
          <p className="text-muted-foreground leading-relaxed">
            A diverse skill set spanning technical development and leadership, 
            enabling me to bridge the gap between technology and business.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {skills.map((skill, index) => (
            <SkillCard
              key={skill.title}
              {...skill}
              delay={index * 0.1}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Skills;
