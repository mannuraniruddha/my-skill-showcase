import { useState } from "react";
import { useSkills, SkillWithProjects } from "@/hooks/useSkills";
import SkillCard from "./SkillCard";
import SkillDetailDialog from "./SkillDetailDialog";
import { getIcon } from "@/lib/icons";

const Skills = () => {
  const { data: skills, isLoading } = useSkills();
  const [selectedSkill, setSelectedSkill] = useState<SkillWithProjects | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleSkillClick = (skill: SkillWithProjects) => {
    setSelectedSkill(skill);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedSkill(null);
  };

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

        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-card border border-border rounded-xl animate-pulse" />
            ))}
          </div>
        ) : skills && skills.length > 0 ? (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {skills.map((skill, index) => (
                <SkillCard
                  key={skill.id}
                  title={skill.title}
                  description={skill.description}
                  icon={getIcon(skill.icon)}
                  projectCount={skill.projectCount}
                  projects={skill.projects}
                  delay={index * 0.1}
                  onClick={() => handleSkillClick(skill)}
                />
              ))}
            </div>
            <SkillDetailDialog
              isOpen={isDialogOpen}
              onClose={handleDialogClose}
              skill={selectedSkill ? {
                title: selectedSkill.title,
                description: selectedSkill.description,
                icon: getIcon(selectedSkill.icon),
                projects: selectedSkill.projects,
              } : null}
            />
          </>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p>No skills added yet. Add them from the admin panel.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Skills;
