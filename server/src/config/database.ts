import { Sequelize } from "sequelize";
import dotenv from 'dotenv';

// Load .env in development
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

const sequelize = new Sequelize({
    dialect: 'mysql',
    host:  process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || 'railway',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    dialectOptions: {
    //   ssl: {
    //   rejectUnauthorized: false,   // Accept self-signed/proxy cert
    // },
    // Optional but helpful: longer timeout + keep-alive
    connectTimeout: 60000,
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});



export default sequelize;