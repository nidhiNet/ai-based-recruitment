import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface DTO {
  
  questions?: any[];
}
export interface QuestionsSummerizedWordDTO {
  _id: string;
  role: string;
  experience: string;
  expertise: [string];
  criteria: {
    [key: string]: {
      [key: string]: DTO[];
    };
  };
}

export interface InitialStateTypes {
  SummerizedQuestionWordList: any;
}

const initialState: InitialStateTypes = {
  SummerizedQuestionWordList: {
    _id: "",
    role: "",
    experience: "",
    expertise: [""],
    criteria: {},
  },
};

export const globalReplicaSlice = createSlice({
  name: "global-replica",
  initialState,
  reducers: {
    onSetSummerizedQuestionsWordList: (state, action: PayloadAction<any>) => {
      state.SummerizedQuestionWordList = action.payload;
    },
    onSetNewQuestionUnderCategory: (
      state,
      {
        payload: { category, subCategory, value, qIndex,subcatIndex },
      }: PayloadAction<{
        category: string;
        subCategory: string;
        value: string;
        qIndex: number;
        subcatIndex:number;
      }>,
    ) => {
        const stageCriteria = state.SummerizedQuestionWordList.criteria[category];
        if (stageCriteria) {
          const categoryToUpdate = stageCriteria.find((categoryItem: any, index: any) =>
            categoryItem.category === subCategory || index === subcatIndex
          );
  
          if (categoryToUpdate) {
            const questionToUpdate = categoryToUpdate.questions[qIndex];
            if (questionToUpdate) {
              questionToUpdate.ques = value;
            }
          }
        }
    },    
  },
});

export const {
  onSetSummerizedQuestionsWordList,
  onSetNewQuestionUnderCategory,
} = globalReplicaSlice.actions;
export default globalReplicaSlice.reducer;
