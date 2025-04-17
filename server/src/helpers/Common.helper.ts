import { IQuestionsDTO } from "@/interface/OpenAI.def";
import { CATEGORY } from "@/utils/category.constant";

class CommonHelper {
    public static GetPreparedJSONResponse = (result:any) => {
        const questions = Object.keys(result?.questions);
        if (questions.length <= 1) {
            const quesKey = questions[0];
            const secondCategoryQuestions = result?.questions?.[quesKey]?.[CATEGORY.FIRST_ROUND_INTERVIEW];
            delete result?.questions?.[quesKey]?.[CATEGORY.FIRST_ROUND_INTERVIEW];
            return {
                ...result?.questions,
                [CATEGORY.FIRST_ROUND_INTERVIEW]: { ...secondCategoryQuestions }
            }
        }
        return result;
    }
};

export default CommonHelper;