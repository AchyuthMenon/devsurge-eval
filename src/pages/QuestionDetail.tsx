import { useParams, Navigate } from "react-router-dom";
import { useState } from "react";
import Editor from "@monaco-editor/react";
import { questions, questionTypeLabels } from "@/data/questions";
import { useAuth } from "@/context/AuthContext";
import { useSubmissions } from "@/context/SubmissionContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Play, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";

const QuestionDetail = () => {
  const { id } = useParams();
  const question = questions.find((q) => q.id === id);
  const { user } = useAuth();
  const { addSubmission, getQuestionSubmissions } = useSubmissions();
  const [code, setCode] = useState(question?.starterCode || "");
  const [showHints, setShowHints] = useState(false);
  const [result, setResult] = useState<null | { status: "accepted" | "wrong_answer" | "error"; output: string }>(null);
  const [submitting, setSubmitting] = useState(false);

  if (!question) return <Navigate to="/questions" />;
  if (!user) return <Navigate to="/login" />;

  const pastSubmissions = getQuestionSubmissions(user.id, question.id);

  const handleSubmit = () => {
    setSubmitting(true);
    // Mock evaluation
    setTimeout(() => {
      const isAccepted = Math.random() > 0.3; // 70% chance of acceptance for demo
      const mockResult = {
        status: isAccepted ? "accepted" as const : "wrong_answer" as const,
        output: isAccepted
          ? question.testCases[0].expectedOutput
          : "Unexpected output",
      };
      setResult(mockResult);

      addSubmission({
        userId: user.id,
        questionId: question.id,
        submittedCode: code,
        output: mockResult.output,
        status: mockResult.status,
        executionTime: `${(Math.random() * 100 + 10).toFixed(0)}ms`,
        memoryUsed: `${(Math.random() * 5 + 1).toFixed(1)}MB`,
      });

      if (isAccepted) {
        toast.success("All test cases passed!");
      } else {
        toast.error("Some test cases failed");
      }
      setSubmitting(false);
    }, 1500);
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
              {question.testCases.map((tc, i) => (
                <div key={tc.id} className="text-sm font-mono">
                  <div className="text-muted-foreground">Input: <span className="text-foreground">{tc.input || "(none)"}</span></div>
                  <div className="text-muted-foreground">Expected: <span className="text-neon-green">{tc.expectedOutput}</span></div>
                </div>
              ))}
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

          <Button onClick={handleSubmit} disabled={submitting} className="w-full">
            <Play className="w-4 h-4 mr-2" />
            {submitting ? "Evaluating..." : "Submit Solution"}
          </Button>

          {/* Result */}
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`rounded-lg border p-4 ${
                result.status === "accepted"
                  ? "border-neon-green/30 bg-neon-green/5"
                  : "border-neon-red/30 bg-neon-red/5"
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`font-mono font-bold ${result.status === "accepted" ? "text-neon-green" : "text-neon-red"}`}>
                  {result.status === "accepted" ? "✓ Accepted" : "✗ Wrong Answer"}
                </span>
              </div>
              <pre className="text-sm font-mono text-muted-foreground">{result.output}</pre>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default QuestionDetail;
