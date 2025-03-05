const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const jobSchema = new Schema({
    company: {
        type: String,
        required: true,
        minlength: 3,
    },
    position: {
        type: String,
        required: true,
        minlength: 3,
    },
    status: {
        type: String,
        required: true,
        enum: ["open", "closed", "interview"],
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
});

module.exports = mongoose.model("Job", jobSchema);
