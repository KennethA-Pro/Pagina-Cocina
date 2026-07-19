import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

export interface RecipeCard {
  id: string;
  nombre: string;
  ingredientes: string[];
  tiempo: string;
  dificultad: string;
  origen?: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  imagePreview?: string;
  generatedImage?: string;
  recipeCards?: RecipeCard[];
  videoUrl?: string;
  videoTitulo?: string;
  videoThumbnail?: string;
  plan?: 'free' | 'premium';
}

export interface ChatResponse {
  respuesta: string;
  usuario_id?: number;
  imagen_url?: string;
  video_url?: string;
  video_titulo?: string;
  video_thumbnail?: string;
  plan?: string;
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private http = inject(HttpClient);

  messages: ChatMessage[] = [];

  /**
   * Envía un mensaje al chatbot.
   * - Modo free: solo text → body JSON { message }
   * - Modo premium: text + usuario_id → body JSON { message, usuario_id }
   *                 con imagen → FormData { message, image, usuario_id }
   */
  sendMessage(text: string, imageFile?: File, usuarioId?: number): Observable<ChatResponse> {
    const isPremium = usuarioId !== undefined && usuarioId !== null;

    if (isPremium) {
      const url = environment.N8N_WEBHOOK_PREMIUM;
      if (imageFile) {
        const formData = new FormData();
        formData.append('message', text);
        formData.append('image', imageFile, imageFile.name);
        formData.append('usuario_id', String(usuarioId));
        return this.http.post<ChatResponse>(url, formData);
      }
      return this.http.post<ChatResponse>(url, { message: text, usuario_id: usuarioId });
    }

    // Modo free
    return this.http.post<ChatResponse>(environment.N8N_WEBHOOK_FREE, { message: text });
  }

  addMessage(message: ChatMessage): void {
    this.messages.push(message);
  }

  clearMessages(): void {
    this.messages = [];
  }
}
