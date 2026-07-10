const getLesson = async (lessonId) => {
  const res = await fetch(`/api/lessons/${lessonId}`);
  const data = await res.json();

  console.log("data after fetch", data);

  if (data.status !== "success")
    throw new Error(data.message || "Could not fetch the lesson");

  return data.lesson;
};

const saveLesson = async (lessonId, lessonData) => {
  const res = await fetch(`/api/lessons/${lessonId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(lessonData),
  });

  const data = await res.json();

  console.log("data after save", data.lesson?.slides);

  if (data.status !== "success") {
    data.message || "Could not save the lesson due to some error";
    return alert("Could not save the lesson due to some error");
  }
  return data.lesson;
};

const lessonService = {
  saveLesson,
  getLesson,
};

export default lessonService;
