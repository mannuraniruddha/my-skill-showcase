import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Plus,
  GripVertical,
  Trash2,
  Save,
  Eye,
  Upload,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useProject } from "@/hooks/useProjects";
import {
  useContentBlocks,
  useCreateContentBlock,
  useUpdateContentBlock,
  useDeleteContentBlock,
  type ContentBlock,
} from "@/hooks/useContentBlocks";
import { useImageUpload } from "@/hooks/useImageUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CodeTextarea } from "@/components/ui/code-textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
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
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/ui/rich-text-editor";
import ContentRenderer from "@/components/content-blocks/ContentRenderer";

const blockTypes = [
  { value: "markdown", label: "Markdown" },
  { value: "code", label: "Code" },
  { value: "output", label: "Output/Console" },
  { value: "image", label: "Image" },
  { value: "text", label: "Plain Text" },
  { value: "spacer", label: "Spacer" },
  { value: "divider", label: "Divider" },
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
  isDirty?: boolean;
}

const ContentEditor = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user, isAdmin, loading: authLoading } = useAuth();
  const { data: project, isLoading: projectLoading } = useProject(slug || "");
  const { data: blocks, isLoading: blocksLoading } = useContentBlocks(
    project?.id || ""
  );
  const createBlock = useCreateContentBlock();
  const updateBlock = useUpdateContentBlock();
  const deleteBlock = useDeleteContentBlock();
  const { uploadImage, isUploading } = useImageUpload();
  const { toast } = useToast();

  const [localBlocks, setLocalBlocks] = useState<LocalBlock[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [blockToDelete, setBlockToDelete] = useState<LocalBlock | null>(null);
  const [saving, setSaving] = useState(false);
  const [expandedLevels, setExpandedLevels] = useState<Record<string, string[]>>({});

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
    let defaultMetadata: Record<string, any> = {};
    if (type === "code") {
      defaultMetadata = { language: "python", filename: "", levels: {} };
    } else if (type === "spacer") {
      defaultMetadata = { height: "medium" };
    } else if (type === "divider") {
      defaultMetadata = { style: "solid" };
    }

    const newBlock: LocalBlock = {
      id: `new-${Date.now()}`,
      type,
      content: "",
      metadata: defaultMetadata,
      order_index: localBlocks.length,
      isNew: true,
      isDirty: true,
    };
    setLocalBlocks([...localBlocks, newBlock]);
  };

  const handleUpdateBlock = useCallback(
    (id: string, updates: Partial<LocalBlock>) => {
      setLocalBlocks((prev) =>
        prev.map((b) =>
          b.id === id ? { ...b, ...updates, isDirty: true } : b
        )
      );
    },
    []
  );

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
      const dirtyBlocks = localBlocks.filter((b) => b.isDirty || b.isNew);

      // Save new blocks
      for (const block of dirtyBlocks.filter((b) => b.isNew)) {
        await createBlock.mutateAsync({
          project_id: project.id,
          type: block.type,
          content: block.content,
          metadata: block.metadata,
          order_index: block.order_index,
        });
      }

      // Update existing dirty blocks
      for (const block of dirtyBlocks.filter((b) => !b.isNew)) {
        await updateBlock.mutateAsync({
          id: block.id,
          content: block.content,
          metadata: block.metadata,
          order_index: block.order_index,
        });
      }

      // Clear dirty flags
      setLocalBlocks((prev) =>
        prev.map((b) => ({ ...b, isDirty: false, isNew: false }))
      );

      toast({
        title: "Changes saved",
        description: `${dirtyBlocks.length} block(s) saved successfully.`,
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

    setLocalBlocks(
      newBlocks.map((b, i) => ({
        ...b,
        order_index: i,
        isDirty: true,
      }))
    );
  };

  const handleImageUploadForBlock = async (
    blockId: string,
    file: File
  ) => {
    const url = await uploadImage(file);
    if (url) {
      handleUpdateBlock(blockId, { content: url });
    }
  };

  const toggleLevelExpansion = (blockId: string, level: string) => {
    setExpandedLevels((prev) => {
      const current = prev[blockId] || [];
      if (current.includes(level)) {
        return { ...prev, [blockId]: current.filter((l) => l !== level) };
      }
      return { ...prev, [blockId]: [...current, level] };
    });
  };

  const updateCodeLevel = (
    blockId: string,
    level: string,
    code: string
  ) => {
    const block = localBlocks.find((b) => b.id === blockId);
    if (!block) return;

    const newLevels = {
      ...(block.metadata?.levels || {}),
      [level]: code,
    };

    handleUpdateBlock(blockId, {
      metadata: { ...block.metadata, levels: newLevels },
      // Also update main content to first non-empty level for fallback
      content:
        newLevels.beginner ||
        newLevels.intermediate ||
        newLevels.expert ||
        block.content,
    });
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

  const dirtyCount = localBlocks.filter((b) => b.isDirty || b.isNew).length;

  // Convert local blocks to ContentBlock format for preview
  const previewBlocks: ContentBlock[] = localBlocks.map((b) => ({
    id: b.id,
    project_id: project.id,
    type: b.type,
    content: b.content,
    metadata: b.metadata,
    order_index: b.order_index,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));

  return (
    <div className="h-screen flex flex-col bg-background">
      <header className="border-b border-border bg-card flex-shrink-0">
        <div className="container px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/admin")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="font-semibold">{project.title}</h1>
              <p className="text-sm text-muted-foreground">
                Content Editor
                {dirtyCount > 0 && (
                  <span className="ml-2 text-primary">
                    ({dirtyCount} unsaved)
                  </span>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to={`/projects/${project.slug}`} target="_blank">
              <Button variant="outline" size="sm">
                <Eye className="w-4 h-4 mr-2" />
                Preview
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={handleSaveAll}
              disabled={saving || dirtyCount === 0}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? "Saving..." : "Save All"}
            </Button>
          </div>
        </div>
      </header>

      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Editor Panel */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full overflow-y-auto">
            <div className="p-6 space-y-6">
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
                      className={`bg-card border rounded-lg p-4 ${
                        block.isDirty ? "border-primary/50" : "border-border"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => moveBlock(index, "up")}
                            disabled={index === 0}
                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <GripVertical className="w-4 h-4 text-muted-foreground" />
                          <button
                            onClick={() => moveBlock(index, "down")}
                            disabled={index === localBlocks.length - 1}
                            className="p-1 text-muted-foreground hover:text-foreground disabled:opacity-30"
                          >
                            <ChevronDown className="w-4 h-4" />
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

                          {/* Code block with multi-level tabs */}
                          {block.type === "code" && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Language</Label>
                                  <Select
                                    value={block.metadata?.language || "python"}
                                    onValueChange={(value) =>
                                      handleUpdateBlock(block.id, {
                                        metadata: {
                                          ...block.metadata,
                                          language: value,
                                        },
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
                                        metadata: {
                                          ...block.metadata,
                                          filename: e.target.value,
                                        },
                                      })
                                    }
                                    placeholder="e.g., main.py"
                                  />
                                </div>
                              </div>

                              {/* Code levels */}
                              <div className="space-y-2">
                                <Label>Code Levels</Label>
                                {(["beginner", "intermediate", "expert"] as const).map(
                                  (level) => {
                                    const isExpanded = (
                                      expandedLevels[block.id] || []
                                    ).includes(level);
                                    const levelCode =
                                      block.metadata?.levels?.[level] || "";
                                    const hasContent = levelCode.trim().length > 0;

                                    return (
                                      <Collapsible
                                        key={level}
                                        open={isExpanded}
                                        onOpenChange={() =>
                                          toggleLevelExpansion(block.id, level)
                                        }
                                      >
                                        <CollapsibleTrigger className="flex items-center justify-between w-full px-3 py-2 bg-secondary/50 rounded-lg hover:bg-secondary">
                                          <span
                                            className={`text-sm font-medium capitalize ${
                                              level === "beginner"
                                                ? "text-green-400"
                                                : level === "intermediate"
                                                ? "text-yellow-400"
                                                : "text-red-400"
                                            }`}
                                          >
                                            {level}
                                            {hasContent && (
                                              <span className="ml-2 text-xs text-muted-foreground">
                                                ({levelCode.split("\n").length} lines)
                                              </span>
                                            )}
                                          </span>
                                          {isExpanded ? (
                                            <ChevronUp className="w-4 h-4" />
                                          ) : (
                                            <ChevronDown className="w-4 h-4" />
                                          )}
                                        </CollapsibleTrigger>
                                        <CollapsibleContent className="pt-2">
                                          <CodeTextarea
                                            value={levelCode}
                                            onChange={(value) =>
                                              updateCodeLevel(
                                                block.id,
                                                level,
                                                value
                                              )
                                            }
                                            placeholder={`Enter ${level} level code...`}
                                            className="min-h-[100px]"
                                          />
                                        </CollapsibleContent>
                                      </Collapsible>
                                    );
                                  }
                                )}
                              </div>
                            </div>
                          )}

                          {/* Image block with upload */}
                          {block.type === "image" && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label>Alt Text</Label>
                                  <Input
                                    value={block.metadata?.alt || ""}
                                    onChange={(e) =>
                                      handleUpdateBlock(block.id, {
                                        metadata: {
                                          ...block.metadata,
                                          alt: e.target.value,
                                        },
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
                                        metadata: {
                                          ...block.metadata,
                                          caption: e.target.value,
                                        },
                                      })
                                    }
                                    placeholder="Image caption"
                                  />
                                </div>
                              </div>

                              {block.content && (
                                <div className="relative">
                                  <img
                                    src={block.content}
                                    alt="Preview"
                                    className="max-h-40 rounded-lg border border-border"
                                  />
                                </div>
                              )}

                              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
                                <input
                                  type="file"
                                  accept="image/jpeg,image/png,image/gif,image/webp"
                                  onChange={(e) => {
                                    const file = e.target.files?.[0];
                                    if (file) {
                                      handleImageUploadForBlock(block.id, file);
                                    }
                                    e.target.value = "";
                                  }}
                                  className="hidden"
                                  id={`image-upload-${block.id}`}
                                />
                                <label
                                  htmlFor={`image-upload-${block.id}`}
                                  className="cursor-pointer"
                                >
                                  <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                                  <p className="text-sm text-muted-foreground">
                                    {isUploading
                                      ? "Uploading..."
                                      : "Click to upload or drag and drop"}
                                  </p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    JPG, PNG, GIF, WebP up to 5MB
                                  </p>
                                </label>
                              </div>

                              <div>
                                <Label>Or enter image URL</Label>
                                <Input
                                  value={block.content}
                                  onChange={(e) =>
                                    handleUpdateBlock(block.id, {
                                      content: e.target.value,
                                    })
                                  }
                                  placeholder="https://..."
                                />
                              </div>
                            </div>
                          )}

                          {/* Output block */}
                          {block.type === "output" && (
                            <div className="space-y-4">
                              <div>
                                <Label>Label (optional)</Label>
                                <Input
                                  value={block.metadata?.label || ""}
                                  onChange={(e) =>
                                    handleUpdateBlock(block.id, {
                                      metadata: {
                                        ...block.metadata,
                                        label: e.target.value,
                                      },
                                    })
                                  }
                                  placeholder="e.g., Output, Console, Result"
                                />
                              </div>
                              <div>
                                <Label>Content</Label>
                                <Textarea
                                  value={block.content}
                                  onChange={(e) =>
                                    handleUpdateBlock(block.id, {
                                      content: e.target.value,
                                    })
                                  }
                                  placeholder="Enter output content..."
                                  className="font-mono min-h-[100px]"
                                />
                              </div>
                            </div>
                          )}

                          {/* Markdown/Text block with rich editor */}
                          {(block.type === "markdown" ||
                            block.type === "text") && (
                            <div>
                              <Label>Content</Label>
                              <RichTextEditor
                                content={block.content}
                                onChange={(html) =>
                                  handleUpdateBlock(block.id, { content: html })
                                }
                                placeholder={
                                  block.type === "markdown"
                                    ? "Write rich content..."
                                    : "Enter text..."
                                }
                              />
                            </div>
                          )}

                          {/* Spacer block */}
                          {block.type === "spacer" && (
                            <div className="space-y-2">
                              <Label>Height</Label>
                              <RadioGroup
                                value={block.metadata?.height || "medium"}
                                onValueChange={(value) =>
                                  handleUpdateBlock(block.id, {
                                    metadata: { ...block.metadata, height: value },
                                  })
                                }
                                className="flex flex-wrap gap-4"
                              >
                                {[
                                  { value: "small", label: "Small (16px)" },
                                  { value: "medium", label: "Medium (32px)" },
                                  { value: "large", label: "Large (48px)" },
                                  { value: "xl", label: "XL (64px)" },
                                ].map((option) => (
                                  <div key={option.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option.value} id={`height-${block.id}-${option.value}`} />
                                    <Label htmlFor={`height-${block.id}-${option.value}`} className="text-sm font-normal cursor-pointer">
                                      {option.label}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                          )}

                          {/* Divider block */}
                          {block.type === "divider" && (
                            <div className="space-y-2">
                              <Label>Style</Label>
                              <RadioGroup
                                value={block.metadata?.style || "solid"}
                                onValueChange={(value) =>
                                  handleUpdateBlock(block.id, {
                                    metadata: { ...block.metadata, style: value },
                                  })
                                }
                                className="flex flex-wrap gap-4"
                              >
                                {[
                                  { value: "solid", label: "Solid" },
                                  { value: "dashed", label: "Dashed" },
                                  { value: "dotted", label: "Dotted" },
                                ].map((option) => (
                                  <div key={option.value} className="flex items-center space-x-2">
                                    <RadioGroupItem value={option.value} id={`style-${block.id}-${option.value}`} />
                                    <Label htmlFor={`style-${block.id}-${option.value}`} className="text-sm font-normal cursor-pointer">
                                      {option.label}
                                    </Label>
                                  </div>
                                ))}
                              </RadioGroup>
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}

                {/* Add Block Buttons */}
                <div className="flex flex-wrap gap-2 justify-center pt-4 pb-8">
                  {blockTypes.map((type) => (
                    <Button
                      key={type.value}
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleAddBlock(type.value as ContentBlock["type"])
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {type.label}
                    </Button>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Preview Panel */}
        <ResizablePanel defaultSize={50} minSize={30}>
          <div className="h-full overflow-y-auto bg-background">
            <div className="border-b border-border px-6 py-3 bg-card sticky top-0 z-10">
              <h3 className="text-sm font-medium text-muted-foreground">
                Live Preview
              </h3>
            </div>
            <div className="p-6 max-w-4xl">
              {previewBlocks.length > 0 ? (
                <ContentRenderer blocks={previewBlocks} />
              ) : (
                <div className="text-center text-muted-foreground py-12">
                  Add content blocks to see the preview
                </div>
              )}
            </div>
          </div>
        </ResizablePanel>
      </ResizablePanelGroup>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Block</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this content block? This action
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
    </div>
  );
};

export default ContentEditor;
