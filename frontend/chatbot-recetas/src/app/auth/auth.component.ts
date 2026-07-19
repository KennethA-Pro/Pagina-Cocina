import {
  Component,
  inject,
  signal,
  output,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';

type Tab = 'login' | 'registro';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.component.html',
  styleUrl: './auth.component.scss',
})
export class AuthComponent {
  private authService = inject(AuthService);

  // Evento para cerrar el modal desde el padre
  cerrar = output<void>();

  tab = signal<Tab>('login');
  isLoading = signal(false);
  errorMsg = signal<string | null>(null);
  successMsg = signal<string | null>(null);

  // Login
  loginEmail = '';
  loginPassword = '';

  // Registro
  regNombre = '';
  regEmail = '';
  regPassword = '';
  regPasswordConfirm = '';

  setTab(t: Tab): void {
    this.tab.set(t);
    this.errorMsg.set(null);
    this.successMsg.set(null);
  }

  submitLogin(): void {
    this.errorMsg.set(null);
    if (!this.loginEmail || !this.loginPassword) {
      this.errorMsg.set('Completa todos los campos.');
      return;
    }
    this.isLoading.set(true);
    this.authService.login(this.loginEmail.trim(), this.loginPassword).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res.ok) {
          this.cerrar.emit();
        } else {
          this.errorMsg.set(res.mensaje || 'Credenciales incorrectas.');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.errorMsg.set('Error al conectar. Intenta de nuevo.');
      },
    });
  }

  submitRegistro(): void {
    this.errorMsg.set(null);
    if (!this.regNombre || !this.regEmail || !this.regPassword || !this.regPasswordConfirm) {
      this.errorMsg.set('Completa todos los campos.');
      return;
    }
    if (this.regPassword !== this.regPasswordConfirm) {
      this.errorMsg.set('Las contraseñas no coinciden.');
      return;
    }
    if (this.regPassword.length < 6) {
      this.errorMsg.set('La contraseña debe tener al menos 6 caracteres.');
      return;
    }
    this.isLoading.set(true);
    this.authService
      .registro(this.regNombre.trim(), this.regEmail.trim(), this.regPassword)
      .subscribe({
        next: (res) => {
          this.isLoading.set(false);
          if (res.ok) {
            this.cerrar.emit();
          } else {
            this.errorMsg.set(res.mensaje || 'No se pudo registrar. El email ya existe.');
          }
        },
        error: () => {
          this.isLoading.set(false);
          this.errorMsg.set('Error al conectar. Intenta de nuevo.');
        },
      });
  }

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('auth-backdrop')) {
      this.cerrar.emit();
    }
  }
}
