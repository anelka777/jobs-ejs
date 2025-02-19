
const Job = require("../models/Job");


const getAllJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ createdBy: req.user._id });
        res.render("jobs", { jobs, _csrf: req.csrfToken() });
    } catch (error) {
        req.flash("error", "Server error while fetching jobs.");
        res.redirect("/");
    }
};


const addJob = async (req, res) => {
    const { company, position, status } = req.body;
    try {
        await Job.create({ company, position, status, createdBy: req.user._id });
        req.flash("success", "Job successfully added!");
        res.redirect("/jobs");
    } catch (error) {
        req.flash("error", "Error adding job.");
        res.redirect("/jobs/new");
    }
};

const newJobForm = (req, res) => {
    res.render("job", { job: null, _csrf: req.csrfToken() });
};


const editJobForm = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job || job.createdBy.toString() !== req.user._id.toString()) {
            req.flash("error", "Unauthorized or job not found.");
            return res.redirect("/jobs");
        }
        res.render("job", { job, _csrf: req.csrfToken() });
    } catch (error) {
        req.flash("error", "Error loading job for editing.");
        res.redirect("/jobs");
    }
};


const updateJob = async (req, res) => {
    const { company, position, status } = req.body;
    try {
        const job = await Job.findById(req.params.id);
        if (!job || job.createdBy.toString() !== req.user._id.toString()) {
            req.flash("error", "Unauthorized or job not found.");
            return res.redirect("/jobs");
        }

        await Job.findByIdAndUpdate(req.params.id, { company, position, status });
        req.flash("success", "Job successfully updated!");
        res.redirect("/jobs");
    } catch (error) {
        req.flash("error", "Error updating job.");
        res.redirect(`/jobs/${req.params.id}/edit`);
    }
};


const deleteJob = async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job || job.createdBy.toString() !== req.user._id.toString()) {
            req.flash("error", "Unauthorized or job not found.");
            return res.redirect("/jobs");
        }
        await Job.findByIdAndDelete(req.params.id);
        req.flash("success", "Job successfully deleted.");
        res.redirect("/jobs");
    } catch (error) {
        req.flash("error", "Error deleting job.");
        res.redirect("/jobs");
    }
};

module.exports = {
    getAllJobs,
    newJobForm,
    addJob,
    editJobForm,
    updateJob,
    deleteJob
};