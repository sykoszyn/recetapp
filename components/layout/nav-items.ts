import { Compass, Home, Bookmark, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const PRIMARY_NAV: NavItem[] = [
  { label: 'Inicio', href: '/feed', icon: Home },
  { label: 'Descubrir', href: '/explore', icon: Compass },
  { label: 'Guardados', href: '/saved', icon: Bookmark },
];

export function profileNavItem(username: string): NavItem {
  return { label: 'Perfil', href: `/user/${username}`, icon: User };
}
