import { useState } from "react";
import { motion } from "framer-motion";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useSkills, useDeleteSkill, type SkillWithProjects } from "@/hooks/useSkills";
import { getIcon } from "@/lib/icons";
import SkillForm from "./SkillForm";
import { useToast } from "@/hooks/use-toast";

const SkillsManager = () => {
  const { data: skills, isLoading } = useSkills();
  const deleteSkill = useDeleteSkill();
  const { toast } = useToast();

  const [formOpen, setFormOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<SkillWithProjects | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<SkillWithProjects | null>(null);

  const handleEdit = (skill: SkillWithProjects) => {
    setEditingSkill(skill);
    setFormOpen(true);
  };

  const handleDelete = (skill: SkillWithProjects) => {
    setSkillToDelete(skill);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!skillToDelete) return;

    try {
      await deleteSkill.mutateAsync(skillToDelete.id);
      toast({
        title: "Skill deleted",
        description: `"${skillToDelete.title}" has been removed.`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setSkillToDelete(null);
    }
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingSkill(null);
  };

  if (isLoading) {
    return (
      <div className="animate-pulse text-muted-foreground">Loading skills...</div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Skills & Expertise</h2>
        <Button onClick={() => setFormOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Skill
        </Button>
      </div>

      {skills && skills.length > 0 ? (
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Icon</TableHead>
                <TableHead>Title</TableHead>
                <TableHead className="hidden md:table-cell">Description</TableHead>
                <TableHead>Projects</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skills.map((skill) => {
                const Icon = getIcon(skill.icon);
                return (
                  <TableRow key={skill.id}>
                    <TableCell>
                      <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{skill.title}</TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground max-w-xs truncate">
                      {skill.description}
                    </TableCell>
                    <TableCell>{skill.projectCount}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(skill)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(skill)}
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-lg p-8 text-center">
          <p className="text-muted-foreground mb-4">No skills added yet.</p>
          <Button onClick={() => setFormOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Your First Skill
          </Button>
        </div>
      )}

      <SkillForm
        open={formOpen}
        onClose={handleFormClose}
        skill={editingSkill}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Skill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{skillToDelete?.title}"? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

export default SkillsManager;
