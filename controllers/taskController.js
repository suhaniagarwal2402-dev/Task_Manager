const Task = require('../models/Task');

exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate } = req.body;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const task = await Task.create({
      user: req.userId,
      title,
      description,
      priority,
      dueDate,
    });

    res.status(201).json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getTasks = async (req, res) => {
  try {
    const filter = { user: req.userId };

    if (req.query.status) filter.status = req.query.status;
    if (req.query.priority) filter.priority = req.query.priority;
    if (req.query.search) {
      const safeText = req.query.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.title = { $regex: safeText, $options: 'i' };
    }

    let sortBy = { createdAt: -1 };
    if (req.query.sort === 'dueDate') sortBy = { dueDate: 1 };

    const tasks = await Task.find(filter).sort(sortBy);
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, user: req.userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: 'Invalid task id' });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const { title, description, priority, status, dueDate } = req.body;

    const task = await Task.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      { title, description, priority, status, dueDate },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid task id' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const total = await Task.countDocuments({ user: req.userId });
    const done = await Task.countDocuments({ user: req.userId, status: 'done' });
    const overdue = await Task.countDocuments({
      user: req.userId,
      status: 'pending',
      dueDate: { $lt: new Date() },
    });

    res.json({ total, done, pending: total - done, overdue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
