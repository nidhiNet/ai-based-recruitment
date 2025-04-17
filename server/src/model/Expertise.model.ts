import mongoose from "mongoose";

const ExpertiseSchema = new mongoose.Schema({
    role: {
        type: String,
        unique: true,
        required: true
    },
    expertise: {
        type: [String],
        required: true
    },
    experiencelevel: {
        type: String,
        required:true
    }
});

const ExpertiseModel = mongoose.model("Expertise", ExpertiseSchema);
export default ExpertiseModel;