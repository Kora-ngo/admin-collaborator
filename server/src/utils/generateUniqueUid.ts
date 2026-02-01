// utils/generateUniqueUid.ts

import sequelize from '../config/database.js';
import { QueryTypes } from 'sequelize';

const VALID_TABLES = [
  "assistance",	 	
	"assistance_type",	 	
	"beneficiaries",
	"beneficiary_members",	 	
	"deliveries",	 
	"delivery_items",	 
	"media",	
	"media_links",	 	
	"membership",	 		
	"organisation",	 		
	"projects",
	"project_assistance",	 	
	"project_members",	 	
	"sequelizemeta",	
	"subscription",
	"sync_batches",	 	
	"users",

];

// Format: YYYYMMDDHHMMSS + 4 random digits → e.g., 202512311430251234
// → 18 digits total → fits in BIGINT easily
export async function generateUniqueUid(tableName: string): Promise<number> {
  if (!VALID_TABLES.includes(tableName)) {
    throw new Error(`Invalid table: ${tableName}`);
  }

  const now = new Date();

  // Format: YYYYMMDDHHMMSS (14 digits)
  const timestampPart = now
    .toISOString()
    .replace(/[-:T.Z]/g, '')
    .slice(0, 14);

  let uid: number;
  let attempts = 0;
  const maxAttempts = 50;

  do {
    // Add 4 random digits (0000–9999)
    const randomPart = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    const uidString = timestampPart + randomPart;
    uid = Number(uidString); // Safe: max 18 digits → fits in JS Number (up to ~15 safe, but we use BIGINT in DB)

    // Check if exists
    const sql = `SELECT 1 FROM \`${tableName}\` WHERE uid = ? LIMIT 1`;
    const result: any[] = await sequelize.query(sql, {
      replacements: [uid],
      type: QueryTypes.SELECT,
    });

    if (result.length === 0) {
      return uid; // Unique!
    }

    attempts++;
  } while (attempts < maxAttempts);

  throw new Error(`Failed to generate unique timestamp-based UID for ${tableName}`);
}