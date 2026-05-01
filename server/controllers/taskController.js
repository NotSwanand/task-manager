const Task = require('../models/Task');
const Project = require('../models/Project');

/**
 * Helper — verify user has access to the project
 */
const checkProjectAccess = async (projectId, user) => {
  const project = await Project.findById(projectId);
  if (!project) return { error: 'Project not found', status: 404 };

  const isMember = project.members.some(
    (m) => m.toString() === user._id.toString()
  );
  if (user.role !== 'admin' && !isMember) {
    return { error: 'Not authorized to access this project', status: 403 };
  }
  return { project };
};

/**
 * @route   POST /api/tasks
 * @desc    Create a task within a project
 * @access  Private (project members / admin)
 */
const createTask = async (req, res, next) => {
  try {
    const { title, description, status, priority, dueDate, project, assignedTo } = req.body;

    const access = await checkProjectAccess(project, req.user);
    if (access.error) return res.status(access.status).json({ message: access.error });

    // Only admin may assign tasks
    if (assignedTo && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can assign tasks' });
    }

    // Validate assignedTo is a project member
    if (assignedTo) {
      const isValidMember = access.project.members.some(
        (m) => m.toString() === assignedTo
      );
      if (!isValidMember) {
        return res.status(400).json({ message: 'Assigned user is not a member of this project' });
      }
    }

    const task = await Task.create({
      title,
      description,
      status,
      priority,
      dueDate,
      project,
      assignedTo,
      createdBy: req.user._id,
    });

    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    await task.populate('project', 'name');

    res.status(201).json(task);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks?project=:projectId
 * @desc    Get tasks — filter by project (optional). Members see only their tasks.
 * @access  Private
 */
const getTasks = async (req, res, next) => {
  try {
    const { project, status, priority, assignedTo } = req.query;

    // Build filter
    const filter = {};

    if (project) {
      // Verify access to the project
      const access = await checkProjectAccess(project, req.user);
      if (access.error) return res.status(access.status).json({ message: access.error });
      filter.project = project;
    } else {
      // If no project filter, members only see tasks assigned to them
      if (req.user.role !== 'admin') {
        filter.assignedTo = req.user._id;
      }
    }

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (assignedTo && req.user.role === 'admin') filter.assignedTo = assignedTo;

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name')
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks/:id
 * @desc    Get a single task
 * @access  Private
 */
const getTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate('assignedTo', 'name email')
      .populate('createdBy', 'name email')
      .populate('project', 'name members');

    if (!task) return res.status(404).json({ message: 'Task not found' });

    // Check access
    const isAssignee = task.assignedTo?.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isAssignee) {
      return res.status(403).json({ message: 'Not authorized to view this task' });
    }

    res.json(task);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/tasks/:id
 * @desc    Update a task — admin or task creator or assignee
 * @access  Private
 */
const updateTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('project', 'members owner');
    if (!task) return res.status(404).json({ message: 'Task not found' });

    const isAssignee = task.assignedTo?.toString() === req.user._id.toString();
    if (req.user.role !== 'admin' && !isAssignee) {
      return res.status(403).json({ message: 'Not authorized to update this task' });
    }

    const { title, description, status, priority, dueDate, assignedTo } = req.body;

    if (req.user.role === 'admin') {
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = dueDate;

      if (assignedTo !== undefined) {
        if (assignedTo) {
          const isValidMember = task.project.members.some(
            (m) => m.toString() === assignedTo
          );
          if (!isValidMember) {
            return res.status(400).json({ message: 'Assigned user is not a member of this project' });
          }
          task.assignedTo = assignedTo;
        } else {
          task.assignedTo = null;
        }
      }
    } else {
      if (status !== undefined) task.status = status;
    }

    await task.save();
    await task.populate('assignedTo', 'name email');
    await task.populate('createdBy', 'name email');
    await task.populate('project', 'name');

    res.json(task);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task (admin or task creator)
 * @access  Private
 */
const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Only admins can delete tasks' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/tasks/dashboard/stats
 * @desc    Get task stats for the logged-in user's dashboard
 * @access  Private
 */
const getDashboardStats = async (req, res, next) => {
  try {
    const now = new Date();

    // Build base query depending on role
    const baseQuery = req.user.role === 'admin' ? {} : { assignedTo: req.user._id };

    const [total, completed, inProgress, todo, overdue] = await Promise.all([
      Task.countDocuments(baseQuery),
      Task.countDocuments({ ...baseQuery, status: 'done' }),
      Task.countDocuments({ ...baseQuery, status: 'in-progress' }),
      Task.countDocuments({ ...baseQuery, status: 'todo' }),
      Task.countDocuments({
        ...baseQuery,
        status: { $ne: 'done' },
        dueDate: { $lt: now },
      }),
    ]);

    // Recent tasks (last 5)
    const recentTasks = await Task.find(baseQuery)
      .sort({ updatedAt: -1 })
      .limit(5)
      .populate('project', 'name')
      .populate('assignedTo', 'name');

    res.json({ total, completed, inProgress, todo, overdue, recentTasks });
  } catch (error) {
    next(error);
  }
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask, getDashboardStats };
