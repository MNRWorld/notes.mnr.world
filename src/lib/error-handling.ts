import { toast } from "sonner";
import { Capacitor } from "@capacitor/core";
import { Haptics, ImpactStyle } from "@capacitor/haptics";

// Error types
export interface AppError extends Error {
  code?: string;
  statusCode?: number;
  context?: Record<string, any>;
}

export class AppError extends Error {
  constructor(
    message: string,
    public code?: string,
    public statusCode?: number,
    public context?: Record<string, any>,
  ) {
    super(message);
    this.name = "AppError";
  }
}

// Error categories
export const ERROR_CODES = {
  // Network errors
  NETWORK_ERROR: "NETWORK_ERROR",
  TIMEOUT_ERROR: "TIMEOUT_ERROR",
  API_ERROR: "API_ERROR",

  // Storage errors
  STORAGE_ERROR: "STORAGE_ERROR",
  SYNC_ERROR: "SYNC_ERROR",

  // Validation errors
  VALIDATION_ERROR: "VALIDATION_ERROR",
  PERMISSION_ERROR: "PERMISSION_ERROR",

  // Editor errors
  EDITOR_ERROR: "EDITOR_ERROR",
  SAVE_ERROR: "SAVE_ERROR",

  // Chat errors
  CHAT_ERROR: "CHAT_ERROR",
  AI_ERROR: "AI_ERROR",

  // Unknown
  UNKNOWN_ERROR: "UNKNOWN_ERROR",
} as const;

// Error messages in Bengali
export const ERROR_MESSAGES = {
  [ERROR_CODES.NETWORK_ERROR]: "ইন্টারনেট সংযোগে সমস্যা হয়েছে।",
  [ERROR_CODES.TIMEOUT_ERROR]: "সময় শেষ হয়ে গেছে। আবার চেষ্টা করুন।",
  [ERROR_CODES.API_ERROR]: "সার্ভারে সমস্যা হয়েছে। পরে চেষ্টা করুন।",
  [ERROR_CODES.STORAGE_ERROR]: "ডেটা সেভ করতে সমস্যা হয়েছে।",
  [ERROR_CODES.SYNC_ERROR]: "সিঙ্ক করতে সমস্যা হয়েছে।",
  [ERROR_CODES.VALIDATION_ERROR]: "তথ্য সঠিকভাবে পূরণ করুন।",
  [ERROR_CODES.PERMISSION_ERROR]: "অনুমতি নেই।",
  [ERROR_CODES.EDITOR_ERROR]: "এডিটরে সমস্যা হয়েছে।",
  [ERROR_CODES.SAVE_ERROR]: "সেভ করতে সমস্যা হয়েছে।",
  [ERROR_CODES.CHAT_ERROR]: "চ্যাটে সমস্যা হয়েছে।",
  [ERROR_CODES.AI_ERROR]: "AI সেবায় সমস্যা হয়েছে।",
  [ERROR_CODES.UNKNOWN_ERROR]: "অজানা সমস্যা হয়েছে।",
} as const;

// Error handler wrapper
export const handleError = async (
  error: unknown,
  context?: Record<string, any>,
  options?: {
    showToast?: boolean;
    logError?: boolean;
    hapticFeedback?: boolean;
  },
): Promise<AppError> => {
  const opts = {
    showToast: true,
    logError: true,
    hapticFeedback: Capacitor.isNativePlatform(),
    ...options,
  };

  let appError: AppError;

  // Convert unknown error to AppError
  if (error instanceof AppError) {
    appError = error;
  } else if (error instanceof Error) {
    // Detect error type from message/name
    let code: string = ERROR_CODES.UNKNOWN_ERROR;

    if (error.name === "NetworkError" || error.message.includes("fetch")) {
      code = ERROR_CODES.NETWORK_ERROR;
    } else if (error.message.includes("timeout")) {
      code = ERROR_CODES.TIMEOUT_ERROR;
    } else if (
      error.message.includes("storage") ||
      error.message.includes("database")
    ) {
      code = ERROR_CODES.STORAGE_ERROR;
    } else if (error.message.includes("validation")) {
      code = ERROR_CODES.VALIDATION_ERROR;
    }

    appError = new AppError(error.message, code, undefined, context);
  } else {
    appError = new AppError(
      String(error),
      ERROR_CODES.UNKNOWN_ERROR,
      undefined,
      context,
    );
  }

  // Log error
  if (opts.logError) {
    console.error("App Error:", {
      message: appError.message,
      code: appError.code,
      statusCode: appError.statusCode,
      context: appError.context,
      stack: appError.stack,
    });
  }

  // Show toast notification
  if (opts.showToast) {
    const message =
      appError.code &&
      ERROR_MESSAGES[appError.code as keyof typeof ERROR_MESSAGES]
        ? ERROR_MESSAGES[appError.code as keyof typeof ERROR_MESSAGES]
        : appError.message;

    toast.error(message);
  }

  // Haptic feedback for native platforms
  if (opts.hapticFeedback && Capacitor.isNativePlatform()) {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch (e) {
      // Ignore haptic errors
    }
  }

  return appError;
};

