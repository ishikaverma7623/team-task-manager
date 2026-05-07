const express = require("express");
const router = express.Router();
const Project = require("../models/Project");
const authMiddleware = require("../middleware/authMiddleware");

// GET all projects
router.get("/", authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("members", "name email")
      .populate("createdBy", "name");
    res.json(projects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE project (Admin only)
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ msg: "Access denied" });

    const { name, description, members } = req.body;
    const project = new Project({ name, description, members, createdBy: req.user.id });
    await project.save();
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET tasks for a specific project
router.get("/:id/tasks", authMiddleware, async (req, res) => {
  try {
    const Task = require("../models/Task");
    const tasks = await Task.find({ project: req.params.id }).populate("assignedTo", "name email");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE project (Admin only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ msg: "Access denied" });
    await Project.findByIdAndDelete(req.params.id);
    res.json({ msg: "Project deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;