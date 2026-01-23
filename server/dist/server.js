import cors from 'cors';
import dotenv from 'dotenv';
import app from './app.js';
import sequelize from './config/database.js';
// Loading the environment variable from .env 
dotenv.config();
const port = process.env.PORT;
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');
        // if(process.env.NODE_ENV === 'development'){
        //     await sequelize.sync({ alter: true });
        //     console.log('Database synced with alter: true (development mode)');
        // }
        // Then: start server
        app.listen(port, () => {
            console.log(`Server is running on http://localhost:${port}`);
        });
    }
    catch (error) {
        console.error('Unable to start server:', error);
        process.exit(1); // Stop the app if DB fails
    }
};
// Start the server 
startServer();
//# sourceMappingURL=server.js.map