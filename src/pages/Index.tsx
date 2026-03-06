import { Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Terminal, Code, Bug, Zap, Brain, Shield } from "lucide-react";
import { motion } from "framer-motion";

const features = [
  { icon: Bug, label: "Debugging", desc: "Find and fix bugs in real code" },
  { icon: Code, label: "DSA", desc: "Data structures & algorithms" },
  { icon: Brain, label: "Output Prediction", desc: "Predict what code will print" },
  { icon: Zap, label: "Code Completion", desc: "Complete partial implementations" },
  { icon: Shield, label: "Edge Cases", desc: "Identify failure scenarios" },
];

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-2xl"
      >
        <div className="w-16 h-16 rounded-xl bg-primary/10 neon-border flex items-center justify-center mx-auto mb-6 neon-glow">
          <Terminal className="w-8 h-8 text-primary" />
        </div>

        <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
          <span className="gradient-text">Epsilon</span>
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
          Sharpen your programming skills with real-world challenges. Debug, predict, complete, and conquer.
        </p>

        <div className="flex gap-3 justify-center mb-16">
          {user ? (
            <Link to="/questions">
              <Button size="lg">Start Solving</Button>
            </Link>
          ) : (
            <>
              <Link to="/signup">
                <Button size="lg">Get Started</Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg">Log in</Button>
              </Link>
            </>
          )}
        </div>
      </motion.div>

      {/* Feature Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 max-w-3xl w-full">
        {features.map((f, i) => (
          <motion.div
            key={f.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.08 }}
            className="rounded-lg border border-border bg-card/50 p-4 text-center hover:neon-border transition-all duration-300"
          >
            <f.icon className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className="text-sm font-display font-semibold">{f.label}</div>
            <div className="text-xs text-muted-foreground mt-1">{f.desc}</div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Index;
