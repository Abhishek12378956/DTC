export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

class NotificationService {
  private listeners: ((toasts: Toast[]) => void)[] = [];
  private toasts: Toast[] = [];

  subscribe(listener: (toasts: Toast[]) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.listeners.forEach((listener) => listener([...this.toasts]));
  }

  show(message: string, type: ToastType = 'info', duration: number = 3000): void {
    const id = Date.now().toString();
    const toast: Toast = { id, message, type, duration };
    this.toasts.push(toast);
    this.notify();

    if (duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, duration);
    }
  }

  remove(id: string): void {
    this.toasts = this.toasts.filter((t) => t.id !== id);
    this.notify();
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration || 5000);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }
}

export const notificationService = new NotificationService();

