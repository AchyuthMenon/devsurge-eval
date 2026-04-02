const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

async function addFunctionNameColumn() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_NAME
        });

        console.log("Connected to MySQL... Adding function_name column to questions...");
        await connection.execute(`
            ALTER TABLE questions 
            ADD COLUMN function_name VARCHAR(255) NULL AFTER difficulty;
        `);
        console.log("Successfully added function_name column!");
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

addFunctionNameColumn();
