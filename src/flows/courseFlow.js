// src/flows/courseFlow.js

const { sendList, sendButtons, sendText } = require("../services/WhatsappApi");
const { getAllCourses, getCourseById } = require("../models/queries");

module.exports = {

  // -----------------------------------------------------
  // SHOW COURSE LIST (Interactive List)
  // -----------------------------------------------------
  async list(phone) {
    const courses = await getAllCourses();

    const rows = courses.map(course => ({
      id: `course_${course.id}`,
      title: course.title,
      description: course.subtitle || course.short_description || ""
    }));

    const sections = [
      {
        title: "Available Courses",
        rows
      }
    ];

    return sendList(
      phone,
      "Browse Courses",
      "Choose a course to view details",
      "View Courses",
      sections
    );
  },

  // -----------------------------------------------------
  // SHOW COURSE DETAILS + PAY NOW + BROWSE AGAIN BUTTON
  // -----------------------------------------------------
  async details(phone, courseId) {
    const course = await getCourseById(courseId);

    if (!course) {
      return sendText(phone, "Course not found.");
    }

    const buttons = [
      { id: `pay_${course.id}`, title: "Pay Now" },
      { id: "browse_courses_again", title: "Browse Other Courses" } // 👈 NEW BUTTON
    ];

    const info =
      `📘 *${course.title}*\n\n` +
      `${course.description}\n\n` +
      `Duration: ${course.duration || "Self-paced"}\n` +
      `Price: ₹${course.price}`;

    return sendButtons(
      phone,
      "Course Details",
      buttons,
      info,
      ""
    );
  }
};
