import path from 'path';
import { pathToFileURL } from 'url';
import sequelize from '../config/database.js';

const migrationArg = process.argv[2];

if (!migrationArg) {
    console.error('Usage: run-migration.ts <path-to-migration-file>');
    process.exit(1);
}

// Resolve relative to the current working directory (wherever the
// command was run from), not relative to this script's own location.
const migrationPath = path.resolve(process.cwd(), migrationArg);
const migrationUrl = pathToFileURL(migrationPath).href;

const run = async () => {
    const migration = await import(migrationUrl);

    if (typeof migration.up !== 'function') {
        console.error(`No "up" function exported from ${migrationPath}`);
        process.exit(1);
    }

    const queryInterface = sequelize.getQueryInterface();

    try {
        await migration.up(queryInterface);
        console.log(`✅ Migration applied: ${migrationPath}`);
    } catch (error) {
        console.error(`❌ Migration failed: ${migrationPath}`);
        console.error(error);
        process.exit(1);
    } finally {
        await sequelize.close();
    }
};

run();