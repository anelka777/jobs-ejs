const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobs');
const csrf = require("csurf");
const csrfProtection = csrf({ cookie: true });


router.get('/', jobsController.getAllJobs);
router.get('/new', jobsController.newJobForm);
router.post('/', jobsController.addJob);
router.get("/edit/:id", jobsController.editJobForm);
router.post('/update/:id', jobsController.updateJob);
router.post('/delete/:id', csrfProtection, jobsController.deleteJob);

module.exports = router;
