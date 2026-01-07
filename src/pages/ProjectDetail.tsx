import { useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Github, ExternalLink } from "lucide-react";
import { useProject } from "@/hooks/useProjects";
import { usePaginatedContent } from "@/hooks/usePaginatedContent";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import ContentRenderer from "@/components/content-blocks/ContentRenderer";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PAGE_SIZE = 10;

const ProjectDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  const { data: project, isLoading, error } = useProject(slug || "");
  const { data: paginatedData, isLoading: contentLoading } = usePaginatedContent(
    project?.id || "",
    currentPage,
    PAGE_SIZE
  );

  const handlePageChange = (page: number) => {
    setSearchParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground">Loading project...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Project not found</h1>
          <p className="text-muted-foreground mb-4">
            The project you're looking for doesn't exist.
          </p>
          <Button onClick={() => navigate("/")}>Go Home</Button>
        </div>
      </div>
    );
  }

  // Generate page numbers for pagination
  const renderPaginationItems = () => {
    if (!paginatedData || paginatedData.totalPages <= 1) return null;

    const { totalPages, currentPage } = paginatedData;
    const items: React.ReactNode[] = [];

    // Always show first page
    items.push(
      <PaginationItem key={1}>
        <PaginationLink
          onClick={() => handlePageChange(1)}
          isActive={currentPage === 1}
          className="cursor-pointer"
        >
          1
        </PaginationLink>
      </PaginationItem>
    );

    // Show ellipsis if needed
    if (currentPage > 3) {
      items.push(
        <PaginationItem key="ellipsis-start">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Show pages around current page
    for (
      let i = Math.max(2, currentPage - 1);
      i <= Math.min(totalPages - 1, currentPage + 1);
      i++
    ) {
      items.push(
        <PaginationItem key={i}>
          <PaginationLink
            onClick={() => handlePageChange(i)}
            isActive={currentPage === i}
            className="cursor-pointer"
          >
            {i}
          </PaginationLink>
        </PaginationItem>
      );
    }

    // Show ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(
        <PaginationItem key="ellipsis-end">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }

    // Always show last page if more than 1 page
    if (totalPages > 1) {
      items.push(
        <PaginationItem key={totalPages}>
          <PaginationLink
            onClick={() => handlePageChange(totalPages)}
            isActive={currentPage === totalPages}
            className="cursor-pointer"
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }

    return items;
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20">
        {/* Header */}
        <section className="border-b border-border bg-gradient-subtle">
          <div className="container px-6 py-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-4xl"
            >
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/")}
                className="mb-6"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>

              <h1 className="text-3xl md:text-4xl font-bold mb-4">
                {project.title}
              </h1>

              <p className="text-lg text-muted-foreground mb-6">
                {project.description}
              </p>

              <div className="flex flex-wrap items-center gap-4">
                {project.skills && project.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {project.skills.map((skill: any) => (
                      <Badge key={skill.id} variant="secondary">
                        {skill.title}
                      </Badge>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  {project.github_url && (
                    <a
                      href={project.github_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        <Github className="w-4 h-4 mr-2" />
                        GitHub
                      </Button>
                    </a>
                  )}
                  {project.live_url && (
                    <a
                      href={project.live_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Live Demo
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="container px-6 py-12 max-w-4xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {contentLoading ? (
              <div className="text-center py-12">
                <div className="animate-pulse text-muted-foreground">
                  Loading content...
                </div>
              </div>
            ) : paginatedData && paginatedData.blocks.length > 0 ? (
              <>
                {/* Page info */}
                {paginatedData.totalPages > 1 && (
                  <div className="text-sm text-muted-foreground mb-6">
                    Showing page {paginatedData.currentPage} of{" "}
                    {paginatedData.totalPages} ({paginatedData.totalCount} total
                    items)
                  </div>
                )}

                <ContentRenderer blocks={paginatedData.blocks as any} />

                {/* Pagination */}
                {paginatedData.totalPages > 1 && (
                  <div className="mt-12 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            onClick={() =>
                              handlePageChange(Math.max(1, currentPage - 1))
                            }
                            className={
                              currentPage === 1
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>

                        {renderPaginationItems()}

                        <PaginationItem>
                          <PaginationNext
                            onClick={() =>
                              handlePageChange(
                                Math.min(paginatedData.totalPages, currentPage + 1)
                              )
                            }
                            className={
                              currentPage === paginatedData.totalPages
                                ? "pointer-events-none opacity-50"
                                : "cursor-pointer"
                            }
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            ) : (
              <div className="bg-card border border-border rounded-lg p-8 text-center">
                <p className="text-muted-foreground">
                  No content has been added to this project yet.
                </p>
              </div>
            )}
          </motion.div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ProjectDetail;
