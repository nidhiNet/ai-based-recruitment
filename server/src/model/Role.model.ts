import mongoose from "mongoose";

const JobRoleSchema = new mongoose.Schema({
    roles: {
        type: [String],
        required: true
    }
});

const JobRoleModel = mongoose.model("JobRole", JobRoleSchema);
export default JobRoleModel;