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
}

export interface ChatResponse {
  respuesta: string;
  usuario_id: number;
  imagen_url?: string;
  video_url?: string;
  video_titulo?: string;
  video_thumbnail?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private http = inject(HttpClient);
  private webhookUrl = environment.N8N_WEBHOOK_URL;

  messages: ChatMessage[] = [];

  sendMessage(text: string, imageFile?: File): Observable<ChatResponse> {
    if (imageFile) {
      const formData = new FormData();
      formData.append('message', text);
      formData.append('image', imageFile, imageFile.name);
      return this.http.post<ChatResponse>(this.webhookUrl, formData);
    }
    return this.http.post<ChatResponse>(this.webhookUrl, { message: text });
  }

  addMessage(message: ChatMessage): void {
    this.messages.push(message);
  }

  clearMessages(): void {
    this.messages = [];
  }
}
