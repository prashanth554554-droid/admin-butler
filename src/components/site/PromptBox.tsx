import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function PromptBox({
  label,
  text,
  onCopied,
}: {
  label: string;
  text: string;
  onCopied?: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      onCopied?.();
      toast.success(`${label} copied to clipboard`);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Your browser blocked clipboard access");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </h3>
        <Button size="sm" variant="secondary" onClick={copy}>
          {copied ? (
            <>
              <Check className="mr-1.5 size-3.5" /> Copied
            </>
          ) : (
            <>
              <Copy className="mr-1.5 size-3.5" /> Copy {label}
            </>
          )}
        </Button>
      </div>
      <p className="prompt-box p-4 text-foreground">{text}</p>
    </div>
  );
}
