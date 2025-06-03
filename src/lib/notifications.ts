import { toast as reactToastify, ToastOptions, Id } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Default toast configuration
const defaultOptions: ToastOptions = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
};

// Custom toast options interface
export interface CustomToastOptions extends Omit<ToastOptions, "type"> {
  title?: string;
}

// Toast API wrapper
export const toast = {
  success: (message: string, options?: CustomToastOptions): Id => {
    return reactToastify.success(message, {
      ...defaultOptions,
      ...options,
    });
  },

  error: (message: string, options?: CustomToastOptions): Id => {
    return reactToastify.error(message, {
      ...defaultOptions,
      ...options,
    });
  },

  warning: (message: string, options?: CustomToastOptions): Id => {
    return reactToastify.warning(message, {
      ...defaultOptions,
      ...options,
    });
  },

  info: (message: string, options?: CustomToastOptions): Id => {
    return reactToastify.info(message, {
      ...defaultOptions,
      ...options,
    });
  },

  // Generic toast with custom type
  custom: (message: string, options?: ToastOptions): Id => {
    return reactToastify(message, {
      ...defaultOptions,
      ...options,
    });
  },

  // Promise-based toast for async operations
  promise: <T>(
    promise: Promise<T>,
    messages: {
      pending: string;
      success: string;
      error: string;
    },
    options?: ToastOptions
  ): Promise<T> => {
    return reactToastify.promise(promise, messages, {
      ...defaultOptions,
      ...options,
    }) as Promise<T>;
  },

  // Loading toast
  loading: (message: string, options?: CustomToastOptions): Id => {
    return reactToastify.loading(message, {
      ...defaultOptions,
      ...options,
    });
  },

  // Update existing toast
  update: (toastId: Id, options: ToastOptions & { render: string }): void => {
    reactToastify.update(toastId, {
      ...defaultOptions,
      ...options,
    });
  },

  // Dismiss specific toast
  dismiss: (toastId?: Id): void => {
    reactToastify.dismiss(toastId);
  },

  // Clear all toasts
  clear: (): void => {
    reactToastify.dismiss();
  },

  // Check if toast is active
  isActive: (toastId: Id): boolean => {
    return reactToastify.isActive(toastId);
  },
};

// Utility functions for common patterns
export const toastUtils = {
  // Success with auto-dismiss
  quickSuccess: (message: string) =>
    toast.success(message, { autoClose: 2000 }),

  // Error that doesn't auto-dismiss
  persistentError: (message: string) =>
    toast.error(message, { autoClose: false }),

  // Loading toast that can be updated
  asyncOperation: async <T>(
    operation: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ): Promise<T> => {
    const loadingToastId = toast.loading(messages.loading);

    try {
      const result = await operation;
      toast.update(loadingToastId, {
        render: messages.success,
        type: "success",
        isLoading: false,
        autoClose: 3000,
      });
      return result;
    } catch (error) {
      toast.update(loadingToastId, {
        render: messages.error,
        type: "error",
        isLoading: false,
        autoClose: 5000,
      });
      throw error;
    }
  },
};

// Export react-toastify components and utilities
export { ToastContainer as ReactToastifyContainer } from "react-toastify";
export type { ToastOptions, Id as ToastId } from "react-toastify";
