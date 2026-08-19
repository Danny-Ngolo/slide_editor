import TextBlockRenderer from "./blocks/TextBlockRenderer";
import ImageBlockRenderer from "./blocks/ImageBlockRenderer";
import YoutubeBlockRenderer from "./blocks/YoutubeBlockRenderer";
import CalloutBlockRenderer from "./blocks/CalloutBlockRenderer";
import DividerBlockRenderer from "./blocks/DividerBlockRenderer";
import TableBlockRenderer from "./blocks/TableBlockRenderer";
import ExerciseBlockRenderer from "./blocks/ExerciseBlockRenderer";
import QuizBlockRenderer from "./blocks/QuizBlockRenderer";
import MathBlockRenderer from "./blocks/MathBlockRenderer";
import CodeBlockRenderer from "./blocks/CodeBlockRenderer";
import UnknownBlockRenderer from "./blocks/UnknownBlockRenderer";

const RENDERERS = {
  text: TextBlockRenderer,
  image: ImageBlockRenderer,
  youtube: YoutubeBlockRenderer,
  callout: CalloutBlockRenderer,
  divider: DividerBlockRenderer,
  table: TableBlockRenderer,
  exercise: ExerciseBlockRenderer,
  quiz: QuizBlockRenderer,
  math: MathBlockRenderer,
  code: CodeBlockRenderer,
};

const BlockRouter = ({ block }) => {
  const Renderer = RENDERERS[block?.type] || UnknownBlockRenderer;

  return (
    <div className="presentation-block">
      <Renderer block={block} />
    </div>
  );
};

export default BlockRouter;