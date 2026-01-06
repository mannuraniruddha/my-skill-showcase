import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Plus, GripVertical, Trash2, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/hooks/useProjects";
import {
  useContentBlocks,
  useCreateContentBlock,
  useUpdateContentBlock,
  useDeleteContentBlock,
  useReorderContentBlocks,
  type ContentBlock,
} from "@/hooks/useContentBlocks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { useToast } from "@/hooks/use-toast";

const blockTypes = [
  { value: "markdown", label: "Markdown" },
  { value: "code", label: "Code" },
  { value: "output", label: "Output/Console" },
  { value: "image", label: "Image" },
  { value: "text", label: "Plain Text" },
];

const languageOptions = [
  "python",
  "javascript",
  "typescript",
  "html",
  "css",
  "json",
  "bash",
  "sql",
  "go",
  "rust",
  "java",
  "cpp",
  "csharp",
];

interface LocalBlock {
  id: string;
  type: ContentBlock["type"];
  content: string;
  metadata: Record<string, any>;
  order_index: number;
  isNew?: boolean;
}

const ContentEditor = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { data: project, isLoading: projectLoading } = useProject(slug || "");
  const { data: blocks, isLoading: blocksLoading } = useContentBlocks(project?.id || "");
  const createBlock = useCreateContentBlock();
  const updateBlock = useUpdateContentBlock();
  const deleteBlock = useDeleteContentBlock();
  const reorderBlocks = useReorderContentBlocks();
  const { toast } = useToast();

  const [localBlocks, setLocalBlocks] = useState<LocalBlock[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<LocalBlock | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && user && !isAdmin) {
      navigate("/admin");
    }
  }, [user, isAdmin, authLoading, navigate]);

  useEffect(() => {
    if (blocks) {
      setLocalBlocks(
        blocks.map((b) => ({
          id: b.id,
          type: b.type,
          content: b.content,
          metadata: b.metadata || {},
          order_index: b.order_index,
        }))
      );
    }
  }, [blocks]);

  const handleAddBlock = (type: ContentBlock["type"]) => {
    const newBlock: LocalBlock = {
      id: `new-${Date.now()}`,
      type,
      content: "",
      metadata: type === "code" ? { language: "python", filename: "" } : {},
      order_index: localBlocks.length,
      isNew: true,
    };
    setLocalBlocks([...localBlocks, newBlock]);
  };

  const handleUpdateBlock = (id: string, updates: Partial<LocalBlock>) => {
    setLocalBlocks(
      localBlocks.map((b) => (b.id === id ? { ...b, ...updates } : b))
    );
  };

  const handleDeleteBlock = (block: LocalBlock) => {
    setBlockToDelete(block);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!blockToDelete) return;

    if (blockToDelete.isNew) {
      setLocalBlocks(localBlocks.filter((b) => b.id !== blockToDelete.id));
    } else {
      try {
        await deleteBlock.mutateAsync({
          id: blockToDelete.id,
          projectId: project!.id,
        });
        setLocalBlocks(localBlocks.filter((b) => b.id !== blockToDelete.id));
        toast({
          title: "Block deleted",
          description: "Content block has been removed.",
        });
      } catch (error: any) {
        toast({
          title: "Error",
          description: error.message,
          variant: "destructive",
        });
      }
    }

    setDeleteDialogOpen(false);
    setBlockToDelete(null);
  };

  const handleSaveAll = async () => {
    if (!project) return;

    setSaving(true);
    try {
      // Save new blocks
      for (const block of localBlocks.filter((b) => b.isNew)) {
        await createBlock.mutateAsync({
          project_id: project.id,
          type: block.type,
          content: block.content,
          metadata: block.metadata,
          order_index: block.order_index,
        });
      }

      // Update existing blocks
      for (const block of localBlocks.filter((b) => !b.isNew)) {
        await updateBlock.mutateAsync({
          id: block.id,
          content: block.content,
          metadata: block.metadata,
          order_index: block.order_index,
        });
      }

      toast({
        title: "Changes saved",
        description: "All content blocks have been saved.",
      });
    } catch (error: any) {
      toast({
        title: "Error saving",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (
      (direction === "up" && index === 0) ||
      (direction === "down" && index === localBlocks.length - 1)
    ) {
      return;
    }

    const newBlocks = [...localBlocks];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    [newBlocks[index], newBlocks[targetIndex]] = [
      newBlocks[targetIndex],
      newBlocks[index],
    ];

    // Update order_index values
    setLocalBlocks(
      newBlocks.map((b, i) => ({
        ...b,
        order_index: i,
      }))
    );
  };

  if (authLoading || projectLoading || blocksLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Project not found</h1>
          <Button onClick={() => navigate("/admin")}>Back to Admin</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold">{project.title}</h1>
              <p className="text-sm text-muted-foreground">Content Editor</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/projects/${project.slug}`} target="_blank">
              <Button variant="outline" size="sm">
                Preview
              </Button>
            </Link>
            <Button size="sm" onClick={handleSaveAll} disabled={saving}>
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save All"}
            </Button>
          </div>
        </div>
      </header>

      <main className="container px-6 py-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-6"
        >
          {localBlocks.length === 0 ? (
            <div className="bg-card border border-border rounded-lg p-8 text-center">
              <p className="text-muted-foreground mb-4">
                No content blocks yet. Add your first block below.
              </p>
            </div>
          ) : (
            localBlocks.map((block, index) => (
              <motion.div
                key={block.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card border border-border rounded-lg p-4"
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveBlock(index, "up")}
                      disabled={index === 0}
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <GripVertical className="w-4 h-4 text-muted-foreground" />
                    <button
                      onClick={() => moveBlock(index, "down")}
                      disabled={index === localBlocks.length - 1}
                      className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex items-center justify-between">
                      <Select
                        value={block.type}
                        onValueChange={(value) =>
                          handleUpdateBlock(block.id, {
                            type: value as ContentBlock["type"],
                          })
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {blockTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteBlock(block)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>

                    {block.type === "code" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Language</Label>
                          <Select
                            value={block.metadata?.language || "python"}
                            onValueChange={(value) =>
                              handleUpdateBlock(block.id, {
                                metadata: { ...block.metadata, language: value },
                              })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {languageOptions.map((lang) => (
                                <SelectItem key={lang} value={lang}>
                                  {lang}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label>Filename (optional)</Label>
                          <Input
                            value={block.metadata?.filename || ""}
                            onChange={(e) =>
                              handleUpdateBlock(block.id, {
                                metadata: { ...block.metadata, filename: e.target.value },
                              })
                            }
                            placeholder="e.g., main.py"
                          />
                        </div>
                      </div>
                    )}

                    {block.type === "image" && (
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label>Alt Text</Label>
                          <Input
                            value={block.metadata?.alt || ""}
                            onChange={(e) =>
                              handleUpdateBlock(block.id, {
                                metadata: { ...block.metadata, alt: e.target.value },
                              })
                            }
                            placeholder="Image description"
                          />
                        </div>
                        <div>
                          <Label>Caption (optional)</Label>
                          <Input
                            value={block.metadata?.caption || ""}
                            onChange={(e) =>
                              handleUpdateBlock(block.id, {
                                metadata: { ...block.metadata, caption: e.target.value },
                              })
                            }
                            placeholder="Image caption"
                          />
                        </div>
                      </div>
                    )}

                    {block.type === "output" && (
                      <div>
                        <Label>Label (optional)</Label>
                        <Input
                          value={block.metadata?.label || ""}
                          onChange={(e) =>
                            handleUpdateBlock(block.id, {
                              metadata: { ...block.metadata, label: e.target.value },
                            })
                          }
                          placeholder="e.g., Output, Console, Result"
                        />
                      </div>
                    )}

                    <div>
                      <Label>Content</Label>
                      <Textarea
                        value={block.content}
                        onChange={(e) =>
                          handleUpdateBlock(block.id, { content: e.target.value })
                        }
                        placeholder={
                          block.type === "image"
                            ? "Enter image URL..."
                            : block.type === "code"
                            ? "Enter code..."
                            : "Enter content..."
                        }
                        className="font-mono min-h-[120px]"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          )}

          {/* Add Block Buttons */}
          <div className="flex flex-wrap gap-2 justify-center pt-4">
            {blockTypes.map((type) => (
              <Button
                key={type.value}
                variant="outline"
                size="sm"
                onClick={() => handleAddBlock(type.value as ContentBlock["type"])}
              >
                <Plus className="w-4 h-4 mr-2" />
                {type.label}
              </Button>
            ))}
          </div>
        </motion.div>
      </main>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Block</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this content block? This action cannot
              be undone.
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
    </div>
  );
};

export default ContentEditor;
