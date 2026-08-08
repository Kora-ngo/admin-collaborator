import cors from 'cors';
import dotenv from 'dotenv';
import app from './app.js';
import sequelize from './config/database.js';
import os from 'os';
import cron from "node-cron";
import { storageClient, BUCKET_NAME } from "./config/storage.js";
import { HeadBucketCommand } from "@aws-sdk/client-s3";
// Loading the environment variable from .env 
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}
const port = Number(process.env.PORT) || 5000;
// This prevents nodemon from restarting on unhandled promise rejections:
process.on("uncaughtException", (err) => {
    console.error("❌ Uncaught Exception:", err);
});
process.on("unhandledRejection", (reason) => {
    console.error("❌ Unhandled Rejection:", reason);
});
// cron.schedule("0 2 * * *", async () => {
// console.log("🤖 Automatic daily backup triggered");
//     try {
//         await axios.post(
//             `http://localhost:${port}/api/backup/automatic`,
//             {},
//             {
//                 headers: {
//                     Authorization: `Bearer ${process.env.CRON_SECRET_TOKEN}`,
//                 },
//             }
//         );
//     } catch (err) {
//         console.error("Cron backup failed:", err);
//     }
// })
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log('Database connected successfully ✅');
        console.log("B2 Config check:", {
            endpoint: process.env.B2_ENDPOINT,
            keyId: process.env.B2_KEY_ID?.substring(0, 6) + "...",
            keyLength: process.env.B2_KEY_ID?.length,
            appKeyLength: process.env.B2_APPLICATION_KEY?.length,
            bucket: process.env.B2_BUCKET_NAME,
        });
        // Connection with the B2 Storage
        try {
            const command = new HeadBucketCommand({ Bucket: BUCKET_NAME });
            await storageClient.send(command);
            console.log("✅ B2 Storage connected to bucket:", BUCKET_NAME);
        }
        catch (err) {
            console.error("❌ B2 Storage connection failed:", err);
        }
        // if(process.env.NODE_ENV === 'development'){
        //     await sequelize.sync({ alter: true });
        //     console.log('Database synced with alter: true (development mode)');
        // }
        await sequelize.sync({ alter: true });
        console.log('Tables synced ✅');
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