const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function addErrorTypeColumn() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log("Connected to MySQL... Adding error_type column...");
        await connection.execute(`
            ALTER TABLE submissions 
            ADD COLUMN error_type VARCHAR(255) NULL AFTER status;
        `);
        console.log("Successfully added error_type column!");
        process.exit(0);
    } catch (err) {
        if (err.code === 'ER_DUP_FIELDNAME') {
            console.log("Column already exists. Skipping.");
            process.exit(0);
        }
        console.error("Error altering table:", err);
        process.exit(1);
    }
}

addErrorTypeColumn();
