import  express, {Request, Response, NextFunction} from "express";
import cors from 'cors';
import dotenv from 'dotenv';

// Loading the environment variable from .env 
dotenv.config();

const app = express();
const port = process.env.PORT;

// Middleware 
app.use(express.json());

app.use((req: Request, res: Response, next: NextFunction) => {
    console.log(req.path, req.method);
    next();
})

app.use(cors());

// Start the server 
app.listen(port, () => {
    console.log('Server is running on port', port)
});