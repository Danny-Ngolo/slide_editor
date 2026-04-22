import {
  Type,
  Image,
  Video,
  BookOpen,
  Brain,
  Lightbulb,
  Minus,
  AlertTriangle,
  FlaskConical,
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
      {
        type: "youtube",
        label: "YouTube Video",
        desc: "Embed YouTube video",
        icon: Video,
      },
    ],
  },
  {
    title: "Education",
    items: [
      {
        type: "callout",
        variant: "definition",
        label: "Definition",
        desc: "Explain a concept",
        icon: BookOpen,
      },
      {
        type: "callout",
        variant: "tip",
        label: "Tip",
        desc: "Highlight something useful",
        icon: Lightbulb,
      },
      {
        type: "callout",
        variant: "warning",
        label: "Warning",
        desc: "Prevent mistakes",
        icon: AlertTriangle,
      },
      {
        type: "callout",
        variant: "example",
        label: "Example",
        desc: "Show a practical case",
        icon: FlaskConical,
      },
    ],
  },
];

export const flattenBlocks = (groups) => {
  return groups.flatMap((group) => group.items);
};

export const filterBlocks = (groups, query) => {
  return groups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => {
        return item.label
          ? item.label.toLowerCase().includes(query?.toString().toLowerCase())
          : null;
      }),
    }))
    .filter((group) => group.items.length > 0);
};
