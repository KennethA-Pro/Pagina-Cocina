// ============================================================
// VARIABLES DE CONFIGURACIÓN
// Cambia N8N_WEBHOOK_URL cuando migres de cuenta n8n
// ============================================================
export const environment = {
  production: false,
  // URL del webhook de n8n — CAMBIA ESTO al migrar de cuenta
  N8N_WEBHOOK_URL: 'https://david19341.app.n8n.cloud/webhook/chatbot-recetas',
  // Nombre del chatbot mostrado en la UI
  APP_NAME: 'Chef IA',
  // Subtítulo
  APP_SUBTITLE: 'Tu asistente de cocina inteligente',
};