// Retry wrapper with exponential backoff
export const withRetry = async <T>(
  operation: () => Promise<T>,
  options?: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    backoffFactor?: number;
    retryCondition?: (error: AppError) => boolean;
  },
): Promise<T> => {
  const opts = {
    maxRetries: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryCondition: (error: AppError) => {
      return [
        ERROR_CODES.NETWORK_ERROR,
        ERROR_CODES.TIMEOUT_ERROR,
        ERROR_CODES.API_ERROR,
      ].includes(error.code as any);
    },
    ...options,
  };

  let lastError: AppError;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      lastError = await handleError(error, { attempt }, { showToast: false });

      // Don't retry on last attempt or if condition fails
      if (attempt === opts.maxRetries || !opts.retryCondition(lastError)) {
        throw lastError;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(
        opts.baseDelay * Math.pow(opts.backoffFactor, attempt),
        opts.maxDelay,
      );

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError!;
};

// Safe async wrapper
export const safeAsync = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
) => {
  return async (...args: T): Promise<[R | null, AppError | null]> => {
    try {
      const result = await fn(...args);
      return [result, null];
    } catch (error) {
      const appError = await handleError(error, { args }, { showToast: false });
      return [null, appError];
    }
  };
};

// API Response utilities
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

export const createApiResponse = <T>(
  data: T,
  meta?: ApiResponse<T>["meta"],
): ApiResponse<T> => ({
  success: true,
  data,
  meta,
});

export const createApiError = (
  code: string,
  message: string,
  details?: any,
): ApiResponse => ({
  success: false,
  error: { code, message, details },
});

// Fetch wrapper with error handling
export const apiRequest = async <T = any>(
  url: string,
  options?: RequestInit & {
    timeout?: number;
    retries?: number;
  },
): Promise<T> => {
  const { timeout = 10000, retries = 2, ...fetchOptions } = options || {};

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await withRetry(
      async () => {
        const res = await fetch(url, {
          ...fetchOptions,
          signal: controller.signal,
        });

        if (!res.ok) {
          throw new AppError(
            `HTTP ${res.status}: ${res.statusText}`,
            ERROR_CODES.API_ERROR,
            res.status,
          );
        }

        return res;
      },
      { maxRetries: retries },
    );

    clearTimeout(timeoutId);

    const data = await response.json();

    if (!data.success) {
      throw new AppError(
        data.error?.message || "API request failed",
        data.error?.code || ERROR_CODES.API_ERROR,
        response.status,
        data.error?.details,
      );
    }

    return data.data;
  } catch (error) {
    clearTimeout(timeoutId);

    if (error instanceof DOMException && error.name === "AbortError") {
      throw new AppError("Request timeout", ERROR_CODES.TIMEOUT_ERROR);
    }

    throw error;
  }
};

// Storage error handling
export const withStorageErrorHandling = <T extends any[], R>(
  operation: (...args: T) => Promise<R>,
) => {
  return async (...args: T): Promise<R> => {
    try {
      return await operation(...args);
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === "QuotaExceededError") {
          throw new AppError(
            "স্টোরেজ পূর্ণ হয়ে গেছে।",
            ERROR_CODES.STORAGE_ERROR,
            undefined,
            { storageQuotaExceeded: true },
          );
        }

        if (
          error.message.includes("database") ||
          error.message.includes("IDB")
        ) {
          throw new AppError(
            "ডেটাবেসে সমস্যা হয়েছে।",
            ERROR_CODES.STORAGE_ERROR,
            undefined,
            { originalError: error.message },
          );
        }
      }

      throw await handleError(error, { operation: operation.name, args });
    }
  };
};

// Validation helpers
export const validateRequired = (value: any, fieldName: string): void => {
  if (value === null || value === undefined || value === "") {
    throw new AppError(
      `${fieldName} প্রয়োজন।`,
      ERROR_CODES.VALIDATION_ERROR,
      400,
      { field: fieldName, value },
    );
  }
};

export const validateLength = (
  value: string,
  min: number,
  max: number,
  fieldName: string,
): void => {
  if (value.length < min || value.length > max) {
    throw new AppError(
      `${fieldName} ${min} থেকে ${max} অক্ষরের মধ্যে হতে হবে।`,
      ERROR_CODES.VALIDATION_ERROR,
      400,
      { field: fieldName, value, min, max },
    );
  }
};

export const validateEmail = (email: string): void => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new AppError("সঠিক ইমেইল দিন।", ERROR_CODES.VALIDATION_ERROR, 400, {
      field: "email",
      value: email,
    });
  }
};
