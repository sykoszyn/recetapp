'use client';

import * as React from 'react';
import type { ToastActionElement } from '@/components/ui/toast';

const TOAST_LIMIT = 3;

type ToasterToast = {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
  variant?: 'default' | 'destructive' | 'success';
};

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type State = { toasts: ToasterToast[] };

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { toasts: [] };

function dispatch(action: { type: 'ADD' | 'DISMISS' | 'REMOVE'; toast?: ToasterToast; toastId?: string }) {
  switch (action.type) {
    case 'ADD':
      memoryState = { toasts: [action.toast!, ...memoryState.toasts].slice(0, TOAST_LIMIT) };
      break;
    case 'DISMISS':
    case 'REMOVE':
      memoryState = { toasts: memoryState.toasts.filter((t) => t.id !== action.toastId) };
      break;
  }
  listeners.forEach((listener) => listener(memoryState));
}

type Toast = Omit<ToasterToast, 'id'>;

function toast(props: Toast) {
  const id = genId();
  dispatch({ type: 'ADD', toast: { ...props, id } });
  setTimeout(() => dispatch({ type: 'REMOVE', toastId: id }), 4000);
  return id;
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) listeners.splice(index, 1);
    };
  }, []);

  return {
    ...state,
    toast,
    dismiss: (toastId: string) => dispatch({ type: 'DISMISS', toastId }),
  };
}

export { useToast, toast };
