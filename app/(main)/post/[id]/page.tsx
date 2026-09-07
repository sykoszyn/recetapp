import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { getPostById } from '@/services/posts';
import { listComments } from '@/services/comments';
import { PostFeedCard } from '@/components/feed/post-feed-card';
import { CommentSection } from '@/components/comments/comment-section';
import { Separator } from '@/components/ui/separator';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const supabase = createClient();
  const post = await getPostById(supabase, params.id);
  if (!post) return {};
  const description = post.caption || `Publicación de @${post.author.username} en RecetApp.`;
  const image = post.media[0]?.thumbnail_url ?? (post.media[0]?.media_type === 'image' ? post.media[0].url : undefined);
  return {
    title: `@${post.author.username}`,
    description,
    openGraph: { type: 'article', description, images: image ? [image] : undefined, url: `${siteUrl}/post/${post.id}` },
  };
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const post = await getPostById(supabase, params.id, user?.id ?? null);
  if (!post) notFound();

  const comments = await listComments(supabase, { postId: post.id }, user?.id ?? null);

  return (
    <div className="mx-auto max-w-lg px-4 py-6 safe-top">
      <PostFeedCard post={post} isAuthenticated={!!user} />
      <Separator className="my-6" />
      <CommentSection target={{ postId: post.id }} initialComments={comments} currentUserId={user?.id ?? null} />
    </div>
  );
}
