// utils/generateUniqueUid.ts
import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

const VALID_TABLES = ['users', 'organisation', 'subscription', 'membership'];

export async function generateUniqueUid(tableName: string): Promise<number> {
  if (!VALID_TABLES.includes(tableName)) {
    throw new Error(`Invalid table: ${tableName}`);
  }

  const maxAttempts = 20;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate a 10-digit random number
    const uid = Math.floor(1000000000 + Math.random() * 9000000000);

    // Use backticks manually — simple and reliable for MariaDB/MySQL
    const sql = `SELECT 1 FROM \`${tableName}\` WHERE uid = ? LIMIT 1`;

    const result: any[] = await sequelize.query(sql, {
      replacements: [uid],
      type: QueryTypes.SELECT,
    });

    if (result.length === 0) {
      return uid; // Unique!
    }
  }

  throw new Error(`Could not generate unique UID for ${tableName} after ${maxAttempts} tries`);
}