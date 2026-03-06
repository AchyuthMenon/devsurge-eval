import { useParams, Navigate } from "react-router-dom";
import { useState } from "react";
import Editor from "@monaco-editor/react";
import { questions, questionTypeLabels } from "@/data/questions";
import { useAuth } from "@/context/AuthContext";
import { useSubmissions } from "@/context/SubmissionContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Play, Send, Lightbulb, ChevronDown, ChevronUp, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { executeCode, getOutput, runAgainstTestCases } from "@/services/judge0";

interface TestCaseResult {
  testCaseId: string;
  input: string;
  expected: string;
  actual: string;
  passed: boolean;
  time: string;
  memory: number;
}

const QuestionDetail = () => {
  const { id } = useParams();
  const question = questions.find((q) => q.id === id);
  const { user } = useAuth();
  const { addSubmission, getQuestionSubmissions } = useSubmissions();
  const [code, setCode] = useState(question?.starterCode || "");
  const [showHints, setShowHints] = useState(false);
  const [runOutput, setRunOutput] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<TestCaseResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!question) return <Navigate to="/questions" />;
  if (!user) return <Navigate to="/login" />;

  const pastSubmissions = getQuestionSubmissions(user.id, question.id);

  const handleRun = async () => {
    setRunning(true);
    setRunOutput(null);
    setTestResults(null);
    try {
      const result = await executeCode(code);
      setRunOutput(getOutput(result));
    } catch (error) {
      setRunOutput(error instanceof Error ? error.message : "Execution failed");
      toast.error("Code execution failed");
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setRunOutput(null);
    setTestResults(null);
    try {
      const { results, allPassed } = await runAgainstTestCases(code, question.testCases);
      setTestResults(results);

      const avgTime = (results.reduce((s, r) => s + parseFloat(r.time), 0) / results.length).toFixed(2);
      const avgMemory = (results.reduce((s, r) => s + r.memory, 0) / results.length / 1024).toFixed(1);

      addSubmission({
        userId: user.id,
        questionId: question.id,
        submittedCode: code,
        output: results.map((r) => r.actual).join("\n"),
        status: allPassed ? "accepted" : "wrong_answer",
        executionTime: `${avgTime}s`,
        memoryUsed: `${avgMemory}MB`,
      });

      if (allPassed) {
        toast.success("All test cases passed!");
      } else {
        const passed = results.filter((r) => r.passed).length;
        toast.error(`${passed}/${results.length} test cases passed`);
      }
    } catch (error) {
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-2 gap-6">
        {/* Left: Problem Description */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs">
                {questionTypeLabels[question.type]}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {question.difficulty}
              </Badge>
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground">{question.title}</h1>
          </div>

          <div className="text-sm text-secondary-foreground leading-relaxed whitespace-pre-line">
            {question.description}
          </div>

          {/* Test Cases */}
          <div className="rounded-lg border border-border bg-secondary/50 p-4">
            <h3 className="font-mono text-xs text-muted-foreground mb-3 uppercase tracking-wider">Test Cases</h3>
            <div className="space-y-3">
              {question.testCases.map((tc) => {
                const result = testResults?.find((r) => r.testCaseId === tc.id);
                return (
                  <div key={tc.id} className="text-sm font-mono">
                    <div className="flex items-center gap-2">
                      {result && (
                        result.passed
                          ? <CheckCircle className="w-4 h-4 text-neon-green" />
                          : <XCircle className="w-4 h-4 text-neon-red" />
                      )}
                      <span className="text-muted-foreground">Input: <span className="text-foreground">{tc.input || "(none)"}</span></span>
                    </div>
                    <div className="text-muted-foreground ml-6">Expected: <span className="text-neon-green">{tc.expectedOutput}</span></div>
                    {result && !result.passed && (
                      <div className="text-muted-foreground ml-6">Got: <span className="text-neon-red">{result.actual}</span></div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Hints */}
          {question.hints && question.hints.length > 0 && (
            <button
              onClick={() => setShowHints(!showHints)}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              <Lightbulb className="w-4 h-4" />
              {showHints ? "Hide hints" : "Show hints"}
              {showHints ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          )}
          {showHints && question.hints && (
            <ul className="space-y-1 text-sm text-muted-foreground pl-6 list-disc">
              {question.hints.map((h, i) => <li key={i}>{h}</li>)}
            </ul>
          )}

          {/* Previous Submissions */}
          {pastSubmissions.length > 0 && (
            <div className="rounded-lg border border-border bg-secondary/30 p-4">
              <h3 className="font-mono text-xs text-muted-foreground mb-2 uppercase tracking-wider">Past Submissions</h3>
              <div className="space-y-1">
                {pastSubmissions.slice(-3).reverse().map((s) => (
                  <div key={s.id} className="flex items-center justify-between text-xs font-mono">
                    <span className={s.status === "accepted" ? "text-neon-green" : "text-neon-red"}>
                      {s.status === "accepted" ? "✓ Accepted" : "✗ Wrong Answer"}
                    </span>
                    <span className="text-muted-foreground">{s.executionTime} · {s.memoryUsed}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Code Editor */}
        <div className="flex flex-col gap-4">
          <div className="rounded-lg border border-border overflow-hidden flex-1 min-h-[400px]">
            <Editor
              height="100%"
              defaultLanguage="javascript"
              value={code}
              onChange={(v) => setCode(v || "")}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                fontFamily: '"JetBrains Mono", monospace',
                padding: { top: 16 },
                scrollBeyondLastLine: false,
              }}
            />
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleRun} disabled={running || submitting} className="flex-1">
              {running ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
              {running ? "Running..." : "Run Code"}
            </Button>
            <Button onClick={handleSubmit} disabled={running || submitting} className="flex-1">
              {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              {submitting ? "Evaluating..." : "Submit Solution"}
            </Button>
          </div>

          {/* Run Output */}
          {runOutput !== null && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-lg border border-border bg-secondary/50 p-4"
            >
              <h3 className="font-mono text-xs text-muted-foreground mb-2 uppercase tracking-wider">Output</h3>
              <pre className="text-sm font-mono text-foreground whitespace-pre-wrap">{runOutput}</pre>
            </motion.div>
          )}

          {/* Test Results Summary */}
          {testResults && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-lg border p-4 ${
                testResults.every((r) => r.passed)
                  ? "border-neon-green/30 bg-neon-green/5"
                  : "border-neon-red/30 bg-neon-red/5"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`font-mono font-bold ${testResults.every((r) => r.passed) ? "text-neon-green" : "text-neon-red"}`}>
                  {testResults.every((r) => r.passed)
                    ? "✓ All Test Cases Passed"
                    : `✗ ${testResults.filter((r) => r.passed).length}/${testResults.length} Passed`}
                </span>
              </div>
              <div className="text-xs font-mono text-muted-foreground">
                Avg time: {(testResults.reduce((s, r) => s + parseFloat(r.time), 0) / testResults.length).toFixed(3)}s
                {" · "}
                Avg memory: {(testResults.reduce((s, r) => s + r.memory, 0) / testResults.length / 1024).toFixed(1)}KB
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default QuestionDetail;
