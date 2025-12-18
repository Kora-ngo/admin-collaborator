import  express, {type Request, type Response, type NextFunction} from "express";
import routes from "./routes/index.js";

const app = express();

// Middleware 
app.use(express.json());


app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(req.path, req.method);
    next();
});

// Plugging all the routes 
app.use("/api", routes);

export default app;