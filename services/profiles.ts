import type { TypedSupabaseClient } from './types';

export async function getProfileByUsername(supabase: TypedSupabaseClient, username: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('username', username).maybeSingle();
  if (error) throw error;
  return data;
}

export async function getProfileById(supabase: TypedSupabaseClient, id: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

export async function updateProfile(
  supabase: TypedSupabaseClient,
  userId: string,
  updates: Partial<{ full_name: string; username: string; bio: string; website: string | null; avatar_url: string | null }>
) {
  const { data, error } = await supabase.from('profiles').update(updates).eq('id', userId).select().single();
  if (error) throw error;
  return data;
}

export async function isUsernameAvailable(supabase: TypedSupabaseClient, username: string, excludeUserId?: string) {
  let query = supabase.from('profiles').select('id').eq('username', username);
  if (excludeUserId) query = query.neq('id', excludeUserId);
  const { data, error } = await query.maybeSingle();
  if (error) throw error;
  return !data;
}

export async function isFollowing(supabase: TypedSupabaseClient, followerId: string, followingId: string) {
  const { data, error } = await supabase
    .from('followers')
    .select('follower_id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function followUser(supabase: TypedSupabaseClient, followerId: string, followingId: string) {
  const { error } = await supabase.from('followers').insert({ follower_id: followerId, following_id: followingId });
  if (error) throw error;
}

export async function unfollowUser(supabase: TypedSupabaseClient, followerId: string, followingId: string) {
  const { error } = await supabase
    .from('followers')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);
  if (error) throw error;
}

export async function listFollowers(supabase: TypedSupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('followers')
    .select('follower:profiles!followers_follower_id_fkey(id, username, full_name, avatar_url)')
    .eq('following_id', userId);
  if (error) throw error;
  return data.map((row) => row.follower);
}

export async function listFollowing(supabase: TypedSupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('followers')
    .select('following:profiles!followers_following_id_fkey(id, username, full_name, avatar_url)')
    .eq('follower_id', userId);
  if (error) throw error;
  return data.map((row) => row.following);
}

export async function listPopularProfiles(supabase: TypedSupabaseClient, limit = 12) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, followers_count')
    .order('followers_count', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}

export async function searchProfiles(supabase: TypedSupabaseClient, query: string, limit = 20) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, avatar_url, followers_count')
    .or(`username.ilike.%${query}%,full_name.ilike.%${query}%`)
    .order('followers_count', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data;
}
