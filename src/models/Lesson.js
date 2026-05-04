import mongoose from "mongoose";

const BlockSchema = new mongoose.Schema({
  id: String,
  type: String,
  content: mongoose.Schema.Types.Mixed,
  important: Boolean,
});

const SlideSchema = new mongoose.Schema({
  id: String,
  title: {
    type: String,
    default: "Untitled Slide",
  },
  blocks: [BlockSchema],
});

const LessonSchema = new mongoose.Schema(
  {
    title: { type: String, default: "Untitled Lesson" },
    slides: [SlideSchema],
  },
  { timestamps: true },
);

export default mongoose.models.SlideLesson ||
  mongoose.model("SlideLesson", LessonSchema);
