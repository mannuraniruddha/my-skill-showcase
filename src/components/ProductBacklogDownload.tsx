import { useState } from "react";
import { Download, FileJson, FileSpreadsheet, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useProjects, ProjectWithSkills } from "@/hooks/useProjects";
import { toast } from "sonner";

interface BacklogItem {
  id: string;
  title: string;
  description: string;
  skills: string[];
  status: string;
  priority: string;
  created_at: string;
}

const transformToBacklog = (projects: ProjectWithSkills[]): BacklogItem[] => {
  return projects.map((project, index) => ({
    id: `PB-${String(index + 1).padStart(3, "0")}`,
    title: project.title,
    description: project.description,
    skills: project.skills.map((s) => s.title),
    status: "Completed",
    priority: index < 3 ? "High" : "Medium",
    created_at: project.created_at,
  }));
};

const downloadJSON = (backlog: BacklogItem[]) => {
  const data = {
    productBacklog: {
      exportedAt: new Date().toISOString(),
      totalItems: backlog.length,
      items: backlog,
    },
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `product-backlog-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success("JSON downloaded successfully!");
};

const downloadCSV = (backlog: BacklogItem[]) => {
  const headers = ["ID", "Title", "Description", "Skills", "Status", "Priority", "Created At"];
  const rows = backlog.map((item) => [
    item.id,
    `"${item.title.replace(/"/g, '""')}"`,
    `"${item.description.replace(/"/g, '""')}"`,
    `"${item.skills.join(", ")}"`,
    item.status,
    item.priority,
    new Date(item.created_at).toLocaleDateString(),
  ]);

  const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `product-backlog-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  toast.success("CSV downloaded successfully!");
};

const downloadPDF = (backlog: BacklogItem[]) => {
  // Create a printable HTML document
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Product Backlog</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 40px; color: #333; }
        h1 { color: #1a1a2e; border-bottom: 2px solid #6366f1; padding-bottom: 10px; }
        .meta { color: #666; margin-bottom: 30px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th { background: #6366f1; color: white; padding: 12px; text-align: left; }
        td { padding: 10px; border-bottom: 1px solid #ddd; vertical-align: top; }
        tr:nth-child(even) { background: #f8f9fa; }
        .skills { display: flex; flex-wrap: wrap; gap: 4px; }
        .skill { background: #e5e7eb; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
        .priority-high { color: #dc2626; font-weight: bold; }
        .priority-medium { color: #f59e0b; }
        @media print { body { padding: 20px; } }
      </style>
    </head>
    <body>
      <h1>Product Backlog</h1>
      <p class="meta">Exported on ${new Date().toLocaleDateString()} | Total Items: ${backlog.length}</p>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Skills</th>
            <th>Status</th>
            <th>Priority</th>
          </tr>
        </thead>
        <tbody>
          ${backlog
            .map(
              (item) => `
            <tr>
              <td>${item.id}</td>
              <td><strong>${item.title}</strong></td>
              <td>${item.description}</td>
              <td><div class="skills">${item.skills.map((s) => `<span class="skill">${s}</span>`).join("")}</div></td>
              <td>${item.status}</td>
              <td class="${item.priority === "High" ? "priority-high" : "priority-medium"}">${item.priority}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const printWindow = window.open("", "_blank");
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
    };
    toast.success("PDF ready for printing!");
  } else {
    toast.error("Please allow popups to generate PDF");
  }
};

const ProductBacklogDownload = () => {
  const { data: projects, isLoading } = useProjects();
  const [isOpen, setIsOpen] = useState(false);

  const backlog = projects ? transformToBacklog(projects) : [];

  const handleDownload = (format: "pdf" | "csv" | "json") => {
    if (!projects || projects.length === 0) {
      toast.error("No projects to export");
      return;
    }

    switch (format) {
      case "json":
        downloadJSON(backlog);
        break;
      case "csv":
        downloadCSV(backlog);
        break;
      case "pdf":
        downloadPDF(backlog);
        break;
    }
    setIsOpen(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            disabled={isLoading || !projects?.length}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download Backlog
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48 bg-popover">
          <DropdownMenuItem onClick={() => handleDownload("pdf")} className="gap-2 cursor-pointer">
            <FileText className="w-4 h-4 text-red-500" />
            Download as PDF
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownload("csv")} className="gap-2 cursor-pointer">
            <FileSpreadsheet className="w-4 h-4 text-green-500" />
            Download as CSV
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => handleDownload("json")} className="gap-2 cursor-pointer">
            <FileJson className="w-4 h-4 text-blue-500" />
            Download as JSON
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </motion.div>
  );
};

export default ProductBacklogDownload;
