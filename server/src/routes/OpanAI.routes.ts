import { Router } from "express";
import { OpenAIController } from "@/controller";

class OpenAIRoutes {
    public static route(): Router {
        const routes = Router();
        routes.route("/jobroles").post(OpenAIController.GetJobRolesController); // fetch all roles
        routes.route("/questionsummerized").post(OpenAIController.GenerateInterviewQuestionsSetController); // generate result set
        routes.route("/generate/summerizedquestions").post(OpenAIController.GenerateIndividualQuestionGenratorController); // get one regeneration of question
        routes.route("/fetch/expertise").post(OpenAIController.GetJobExpertiseController); // fetch expertise
        routes.route("/add/expertise").post(OpenAIController.SaveExpertiseManually); // to add new expertise
        routes.route("/train/modeldata").post(OpenAIController.SaveFileWithExistingPromptResult)
        return routes;
    }
};

export default OpenAIRoutes;