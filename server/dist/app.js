import express, {} from "express";
import routes from "./routes/index.js";
import cors from 'cors';
import { handleGlobalError } from "./utils/handleGlobalError.js";
const app = express();
// Allow my frontend dureing dev
app.use(cors({
    origin: function (origin, callback) {
        if (!origin) {
            // Allow request with no origin (like mobile apps, postman, curl)
            return callback(null, true);
        }
        const allowedOrigins = [
            'https://kora.onl/space', // Production frontend (custom domain)
            'https://kora-space.vercel.app', // Vercel default domain
            'http://localhost:3000', // Local React dev
            'http://localhost:5173', // Local Vite dev
            'http://localhost:4200', // Local Angular dev (if applicable)
        ];
        if (allowedOrigins.includes(origin)) {
            callback(null, true);
        }
        else {
            callback(null, true);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
// Middleware 
app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use((err, req, res, next) => {
    console.log(req.path, req.method);
    // Handle everything else with the utility
    // handleGlobalError(err, req, res);
    next();
});
// Plugging all the routes 
app.use("/api", routes);
export default app;
//# sourceMappingURL=app.js.map