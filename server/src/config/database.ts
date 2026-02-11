import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

// Load .env in development only
if (process.env.NODE_ENV !== 'production') {
    dotenv.config();
}

// Debug: Log connection info
const sequelize = process.env.DATABASE_URL 
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: 'mysql',
        logging: false,
        dialectOptions: {
            connectTimeout: 60000,
        }
      })
    : new Sequelize({
        dialect: 'mysql',
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '3306'),
        username: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'kora',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
      });

export default sequelize;