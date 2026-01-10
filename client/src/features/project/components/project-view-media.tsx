// src/features/project/components/project-view-media.tsx

import { useState } from "react";
import DetailView from "../../../components/widgets/detail-view";
import { Button } from "../../../components/widgets/button";
import { getFileIcon } from "../../../utils/fileIcons"; // your icon helper
import { formatDate } from "../../../utils/formatDate";

interface ProjectViewMediaProps {
  mediaLinks: any[]; // array of { id, media: { file_name, file_type, storage_path, mime_type }, usage, created_at }
}

const ProjectViewMedia = ({ mediaLinks }: ProjectViewMediaProps) => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  if (!mediaLinks || mediaLinks.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">No media attached to this project</p>
      </div>
    );
  }

  // Open media in new tab (image preview or document download/view)
  const openMedia = (url: string, fileName: string, fileType: string) => {
    if (fileType === "image") {
      // For images: open in new tab with preview
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(`
          <html>
            <head><title>${fileName}</title></head>
            <body style="margin:0;background:#000;display:flex;align-items:center;justify-content:center;height:100vh;">
              <img src="${url}" alt="${fileName}" style="max-width:100%;max-height:100vh;object-fit:contain;" />
            </body>
          </html>
        `);
      }
    } else {
      // For documents: direct open (browser handles PDF/doc/etc.)
      window.open(url, "_blank");
    }
  };

  // Grid View
  const renderGrid = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {mediaLinks.map((link) => {
        const { media } = link;
        const iconSrc = getFileIcon(media.file_name);

        return (
          <div
            key={link.id}
            onClick={() => openMedia(media.storage_path, media.file_name, media.file_type)}
            className="group cursor-pointer border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-all duration-200 bg-white"
          >
            {/* Preview / Icon */}
            <div className="h-28 bg-gray-50 flex items-center justify-center relative">
              {media.file_type === "image" ? (
                <img
                  src={media.storage_path}
                  alt={media.file_name}
                  className="max-h-20 max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <img
                  src={iconSrc}
                  alt={media.file_name}
                  className="w-24 h-24 object-contain opacity-80 group-hover:opacity-100 transition-opacity"
                />
              )}
            </div>

            {/* Info */}
            <div className="p-4">
              <p className="font-medium text-gray-900 truncate text-sm">{media.file_name}</p>
              <p className="text-xs text-gray-500 mt-1">
                <span className="font-semibold">Uploaded At</span> {new Date(link.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );

  // List View
  const renderList = () => (
    <div className="space-y-3">
      {mediaLinks.map((link) => {
        const { media } = link;
        const iconSrc = getFileIcon(media.file_name);

        return (
          <div
            key={link.id}
            onClick={() => openMedia(media.storage_path, media.file_name, media.file_type)}
            className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
          >
            <img
              src={iconSrc}
              alt={media.file_name}
              className="w-12 h-12 object-contain"
            />

            <div className="flex-1">
              <p className="font-bold text-gray-900">{media.file_name}</p>
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Uploaded At -</span> {formatDate(link.created_at, false)}
              </p>
            </div>

            <span className="text-gray-400">→</span>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header + Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Media {viewMode === "grid" ? "Grid" : "List"}</h2>
          <p className="text-sm text-gray-600 mt-1">
            Total: {mediaLinks.length} item{mediaLinks.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant={viewMode === "grid" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("grid")}
          >
            Grid View
          </Button>
          <Button
            variant={viewMode === "list" ? "default" : "ghost"}
            size="sm"
            onClick={() => setViewMode("list")}
          >
            List View
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === "grid" ? renderGrid() : renderList()}
    </div>
  );
};

export default ProjectViewMedia;