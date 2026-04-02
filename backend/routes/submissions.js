const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');
const axios = require('axios');

const JUDGE0_BASE_URL = 'https://ce.judge0.com';

// Judge0 language IDs
const LANGUAGE_IDS = {
    javascript: 93,  // JavaScript (Node.js 18)
    python: 71,       // Python 3
    java: 62          // Java (OpenJDK 13)
};

/**
 * Normalize output for comparison.
 * Handles whitespace, boolean casing, array formatting differences.
 */
function normalizeOutput(str) {
    if (!str) return '';
    let s = str.trim();
    // Normalize booleans: True/TRUE/true -> true, False/FALSE/false -> false
    if (/^true$/i.test(s)) return 'true';
    if (/^false$/i.test(s)) return 'false';
    // Normalize arrays: remove spaces around commas/brackets for comparison
    // "[1, 2, 3]" and "[1,2,3]" should match
    s = s.replace(/\s*,\s*/g, ', ');
    // Normalize number outputs: "2.0" -> "2" for integer results
    if (/^-?\d+\.0+$/.test(s)) {
        s = String(parseInt(s));
    }
    return s;
}

/**
 * Build the wrapper code that calls the user's function and prints the result.
 * The wrapper is generated SERVER-SIDE so the user never sees it and can't tamper with it.
 */
function buildWrappedCode(userCode, functionName, input, language) {
    if (!functionName) {
        // No function name = output-prediction type, just run the code as-is
        return userCode;
    }

    // Convert JS-style function name to Python snake_case
    const pythonFuncName = functionName.replace(/([A-Z])/g, '_$1').toLowerCase();

    switch (language) {
        case 'javascript':
            return `${userCode}

;(function() {
    try {
        const __fn = typeof ${functionName} === 'function' ? ${functionName} : undefined;
        if (!__fn) { console.log("__EPSILON_ERR__:Function '${functionName}' not found"); process.exit(1); }
        const __result = __fn(${input});
        if (Array.isArray(__result)) {
            console.log("[" + __result.join(", ") + "]");
        } else if (typeof __result === "object" && __result !== null) {
            console.log(JSON.stringify(__result).replace(/,/g, ", "));
        } else {
            console.log(__result);
        }
    } catch(e) {
        console.log("__EPSILON_ERR__:" + e.toString());
        process.exit(1);
    }
})();`;

        case 'python':
            return `import json, sys
${userCode}

if __name__ == "__main__":
    try:
        __fn = None
        for __name in ["${pythonFuncName}", "${functionName}"]:
            if __name in dir() and callable(eval(__name)):
                __fn = eval(__name)
                break
        if __fn is None:
            print("__EPSILON_ERR__:Function '${pythonFuncName}' or '${functionName}' not found")
            sys.exit(1)
        __result = __fn(${input})
        if isinstance(__result, list):
            print("[" + ", ".join(str(x) for x in __result) + "]")
        elif isinstance(__result, bool):
            print("true" if __result else "false")
        elif __result is None:
            print("null")
        else:
            print(__result)
    except Exception as e:
        print(f"__EPSILON_ERR__:{e}")
        sys.exit(1)
`;

        case 'java':
            return buildJavaWrapper(userCode, functionName, input);

        default:
            return userCode;
    }
}

/**
 * Build Java wrapper. Java requires special handling because:
 * 1. All code must be inside a class
 * 2. The user writes a Solution class with static methods
 * 3. We wrap it with a Main class that calls their method
 */
function buildJavaWrapper(userCode, functionName, input) {
    // Parse the input to determine types and build the Java call
    const javaCall = buildJavaFunctionCall(functionName, input);

    // The user's code should be a Solution class. We embed it and add a Main entry point.
    return `import java.util.*;

${userCode}

class Main {
    public static void main(String[] args) {
        try {
            ${javaCall.setup}
            ${javaCall.invocation}
            ${javaCall.printResult}
        } catch (Exception e) {
            System.out.println("__EPSILON_ERR__:" + e.getMessage());
            System.exit(1);
        }
    }
}
`;
}

