'use client';

import { useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Camera, Loader2 } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { uploadToBucket } from '@/services/storage';
import { updateProfileAction } from '@/features/profile/actions';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import type { ProfileRow } from '@/types/database';

export function EditProfileForm({ profile }: { profile: ProfileRow }) {
  const router = useRouter();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [fullName, setFullName] = useState(profile.full_name);
  const [username, setUsername] = useState(profile.username);
  const [bio, setBio] = useState(profile.bio);
  const [website, setWebsite] = useState(profile.website ?? '');
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const supabase = createClient();
      const { publicUrl } = await uploadToBucket(supabase, 'avatars', profile.id, file);
      setAvatarUrl(publicUrl);
      await updateProfileAction({ full_name: fullName, username, bio, website, avatar_url: publicUrl });
      toast({ description: 'Foto de perfil actualizada.' });
    } catch (err) {
      toast({ variant: 'destructive', description: err instanceof Error ? err.message : 'No se pudo subir la imagen.' });
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    const result = await updateProfileAction({ full_name: fullName, username, bio, website, avatar_url: avatarUrl });
    setSaving(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    toast({ description: 'Perfil actualizado.' });
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="relative"
          aria-label="Cambiar foto de perfil"
        >
          <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrl ?? undefined} alt={fullName} />
            <AvatarFallback className="text-2xl">{fullName.slice(0, 1).toUpperCase()}</AvatarFallback>
          </Avatar>
          <span className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-soft">
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
          </span>
        </button>
        <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="full_name">Nombre</Label>
        <Input id="full_name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="username">Usuario</Label>
        <Input id="username" value={username} onChange={(e) => setUsername(e.target.value.toLowerCase())} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="bio">Biografía</Label>
        <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="website">Sitio web</Label>
        <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://" />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      <Button type="submit" className="w-full" disabled={saving}>
        {saving && <Loader2 className="h-4 w-4 animate-spin" />}
        Guardar cambios
      </Button>
    </form>
  );
}
