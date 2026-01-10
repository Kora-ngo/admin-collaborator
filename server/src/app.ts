import  express, {type Request, type Response, type NextFunction} from "express";
import routes from "./routes/index.js";
import cors from 'cors';
import { handleGlobalError } from "./utils/handleGlobalError.js";

const app = express();

// Allow my frontend dureing dev
app.use(cors());


// Middleware 
app.use(express.json());


app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.log(req.path, req.method);
    // Handle everything else with the utility
    handleGlobalError(err, req, res);
    next();
});

// Plugging all the routes 
app.use("/api", routes);

export default app;