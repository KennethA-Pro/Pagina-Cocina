// ============================================================
// VARIABLES DE CONFIGURACIÓN — leídas del archivo .env
// Las URLs NO se hardcodean aquí. Edita el .env para cambiarlas.
// ============================================================
export const environment = {
  production: false,

  // Webhooks — valores provienen del .env
  N8N_WEBHOOK_FREE:    (process.env['NG_APP_WEBHOOK_FREE']     ?? ''),
  N8N_WEBHOOK_PREMIUM: (process.env['NG_APP_WEBHOOK_PREMIUM']  ?? ''),
  N8N_WEBHOOK_REGISTRO:(process.env['NG_APP_WEBHOOK_REGISTRO'] ?? ''),
  N8N_WEBHOOK_LOGIN:   (process.env['NG_APP_WEBHOOK_LOGIN']    ?? ''),

  // UI (no sensible, puede vivir aquí)
  APP_NAME: 'Chef IA',
  APP_SUBTITLE: 'Tu asistente de cocina inteligente',
};
