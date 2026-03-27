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

      <button onClick={() => addBlock("text")} style={{ marginLeft: "5px" }}>
        Text
      </button>
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
      <button
        onClick={() => addBlock("definition")}
        style={{ marginLeft: "5px" }}
      >
        Definition
      </button>
      <button onClick={() => addBlock("example")} style={{ marginLeft: "5px" }}>
        Example
      </button>
      <button
        onClick={() => addBlock("important")}
        style={{ marginLeft: "5px" }}
      >
        Important
      </button>
      <button
        onClick={() => addBlock("exercise")}
        style={{ marginLeft: "5px" }}
      >
        Exercise
      </button>
    </div>
  );
}
