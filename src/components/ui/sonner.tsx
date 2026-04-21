import * as React from "react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, XCircle, AlertTriangle, Info } from "lucide-react";

type ToastType = "success" | "error" | "warning" | "info" | "default";

interface ToastState {
  id: string;
  message: string;
  type: ToastType;
  open: boolean;
}

let toastState: ToastState | null = null;
const listeners: Set<() => void> = new Set();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

// Modal toast singleton API
const toast = Object.assign(
  (message: string) => {
    toastState = { id: Date.now().toString(), message, type: "default", open: true };
    notifyListeners();
  },
  {
    success: (message: string) => {
      toastState = { id: Date.now().toString(), message, type: "success", open: true };
      notifyListeners();
    },
    error: (message: string) => {
      toastState = { id: Date.now().toString(), message, type: "error", open: true };
      notifyListeners();
    },
    warning: (message: string) => {
      toastState = { id: Date.now().toString(), message, type: "warning", open: true };
      notifyListeners();
    },
    info: (message: string) => {
      toastState = { id: Date.now().toString(), message, type: "info", open: true };
      notifyListeners();
    },
  }
);

const typeConfig = {
  success: {
    icon: CheckCircle2,
    className: "text-green-500",
    bgClassName: "bg-green-50 dark:bg-green-950/30",
  },
  error: {
    icon: XCircle,
    className: "text-red-500",
    bgClassName: "bg-red-50 dark:bg-red-950/30",
  },
  warning: {
    icon: AlertTriangle,
    className: "text-yellow-500",
    bgClassName: "bg-yellow-50 dark:bg-yellow-950/30",
  },
  info: {
    icon: Info,
    className: "text-blue-500",
    bgClassName: "bg-blue-50 dark:bg-blue-950/30",
  },
  default: {
    icon: Info,
    className: "text-blue-500",
    bgClassName: "bg-blue-50 dark:bg-blue-950/30",
  },
};

function Toaster() {
  const [state, setState] = React.useState<ToastState | null>(null);

  React.useEffect(() => {
    const updateState = () => {
      setState(toastState ? { ...toastState } : null);
    };
    
    listeners.add(updateState);
    return () => {
      listeners.delete(updateState);
    };
  }, []);

  const handleClose = () => {
    if (toastState) {
      toastState = { ...toastState, open: false };
      notifyListeners();
    }
    // Clear after animation
    setTimeout(() => {
      toastState = null;
      notifyListeners();
    }, 150);
  };

  if (!state || !state.open) return null;

  const config = typeConfig[state.type];
  const Icon = config.icon;

  return (
    <AlertDialog open={state.open} onOpenChange={(open) => !open && handleClose()}>
      <AlertDialogContent className="max-w-sm mx-4">
        <AlertDialogHeader>
          <div className={`mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full ${config.bgClassName}`}>
            <Icon className={`h-6 w-6 ${config.className}`} />
          </div>
          <AlertDialogTitle className="text-center">
            {state.message}
          </AlertDialogTitle>
          <AlertDialogDescription className="sr-only">
            通知消息
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-center">
          <AlertDialogAction onClick={handleClose} className="min-w-[100px]">
            确定
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { Toaster, toast };
