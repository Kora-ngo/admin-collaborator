import express, {} from "express";
import routes from "./routes/index.js";
import cors from 'cors';
const app = express();
// Allow my frontend dureing dev
app.use(cors());
// Middleware 
app.use(express.json());
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});
// Plugging all the routes 
app.use("/api", routes);
export default app;
//# sourceMappingURL=app.js.map