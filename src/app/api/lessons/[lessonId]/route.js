import { connectDB } from "@/lib/mongodb";
import Lesson from "@/models/Lesson";
import { NextResponse } from "next/server";

// SAVE (update) lesson
export async function POST(req, { params }) {
  try {
    await connectDB();

    const { lessonId } = await params;
    const body = await req.json();

    const lesson = await Lesson.findByIdAndUpdate(lessonId, body, {
      returnDocument: "after",
      upsert: true,
    });

    console.log("lesson", lesson);

    if (!lesson)
      return NextResponse.json(
        {
          status: "fail",
          message: "Could not create or update the lesson",
        },
        { status: 400 },
      );

    return NextResponse.json(
      {
        status: "success",
        message: "Lesson updated successfully",
        lesson,
      },
      { status: 200 },
    );
  } catch (err) {
    return NextResponse.json(
      {
        status: "fail",
        message: err.message,
      },
      { status: 500 },
    );
  }
}

// GET lesson
export async function GET(req, { params }) {
  await connectDB();

  const { lessonId } = await params;

  const lesson = await Lesson.findById(lessonId);

  console.log("lesson", lesson);

  if (!lesson) {
    return NextResponse.json(
      { status: "fail", message: "Lesson not found" },
      { status: 404 },
    );
  }

  return NextResponse.json({ status: "success", lesson }, { status: 200 });
}
