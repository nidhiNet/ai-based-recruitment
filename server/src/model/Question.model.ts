import mongoose from "mongoose";

const QuestionSchema = new mongoose.Schema({
    role: {
        type: String,
        required: true
    },
    questions: {
        type: Map,
        required: true
    }
});

const QuestionModel = mongoose.model("Questions", QuestionSchema);
export default QuestionModel;