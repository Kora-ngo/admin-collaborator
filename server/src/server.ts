import cors from 'cors';
import dotenv from 'dotenv';
import app from './app.js';
import sequelize from './config/database.js';


// Loading the environment variable from .env 
dotenv.config();
const port = process.env.PORT;

app.use(cors());

// Start the server 
app.listen(port, async () => {
    await sequelize.sync({force: true});
    console.log(`Server is running on http://localhost:${port}`);
});