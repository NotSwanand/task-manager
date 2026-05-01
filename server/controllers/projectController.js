const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');

/**
 * @route   POST /api/projects
 * @desc    Create a new project (Admin only)
 * @access  Private/Admin
 */
const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      owner: req.user._id,
    });

    await project.populate('owner', 'name email');
    res.status(201).json(project);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/projects
 * @desc    Get all projects the logged-in user is a member of
 * @access  Private
 */
const getProjects = async (req, res, next) => {
  try {
    const query = req.user.role === 'admin'
      ? {} // Admins see all projects
      : { members: req.user._id }; // Members only see their projects

    const projects = await Project.find(query)
      .populate('owner', 'name email')
      .populate('members', 'name email role')
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/projects/:id
 * @desc    Get single project by ID
 * @access  Private
 */
const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate('owner', 'name email')
      .populate('members', 'name email role');

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Check access: admin sees all, member must be in members list
    const isMember = project.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    if (req.user.role !== 'admin' && !isMember) {
      return res.status(403).json({ message: 'Not authorized to view this project' });
    }

    res.json(project);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   PUT /api/projects/:id
 * @desc    Update project name/description (Admin only)
 * @access  Private/Admin
 */
const updateProject = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to update this project' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const { name, description } = req.body;
    if (name) project.name = name;
    if (description !== undefined) project.description = description;

    await project.save();
    await project.populate('owner', 'name email');
    await project.populate('members', 'name email role');

    res.json(project);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/projects/:id
 * @desc    Delete a project and all its tasks (Admin only)
 * @access  Private/Admin
 */
const deleteProject = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized to delete this project' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Cascade delete tasks belonging to this project
    await Task.deleteMany({ project: project._id });
    await project.deleteOne();

    res.json({ message: 'Project and all related tasks deleted successfully' });
  } catch (error) {
    next(error);
  }
};

/**
 * @route   POST /api/projects/:id/members
 * @desc    Add a member to project (Admin only)
 * @access  Private/Admin
 */
const addMember = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const { userId } = req.body;
    if (!userId) return res.status(400).json({ message: 'userId is required' });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const userToAdd = await User.findById(userId);
    if (!userToAdd) return res.status(404).json({ message: 'User not found' });

    if (project.members.includes(userId)) {
      return res.status(400).json({ message: 'User is already a member' });
    }

    project.members.push(userId);
    await project.save();
    await project.populate('members', 'name email role');
    await project.populate('owner', 'name email');

    res.json(project);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   DELETE /api/projects/:id/members/:userId
 * @desc    Remove a member from project (Admin only)
 * @access  Private/Admin
 */
const removeMember = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: 'Project not found' });

    // Cannot remove the owner from members
    if (project.owner.toString() === req.params.userId) {
      return res.status(400).json({ message: 'Cannot remove the project owner' });
    }

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );
    await project.save();
    await project.populate('members', 'name email role');
    await project.populate('owner', 'name email');

    res.json(project);
  } catch (error) {
    next(error);
  }
};

/**
 * @route   GET /api/projects/:id/members
 * @desc    Get project members
 * @access  Private
 */
const getProjectMembers = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('members', 'name email role');
    if (!project) return res.status(404).json({ message: 'Project not found' });

    const isMember = project.members.some(
      (m) => m._id.toString() === req.user._id.toString()
    );
    if (req.user.role !== 'admin' && !isMember) {
      return res.status(403).json({ message: 'Not authorized to view project members' });
    }

    res.json(project.members);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getProjectMembers,
};
