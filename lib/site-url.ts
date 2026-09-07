// `||` a propósito (no `??`): si la env var está seteada pero vacía (''),
// que en Vercel puede pasar si se dejó en blanco, `??` no la reemplaza y
// `new URL('')` rompe el build entero.
export const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
