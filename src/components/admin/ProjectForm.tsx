import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useCreateProject, useUpdateProject, type ProjectWithSkills } from "@/hooks/useProjects";
import { useSkills } from "@/hooks/useSkills";
import { useToast } from "@/hooks/use-toast";

const projectSchema = z.object({
  title: z.string().min(1, "Title is required"),
  slug: z.string().min(1, "Slug is required").regex(/^[a-z0-9-]+$/, "Slug must be lowercase with hyphens only"),
  description: z.string().min(1, "Description is required"),
  github_url: z.string().url().optional().or(z.literal("")),
  live_url: z.string().url().optional().or(z.literal("")),
  image_url: z.string().url().optional().or(z.literal("")),
  skillIds: z.array(z.string()),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  open: boolean;
  onClose: () => void;
  project?: ProjectWithSkills | null;
}

const ProjectForm = ({ open, onClose, project }: ProjectFormProps) => {
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const { data: skills } = useSkills();
  const { toast } = useToast();

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      slug: "",
      description: "",
      github_url: "",
      live_url: "",
      image_url: "",
      skillIds: [],
    },
  });

  useEffect(() => {
    if (project) {
      form.reset({
        title: project.title,
        slug: project.slug,
        description: project.description,
        github_url: project.github_url || "",
        live_url: project.live_url || "",
        image_url: project.image_url || "",
        skillIds: project.skills.map((s) => s.id),
      });
    } else {
      form.reset({
        title: "",
        slug: "",
        description: "",
        github_url: "",
        live_url: "",
        image_url: "",
        skillIds: [],
      });
    }
  }, [project, form]);

  // Auto-generate slug from title
  const watchTitle = form.watch("title");
  useEffect(() => {
    if (!project && watchTitle) {
      const slug = watchTitle
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
      form.setValue("slug", slug);
    }
  }, [watchTitle, project, form]);

  const onSubmit = async (values: ProjectFormValues) => {
    try {
      const projectData = {
        title: values.title,
        slug: values.slug,
        description: values.description,
        github_url: values.github_url || null,
        live_url: values.live_url || null,
        image_url: values.image_url || null,
      };

      if (project) {
        await updateProject.mutateAsync({
          id: project.id,
          project: projectData,
          skillIds: values.skillIds,
        });
        toast({
          title: "Project updated",
          description: `"${values.title}" has been updated.`,
        });
      } else {
        await createProject.mutateAsync({
          project: projectData,
          skillIds: values.skillIds,
        });
        toast({
          title: "Project created",
          description: `"${values.title}" has been added.`,
        });
      }
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isLoading = createProject.isPending || updateProject.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{project ? "Edit Project" : "Add New Project"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Learn Python" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., learn-python" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe this project..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="github_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GitHub URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://github.com/..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="live_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Live URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image URL (optional)</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="skillIds"
              render={() => (
                <FormItem>
                  <FormLabel>Associated Skills</FormLabel>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {skills?.map((skill) => (
                      <FormField
                        key={skill.id}
                        control={form.control}
                        name="skillIds"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(skill.id)}
                                onCheckedChange={(checked) => {
                                  const current = field.value || [];
                                  if (checked) {
                                    field.onChange([...current, skill.id]);
                                  } else {
                                    field.onChange(
                                      current.filter((id) => id !== skill.id)
                                    );
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal cursor-pointer">
                              {skill.title}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : project ? "Update Project" : "Add Project"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProjectForm;
