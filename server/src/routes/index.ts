import { Router } from "express";
import OpenAIRoutes from "@/routes/OpanAI.routes";

class Routes {
    public static routes(): Router {
        const route = Router();
        route.use("/opanai", OpenAIRoutes.route());
        return route;
    }   
};

export default Routes;