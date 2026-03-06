const JUDGE0_API = "https://ce.judge0.com";

// JavaScript (Node.js 12.14.0) language ID
const JAVASCRIPT_LANG_ID = 63;

export interface Judge0Submission {
  token: string;
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  status: {
    id: number;
    description: string;
  };
  time: string;
  memory: number;
}

export async function executeCode(sourceCode: string, stdin: string = ""): Promise<Judge0Submission> {
  const response = await fetch(`${JUDGE0_API}/submissions/?base64_encoded=false&wait=true`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      source_code: sourceCode,
      language_id: JAVASCRIPT_LANG_ID,
      stdin,
    }),
  });

  if (!response.ok) {
    throw new Error(`Judge0 API error: ${response.status}`);
  }

  return response.json();
}

export function getOutput(result: Judge0Submission): string {
  if (result.compile_output) return result.compile_output.trim();
  if (result.stderr) return result.stderr.trim();
  if (result.stdout) return result.stdout.trim();
  return "(no output)";
}

export function isAccepted(result: Judge0Submission): boolean {
  // Status ID 3 = Accepted
  return result.status.id === 3;
}

export async function runAgainstTestCases(
  sourceCode: string,
  testCases: { id: string; input: string; expectedOutput: string }[]
): Promise<{
  results: {
    testCaseId: string;
    input: string;
    expected: string;
    actual: string;
    passed: boolean;
    time: string;
    memory: number;
  }[];
  allPassed: boolean;
}> {
  const results = await Promise.all(
    testCases.map(async (tc) => {
      try {
        const result = await executeCode(sourceCode, tc.input);
        const actual = getOutput(result);
        return {
          testCaseId: tc.id,
          input: tc.input,
          expected: tc.expectedOutput,
          actual,
          passed: actual === tc.expectedOutput,
          time: result.time || "0",
          memory: result.memory || 0,
        };
      } catch (error) {
        return {
          testCaseId: tc.id,
          input: tc.input,
          expected: tc.expectedOutput,
          actual: error instanceof Error ? error.message : "Execution error",
          passed: false,
          time: "0",
          memory: 0,
        };
      }
    })
  );

  return {
    results,
    allPassed: results.every((r) => r.passed),
  };
}
