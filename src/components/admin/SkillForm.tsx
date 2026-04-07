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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateSkill, useUpdateSkill, type SkillWithProjects } from "@/hooks/useSkills";
import { iconNames, getIcon } from "@/lib/icons";
import { useToast } from "@/hooks/use-toast";

const skillSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  icon: z.string().min(1, "Icon is required"),
});

type SkillFormValues = z.infer<typeof skillSchema>;

interface SkillFormProps {
  open: boolean;
  onClose: () => void;
  skill?: SkillWithProjects | null;
}

const SkillForm = ({ open, onClose, skill }: SkillFormProps) => {
  const createSkill = useCreateSkill();
  const updateSkill = useUpdateSkill();
  const { toast } = useToast();

  const form = useForm<SkillFormValues>({
    resolver: zodResolver(skillSchema),
    defaultValues: {
      title: "",
      description: "",
      icon: "Code2",
    },
  });

  useEffect(() => {
    if (skill) {
      form.reset({
        title: skill.title,
        description: skill.description,
        icon: skill.icon,
      });
    } else {
      form.reset({
        title: "",
        description: "",
        icon: "Code2",
      });
    }
  }, [skill, form]);

  const onSubmit = async (values: SkillFormValues) => {
    try {
      if (skill) {
        await updateSkill.mutateAsync({ id: skill.id, title: values.title, description: values.description, icon: values.icon });
        toast({
          title: "Skill updated",
          description: `"${values.title}" has been updated.`,
        });
      } else {
        await createSkill.mutateAsync({
          title: values.title,
          description: values.description,
          icon: values.icon,
        });
        toast({
          title: "Skill created",
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

  const isLoading = createSkill.isPending || updateSkill.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{skill ? "Edit Skill" : "Add New Skill"}</DialogTitle>
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
                    <Input placeholder="e.g., Python Development" {...field} />
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
                      placeholder="Describe this skill..."
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
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an icon" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {iconNames.map((name) => {
                        const Icon = getIcon(name);
                        return (
                          <SelectItem key={name} value={name}>
                            <div className="flex items-center gap-2">
                              <Icon className="w-4 h-4" />
                              <span>{name}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : skill ? "Update Skill" : "Add Skill"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default SkillForm;
