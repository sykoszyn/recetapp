// `createClient`/`createServerClient` instancian un RealtimeClient apenas
// se crean, aunque nunca abramos un canal — y ese RealtimeClient resuelve
// un WebSocket global de forma síncrona en su constructor. En el Edge
// Runtime de Vercel (usado por el middleware) y en runtimes de Node sin
// WebSocket global, esa resolución tira una excepción y crashea el cliente
// entero (visto como `MIDDLEWARE_INVOCATION_FAILED`). No usamos Realtime en
// el servidor, así que le pasamos un transport dummy para que no intente
// resolver nada.
class NoopWebSocketTransport {}

export const disableRealtimeOption = {
  realtime: { transport: NoopWebSocketTransport as unknown as new (...args: any[]) => any },
};
