-- Drop the database if it exists, then create a new one
DROP DATABASE IF EXISTS devsurge;
CREATE DATABASE devsurge;
USE devsurge;

-- Create the users table
CREATE TABLE users (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create the questions table
CREATE TABLE questions (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    difficulty VARCHAR(50) NOT NULL,
    starter_code TEXT,
    hints JSON
);

-- Create test_cases table (Linked to questions)
CREATE TABLE test_cases (
    id VARCHAR(50) PRIMARY KEY,
    question_id VARCHAR(50) NOT NULL,
    input TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Create the submissions table
CREATE TABLE submissions (
    id VARCHAR(50) PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    question_id VARCHAR(50) NOT NULL,
    submitted_code TEXT NOT NULL,
    output TEXT,
    status ENUM('accepted', 'wrong_answer', 'error') NOT NULL,
    execution_time VARCHAR(50),
    memory_used VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
);

-- Output a success message
SELECT 'Database and tables created successfully!' AS Status;
