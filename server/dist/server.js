import cors from 'cors';
import dotenv from 'dotenv';
import app from './app.js';
import sequelize from './config/database.js';
// Loading the environment variable from .env 
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}
console.log('=== DATABASE DEBUG ===');
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_PORT:', process.env.DB_PORT, 'Type:', typeof process.env.DB_PORT);
console.log('DB_USER:', process.env.DB_USER);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PASSWORD set?', !!process.env.DB_PASSWORD);
console.log('Parsed port:', parseInt(process.env.DB_PORT || '3306'));
console.log('======================');
const port = Number(process.env.PORT) || 5000;
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully.');
        // if(process.env.NODE_ENV === 'development'){
        //     await sequelize.sync({ alter: true });
        //     console.log('Database synced with alter: true (development mode)');
        // }
        // Then: start server
        app.listen(port, '0.0.0.0', () => {
            console.log(`Server is running on port ${port}`);
            console.log(`Environment: ${process.env.NODE_ENV}`);
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