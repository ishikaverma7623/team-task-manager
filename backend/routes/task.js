const express = require("express");
const router = express.Router();
const Task = require("../models/Task");
const authMiddleware = require("../middleware/authMiddleware");

// GET dashboard stats
router.get("/stats", authMiddleware, async (req, res) => {
  try {
    const total = await Task.countDocuments();
    const completed = await Task.countDocuments({ status: "done" });
    const inProgress = await Task.countDocuments({ status: "in-progress" });
    const overdue = await Task.countDocuments({
      deadline: { $lt: new Date() },
      status: { $ne: "done" }
    });
    res.json({ total, completed, inProgress, overdue });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all tasks
router.get("/", authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find()
      .populate("assignedTo", "name email")
      .populate("project", "name");
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CREATE task (Admin only)
router.post("/", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ msg: "Access denied" });

    const { title, description, project, assignedTo, deadline } = req.body;
    const task = new Task({ title, description, project, assignedTo, deadline });
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE task status
router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: "Task not found" });

    if (task.assignedTo.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ msg: "Not allowed" });
    }

    task.status = req.body.status;
    await task.save();
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE task (Admin only)
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== "admin") return res.status(403).json({ msg: "Access denied" });
    await Task.findByIdAndDelete(req.params.id);
    res.json({ msg: "Task deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;