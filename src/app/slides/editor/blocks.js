import {
  Type,
  Image,
  Video,
  BookOpen,
  Brain,
  Lightbulb,
  Minus,
} from "lucide-react";

export const blocks_groups = [
  {
    title: "Basic",
    items: [
      { type: "text", label: "Text", desc: "Write content", icon: Type },
      {
        type: "divider",
        label: "Divider",
        desc: "Separate sections",
        icon: Minus,
      },
    ],
  },
  {
    title: "Media",
    items: [
      {
        type: "image",
        label: "Image",
        desc: "Upload or display image",
        icon: Image,
      },
      { type: "video", label: "Video", desc: "Embed video", icon: Video },
    ],
  },
  {
    title: "Education",
    items: [
      {
        type: "definition",
        label: "Definition",
        desc: "Explain a concept",
        icon: BookOpen,
      },
      {
        type: "example",
        label: "Example",
        desc: "Show an example",
        icon: Lightbulb,
      },
      {
        type: "exercise",
        label: "Exercise",
        desc: "Practice activity",
        icon: Brain,
      },
    ],
  },
];

export const flattenBlocks = (groups) => {
  return groups.flatMap(group => group.items)
};

export const filterBlocks = (groups, query) => {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        return item.label
          ? item.label
            .toLowerCase()
            .includes(query?.toString().toLowerCase())
          : null;
      }),
    }))
    .filter((group) => group.items.length > 0);
};