import {
  Code2,
  FolderKanban,
  Users,
  Package,
  BarChart,
  Database,
  Globe,
  Layers,
  Lightbulb,
  Rocket,
  Settings,
  Terminal,
  Zap,
  Brain,
  Cpu,
  FileCode,
  GitBranch,
  Layout,
  Monitor,
  Palette,
  Server,
  Smartphone,
  type LucideIcon,
} from "lucide-react";

export const iconMap: Record<string, LucideIcon> = {
  Code2,
  FolderKanban,
  Users,
  Package,
  BarChart,
  Database,
  Globe,
  Layers,
  Lightbulb,
  Rocket,
  Settings,
  Terminal,
  Zap,
  Brain,
  Cpu,
  FileCode,
  GitBranch,
  Layout,
  Monitor,
  Palette,
  Server,
  Smartphone,
};

export const iconNames = Object.keys(iconMap);

export const getIcon = (name: string): LucideIcon => {
  return iconMap[name] || Code2;
};