/**
 * Parse test case input and build Java method invocation code.
 * Handles: int, int[], String, boolean, and null
 */
function buildJavaFunctionCall(functionName, input) {
    const args = parseInputArgs(input);
    const javaArgs = [];
    const setupLines = [];

    args.forEach((arg, i) => {
        const trimmed = arg.trim();
        if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
            // Array of ints
            const inner = trimmed.slice(1, -1).trim();
            if (inner === '') {
                setupLines.push(`int[] __arg${i} = new int[]{};`);
            } else {
                setupLines.push(`int[] __arg${i} = new int[]{${inner}};`);
            }
            javaArgs.push(`__arg${i}`);
        } else if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
            // String
            javaArgs.push(trimmed);
        } else if (trimmed === 'null') {
            javaArgs.push('null');
        } else if (trimmed === 'true' || trimmed === 'false') {
            javaArgs.push(trimmed);
        } else {
            // Numeric
            javaArgs.push(trimmed);
        }
    });

    const setup = setupLines.join('\n            ');
    const invocation = `Object __result = Solution.${functionName}(${javaArgs.join(', ')});`;
    const printResult = `
            if (__result instanceof int[]) {
                int[] __arr = (int[]) __result;
                StringBuilder sb = new StringBuilder("[");
                for (int i = 0; i < __arr.length; i++) {
                    if (i > 0) sb.append(", ");
                    sb.append(__arr[i]);
                }
                sb.append("]");
                System.out.println(sb.toString());
            } else if (__result instanceof Boolean) {
                System.out.println(((Boolean)__result) ? "true" : "false");
            } else if (__result instanceof Double) {
                double d = (Double) __result;
                if (d == Math.floor(d) && !Double.isInfinite(d)) {
                    System.out.println((int) d);
                } else {
                    System.out.println(d);
                }
            } else {
                System.out.println(__result);
            }`;

    return { setup, invocation, printResult };
}

/**
 * Parse comma-separated input arguments, respecting brackets and quotes.
 * E.g. "[1, 2, 3], 5" -> ["[1, 2, 3]", "5"]
 */
function parseInputArgs(input) {
    if (!input || input.trim() === '') return [];
    const args = [];
    let current = '';
    let depth = 0;
    let inString = false;

    for (let i = 0; i < input.length; i++) {
        const ch = input[i];
        if (ch === '"' && (i === 0 || input[i - 1] !== '\\')) {
            inString = !inString;
            current += ch;
        } else if (inString) {
            current += ch;
        } else if (ch === '[') {
            depth++;
            current += ch;
        } else if (ch === ']') {
            depth--;
            current += ch;
        } else if (ch === ',' && depth === 0) {
            args.push(current.trim());
            current = '';
        } else {
            current += ch;
        }
    }
    if (current.trim()) args.push(current.trim());
    return args;
}


