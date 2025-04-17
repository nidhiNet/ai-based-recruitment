import mongoose from "mongoose";

export interface IQuestionsDTO {
    _id: mongoose.Types.ObjectId;
    role: string;
    questions: IQuestions;
}

export interface IQuestions {
    [key: string]: {
        [key: string]: {
            questions: IQuestionsList[]
        }
    };
}

export interface IQuestionsList {
    ques: string;
}