import { useUserPreferences } from "@/hooks/useUserPreferences";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const LEVELS = [
  { value: "beginner", label: "Beginner", color: "bg-green-500/20 text-green-400" },
  { value: "intermediate", label: "Intermediate", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "expert", label: "Expert", color: "bg-red-500/20 text-red-400" },
] as const;

const UserLevelSelector = () => {
  const { pythonLevel, setPythonLevel, isAuthenticated } = useUserPreferences();

  if (!isAuthenticated) return null;

  const handleChange = async (value: string) => {
    try {
      await setPythonLevel(value as "beginner" | "intermediate" | "expert");
      toast.success(`Level set to ${value}`);
    } catch {
      toast.error("Failed to update level");
    }
  };

  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
      <span className="text-sm text-muted-foreground whitespace-nowrap">Your level:</span>
      <RadioGroup
        value={pythonLevel}
        onValueChange={handleChange}
        className="flex gap-3"
      >
        {LEVELS.map((level) => (
          <div key={level.value} className="flex items-center gap-1.5">
            <RadioGroupItem value={level.value} id={`level-${level.value}`} />
            <Label htmlFor={`level-${level.value}`} className="cursor-pointer">
              <Badge variant="secondary" className={level.color}>
                {level.label}
              </Badge>
            </Label>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default UserLevelSelector;