router.post('/evaluate', async (req, res) => {
    try {
        const { userId, questionId, submittedCode, language = 'javascript' } = req.body;

        // Validate language
        if (!LANGUAGE_IDS[language]) {
            return res.status(400).json({ error: `Unsupported language: ${language}` });
        }

        // 1. Fetch the question's test cases from our database
        const [testCases] = await db.query('SELECT * FROM test_cases WHERE question_id = ?', [questionId]);

        if (!testCases || testCases.length === 0) {
            return res.status(400).json({ error: "No test cases found for this question." });
        }

        const [questionRow] = await db.query('SELECT function_name, type FROM questions WHERE id = ?', [questionId]);
        const functionName = questionRow.length > 0 ? questionRow[0].function_name : null;
        const questionType = questionRow.length > 0 ? questionRow[0].type : null;

        // Enforce JS-only for certain question types
        if (['output-prediction', 'code-completion'].includes(questionType) && language !== 'javascript') {
            return res.status(400).json({ error: "This challenge type only supports JavaScript." });
        }

        // Start Judge0 Execution and AI Detection in parallel

        // --- A. Judge0 Execution with server-side comparison ---
        const judgePromise = (async () => {
            let allPassed = true;
            let finalOutput = "";
            let maxExecTime = 0;
            let maxMemory = 0;
            let capturedErrorType = null;

            let testIndex = 1;
            for (const tc of testCases) {
                const wrappedCode = buildWrappedCode(
                    submittedCode,
                    functionName,
                    tc.input,
                    language
                );

                const submission = {
                    language_id: LANGUAGE_IDS[language],
                    source_code: wrappedCode,
                    stdin: functionName ? "" : (tc.input || ""),
                    // NOTE: We do NOT send expected_output to Judge0.
                    // Comparison happens on our server to prevent bypass.
                };

                const submissionRes = await axios.post(
                    `${JUDGE0_BASE_URL}/submissions?base64_encoded=false&wait=true`,
                    submission
                );
                const data = submissionRes.data;
                const time = parseFloat(data.time) || 0;
                const memory = parseFloat(data.memory) || 0;

                if (time > maxExecTime) maxExecTime = time;
                if (memory > maxMemory) maxMemory = memory;

                // Check for compilation/runtime errors first (status != 3 means not "Accepted" by Judge0)
                if (data.status.id !== 3) {
                    allPassed = false;
                    const errorOutput = (data.compile_output || data.stderr || data.stdout || "Error").trim();

                    // Clean up internal error markers
                    finalOutput = `Test ${testIndex}: ${errorOutput.replace(/__EPSILON_ERR__:/g, '')}`;

                    if (data.status.id === 5) {
                        capturedErrorType = "Performance Error (Time Limit)";
                    } else if (data.status.id === 6) {
                        capturedErrorType = "Syntax / Compilation Error";
                    } else if (data.status.id >= 7 && data.status.id <= 12) {
                        capturedErrorType = "Runtime Error";
                    } else {
                        capturedErrorType = "System Error";
                    }
                    break;
                }

                // Judge0 ran successfully — now compare output SERVER-SIDE
                const actualOutput = (data.stdout || '').trim();
                const expectedOutput = (tc.expected_output || tc.expectedOutput || '').trim();

                // Check for internal error markers from our wrapper
                if (actualOutput.startsWith('__EPSILON_ERR__:')) {
                    allPassed = false;
                    finalOutput = `Test ${testIndex}: ${actualOutput.replace('__EPSILON_ERR__:', '')}`;
                    capturedErrorType = "Runtime Error";
                    break;
                }

                console.log(`[DEBUG] Test ${testIndex} | Language: ${language} | Expected: '${expectedOutput}' | Got: '${actualOutput}'`);

                // Normalized comparison
                if (normalizeOutput(actualOutput) !== normalizeOutput(expectedOutput)) {
                    allPassed = false;
                    finalOutput = `Test ${testIndex}: Expected "${expectedOutput}" but got "${actualOutput}"`;
                    capturedErrorType = "Logical Error (Wrong Answer)";
                    break;
                }

                finalOutput += `Test ${testIndex}: ${actualOutput}\n`;
                testIndex++;
            }
            finalOutput = finalOutput.trim();
            return {
                status: allPassed ? "accepted" : "wrong_answer",
                errorType: capturedErrorType,
                executionTime: `${(maxExecTime * 1000).toFixed(0)}ms`,
                memoryUsed: `${(maxMemory / 1024).toFixed(1)}MB`,
                finalOutput
            };
        })();

        // --- B. Local Heuristic AI Detection ---
        const heuristicPromise = (async () => {
            let score = 0.05;
            const code = submittedCode.toLowerCase();

            // 1. "As an AI" Bot Phrases (+40%)
            if (code.includes("here is the solution") ||
                code.includes("here's the solution") ||
                code.includes("as an ai") ||
                code.includes("this approach uses") ||
                code.includes("algorithm works by")) {
                score += 0.40;
            }

            // 2. High Comment Density (+30%)
            const lines = code.split('\n');
            const commentPatterns = language === 'python'
                ? l => l.trim().startsWith('#')
                : l => l.trim().startsWith('//') || l.trim().startsWith('/*') || l.trim().startsWith('*');
            const commentLines = lines.filter(commentPatterns).length;
            if (lines.length > 5 && (commentLines / lines.length) > 0.3) {
                score += 0.30;
            }

            // 3. Markdown Formatting Wrappers (+20%)
            if (code.includes("```javascript") || code.includes("```js") || code.includes("```python") || code.includes("```java") || code.includes("```")) {
                score += 0.20;
            }

            // 4. Cleanliness / Lack of Debugging (+10%)
            const debugPatterns = {
                javascript: "console.log",
                python: "print(",
                java: "System.out.print"
            };
            // Don't flag debug absence for languages where print IS the output mechanism
            if (language === 'javascript' && !code.includes(debugPatterns.javascript)) {
                score += 0.10;
            }

            // 5. Verbose AI-style variable names (+15%)
            if (code.includes("currentindex") || code.includes("inputarray") || code.includes("tempvariable") ||
                code.includes("current_index") || code.includes("input_array") || code.includes("temp_variable")) {
                score += 0.15;
            }

            return Math.min(score, 0.99);
        })();

        // Wait for both
        const [judgeResult, aiScoreResult] = await Promise.all([judgePromise, heuristicPromise]);

        const submissionId = crypto.randomUUID();
        const aiScore = aiScoreResult !== null ? parseFloat(aiScoreResult.toFixed(4)) : null;

        // 3. Save the result in our database (with language)
        await db.query(
            'INSERT INTO submissions (id, user_id, question_id, submitted_code, language, output, status, error_type, execution_time, memory_used, ai_score) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [submissionId, userId, questionId, submittedCode, language, judgeResult.finalOutput, judgeResult.status, judgeResult.errorType, judgeResult.executionTime, judgeResult.memoryUsed, aiScore]
        );

        res.json({
            id: submissionId, userId, questionId, submittedCode, language,
            output: judgeResult.finalOutput, status: judgeResult.status,
            errorType: judgeResult.errorType,
            executionTime: judgeResult.executionTime, memoryUsed: judgeResult.memoryUsed,
            aiScore: aiScore,
            createdAt: new Date().toISOString()
        });

    } catch (err) {
        console.error("Evaluation Error:", err?.response?.data || err.stack || err.message);
        res.status(500).json({ error: "Code execution failed." });
    }
});

// The existing GET endpoints remain below
router.get('/user/:userId', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM submissions WHERE user_id = ?', [req.params.userId]);
        const formatted = rows.map(r => ({
            id: r.id, userId: r.user_id, questionId: r.question_id,
            submittedCode: r.submitted_code, language: r.language || 'javascript',
            output: r.output, status: r.status,
            errorType: r.error_type,
            executionTime: r.execution_time, memoryUsed: r.memory_used,
            aiScore: r.ai_score, createdAt: r.created_at
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/user/:userId/question/:questionId', async (req, res) => {
    try {
        const [rows] = await db.query('SELECT * FROM submissions WHERE user_id = ? AND question_id = ?', [req.params.userId, req.params.questionId]);
        const formatted = rows.map(r => ({
            id: r.id, userId: r.user_id, questionId: r.question_id,
            submittedCode: r.submitted_code, language: r.language || 'javascript',
            output: r.output, status: r.status,
            errorType: r.error_type,
            executionTime: r.execution_time, memoryUsed: r.memory_used,
            aiScore: r.ai_score, createdAt: r.created_at
        }));
        res.json(formatted);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
