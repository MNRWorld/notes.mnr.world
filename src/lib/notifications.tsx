import React from "react";
import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Icons } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

// Notification types
export type NotificationType =
  | "success"
  | "error"
  | "warning"
  | "info"
  | "loading";

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "destructive" | "outline";
}

export interface NotificationOptions {
  type?: NotificationType;
  title?: string;
  description?: string;
  actions?: NotificationAction[];
  duration?: number;
  haptic?: boolean;
  persistent?: boolean;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: {
    text: string;
    variant?: "default" | "secondary" | "destructive" | "outline";
  };
}

// Bengali notification messages
export const NOTIFICATION_MESSAGES = {
  success: {
    saved: "সফলভাবে সেভ হয়েছে।",
    deleted: "সফলভাবে ডিলিট হয়েছে।",
    updated: "সফলভাবে আপডেট হয়েছে।",
    created: "সফলভাবে তৈরি হয়েছে।",
    exported: "সফলভাবে এক্সপোর্ট হয়েছে।",
    imported: "সফলভাবে ইমপোর্ট হয়েছে।",
    copied: "কপি হয়েছে।",
    shared: "শেয়ার হয়েছে।",
    synced: "সিঙ্ক হয়েছে।",
  },
  error: {
    network: "ইন্টারনেট সংযোগ নেই।",
    storage: "স্টোরেজে সমস্যা হয়েছে।",
    validation: "তথ্য সঠিকভাবে পূরণ করুন।",
    permission: "অনুমতি নেই।",
    notFound: "পাওয়া যায়নি।",
    server: "সার্ভারে সমস্যা হয়েছে।",
    unknown: "অজানা সমস্যা হয়েছে।",
  },
  warning: {
    unsaved: "পরিবর্তনগুলো সেভ হয়নি।",
    quota: "স্টোরেজ প্রায় পূর্ণ।",
    outdated: "পুরাতন ভার্সন চলছে।",
    offline: "অফলাইন মোডে চলছে।",
  },
  info: {
    loading: "লোড হচ্ছে...",
    processing: "প্রসেস হচ্ছে...",
    uploading: "আপলোড হচ্ছে...",
    syncing: "সিঙ্ক হচ্ছে...",
    welcome: "স্বাগতম!",
  },
} as const;

// Custom notification component
interface NotificationContentProps {
  title?: string;
  description?: string;
  type: NotificationType;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: NotificationOptions["badge"];
  actions?: NotificationAction[];
  onDismiss?: () => void;
}

