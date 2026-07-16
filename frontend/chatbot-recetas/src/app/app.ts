import {
  Component,
  inject,
  signal,
  ViewChild,
  ElementRef,
  AfterViewChecked,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ChatService, ChatMessage, RecipeCard } from './chat.service';
import { environment } from '../environments/environment';

// Cuánto tiempo mínimo dura la animación de cocinando (ms)
const COOKING_MIN_MS = 4500;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements AfterViewChecked {
  @ViewChild('messagesContainer') messagesContainer!: ElementRef;
  @ViewChild('fileInput') fileInput!: ElementRef;

  private chatService = inject(ChatService);

  appName = environment.APP_NAME;
  appSubtitle = environment.APP_SUBTITLE;

  userInput = '';
  isLoading = signal(false);
  isCooking = signal(false);          // animación de cocinando
  cookingLabel = signal('Preparando tu receta...');
  selectedImage = signal<File | null>(null);
  imagePreview = signal<string | null>(null);
  errorMessage = signal<string | null>(null);

  // Frases que rotan durante la animación
  private cookingPhrases = [
    '🔪 Picando los ingredientes...',
    '🫕 Poniendo a calentar la sartén...',
    '🧂 Añadiendo la sazón perfecta...',
    '🥄 Revolviendo con amor...',
    '🔥 Ajustando el fuego...',
    '✨ Casi listo...',
  ];
  private phraseInterval: ReturnType<typeof setInterval> | null = null;
  private phraseIndex = 0;

  get messages(): ChatMessage[] {
    return this.chatService.messages;
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      this.errorMessage.set('Solo se permiten imágenes.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      this.errorMessage.set('La imagen no puede superar 5MB.');
      return;
    }

    this.selectedImage.set(file);
    this.errorMessage.set(null);

    const reader = new FileReader();
    reader.onload = (e) => this.imagePreview.set(e.target?.result as string);
    reader.readAsDataURL(file);
  }

  removeImage(): void {
    this.selectedImage.set(null);
    this.imagePreview.set(null);
    if (this.fileInput) this.fileInput.nativeElement.value = '';
  }

  private parseRecipeCards(text: string): { clean: string; cards: RecipeCard[] | null } {
    const match = text.match(/```recetas\n([\s\S]*?)```/);
    if (!match) return { clean: text, cards: null };
    try {
      const cards: RecipeCard[] = JSON.parse(match[1]);
      const clean = text.replace(/```recetas\n[\s\S]*?```/, '').trim();
      return { clean, cards };
    } catch {
      return { clean: text, cards: null };
    }
  }

  /** Detecta si el mensaje es una petición de receta (activa animación de cocinando) */
  private isRecipeRequest(text: string): boolean {
    return /pasos|preparar|hacer|cocinar|cómo\s+hago|cómo\s+preparo/i.test(text);
  }

  private startCookingAnimation(): void {
    this.phraseIndex = 0;
    this.cookingLabel.set(this.cookingPhrases[0]);
    this.isCooking.set(true);
    this.phraseInterval = setInterval(() => {
      this.phraseIndex = (this.phraseIndex + 1) % this.cookingPhrases.length;
      this.cookingLabel.set(this.cookingPhrases[this.phraseIndex]);
    }, 900);
  }

  private stopCookingAnimation(): void {
    if (this.phraseInterval) {
      clearInterval(this.phraseInterval);
      this.phraseInterval = null;
    }
    this.isCooking.set(false);
  }

  sendMessage(): void {
    const text = this.userInput.trim();
    const image = this.selectedImage();

    if (!text && !image) return;
    if (this.isLoading()) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: text || '📸 Imagen enviada',
      timestamp: new Date(),
      imagePreview: this.imagePreview() ?? undefined,
    };
    this.chatService.addMessage(userMsg);

    this.userInput = '';
    this.removeImage();
    this.isLoading.set(true);
    this.errorMessage.set(null);

    // Activar animación de cocinando si el usuario pide una receta específica
    const showCooking = this.isRecipeRequest(userMsg.content) || !!image;
    if (showCooking) this.startCookingAnimation();

    const startTime = Date.now();

    this.chatService.sendMessage(text, image ?? undefined).subscribe({
      next: (response) => {
        const raw = response.respuesta
          .replace(/<think>[\s\S]*?<\/think>/gi, '')
          .trim();
        const { clean, cards } = this.parseRecipeCards(raw);

        const assistantMsg: ChatMessage = {
          role: 'assistant',
          content: clean,
          timestamp: new Date(),
          recipeCards: cards ?? undefined,
          generatedImage: response.imagen_url ?? undefined,
          videoUrl: response.video_url ?? undefined,
          videoTitulo: response.video_titulo ?? undefined,
          videoThumbnail: response.video_thumbnail ?? undefined,
        };

        // Garantizar duración mínima de la animación
        const elapsed = Date.now() - startTime;
        const remaining = showCooking ? Math.max(0, COOKING_MIN_MS - elapsed) : 0;

        setTimeout(() => {
          if (showCooking) this.stopCookingAnimation();
          this.chatService.addMessage(assistantMsg);
          this.isLoading.set(false);
        }, remaining);
      },
      error: () => {
        if (showCooking) this.stopCookingAnimation();
        this.errorMessage.set('Error al conectar con el servidor. Verifica la URL del webhook.');
        this.isLoading.set(false);
      },
    });
  }

  selectRecipe(card: RecipeCard): void {
    this.userInput = `Quiero hacer "${card.nombre}", dame los pasos detallados`;
    this.sendMessage();
  }

  onKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  clearChat(): void {
    this.chatService.clearMessages();
  }

  private scrollToBottom(): void {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) el.scrollTop = el.scrollHeight;
    } catch {}
  }

  triggerFileInput(): void {
    this.fileInput.nativeElement.click();
  }

  formatTime(date: Date): string {
    return date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
  }

  formatText(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/^[-•]\s(.+)/gm, '<li>$1</li>')
      .replace(/\n/g, '<br>');
  }
}
