/**
 * Simple toast notification utility for client-side JavaScript
 */

export class Toast {
  private container: HTMLDivElement;
  private timeout: number = 5000; // Default timeout

  constructor() {
    // Create container if not exists
    let container = document.getElementById('toast-container') as HTMLDivElement;
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
      document.body.appendChild(container);
    }
    
    this.container = container;
  }

  /**
   * Show a toast notification
   * @param message - The message to display
   * @param type - The type of toast: "success", "error", "info", or "warning"
   * @param timeout - Optional timeout in milliseconds, defaults to 5000
   */
  show(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', timeout?: number): void {
    const toast = document.createElement('div');
    toast.className = 'py-3 px-4 rounded-lg shadow-md max-w-sm transform transition-all duration-300 ease-in-out opacity-0 translate-x-4';
    
    // Apply styles based on type
    switch (type) {
      case 'success':
        toast.classList.add('bg-green-500', 'text-white');
        break;
      case 'error':
        toast.classList.add('bg-red-500', 'text-white');
        break;
      case 'warning':
        toast.classList.add('bg-yellow-500', 'text-white');
        break;
      case 'info':
      default:
        toast.classList.add('bg-primary', 'text-white');
        break;
    }
    
    toast.textContent = message;
    this.container.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
      toast.classList.remove('opacity-0', 'translate-x-4');
    }, 10);
    
    // Auto-remove after timeout
    setTimeout(() => {
      toast.classList.add('opacity-0', 'translate-x-4');
      setTimeout(() => {
        if (toast.parentNode === this.container) {
          this.container.removeChild(toast);
        }
      }, 300); // Wait for transition
    }, timeout || this.timeout);
  }
}

// Create singleton instance
let toastInstance: Toast;

export function useToast(): Toast {
  if (!toastInstance && typeof window !== 'undefined') {
    toastInstance = new Toast();
  }
  return toastInstance;
}