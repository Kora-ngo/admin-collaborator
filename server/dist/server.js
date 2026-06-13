import cors from 'cors';
import dotenv from 'dotenv';
import app from './app.js';
import sequelize from './config/database.js';
import SuperAdminModel from './models/SuperAdmin.js';
import os from 'os';
// Loading the environment variable from .env 
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}
const port = Number(process.env.PORT) || 5000;
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully ✅');
        // if(process.env.NODE_ENV === 'development'){
        //     await sequelize.sync({ alter: true });
        //     console.log('Database synced with alter: true (development mode)');
        // }
        // await sequelize.sync({ force: true });
        // console.log('Tables synced ✅');
        // Then: start server
        app.listen(port, '0.0.0.0', () => {
            console.log(`Environment: ${process.env.NODE_ENV}`);
            console.log(`\n🚀 Server running on port ${port}`);
            // Get all network interfaces
            const nets = os.networkInterfaces();
            console.log('\n📡 Available on:');
            console.log(`   Local:    http://localhost:${port}`);
            // Find and display all IPv4 addresses
            for (const name of Object.keys(nets)) {
                for (const net of nets[name]) {
                    // Only show IPv4 and skip internal (loopback)
                    if (net.family === 'IPv4' && !net.internal) {
                        console.log(`   Network:  http://${net.address}:${port}  ← use this on other devices`);
                    }
                }
            }
            console.log('\n');
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