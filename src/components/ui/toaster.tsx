import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import { CheckCircle2, XCircle } from "lucide-react";

export function Toaster() {
  const { notifications, dismiss } = useToast();

  return (
    <>
      {notifications.map(({ id, title, description, variant, open }) => {
        const isDestructive = variant === "destructive";
        const Icon = isDestructive ? XCircle : CheckCircle2;
        const iconClass = isDestructive ? "text-red-500" : "text-green-500";
        const bgClass = isDestructive 
          ? "bg-red-50 dark:bg-red-950/30" 
          : "bg-green-50 dark:bg-green-950/30";

        return (
          <AlertDialog 
            key={id} 
            open={open} 
            onOpenChange={(isOpen) => !isOpen && dismiss(id)}
          >
            <AlertDialogContent className="max-w-xs rounded-md">
              <AlertDialogHeader>
                <div className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full ${bgClass}`}>
                  <Icon className={`h-12 w-12 ${iconClass} ${!isDestructive ? 'animate-[scale-in_0.3s_ease-out,pulse_1s_ease-in-out_0.3s]' : ''}`} />
                </div>
                {title && (
                  <AlertDialogTitle className="text-center">
                    {title}
                  </AlertDialogTitle>
                )}
                {description && (
                  <AlertDialogDescription className="text-center">
                    {description}
                  </AlertDialogDescription>
                )}
              </AlertDialogHeader>
              <AlertDialogFooter className="sm:justify-center">
                <AlertDialogAction 
                  onClick={() => dismiss(id)} 
                  className="min-w-[100px]"
                >
                  确定
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        );
      })}
    </>
  );
}