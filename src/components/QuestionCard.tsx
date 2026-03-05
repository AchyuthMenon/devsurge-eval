import { Link } from "react-router-dom";
import { Question, questionTypeLabels } from "@/data/questions";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

const difficultyStyles: Record<string, string> = {
  easy: "bg-neon-green/10 text-neon-green border-neon-green/30",
  medium: "bg-neon-orange/10 text-neon-orange border-neon-orange/30",
  hard: "bg-neon-red/10 text-neon-red border-neon-red/30",
};

const typeStyles: Record<string, string> = {
  debugging: "bg-neon-red/10 text-neon-red border-neon-red/30",
  dsa: "bg-neon-blue/10 text-neon-blue border-neon-blue/30",
  "output-prediction": "bg-neon-orange/10 text-neon-orange border-neon-orange/30",
  "code-completion": "bg-neon-green/10 text-neon-green border-neon-green/30",
  "edge-case": "bg-neon-purple/10 text-neon-purple border-neon-purple/30",
};

interface Props {
  question: Question;
  index: number;
  solved?: boolean;
}

const QuestionCard = ({ question, index, solved }: Props) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Link to={`/questions/${question.id}`}>
        <div className="group rounded-lg border border-border bg-card p-5 hover:neon-border transition-all duration-300 hover:shadow-[var(--shadow-neon)]">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-display font-semibold text-foreground group-hover:text-primary transition-colors">
              {question.title}
            </h3>
            {solved && (
              <span className="text-xs text-neon-green font-mono">✓ solved</span>
            )}
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {question.description}
          </p>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className={typeStyles[question.type]}>
              {questionTypeLabels[question.type]}
            </Badge>
            <Badge variant="outline" className={difficultyStyles[question.difficulty]}>
              {question.difficulty}
            </Badge>
            <span className="text-xs text-muted-foreground ml-auto font-mono">
              {question.testCases.length} test{question.testCases.length !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

export default QuestionCard;
