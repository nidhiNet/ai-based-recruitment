import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface QuestionsListDTO {
    ques: string;
    rating: number;
}
export interface QuestionsDTO {
    role: string;
    _id: string;
    questions: {
        [key: string]: {
            [key: string]: {
                questions: QuestionsListDTO[]
            }
        }
    }

}
export interface InitialStateTypes {
    QuestionsData: QuestionsDTO
};

const initialState: InitialStateTypes = {
    QuestionsData: {
        role: '',
        _id: "",
        questions: {}
    }
};

export const globalSlice = createSlice({
    name: "global",
    initialState,
    reducers: {
        setQuestionsList: (state, action: PayloadAction<any>) => {
            console.log("action", action)
            state.QuestionsData = action.payload;
        },
        setQuestionsRatings: (
            state,
            { payload: { category, subcategory, ques, rating } }: PayloadAction<{ category: string; subcategory: string; ques: string; rating: number }>
        ) => {
            const questions = state.QuestionsData.questions?.[category]?.[subcategory]?.questions || [];

            state.QuestionsData.questions = {
                ...state.QuestionsData.questions,
                [category]: {
                    ...state.QuestionsData.questions?.[category],
                    [subcategory]: {
                        ...state.QuestionsData.questions?.[category]?.[subcategory],
                        questions: questions.map(q => (q.ques === ques ? { ...q, rating } : q))
                    }
                }
            };
        },
        setRegenerateQuestionsList: (state, { payload: { category, subcategory, newQuestionsList } }: PayloadAction<{ category: string; subcategory: string, newQuestionsList: QuestionsListDTO[] }>) => {
            state.QuestionsData.questions = {
                ...state.QuestionsData.questions,
                [category]: {
                    ...state.QuestionsData.questions?.[category],
                    [subcategory]: {
                        questions: newQuestionsList
                    }
                }
            }
        }
    }
});

export const { setQuestionsList, setQuestionsRatings, setRegenerateQuestionsList } = globalSlice.actions;
export default globalSlice.reducer;