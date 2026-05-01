const express = require('express');
const router = express.Router();
const {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
  getProjectMembers,
} = require('../controllers/projectController');
const { protect, authorize } = require('../middleware/auth');
const { validateProject } = require('../middleware/validate');

// All routes require authentication
router.use(protect);

router.route('/')
  .get(getProjects)
  .post(authorize('admin'), validateProject, createProject);

router.route('/:id')
  .get(getProject)
  .put(authorize('admin'), validateProject, updateProject)
  .delete(authorize('admin'), deleteProject);

// Member management
router.get('/:id/members', getProjectMembers);
router.post('/:id/members', authorize('admin'), addMember);
router.delete('/:id/members/:userId', authorize('admin'), removeMember);

module.exports = router;
