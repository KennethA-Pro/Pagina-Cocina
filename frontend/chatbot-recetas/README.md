# 🍳 Chatbot Recetas — Frontend (Angular)

Interfaz de usuario del chatbot de recetas, construida con **Angular 21** y desplegada en Netlify. Permite chatear con un asistente de cocina IA, enviar fotos del refrigerador, elegir recetas en tarjetas interactivas y ver videos de preparación.

## ✨ Funcionalidades

- 💬 Chat en tiempo real con el asistente Chef IA
- 📷 Envío de imágenes para identificar ingredientes
- 🃏 Tarjetas de recetas seleccionables (nombre, ingredientes, tiempo, dificultad)
- 🎬 Link directo a video de YouTube al elegir una receta
- 🍳 Animación de cocinando con duración mínima de 4.5 segundos
- 🌙 Diseño dark mode con tema naranja

## 🚀 Instalación y uso

```bash
# Instalar dependencias
npm install

# Servidor de desarrollo
npm start
# → http://localhost:4200

# Build de producción
npm run build
```

## ⚙️ Configuración

Edita `src/environments/environment.ts` antes de correr el proyecto:

```typescript
export const environment = {
  production: false,
  N8N_WEBHOOK_URL: 'https://TU-INSTANCIA.app.n8n.cloud/webhook/chatbot-recetas',
  APP_NAME: 'Chef IA',
  APP_SUBTITLE: 'Tu asistente de cocina inteligente',
};
```

> Al migrar de cuenta n8n, solo cambia `N8N_WEBHOOK_URL`.

## 📁 Estructura

```
src/
├── app/
│   ├── app.ts           # Componente principal — lógica del chat
│   ├── app.html         # Template — UI del chat
│   ├── app.scss         # Estilos — dark mode, tarjetas, animaciones
│   ├── chat.service.ts  # Servicio HTTP hacia el webhook n8n
│   └── new-line.pipe.ts # Pipe para saltos de línea
├── environments/
│   └── environment.ts   # URL del webhook y nombre de la app
└── styles.scss          # Estilos globales
```

## 🔌 Comunicación con el backend

El frontend envía requests al webhook de n8n:

**Mensaje de texto:**
```typescript
POST webhook-url
Content-Type: application/json
{ "message": "Tengo huevos y tomate" }
```

**Mensaje con imagen:**
```typescript
POST webhook-url
Content-Type: multipart/form-data
  message: "texto"
  image: File
```

**Respuesta esperada:**
```typescript
{
  respuesta: string,       // texto del bot (puede contener bloque ```recetas)
  imagen_url: string|null, // imagen generada por IA (si aplica)
  video_url: string|null,  // link de YouTube
  video_titulo: string|null,
  video_thumbnail: string|null,
  usuario_id: number
}
```

## 🃏 Formato de tarjetas

Cuando el bot responde con sugerencias de recetas, incluye un bloque JSON especial:

````
```recetas
[{ "id": "1", "nombre": "Arroz con huevo", "ingredientes": ["arroz","huevo"], "tiempo": "15 min", "dificultad": "Fácil" }]
```
````

El componente lo parsea con `parseRecipeCards()` y renderiza tarjetas clicables. Al hacer click, envía automáticamente `Quiero hacer "Nombre", dame los pasos detallados`.

## 🍳 Animación de cocinando

Se activa cuando el usuario elige una receta o envía una imagen. Muestra una sartén animada con vapor y fuego, con frases rotativas cada 900ms. Dura mínimo **4.5 segundos** aunque el backend responda antes.

## 🌐 Deploy en Netlify

El proyecto incluye `netlify.toml` configurado. Para desplegar:

1. Conecta el repo en [netlify.com](https://netlify.com)
2. Build command: `npm run build`
3. Publish directory: `dist/chatbot-recetas/browser`

## 🛠️ Tecnologías

- [Angular 21](https://angular.dev) — Framework principal
- [Angular Signals](https://angular.dev/guide/signals) — Estado reactivo
- [HttpClient](https://angular.dev/guide/http) — Comunicación con n8n
- [SCSS](https://sass-lang.com) — Estilos con variables y animaciones
- [Netlify](https://netlify.com) — Hosting y deploy continuo
