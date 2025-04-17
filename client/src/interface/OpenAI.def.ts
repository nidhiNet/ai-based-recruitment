
export interface IQuestionsDTO {
    _id: string;
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
    rating: number;
}

export interface IJobRoleDTO {
    _id: string;
    role: string;
    roles: ReadonlyArray<string>
}

export interface IExpertiseDTO {
    _id: string;
    role: string;
    expertise: Array<string>;
}