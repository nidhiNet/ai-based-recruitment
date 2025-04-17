import "dotenv/config";
import express from "express";
import Http from "node:http";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import mongoose from "mongoose";
import Routes from "@/routes";
import { AppHelper, ConsoleOverride } from "@/helpers";
import { ErrorMiddleware } from "@/middleware";

class App {
    public static app: express.Application;
    public static http: Http.Server;
    public static PORT: number = parseInt(process.env.PORT as string, 10) || 3010;

    public static async run(): Promise<void> {
        ConsoleOverride.override();
        App.app = express();
        App.http = Http.createServer(this.app);
        App.app.set("port", this.PORT);
        await App.init();
        App.http.on("close", console.log);
        App.http.on("listening", () => console.log("OK 🟢"));
        App.http.listen(this.PORT, () => console.log(`Server runnning on PORT ${App.PORT} 🚀`));
    };

    private static async init(): Promise<void> {
        /** Database Connection */
        await mongoose.connect(process.env.MONGO_URL as string).then(() => console.log("Database connected 🌱")).catch((error) => {
            console.error("error", error);
            process.exit(1);
        });
        /** Middleware Configuration */
        App.app.use(express.json());
        App.app.use(bodyParser.json());
        App.app.use(bodyParser.urlencoded({ extended: false }));
        
        /** Security Middleware */
        App.app.use(helmet());
        App.app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));

        /** Logger Middleware */
        App.app.use(morgan("dev"));
        App.app.use(cors({
            origin: '*',
            methods: ['GET', 'POST', 'PUT', 'DELETE'],
            preflightContinue: false
        }));
        App.app.options("*");

        /** Routes Configuration */
        App.app.use("/api/v1", Routes.routes());
        App.app.use("*", AppHelper.notRoute);
        App.app.use(ErrorMiddleware.catchGlobalErrors);

        process.on("SIGINT", () => {
            try {
                App.http.close();
            } catch (error) {
                console.error(`Error occurred during shutdown server`, error);
            } finally {
                process.exit(1); /** Shutdown server */
            }
        }).on("SIGTERM", () => {
            App.http.close();
        }).on("SIGHUP", () => {
            process.kill(process.pid, "SIGTERM");
        }).on("uncaughtException", (error) => {
            console.error(`Uncaught exception thrown`, error);
            App.http.close();
            process.exit(1);
        }).on("unhandledRejection", (error) => {
            console.error(`Unhandled rejection thrown`, error);
            process.exit(1);
        });
    }
};

export default App;