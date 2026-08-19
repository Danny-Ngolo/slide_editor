const demoImageSrc = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="400" viewBox="0 0 640 400"><rect width="640" height="400" fill="#4f6ef7"/><rect x="40" y="40" width="560" height="320" fill="none" stroke="#ffffff" stroke-width="4" rx="12"/><text x="320" y="210" fill="#ffffff" font-family="Arial, sans-serif" font-size="34" text-anchor="middle">Sample diagram</text></svg>`,
)}`;

const rich = {
  formatted:
    '<h2>Why this matters</h2><p>This paragraph shows <strong>bold</strong>, <em>italic</em>, <u>underline</u>, <s>strikethrough</s>, <mark>highlighted text</mark>, <sub>subscript</sub>, <sup>superscript</sup> and <code>inline code</code>.</p><ul><li><p>First bullet item</p></li><li><p>Second bullet item</p></li></ul><ol><li><p>Step one</p></li><li><p>Step two</p></li></ol><blockquote><p>A notable quote worth remembering while studying this material.</p></blockquote><p style="text-align: center">Centered paragraph via text-align.</p><p>Learn more at <a target="_blank" rel="noopener noreferrer" href="https://en.wikipedia.org/wiki/Mathematics">this link</a>.</p>',
  taskList:
    '<ul data-type="taskList"><li><label><input type="checkbox" checked="checked"><span></span></label><div><p>Already completed step</p></div></li><li><label><input type="checkbox"><span></span></label><div><p>Still pending step</p></div></li></ul>',
  empty: "",
};

