// src/flows/courseFlow.js

const { sendList, sendButtons, sendText } = require("../services/whatsappApi");
const { getAllCourses, getCourseById } = require("../models/queries");

module.exports = {

  async list(phone) {
    const courses = await getAllCourses();

    const rows = courses.map(course => ({
      id: `course_${course.id}`,
      title: course.title,
      description: course.subtitle || course.short_description || ""
    }));

    const sections = [{
      title: "Available Courses",
      rows
    }];

    return sendList(
      phone,
      "Browse Courses",
      "Choose a course to view details",
      "View Courses",
      sections
    );
  },

  async details(phone, courseId) {
    const course = await getCourseById(courseId);

    if (!course) {
      return sendText(phone, "Course not found.");
    }

    const buttons = [
      { id: `pay_${course.id}`, title: "Pay Now" }
    ];

    const info = 
      `📘 *${course.title}*\n\n${course.description}\n\n` +
      `Duration: ${course.duration}\nPrice: ₹${course.price}`;

    return sendButtons(
      phone,
      "Course Details",
      buttons,
      info,
      ""
    );
  }
};
