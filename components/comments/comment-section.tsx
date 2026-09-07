'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Send, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/empty-state';
import { CommentItem } from './comment-item';
import { createCommentAction } from '@/features/comments/actions';
import type { CommentWithAuthor } from '@/types';

export function CommentSection({
  target,
  initialComments,
  currentUserId,
}: {
  target: { recipeId?: string; postId?: string };
  initialComments: CommentWithAuthor[];
  currentUserId: string | null;
}) {
  const router = useRouter();
  const [comments, setComments] = useState(initialComments);
  const [body, setBody] = useState('');
  const [replyTo, setReplyTo] = useState<CommentWithAuthor | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!currentUserId) {
      router.push('/login');
      return;
    }
    if (!body.trim()) return;

    setSubmitting(true);
    try {
      const created = await createCommentAction({ ...target, body, parentCommentId: replyTo?.id ?? null });
      if (replyTo) {
        setComments((prev) => addReply(prev, replyTo.id, { ...created, replies: [] } as CommentWithAuthor));
      } else {
        setComments((prev) => [...prev, { ...created, replies: [] } as CommentWithAuthor]);
      }
      setBody('');
      setReplyTo(null);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <h2 className="mb-4 text-lg font-bold">Comentarios</h2>

      {comments.length === 0 ? (
        <EmptyState emoji="💬" title="Sin comentarios todavía" description="Sé el primero en comentar." />
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} currentUserId={currentUserId} onReply={setReplyTo} />
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-5">
        {replyTo && (
          <div className="mb-2 flex items-center justify-between rounded-lg bg-muted px-3 py-1.5 text-sm">
            Respondiendo a @{replyTo.author.username}
            <button type="button" onClick={() => setReplyTo(null)} aria-label="Cancelar respuesta">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Agregá un comentario..." maxLength={500} />
          <button type="submit" disabled={submitting || !body.trim()} className="rounded-full bg-primary p-3 text-primary-foreground disabled:opacity-40">
            {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </form>
    </div>
  );
}

function addReply(comments: CommentWithAuthor[], parentId: string, reply: CommentWithAuthor): CommentWithAuthor[] {
  return comments.map((comment) => {
    if (comment.id === parentId) return { ...comment, replies: [...(comment.replies ?? []), reply] };
    if (comment.replies?.length) return { ...comment, replies: addReply(comment.replies, parentId, reply) };
    return comment;
  });
}
