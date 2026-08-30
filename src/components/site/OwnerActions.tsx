import { useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Loader2, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { deletePrompt, type Prompt } from "@/lib/content";
import { useAuth } from "@/lib/auth";

/**
 * Edit / delete controls rendered on top of a prompt card.
 * Visible only to the admin account — no other signed-in user sees them.
 */
export function OwnerActions({ prompt, redirectAfterDelete }: { prompt: Prompt; redirectAfterDelete?: string }) {
  const { user, isAdmin } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);

  const canManage = Boolean(user && isAdmin);
  if (!canManage) return null;

  const remove = async () => {
    setBusy(true);
    try {
      await deletePrompt(prompt.id);
      toast.success("Prompt deleted");
      await queryClient.invalidateQueries({ queryKey: ["prompts"] });
      await queryClient.invalidateQueries({ queryKey: ["prompt"] });
      if (redirectAfterDelete) await router.navigate({ to: redirectAfterDelete });
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setBusy(false);
      setConfirming(false);
    }
  };

  return (
    <>
      <div className="absolute right-3 top-3 z-10 flex gap-1.5">
        <Button
          asChild
          size="icon"
          variant="secondary"
          className="size-8 rounded-full border border-border bg-card/90 backdrop-blur"
          aria-label={`Edit ${prompt.title}`}
          title="Edit prompt"
        >
          <Link to="/add-prompt" search={{ edit: prompt.slug }}>
            <Pencil className="size-3.5" />
          </Link>
        </Button>
        <Button
          size="icon"
          variant="secondary"
          className="size-8 rounded-full border border-border bg-card/90 text-destructive backdrop-blur"
          aria-label={`Delete ${prompt.title}`}
          title="Delete prompt"
          onClick={() => setConfirming(true)}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>

      <AlertDialog open={confirming} onOpenChange={setConfirming}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this prompt?</AlertDialogTitle>
            <AlertDialogDescription>
              “{prompt.title}” will be removed permanently. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                void remove();
              }}
              disabled={busy}
            >
              {busy ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </>
  );
}
