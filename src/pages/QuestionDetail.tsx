import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import { questionTypeLabels, Question, Language, languageLabels, monacoLanguageMap, getSupportedLanguages } from "@/data/questions";
import { useAuth } from "@/context/AuthContext";
import { useSubmissions, Submission } from "@/context/SubmissionContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Play, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

const languageIcons: Record<Language, string> = {
  javascript: "JS",
  python: "PY",
  java: "JV",
};

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addSubmission, getQuestionSubmissions } = useSubmissions();

  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(true);
  const [pastSubmissions, setPastSubmissions] = useState<Submission[]>([]);

  const [language, setLanguage] = useState<Language>("javascript");
  const [code, setCode] = useState("");
  const [showHints, setShowHints] = useState(false);
  const [result, setResult] = useState<null | { status: "accepted" | "wrong_answer" | "error" | string; output: string; aiScore?: number | null; errorType?: string | null }>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/questions");
        if (res.ok) {
          const allQs: Question[] = await res.json();
          const q = allQs.find(q => q.id === id);
          if (q) {
            setQuestion(q);
            setCode(q.starterCode || "");
            setLanguage("javascript");
          } else {
            navigate("/questions");
          }
        }
      } catch (e) {
        toast.error("Failed to load question");
      }

      if (user?.id && id) {
        const subs = await getQuestionSubmissions(user.id, id);
        setPastSubmissions(subs);
      }
      setLoading(false);
    };
    fetchData();
  }, [id, user]);

  // Get starter code for the selected language
  const getStarterCode = (lang: Language): string => {
    if (!question) return "";
    switch (lang) {
      case "python": return question.starterCodePython || "";
      case "java": return question.starterCodeJava || "";
      default: return question.starterCode || "";
    }
  };

  // Handle language change
  const handleLanguageChange = (newLang: Language) => {
    if (newLang === language) return;
    setLanguage(newLang);
    setCode(getStarterCode(newLang));
    setResult(null);
  };

  if (!user) return <Navigate to="/login" />;
  if (loading) return <div className="p-8 text-center text-muted-foreground">Loading challenge...</div>;
  if (!question) return <Navigate to="/questions" />;

  const supportedLanguages = getSupportedLanguages(question);
  const isMultiLang = supportedLanguages.length > 1;

  const handleSubmit = async () => {
    setSubmitting(true);

    const newSub = await addSubmission({
      userId: user.id,
      questionId: question.id,
      submittedCode: code,
      language,
    });

    if (newSub) {
      setPastSubmissions(prev => [...prev, newSub]);
      setResult({
        status: newSub.status,
        output: newSub.output,
        aiScore: newSub.aiScore,
        errorType: newSub.errorType
      });

      if (newSub.status === "accepted") {
        toast.success("All test cases passed!");
      } else {
        toast.error("Some test cases failed");
      }
    } else {
      toast.error("Execution failed or timed out.");
    }

    setSubmitting(false);
  };

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid lg:grid-cols-2 gap-6">
        {/* Left: Problem Description & Submissions Tabs */}
        <div className="space-y-4">
          <Tabs defaultValue="description" className="w-full">
            <TabsList className="w-full justify-start border-b border-border mb-4 bg-transparent p-0 h-auto rounded-none">
              <TabsTrigger
                value="description"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground bg-transparent data-[state=active]:bg-transparent px-4 py-2 font-display tracking-tight"
              >
                Description
              </TabsTrigger>
              <TabsTrigger
                value="submissions"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground bg-transparent data-[state=active]:bg-transparent px-4 py-2 font-display tracking-tight flex items-center gap-2"
              >
                Submissions
                {pastSubmissions.length > 0 && (
                  <Badge variant="secondary" className="px-1.5 py-0 text-[10px] h-4 bg-primary/20 text-primary">{pastSubmissions.length}</Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* DESCRIPTION TAB */}
            <TabsContent value="description" className="space-y-4 mt-0 outline-none">
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
                      <div className="text-muted-foreground">
                        Expected: {' '}
                        {question.type === 'output-prediction' ? (
                          <span className="text-muted-foreground italic">Hidden for this challenge type</span>
                        ) : (
                          <span className="text-neon-green">{tc.expectedOutput}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Hints */}
              {question.hints && question.hints.length > 0 && (
                <button
                  onClick={() => setShowHints(!showHints)}
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mt-4"
                >
                  <Lightbulb className="w-4 h-4" />
                  {showHints ? "Hide hints" : "Show hints"}
                  {showHints ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
              )}
              {showHints && question.hints && (
                <ul className="space-y-1 text-sm text-muted-foreground pl-6 list-disc mt-2">
                  {question.hints.map((h, i) => <li key={i}>{h}</li>)}
                </ul>
              )}
            </TabsContent>

            {/* SUBMISSIONS TAB */}
            <TabsContent value="submissions" className="space-y-4 mt-0 outline-none">
              {pastSubmissions.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center border border-border border-dashed rounded-lg bg-secondary/20">
                  <Play className="w-8 h-8 text-muted-foreground mb-3 opacity-50" />
                  <p className="text-muted-foreground text-sm">You haven't submitted any solutions yet.</p>
                  <p className="text-muted-foreground text-xs mt-1">Run your code to see history here.</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
                  {pastSubmissions.slice().reverse().map((sub) => (
                    <div key={sub.id} className="rounded-lg border border-border bg-card overflow-hidden">
                      {/* Submission Header */}
                      <div className="p-3 bg-secondary/30 flex items-center justify-between border-b border-border">
                        <div className="flex items-center gap-3">
                          <span className={`font-mono text-sm font-bold ${sub.status === "accepted" ? "text-neon-green" : "text-neon-red"}`}>
                            {sub.status === "accepted" ? "✓ Accepted" : "✗ Failed"}
                          </span>
                          {/* Language Badge */}
                          <Badge variant="outline" className="text-[10px] h-5 py-0 font-mono border-primary/30 text-primary/80">
                            {languageLabels[(sub.language || "javascript") as Language] || sub.language}
                          </Badge>
                          {/* Error Type Badge */}
                          {sub.status !== "accepted" && sub.errorType && (
                            <Badge variant="outline" className="text-[10px] h-5 py-0 border-red-500/30 text-red-400 bg-red-500/5 font-mono">
                              {sub.errorType}
                            </Badge>
                          )}
                          {/* AI Score Badge */}
                          {sub.aiScore !== null && sub.aiScore !== undefined && (
                            <Badge variant={sub.aiScore > 0.5 ? "destructive" : "secondary"} className="text-[10px] h-5 py-0 font-mono border-muted">
                              AI: {(sub.aiScore * 100).toFixed(0)}%
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-4 text-xs font-mono text-muted-foreground">
                          <span>⏱ {sub.executionTime}</span>
                          <span>💾 {sub.memoryUsed}</span>
                        </div>
                      </div>

                      {/* Submission Source Code */}
                      <div className="p-0 relative">
                        <div className="absolute top-0 right-0 px-3 py-1 text-[10px] font-mono text-muted-foreground/50 uppercase tracking-widest bg-card/80 backdrop-blur rounded-bl-lg border-b border-l border-border">
                          Source Code
                        </div>
                        <pre className="p-4 pt-6 text-xs font-mono text-muted-foreground overflow-x-auto bg-[#0d1117]">
                          <code>{sub.submittedCode}</code>
                        </pre>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: Code Editor */}
        <div className="flex flex-col gap-4">
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            {supportedLanguages.map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                disabled={!isMultiLang}
                className={`
                  flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-semibold transition-all duration-200
                  ${language === lang
                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border"
                  }
                  ${!isMultiLang ? "opacity-60 cursor-default" : "cursor-pointer"}
                `}
              >
                <span className={`
                  inline-flex items-center justify-center w-5 h-5 rounded text-[9px] font-black
                  ${language === lang ? "bg-primary-foreground/20" : "bg-muted"}
                `}>
                  {languageIcons[lang]}
                </span>
                {languageLabels[lang]}
              </button>
            ))}
            {!isMultiLang && (
              <span className="text-[10px] text-muted-foreground/60 ml-2 italic">
                JavaScript only for this challenge type
              </span>
            )}
          </div>

          <div className="rounded-lg border border-border overflow-hidden flex-1 min-h-[400px]">
            <Editor
              height="100%"
              language={monacoLanguageMap[language]}
              value={code}
              onChange={(v) => setCode(v || "")}
              theme="vs-dark"
              onMount={(editor, monaco) => {
                // Intercept the paste command directly within Monaco's keybinding system
                editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
                  toast.error("Pasting code is disabled for this challenge. Please type your solution manually.", {
                    position: "bottom-center",
                    style: { background: "#ff4b4b", color: "#fff", border: "none" }
                  });
                });

                // Also attempt to block standard right-click context menu pasting by disabling the context menu entirely
                editor.updateOptions({ contextmenu: false });
              }}
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
              className={`rounded-lg border p-4 ${result.status === "accepted"
                ? "border-neon-green/30 bg-neon-green/5"
                : "border-neon-red/30 bg-neon-red/5"
                }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className={`font-mono font-bold ${result.status === "accepted" ? "text-neon-green" : "text-neon-red"}`}>
                  {result.status === "accepted" ? "✓ Accepted" : "✗ Failed"}
                </span>
                {result.status !== "accepted" && (
                  <Badge variant="destructive" className="text-[10px] h-5 py-0 bg-red-500/10 text-red-400 border-red-500/20">
                    {result.errorType || "Error"}
                  </Badge>
                )}
                {result.aiScore !== null && result.aiScore !== undefined && (
                  <Badge variant={result.aiScore > 0.5 ? "destructive" : "secondary"} className="text-[10px] h-5 py-0">
                    AI Probability: {(result.aiScore * 100).toFixed(0)}%
                  </Badge>
                )}
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