const NotificationContent: React.FC<NotificationContentProps> = ({
  title,
  description,
  type,
  icon: Icon,
  badge,
  actions = [],
  onDismiss,
}) => {
  // Default icons for each type
  const defaultIcons = {
    success: Icons.Check,
    error: Icons.X,
    warning: Icons.AlertTriangle,
    info: Icons.Info,
    loading: Icons.Loader,
  };

  const DisplayIcon = Icon || defaultIcons[type];

  return (
    <div className="flex items-start gap-3 w-full">
      {/* Icon */}
      <div
        className={cn(
          "flex-shrink-0 w-5 h-5 mt-0.5",
          type === "loading" && "animate-spin",
        )}
      >
        <DisplayIcon
          className={cn(
            "w-5 h-5",
            type === "success" && "text-green-500",
            type === "error" && "text-red-500",
            type === "warning" && "text-yellow-500",
            type === "info" && "text-blue-500",
            type === "loading" && "text-muted-foreground",
          )}
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          {title && <p className="font-medium text-sm leading-none">{title}</p>}
          {badge && (
            <Badge variant={badge.variant || "secondary"} className="text-xs">
              {badge.text}
            </Badge>
          )}
        </div>

        {description && (
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}

        {/* Actions */}
        {actions.length > 0 && (
          <div className="flex items-center gap-2 mt-3">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant={action.variant || "outline"}
                size="sm"
                onClick={() => {
                  action.onClick();
                  onDismiss?.();
                }}
                className="h-7 px-3 text-xs"
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Dismiss button */}
      {onDismiss && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onDismiss}
          className="h-6 w-6 p-0 flex-shrink-0"
        >
          <Icons.X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
};

// Enhanced notification functions
const createNotification = (
  type: NotificationType,
  options: NotificationOptions,
): string | number => {
  const {
    title,
    description,
    actions = [],
    duration,
    haptic = true,
    persistent = false,
    icon,
    badge,
  } = options;

  // Haptic feedback for native platforms
  if (haptic && Capacitor.isNativePlatform()) {
    const hapticStyle =
      type === "error" ? ImpactStyle.Heavy : ImpactStyle.Light;
    Haptics.impact({ style: hapticStyle }).catch(() => {
      // Ignore haptic errors
    });
  }

  // Calculate duration based on type and content
  let calculatedDuration = duration;
  if (!calculatedDuration) {
    if (persistent || type === "loading") {
      calculatedDuration = Infinity;
    } else if (type === "error") {
      calculatedDuration = 6000;
    } else if (actions.length > 0) {
      calculatedDuration = 8000;
    } else {
      calculatedDuration = 4000;
    }
  }

  const toastId = toast.custom(
    (t) => (
      <NotificationContent
        title={title}
        description={description}
        type={type}
        icon={icon}
        badge={badge}
        actions={actions}
        onDismiss={() => toast.dismiss(t)}
      />
    ),
    {
      duration: calculatedDuration,
    },
  );

  return toastId;
};

// Notification manager
export const notifications = {
  success: (options: Omit<NotificationOptions, "type">) =>
    createNotification("success", { ...options, type: "success" }),

  error: (options: Omit<NotificationOptions, "type">) =>
    createNotification("error", { ...options, type: "error" }),

  warning: (options: Omit<NotificationOptions, "type">) =>
    createNotification("warning", { ...options, type: "warning" }),

  info: (options: Omit<NotificationOptions, "type">) =>
    createNotification("info", { ...options, type: "info" }),

  loading: (options: Omit<NotificationOptions, "type">): string | number =>
    createNotification("loading", { ...options, type: "loading" }),

  // Convenience methods with predefined messages
  saved: (title?: string) =>
    notifications.success({
      title: title || NOTIFICATION_MESSAGES.success.saved,
    }),

  deleted: (title?: string) =>
    notifications.success({
      title: title || NOTIFICATION_MESSAGES.success.deleted,
    }),

  updated: (title?: string) =>
    notifications.success({
      title: title || NOTIFICATION_MESSAGES.success.updated,
    }),

  networkError: (retry?: () => void) =>
    notifications.error({
      title: NOTIFICATION_MESSAGES.error.network,
      actions: retry
        ? [{ label: "আবার চেষ্টা করুন", onClick: retry }]
        : undefined,
    }),

  storageError: () =>
    notifications.error({
      title: NOTIFICATION_MESSAGES.error.storage,
    }),

  validationError: (message?: string) =>
    notifications.error({
      title: message || NOTIFICATION_MESSAGES.error.validation,
    }),

  unsavedChanges: (onSave: () => void, onDiscard: () => void) =>
    notifications.warning({
      title: NOTIFICATION_MESSAGES.warning.unsaved,
      description: "পরিবর্তনগুলো সেভ করতে চান?",
      actions: [
        { label: "সেভ করুন", onClick: onSave },
        { label: "বাতিল করুন", onClick: onDiscard, variant: "outline" },
      ],
      persistent: true,
    }),

  storageQuota: (onCleanup?: () => void) =>
    notifications.warning({
      title: NOTIFICATION_MESSAGES.warning.quota,
      description: "কিছু পুরাতন ডেটা ডিলিট করুন।",
      actions: onCleanup
        ? [{ label: "পরিষ্কার করুন", onClick: onCleanup }]
        : undefined,
    }),

  offline: () =>
    notifications.info({
      title: NOTIFICATION_MESSAGES.warning.offline,
      badge: { text: "অফলাইন", variant: "secondary" },
    }),

  // Loading states
  loadingWithProgress: (title: string, progress?: number): string | number =>
    notifications.loading({
      title,
      badge: progress !== undefined ? { text: `${progress}%` } : undefined,
    }),

  processingOperation: (operation: string) =>
    notifications.loading({
      title: `${operation} হচ্ছে...`,
    }),
};

// Promise-based notification for async operations
export const notifyAsync = async <T,>(
  promise: Promise<T>,
  options: {
    loading?: string;
    success?: string;
    error?: string;
    onSuccess?: (result: T) => void;
    onError?: (error: unknown) => void;
  },
): Promise<T> => {
  const loadingId = options.loading
    ? notifications.loading({ title: options.loading })
    : null;

  try {
    const result = await promise;

    if (loadingId) {
      toast.dismiss(loadingId);
    }

    if (options.success) {
      notifications.success({ title: options.success });
    }

    options.onSuccess?.(result);
    return result;
  } catch (error) {
    if (loadingId) {
      toast.dismiss(loadingId);
    }

    if (options.error) {
      notifications.error({ title: options.error });
    }

    options.onError?.(error);
    throw error;
  }
};

// Local notifications for native platforms
export const localNotifications = {
  async requestPermission(): Promise<boolean> {
    // LocalNotifications removed for simplicity
    return false;
  },

  async schedule(options: {
    id: number;
    title: string;
    body: string;
    schedule?: {
      at: Date;
      repeats?: boolean;
    };
    extra?: Record<string, unknown>;
  }): Promise<void> {
    // LocalNotifications removed for simplicity
    // Schedule notification (development only)
    // Note: Removed console.log for production
  },

  async cancel(_ids: number[]): Promise<void> {
    // LocalNotifications removed for simplicity
    // Cancel notifications (development only)
    // Note: Removed console.log for production
  },

  // Convenience methods for common notifications
  async reminderToReview(): Promise<void> {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // 10 AM

    await this.schedule({
      id: 1,
      title: "নোট রিভিউ করুন",
      body: "আজকের জন্য কিছু নোট রিভিউ করার সময়!",
      schedule: { at: tomorrow, repeats: true },
    });
  },

  async backupReminder(): Promise<void> {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(9, 0, 0, 0); // 9 AM

    await this.schedule({
      id: 2,
      title: "ব্যাকআপ নিন",
      body: "আপনার নোটগুলোর ব্যাকআপ নেওয়ার সময় হয়েছে।",
      schedule: { at: nextWeek, repeats: true },
    });
  },
};

// Notification settings hook
export const useNotificationSettings = () => {
  const [settings, setSettings] = React.useState({
    showSuccess: true,
    showError: true,
    showWarning: true,
    showInfo: true,
    hapticFeedback: true,
    localNotifications: false,
  });

  const updateSetting = React.useCallback(
    (key: keyof typeof settings, value: boolean) => {
      setSettings((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  return { settings, updateSetting };
};

// Batch notifications for multiple operations
export const batchNotifications = {
  start: (title: string) => {
    return notifications.loading({ title, persistent: true });
  },

  update: (id: string | number, progress: number, total: number) => {
    toast.dismiss(id);
    return notifications.loading({
      title: `প্রসেস হচ্ছে... (${progress}/${total})`,
      badge: { text: `${Math.round((progress / total) * 100)}%` },
      persistent: true,
    });
  },

  complete: (id: string | number, successCount: number, totalCount: number) => {
    toast.dismiss(id);

    if (successCount === totalCount) {
      notifications.success({
        title: `সব ${totalCount}টি আইটেম সফলভাবে প্রসেস হয়েছে।`,
      });
    } else {
      notifications.warning({
        title: `${successCount}/${totalCount} আইটেম প্রসেস হয়েছে।`,
        description: `${totalCount - successCount}টি আইটেমে সমস্যা হয়েছে।`,
      });
    }
  },
};
