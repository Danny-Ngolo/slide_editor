import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });
import { connectDB } from "./mongodb.js";
import Lesson from "../models/Lesson.js";

const seedLessons = async (count) => {
  try {
    await connectDB();

    let lessonsData = [];

    for (let i = 0; i < count; i++) {
      lessonsData.push({
        title: `Lesson ${i + 1}`,
        slides: [],
      });
    }

    const lessons = await Promise.all(
      lessonsData.map((lesson) => {
        return new Promise(async (resolve, reject) => {
          const createdLesson = await Lesson.create(lesson);
          console.log("createdLesson", createdLesson);

          resolve(createdLesson);
        });
      }),
    );

    console.log("created lessons", lessons);

    process.exit(0);
  } catch (err) {
    process.exit(1);
  }
};

await seedLessons(3);
