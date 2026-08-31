import { useState } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { LogOut, Menu, Moon, Plus, Search, Sparkles, Sun, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";

const LINKS = [
  { to: "/", label: "Home" },
  { to: "/prompts/ai-image", label: "Image" },
  { to: "/prompts/ai-video", label: "Video" },
  { to: "/tutorials", label: "Tutorials" },
  { to: "/trending", label: "Trending" },
  { to: "/categories", label: "Categories" },
] as const;

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const navigate = useNavigate();
  const { theme, toggle } = useTheme();
  const { user, isAdmin, signOut } = useAuth();

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!term.trim()) return;
    setOpen(false);
    navigate({ to: "/search", search: { q: term.trim() } });
  };

  return (
    <header className="sticky top-0 z-50 glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-3 px-4 sm:px-6">
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-brand text-brand-foreground">
            <Sparkles className="size-5" />
          </span>
          <span className="hidden font-display text-base font-semibold tracking-tight sm:inline">
            Prompt Studio <span className="text-gradient">AI</span>
          </span>
        </Link>

        <nav className="mx-auto hidden items-center gap-1 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              activeProps={{ className: "text-foreground bg-accent" }}
              activeOptions={{ exact: link.to === "/" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <form onSubmit={submit} className="hidden md:block">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                placeholder="Search prompts..."
                aria-label="Search prompts and tutorials"
                className="h-10 w-40 rounded-xl bg-surface-2 pl-9 xl:w-56"
              />
            </div>
          </form>

          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle color theme">
            {theme === "dark" ? <Sun className="size-4" /> : <Moon className="size-4" />}
          </Button>

          {user ? (
            <Button asChild className="hidden bg-gradient-brand text-brand-foreground sm:inline-flex">
              <Link to="/add-prompt">
                <Plus className="mr-1.5 size-4" /> Add Prompt
              </Link>
            </Button>
          ) : null}

          {user ? (
            <Button
              variant="ghost"
              size="icon"
              aria-label="Log out"
              onClick={() => void signOut()}
            >
              <LogOut className="size-4" />
            </Button>
          ) : null}

          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation menu"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border bg-surface px-4 pb-5 pt-3 lg:hidden">
          <form onSubmit={submit} className="mb-3">
            <Input
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              placeholder="Search AI prompts and tutorials..."
              aria-label="Search"
              className="h-11 rounded-xl bg-surface-2"
            />
          </form>
          <nav className="flex flex-col">
            {LINKS.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                activeProps={{ className: "text-foreground bg-accent" }}
                activeOptions={{ exact: link.to === "/" }}
              >
                {link.label}
              </Link>
            ))}
            {isAdmin ? (
              <Link
                to="/add-prompt"
                onClick={() => setOpen(false)}
                className="mt-2 rounded-lg bg-gradient-brand px-3 py-2.5 text-center text-sm font-medium text-brand-foreground"
              >
                + Create Prompt
              </Link>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
