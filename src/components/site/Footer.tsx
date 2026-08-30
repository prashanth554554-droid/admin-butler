import { Link } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-4">
        <div className="md:col-span-2">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-brand text-brand-foreground">
              <Sparkles className="size-5" />
            </span>
            <span className="font-display text-lg font-semibold">
              Prompt Studio <span className="text-gradient">AI</span>
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm text-muted-foreground">
            Create amazing AI images and videos with powerful prompts. A curated library of
            production-ready prompts, tutorials and a built-in AI video studio.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Explore</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/prompts" className="hover:text-foreground">
                All prompts
              </Link>
            </li>
            <li>
              <Link to="/prompts/ai-video" className="hover:text-foreground">
                AI video prompts
              </Link>
            </li>
            <li>
              <Link to="/prompts/ai-image" className="hover:text-foreground">
                AI image prompts
              </Link>
            </li>
            <li>
              <Link to="/trending" className="hover:text-foreground">
                Trending
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold">Learn &amp; create</h3>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/tutorials" className="hover:text-foreground">
                Tutorials
              </Link>
            </li>
            <li>
              <Link to="/categories" className="hover:text-foreground">
                Categories
              </Link>
            </li>
            <li>
              <Link to="/add-prompt" className="hover:text-foreground">
                AI video studio
              </Link>
            </li>
            <li>
              <Link to="/search" search={{ q: "cinematic" }} className="hover:text-foreground">
                Search
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
        © {new Date().getFullYear()} Prompt Studio AI. All prompts are original and free to use.
      </div>
    </footer>
  );
}
