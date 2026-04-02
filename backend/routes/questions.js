const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

router.get('/', async (req, res) => {
    try {
        const [questions] = await db.query('SELECT * FROM questions');
        const [testCases] = await db.query('SELECT * FROM test_cases');

        const questionsWithTests = questions.map(q => ({
            id: q.id,
            title: q.title,
            description: q.description,
            type: q.type,
            difficulty: q.difficulty,
            starterCode: q.starter_code,
            starterCodePython: q.starter_code_python || null,
            starterCodeJava: q.starter_code_java || null,
            functionName: q.function_name,
            hints: typeof q.hints === 'string' ? JSON.parse(q.hints) : q.hints,
            testCases: testCases.filter(t => t.question_id === q.id).map(t => ({
                id: t.id,
                input: t.input,
                expectedOutput: t.expected_output
            }))
        }));

        res.json(questionsWithTests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
