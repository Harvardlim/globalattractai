import * as React from "react";

// Modal-based notification state
interface ModalNotification {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
  open: boolean;
}

type NotificationAction =
  | { type: "ADD"; notification: ModalNotification }
  | { type: "UPDATE"; notification: Partial<ModalNotification> & { id: string } }
  | { type: "DISMISS"; id?: string }
  | { type: "REMOVE"; id?: string };

interface State {
  notifications: ModalNotification[];
}

let count = 0;
function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

const notificationTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (id: string) => {
  if (notificationTimeouts.has(id)) return;
  
  const timeout = setTimeout(() => {
    notificationTimeouts.delete(id);
    dispatch({ type: "REMOVE", id });
  }, 100);
  
  notificationTimeouts.set(id, timeout);
};

const reducer = (state: State, action: NotificationAction): State => {
  switch (action.type) {
    case "ADD":
      return {
        ...state,
        notifications: [action.notification, ...state.notifications].slice(0, 1),
      };
    case "UPDATE":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.notification.id ? { ...n, ...action.notification } : n
        ),
      };
    case "DISMISS": {
      const { id } = action;
      if (id) {
        addToRemoveQueue(id);
      } else {
        state.notifications.forEach((n) => addToRemoveQueue(n.id));
      }
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === id || id === undefined ? { ...n, open: false } : n
        ),
      };
    }
    case "REMOVE":
      if (action.id === undefined) {
        return { ...state, notifications: [] };
      }
      return {
        ...state,
        notifications: state.notifications.filter((n) => n.id !== action.id),
      };
    default:
      return state;
  }
};

const listeners: Array<(state: State) => void> = [];
let memoryState: State = { notifications: [] };

function dispatch(action: NotificationAction) {
  memoryState = reducer(memoryState, action);
  listeners.forEach((listener) => listener(memoryState));
}

type ToastOptions = {
  title?: React.ReactNode;
  description?: React.ReactNode;
  variant?: "default" | "destructive";
};

function toast({ title, description, variant = "default" }: ToastOptions) {
  const id = genId();

  const update = (props: Partial<ToastOptions>) =>
    dispatch({
      type: "UPDATE",
      notification: { ...props, id },
    });

  const dismiss = () => dispatch({ type: "DISMISS", id });

  dispatch({
    type: "ADD",
    notification: {
      id,
      title,
      description,
      variant,
      open: true,
    },
  });

  return { id, dismiss, update };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    listeners.push(setState);
    return () => {
      const index = listeners.indexOf(setState);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, [state]);

  return {
    notifications: state.notifications,
    toast,
    dismiss: (id?: string) => dispatch({ type: "DISMISS", id }),
  };
}

export { useToast, toast };
