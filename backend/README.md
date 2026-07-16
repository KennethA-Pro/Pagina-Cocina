# 🍳 Chatbot Recetas — Backend (n8n)

Flujo de automatización construido en **n8n** que actúa como el backend del chatbot de recetas. Recibe mensajes del frontend Angular, los procesa con IA y devuelve respuestas estructuradas.

## 📁 Archivos

| Archivo | Descripción |
|---|---|
| `chatbot-recetas.json` | Flujo completo de n8n listo para importar |

## 🔄 Flujo

```
Webhook → Crear tablas → Extraer datos
    ↓ (sin imagen)              ↓ (con imagen)
 msg-texto               Gemini analiza imagen
    ↓                           ↓
    └──────── guardar-msg ───────┘
                  ↓
          obtener-historial (Postgres)
                  ↓
          preparar-contexto
                  ↓
          agente-recetas (Groq LLM)
                  ↓
          detectar-receta
                  ↓
          if-buscar-video
         ↙              ↘
  buscar-video        sin-video
      ↓                   ↓
      └──── responder ─────┘
               +
          guardar-historial
```

## 🚀 Cómo importar

1. Abre tu instancia de **n8n**
2. Ve a **Workflows → Import from file**
3. Selecciona `chatbot-recetas.json`
4. Configura las credenciales (ver abajo)

## ⚙️ Credenciales necesarias

| Credencial | Nodo | Para qué |
|---|---|---|
| **Postgres** | `crear-tablas`, `obtener-historial`, `guardar-historial` | Guardar historial de chat |
| **Groq API** | `groq-model` | Modelo de lenguaje (llama / gpt-oss) |
| **Google Gemini (PaLM)** | `analizar-imagen` | Analizar fotos del refrigerador |

## 📦 Base de datos

El flujo crea automáticamente las tablas necesarias al primer uso:

```sql
chat_historial (id, usuario_id, rol, mensaje, created_at)
usuarios       (id, nombre, created_at)
```

## 📡 API

**Endpoint:** `POST /webhook/chatbot-recetas`

**Request sin imagen:**
```json
{ "message": "Tengo huevos y tomate" }
```

**Request con imagen:**
```
multipart/form-data
  message: "texto opcional"
  image: archivo de imagen (max 5MB)
```

**Response:**
```json
{
  "respuesta": "texto del bot (puede incluir bloque ```recetas JSON)",
  "imagen_url": null,
  "video_url": "https://youtube.com/results?search_query=...",
  "video_titulo": "Ver videos: cómo preparar ...",
  "video_thumbnail": null,
  "usuario_id": 1
}
```

### Formato de tarjetas de recetas

Cuando el bot sugiere recetas, la respuesta incluye un bloque especial que el frontend parsea:

````
```recetas
[
  {
    "id": "1",
    "nombre": "Arroz con huevo",
    "ingredientes": ["arroz", "huevo", "sal"],
    "tiempo": "15 min",
    "dificultad": "Muy fácil"
  }
]
```
````

## 🔧 Variables a configurar

En el nodo `buscar-video-youtube`, el flujo construye automáticamente una URL de búsqueda de YouTube sin necesidad de API key.

Para usar la **YouTube Data API v3** (resultados exactos):
1. Obtén una key gratis en [console.cloud.google.com](https://console.cloud.google.com)
2. Activa "YouTube Data API v3"
3. Reemplaza la URL en el nodo `buscar-video-youtube`

## 🛠️ Tecnologías

- [n8n](https://n8n.io) — Automatización de flujos
- [Groq](https://groq.com) — LLM rápido (llama-3.3-70b / gpt-oss-20b)
- [Google Gemini](https://ai.google.dev) — Análisis de imágenes
- [PostgreSQL](https://postgresql.org) — Historial de conversaciones
