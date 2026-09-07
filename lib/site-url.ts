// `||` a propósito (no `??`): si la env var está seteada pero vacía (''),
// que en Vercel puede pasar si se dejó en blanco, `??` no la reemplaza y
// `new URL('')` rompe el build entero.
const raw = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

// Si alguien configura la variable sin protocolo (ej. "miapp.vercel.app"
// en vez de "https://miapp.vercel.app"), `new URL(...)` también revienta.
// Se normaliza acá una sola vez para que ningún llamador tenga que acordarse.
export const siteUrl = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
