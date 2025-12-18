import cors from 'cors';
import dotenv from 'dotenv';
import app from './app.js';
// Loading the environment variable from .env 
dotenv.config();
const port = process.env.PORT;
app.use(cors());
// Start the server 
app.listen(port, () => {
    console.log('Hello', port);
});
//# sourceMappingURL=server.js.map