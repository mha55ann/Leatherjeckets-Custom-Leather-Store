import type { ReactNode } from 'react';
import type { ToastActionElement, ToastProps } from '@/components/ui/toast';

export type ToasterToast = ToastProps & {
  id: string;
  title?: ReactNode;
  description?: ReactNode;
  action?: ToastActionElement;
};

type ToastState = {
  toasts: ToasterToast[];
};

type ToastAction =
  | { type: 'ADD_TOAST'; toast: ToasterToast }
  | { type: 'UPDATE_TOAST'; toast: Partial<ToasterToast> }
  | { type: 'DISMISS_TOAST'; toastId?: string }
  | { type: 'REMOVE_TOAST'; toastId?: string };

export function reducer(state: ToastState, action: ToastAction): ToastState;

export function toast(
  props: Omit<ToasterToast, 'id'>,
): {
  id: string;
  dismiss: () => void;
  update: (props: ToasterToast) => void;
};

export function useToast(): {
  toasts: ToasterToast[];
  toast: typeof toast;
  dismiss: (toastId?: string) => void;
};
