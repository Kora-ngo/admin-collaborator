// utils/generateUniqueUid.ts
import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

interface TableUidMap {
  [key: string]: string;
}

const TABLE_UID_COLUMN_MAP: TableUidMap = {
  user: 'uid',
  organization: 'uid',
  subscription: 'uid',
  member: 'uid',
  // add more tables as needed
};

const VALID_TABLES = Object.keys(TABLE_UID_COLUMN_MAP);

export async function generateUniqueUid(tableName: string): Promise<number> {
  if (!VALID_TABLES.includes(tableName)) {
    throw new Error(`Invalid table name: ${tableName}. Allowed: ${VALID_TABLES.join(', ')}`);
  }

  const uidColumn = TABLE_UID_COLUMN_MAP[tableName];
  const maxAttempts = 20; // Increased slightly — numeric collisions are more likely than UUIDs

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Generate a large random number: 1_000_000_000 to 9_999_999_999 (10 digits)
    // This gives ~9 billion possible values — plenty for most apps
    const rawUid = Math.floor(1000000000 + Math.random() * 9000000000);

    // Check if it already exists
    const [result]: any[] = await sequelize.query(
      `SELECT 1 FROM "${tableName}" WHERE "${uidColumn}" = ? LIMIT 1`,
      {
        replacements: [rawUid],
        type: QueryTypes.SELECT,
      }
    );

    if (!result) {
      // Unique! Return as number
      return rawUid;
    }

    // Collision → try again
  }

  throw new Error(`Failed to generate unique numeric UID for table "${tableName}" after ${maxAttempts} attempts`);
}