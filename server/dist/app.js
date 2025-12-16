import express from "express";
import routes from "./routes/index.js";
const app = express();
// Middleware 
app.use(express.json());
app.use((req, res, next) => {
    console.log(req.path, req.method);
    next();
});
// Plugging all the routes 
app.use("/api", routes);
export default app;
