import { FileText, Image, Link, Video } from "lucide-react";
import { generateId } from "../utils/generateId";

export const RESOURCE_TYPES = {
  file: { label: "File", icon: FileText, accept: "*/*" },
  image: { label: "Image", icon: Image, accept: "image/*" },
  url: { label: "URL", icon: Link, accept: null },
  video: { label: "Video", icon: Video, accept: "video/*" },
};

export const createResource = (type, data = {}) => ({
  id: generateId(),
  type,
  title: data.title || data.src || "Resource",
  src: data.src || "",
  mimeType: data.mimeType || null,
  size: data.size || null,
  addedAt: new Date().toISOString(),
});