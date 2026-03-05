import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Terminal, LogOut, User, BarChart3 } from "lucide-react";

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary/20 neon-border flex items-center justify-center">
            <Terminal className="w-4 h-4 text-primary" />
          </div>
          <span className="font-display font-bold text-lg gradient-text">SkillForge</span>
        </Link>

        <div className="flex items-center gap-1">
          {user ? (
            <>
              <Link to="/questions">
                <Button variant={isActive("/questions") ? "default" : "ghost"} size="sm">
                  Challenges
                </Button>
              </Link>
              <Link to="/results">
                <Button variant={isActive("/results") ? "default" : "ghost"} size="sm">
                  <BarChart3 className="w-4 h-4 mr-1" />
                  Results
                </Button>
              </Link>
              <div className="ml-2 flex items-center gap-2 pl-2 border-l border-border">
                <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <span className="text-sm text-muted-foreground hidden sm:block">{user.name}</span>
                <Button variant="ghost" size="icon" onClick={logout} className="h-8 w-8">
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">Log in</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
