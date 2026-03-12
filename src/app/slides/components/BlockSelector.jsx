export default function BlockSelector({ addBlock }) {
  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        marginTop: "10px",
        background: "#fafafa",
      }}
    >
      <p style={{ marginBottom: "10px" }}>Choose block type</p>

      <button onClick={() => addBlock("text")}>Text</button>
      <button onClick={() => addBlock("image")} style={{ marginLeft: "5px" }}>
        Image
      </button>
      <button onClick={() => addBlock("youtube")} style={{ marginLeft: "5px" }}>
        YouTube
      </button>
      <button onClick={() => addBlock("quiz")} style={{ marginLeft: "5px" }}>
        Quiz
      </button>
      <button onClick={() => addBlock("divider")} style={{ marginLeft: "5px" }}>
        Divider
      </button>
    </div>
  );
}
