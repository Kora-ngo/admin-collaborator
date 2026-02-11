import  express, {type Request, type Response, type NextFunction} from "express";
import routes from "./routes/index.js";
import cors from 'cors';
import { handleGlobalError } from "./utils/handleGlobalError.js";

const app = express();

// Allow my frontend dureing dev
app.use(cors({
    origin: [
        'https://space.kora.onl',              // Production frontend (custom domain)
        'https://kora-space.vercel.app',    // Vercel default domain
        'http://localhost:3000',               // Local React dev
        'http://localhost:5173',               // Local Vite dev
        'http://localhost:4200',               // Local Angular dev (if applicable)
    ],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
}));


// Middleware 
app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));


app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.log(req.path, req.method);
    // Handle everything else with the utility
    // handleGlobalError(err, req, res);
    next();
});

// Plugging all the routes 
app.use("/api", routes);

export default app;