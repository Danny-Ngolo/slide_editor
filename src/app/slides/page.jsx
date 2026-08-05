"use client";

import React from "react";
import "./editor.css";
import SlideEditor from "./components/SlideEditor";
import EditorProvider from "./components/EditorContext";

const lessons = [
  {
    title: "Lesson 1",
    slides: [],
    _id: "69f423b6bc64d5814e1a7c6d",
    createdAt: "2026-05-01T03:53:26.223Z",
    updatedAt: "2026-05-01T03:53:26.223Z",
    __v: 0,
  },
  {
    title: "Lesson 2",
    slides: [],
    _id: "69f423b6bc64d5814e1a7c6e",
    createdAt: "2026-05-01T03:53:26.224Z",
    updatedAt: "2026-05-01T03:53:26.224Z",
    __v: 0,
  },
  {
    title: "Lesson 3",
    slides: [],
    _id: "69f423b6bc64d5814e1a7c6f",
    createdAt: "2026-05-01T03:53:26.225Z",
    updatedAt: "2026-05-01T03:53:26.225Z",
    __v: 0,
  },
];

const SlidesPage = () => {
  return (
    <div>
      <EditorProvider>
        <SlideEditor lessonId={lessons[0]._id} />
      </EditorProvider>
    </div>
  );
};

export default SlidesPage;
