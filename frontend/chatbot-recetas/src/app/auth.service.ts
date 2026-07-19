import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../environments/environment';

export interface Usuario {
  usuario_id: number;
  nombre: string;
  email: string;
}

export interface AuthResponse {
  ok: boolean;
  usuario_id?: number;
  nombre?: string;
  email?: string;
  mensaje: string;
}

const STORAGE_KEY = 'chef_ia_usuario';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  // Señal reactiva con el usuario actualmente autenticado
  usuario = signal<Usuario | null>(this.cargarSesion());

  get isLoggedIn(): boolean {
    return this.usuario() !== null;
  }

  registro(nombre: string, email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(environment.N8N_WEBHOOK_REGISTRO, { nombre, email, password })
      .pipe(
        tap((res) => {
          if (res.ok && res.usuario_id) {
            this.guardarSesion({ usuario_id: res.usuario_id, nombre: res.nombre!, email: res.email! });
          }
        })
      );
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(environment.N8N_WEBHOOK_LOGIN, { email, password })
      .pipe(
        tap((res) => {
          if (res.ok && res.usuario_id) {
            this.guardarSesion({ usuario_id: res.usuario_id, nombre: res.nombre!, email: res.email! });
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.usuario.set(null);
  }

  private guardarSesion(u: Usuario): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(u));
    this.usuario.set(u);
  }

  private cargarSesion(): Usuario | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as Usuario) : null;
    } catch {
      return null;
    }
  }
}
