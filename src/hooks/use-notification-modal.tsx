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

type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationModalState {
  open: boolean;
  title: string;
  description?: string;
  type: NotificationType;
}

interface NotificationModalContextType {
  show: (options: { title: string; description?: string; type?: NotificationType }) => void;
  success: (title: string, description?: string) => void;
  error: (title: string, description?: string) => void;
  warning: (title: string, description?: string) => void;
  info: (title: string, description?: string) => void;
}

const NotificationModalContext = React.createContext<NotificationModalContextType | null>(null);

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
};

export function NotificationModalProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<NotificationModalState>({
    open: false,
    title: "",
    description: undefined,
    type: "info",
  });

  const show = React.useCallback(
    ({ title, description, type = "info" }: { title: string; description?: string; type?: NotificationType }) => {
      setState({ open: true, title, description, type });
    },
    []
  );

  const success = React.useCallback((title: string, description?: string) => {
    show({ title, description, type: "success" });
  }, [show]);

  const error = React.useCallback((title: string, description?: string) => {
    show({ title, description, type: "error" });
  }, [show]);

  const warning = React.useCallback((title: string, description?: string) => {
    show({ title, description, type: "warning" });
  }, [show]);

  const info = React.useCallback((title: string, description?: string) => {
    show({ title, description, type: "info" });
  }, [show]);

  const handleClose = () => {
    setState((prev) => ({ ...prev, open: false }));
  };

  const config = typeConfig[state.type];
  const Icon = config.icon;

  return (
    <NotificationModalContext.Provider value={{ show, success, error, warning, info }}>
      {children}
      <AlertDialog open={state.open} onOpenChange={(open) => !open && handleClose()}>
        <AlertDialogContent className="max-w-xs mx-4">
          <AlertDialogHeader>
            <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${config.bgClassName}`}>
              <Icon className={`h-12 w-12 ${config.className}`} />
            </div>
            <AlertDialogTitle className="text-center">{state.title}</AlertDialogTitle>
            {state.description && (
              <AlertDialogDescription className="text-center">
                {state.description}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter className="sm:justify-center">
            <AlertDialogAction onClick={handleClose} className="min-w-[100px]">
              确定
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </NotificationModalContext.Provider>
  );
}

export function useNotificationModal() {
  const context = React.useContext(NotificationModalContext);
  if (!context) {
    throw new Error("useNotificationModal must be used within NotificationModalProvider");
  }
  return context;
}

// 兼容 toast API 的包装函数
export function createModalToast(modal: NotificationModalContextType) {
  return {
    success: (message: string) => modal.success(message),
    error: (message: string) => modal.error(message),
    warning: (message: string) => modal.warning(message),
    info: (message: string) => modal.info(message),
  };
}