export const demoSlides = [
  {
    id: "slide_1",
    title: "Introduction to Algebra",
    blocks: [
      {
        id: "b_text_intro",
        type: "text",
        content: { html: rich.formatted },
        important: false,
      },
      {
        id: "b_divider_1",
        type: "divider",
        content: {},
        important: false,
      },
      {
        id: "b_callout_def",
        type: "callout",
        content: {
          variant: "definition",
          html: "<p>A <strong>variable</strong> is a symbol that stands for an unknown number.</p>",
        },
        important: false,
      },
      {
        id: "b_callout_tip",
        type: "callout",
        content: {
          variant: "tip",
          html: "<p>Always check your answer by substituting it back into the original equation.</p>",
        },
        important: false,
      },
      {
        id: "b_callout_warn",
        type: "callout",
        content: {
          variant: "warning",
          html: "<p>Do not forget to apply the same operation to <em>both</em> sides of the equation.</p>",
        },
        important: false,
      },
      {
        id: "b_callout_example",
        type: "callout",
        content: {
          variant: "example",
          html: "<p>If <code>2x + 3 = 11</code>, subtracting 3 from both sides gives <code>2x = 8</code>.</p>",
        },
        important: false,
      },
    ],
  },
  {
    id: "slide_2",
    title: "Quadratic Formula",
    blocks: [
      {
        id: "b_math_1",
        type: "math",
        content: {
          title: "The Quadratic Formula",
          expressions: [
            {
              id: "me_1",
              latex: "x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}",
              mode: "display",
            },
            {
              id: "me_2",
              latex: "E = mc^2",
              mode: "inline",
            },
            {
              id: "me_3",
              latex: "\\sum_{n=1}^{\\infty} \\frac{1}{n^2} = \\frac{\\pi^2}{6}",
              mode: "display",
            },
          ],
        },
        important: false,
      },
      {
        id: "b_text_before_math",
        type: "text",
        content: {
          html: "<p>The discriminant is <code>b² − 4ac</code>. It tells us how many real roots exist.</p>",
        },
        important: false,
      },
      {
        id: "b_tasklist",
        type: "text",
        content: { html: rich.taskList },
        important: false,
      },
    ],
  },
  {
    id: "slide_3",
    title: "Video and Image",
    blocks: [
      {
        id: "b_youtube_1",
        type: "youtube",
        content: {
          url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          videoId: "dQw4w9WgXcQ",
          startTime: "10",
          caption: "An introductory video for this lesson.",
        },
        important: false,
      },
      {
        id: "b_image_1",
        type: "image",
        content: {
          image: demoImageSrc,
          width: 420,
          align: "center",
          caption: "A representative diagram for the lesson.",
        },
        important: false,
      },
    ],
  },
  {
    id: "slide_4",
    title: "Data Table",
    blocks: [
      {
        id: "b_table_1",
        type: "table",
        content: {
          rows: [
            {
              id: "tr_1",
              cells: [
                {
                  id: "tc_11",
                  html: "<p>Planet</p>",
                  colspan: 1,
                  rowspan: 1,
                  hidden: false,
                  width: null,
                  height: null,
                  background: null,
                  align: "left",
                },
                {
                  id: "tc_12",
                  html: "<p>Diameter (km)</p>",
                  colspan: 1,
                  rowspan: 1,
                  hidden: false,
                  width: null,
                  height: null,
                  background: null,
                  align: "left",
                },
                {
                  id: "tc_13",
                  html: "<p>Moons</p>",
                  colspan: 1,
                  rowspan: 1,
                  hidden: false,
                  width: null,
                  height: null,
                  background: null,
                  align: "left",
                },
              ],
            },
            {
              id: "tr_2",
              cells: [
                {
                  id: "tc_21",
                  html: "<p>Earth</p>",
                  colspan: 1,
                  rowspan: 1,
                  hidden: false,
                  width: null,
                  height: null,
                  background: null,
                  align: "left",
                },
                {
                  id: "tc_22",
                  html: "<p>12,742</p>",
                  colspan: 1,
                  rowspan: 1,
                  hidden: false,
                  width: null,
                  height: null,
                  background: null,
                  align: "right",
                },
                {
                  id: "tc_23",
                  html: "<p>1</p>",
                  colspan: 1,
                  rowspan: 1,
                  hidden: false,
                  width: null,
                  height: null,
                  background: null,
                  align: "center",
                },
              ],
            },
            {
              id: "tr_3",
              cells: [
                {
                  id: "tc_31",
                  html: "<p>Mars</p>",
                  colspan: 1,
                  rowspan: 1,
                  hidden: false,
                  width: null,
                  height: null,
                  background: null,
                  align: "left",
                },
                {
                  id: "tc_32",
                  html: "<p>6,779</p>",
                  colspan: 1,
                  rowspan: 1,
                  hidden: false,
                  width: null,
                  height: null,
                  background: null,
                  align: "right",
                },
                {
                  id: "tc_33",
                  html: "<p>2</p>",
                  colspan: 1,
                  rowspan: 1,
                  hidden: false,
                  width: null,
                  height: null,
                  background: null,
                  align: "center",
                },
              ],
            },
            {
              id: "tr_4",
              cells: [
                {
                  id: "tc_41",
                  html: "<p>Jupiter</p>",
                  colspan: 1,
                  rowspan: 1,
                  hidden: false,
                  width: null,
                  height: null,
                  background: null,
                  align: "left",
                },
                {
                  id: "tc_42",
                  html: "<p>139,820</p>",
                  colspan: 1,
                  rowspan: 1,
                  hidden: false,
                  width: null,
                  height: null,
                  background: null,
                  align: "right",
                },
                {
                  id: "tc_43",
                  html: "<p>95</p>",
                  colspan: 1,
                  rowspan: 1,
                  hidden: false,
                  width: null,
                  height: null,
                  background: null,
                  align: "center",
                },
              ],
            },
          ],
          headerRow: 0,
          headerColumn: null,
          columnWidths: [160, 160, 100],
          rowHeights: [40, 40, 40, 40],
        },
        important: false,
      },
      {
        id: "b_table_2",
        type: "table",
        content: {
          rows: [
            {
              id: "tr_5",
              cells: [
                {
                  id: "tc_51",
                  html: "<p>Metric</p>",
                  colspan: 1,
                  rowspan: 1,
                  hidden: false,
                  width: null,
                  height: null,
                  background: null,
                  align: "left",
                },
                {
                  id: "tc_52",
                  html: "<p>Value</p>",
                  colspan: 1,
                  rowspan: 1,
                  hidden: false,
                  width: null,
                  height: null,
                  background: null,
                  align: "left",
                },
              ],
            },
            {
              id: "tr_6",
              cells: [
                {
                  id: "tc_61",
                  html: "<p>Mass</p>",
                  colspan: 1,
                  rowspan: 2,
                  hidden: false,
                  width: null,
                  height: null,
                  background: null,
                  align: "left",
                },
                {
                  id: "tc_62",
                  html: "<p>5.972 × 10²⁴ kg</p>",
                  colspan: 1,
                  rowspan: 1,
                  hidden: false,
                  width: null,
                  height: null,
                  background: null,
                  align: "left",
                },
              ],
            },
            {
              id: "tr_7",
              cells: [
                {
                  id: "tc_72",
                  html: "<p>1.989 × 10³⁰ kg</p>",
                  colspan: 1,
                  rowspan: 1,
                  hidden: false,
                  width: null,
                  height: null,
                  background: null,
                  align: "left",
                },
              ],
            },
          ],
          headerRow: 0,
          headerColumn: 0,
          columnWidths: [120, 200],
          rowHeights: [40, 40, 40],
        },
        important: false,
      },
    ],
  },
  {
    id: "slide_5",
    title: "Practice Exercise",
    blocks: [
      {
        id: "b_exercise_1",
        type: "exercise",
        content: {
          title: "Solve the Equation",
          difficulty: "easy",
          estimatedTime: 10,
          questions: [
            {
              id: "eq_1",
              prompt: {
                html: "<p>Solve for <code>x</code> and explain each step: <code>3x + 5 = 20</code></p>",
              },
              hint: {
                html: "<p>Start by subtracting 5 from both sides of the equation.</p>",
              },
              teacherNotes: {
                html: "<p>Watch for sign errors when moving terms across the equals sign.</p>",
              },
            },
            {
              id: "eq_2",
              prompt: {
                html: "<p>Write down two real-life situations where you would use an equation.</p>",
              },
              hint: {
                html: "<p>Think about shopping budgets or travel times.</p>",
              },
              teacherNotes: {
                html: "<p>Accept any reasonable situation involving an unknown quantity.</p>",
              },
            },
          ],
          resources: [
            {
              id: "res_ex_1",
              type: "url",
              title: "Solving equations (Khan Academy)",
              src: "https://www.khanacademy.org/math/algebra",
              mimeType: null,
              size: null,
              addedAt: "2026-01-01T00:00:00.000Z",
            },
          ],
        },
        important: false,
      },
    ],
  },
  {
    id: "slide_6",
    title: "Quick Check",
    blocks: [
      {
        id: "b_quiz_1",
        type: "quiz",
        content: {
          title: "Quick Check",
          difficulty: "medium",
          estimatedTime: 5,
          questions: [
            {
              id: "q_1",
              type: "choice",
              prompt: { html: "<p>Which of the following is a prime number?</p>" },
              options: [
                { id: "qo_1", label: { html: "<p>15</p>" }, isCorrect: false },
                { id: "qo_2", label: { html: "<p>17</p>" }, isCorrect: true },
                { id: "qo_3", label: { html: "<p>21</p>" }, isCorrect: false },
                { id: "qo_4", label: { html: "<p>27</p>" }, isCorrect: false },
              ],
              multipleCorrect: false,
              modelAnswer: { html: "" },
              explanation: {
                html: "<p>17 is only divisible by 1 and by itself.</p>",
              },
            },
            {
              id: "q_2",
              type: "choice",
              prompt: { html: "<p>Select all numbers that are even.</p>" },
              options: [
                { id: "qo_5", label: { html: "<p>2</p>" }, isCorrect: true },
                { id: "qo_6", label: { html: "<p>7</p>" }, isCorrect: false },
                { id: "qo_7", label: { html: "<p>12</p>" }, isCorrect: true },
                { id: "qo_8", label: { html: "<p>15</p>" }, isCorrect: false },
              ],
              multipleCorrect: true,
              modelAnswer: { html: "" },
              explanation: { html: "<p>Even numbers end in 0, 2, 4, 6 or 8.</p>" },
            },
            {
              id: "q_3",
              type: "open",
              prompt: {
                html: "<p>Explain the difference between a prime number and a composite number.</p>",
              },
              options: [],
              multipleCorrect: false,
              modelAnswer: {
                html: "<p>A prime number has exactly two distinct divisors; a composite number has more.</p>",
              },
              explanation: { html: "" },
            },
          ],
          resources: [],
        },
        important: false,
      },
    ],
  },
  {
    id: "slide_7",
    title: "Example Code",
    blocks: [
      {
        id: "b_code_1",
        type: "code",
        content: {
          code: "function greet(name) {\n  // returns a friendly greeting\n  return `Hello, ${name}!`;\n}\n\nconst message = greet(\"Student\");\nconsole.log(message);",
          language: "javascript",
        },
        important: false,
      },
      {
        id: "b_code_2",
        type: "code",
        content: {
          code: "def factorial(n):\n    if n <= 1:\n        return 1\n    return n * factorial(n - 1)",
          language: "python",
        },
        important: false,
      },
    ],
  },
  {
    id: "slide_8",
    title: "Edge Cases",
    blocks: [
      {
        id: "b_text_empty",
        type: "text",
        content: { html: "" },
        important: false,
      },
      {
        id: "b_youtube_missing",
        type: "youtube",
        content: { url: "", videoId: "", startTime: "", caption: "" },
        important: false,
      },
      {
        id: "b_image_missing",
        type: "image",
        content: { image: "", width: 300, align: "center", caption: "" },
        important: false,
      },
      {
        id: "b_unknown",
        type: "flashcard",
        content: { front: { html: "<p>Front</p>" }, back: { html: "<p>Back</p>" } },
        important: false,
      },
      {
        id: "b_legacy_exercise",
        type: "exercise",
        content: {
          title: "Legacy Exercise",
          instructions: { html: "<p>Older exercise content without questions.</p>" },
          hint: { html: "<p>A legacy hint.</p>" },
          teacherNotes: { html: "" },
        },
        important: false,
      },
      {
        id: "b_legacy_math",
        type: "math",
        content: { latex: "a^2 + b^2 = c^2" },
        important: false,
      },
      {
        id: "b_malformed",
        type: "text",
        important: false,
      },
    ],
  },
  {
    id: "slide_9",
    title: "Empty Slide",
    blocks: [],
  },
];
