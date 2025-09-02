import {
  validateRequired,
  validateLength,
  validateEmail,
  AppError,
  ERROR_CODES,
} from "./error-handling";

// Validation schema types
export interface ValidationRule<T = any> {
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  pattern?: RegExp;
  custom?: (value: T) => void | Promise<void>;
  message?: string;
}

export interface ValidationSchema {
  [key: string]: ValidationRule;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  firstError?: string;
}

// Common validation patterns
export const VALIDATION_PATTERNS = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  phone: /^(\+8801|8801|01)[3-9]\d{8}$/,
  url: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
  alphanumeric: /^[a-zA-Z0-9]+$/,
  alphanumericWithSpaces: /^[a-zA-Z0-9\s]+$/,
  bengaliText: /^[\u0980-\u09FF\s]+$/,
  mixedText: /^[\u0980-\u09FF\sa-zA-Z0-9.,!?'"()\-_]+$/,
  slug: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
  hexColor: /^#(?:[0-9a-fA-F]{3}){1,2}$/,
  strongPassword:
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
} as const;

// Validation messages in Bengali
export const VALIDATION_MESSAGES = {
  required: (field: string) => `${field} প্রয়োজন।`,
  minLength: (field: string, min: number) =>
    `${field} কমপক্ষে ${min} অক্ষর হতে হবে।`,
  maxLength: (field: string, max: number) =>
    `${field} সর্বোচ্চ ${max} অক্ষর হতে পারে।`,
  pattern: (field: string) => `${field} সঠিক ফরম্যাটে দিন।`,
  email: "সঠিক ইমেইল দিন।",
  phone: "সঠিক ফোন নম্বর দিন।",
  url: "সঠিক URL দিন।",
  strongPassword:
    "পাসওয়ার্ড শক্তিশালী হতে হবে (কমপক্ষে ৮ অক্ষর, বড় ও ছোট হাতের অক্ষর, সংখ্যা ও বিশেষ চিহ্ন)।",
  custom: (field: string) => `${field} সঠিক নয়।`,
} as const;

// Validate single field
export const validateField = async (
  value: any,
  rule: ValidationRule,
  fieldName: string,
): Promise<string | null> => {
  try {
    // Required validation
    if (
      rule.required &&
      (value === null || value === undefined || value === "")
    ) {
      return rule.message || VALIDATION_MESSAGES.required(fieldName);
    }

    // Skip other validations if value is empty and not required
    if (
      !rule.required &&
      (value === null || value === undefined || value === "")
    ) {
      return null;
    }

    const stringValue = String(value);

    // Length validations
    if (rule.minLength !== undefined && stringValue.length < rule.minLength) {
      return (
        rule.message || VALIDATION_MESSAGES.minLength(fieldName, rule.minLength)
      );
    }

    if (rule.maxLength !== undefined && stringValue.length > rule.maxLength) {
      return (
        rule.message || VALIDATION_MESSAGES.maxLength(fieldName, rule.maxLength)
      );
    }

    // Pattern validation
    if (rule.pattern && !rule.pattern.test(stringValue)) {
      return rule.message || VALIDATION_MESSAGES.pattern(fieldName);
    }

    // Custom validation
    if (rule.custom) {
      await rule.custom(value);
    }

    return null;
  } catch (error) {
    if (error instanceof AppError) {
      return error.message;
    }
    return rule.message || VALIDATION_MESSAGES.custom(fieldName);
  }
};

// Validate entire form
export const validateForm = async (
  data: Record<string, any>,
  schema: ValidationSchema,
): Promise<ValidationResult> => {
  const errors: Record<string, string> = {};

  for (const [fieldName, rule] of Object.entries(schema)) {
    const error = await validateField(data[fieldName], rule, fieldName);
    if (error) {
      errors[fieldName] = error;
    }
  }

  const isValid = Object.keys(errors).length === 0;
  const firstError = isValid ? undefined : Object.values(errors)[0];

  return { isValid, errors, firstError };
};

// Common validation schemas
export const NOTE_VALIDATION_SCHEMA: ValidationSchema = {
  title: {
    maxLength: 200,
    message: "শিরোনাম সর্বোচ্চ ২০০ অক্ষর হতে পারে।",
  },
  content: {
    minLength: 1,
    message: "কন্টেন্ট খালি রাখা যাবে না।",
  },
  tags: {
    custom: (tags: string[]) => {
      if (tags && tags.length > 20) {
        throw new AppError("সর্বোচ্চ ২০টি ট্যাগ দেওয়া যাবে।");
      }
      if (tags) {
        for (const tag of tags) {
          if (tag.length > 50) {
            throw new AppError("ট্যাগ সর্বোচ্চ ৫০ অক্ষর হতে পারে।");
          }
        }
      }
    },
  },
};

export const CHAT_MESSAGE_SCHEMA: ValidationSchema = {
  content: {
    required: true,
    minLength: 1,
    maxLength: 4000,
    message: "বার্তা ১ থেকে ৪০০০ অক্ষরের মধ্যে হতে হবে।",
  },
  sessionId: {
    required: true,
    pattern: /^[a-zA-Z0-9\-_]+$/,
    message: "সেশন ID সঠিক নয়।",
  },
};

export const USER_SETTINGS_SCHEMA: ValidationSchema = {
  name: {
    maxLength: 100,
    pattern: VALIDATION_PATTERNS.mixedText,
    message: "নাম সর্বোচ্চ ১০০ অক্ষর হতে পারে।",
  },
  email: {
    pattern: VALIDATION_PATTERNS.email,
    message: VALIDATION_MESSAGES.email,
  },
  phone: {
    pattern: VALIDATION_PATTERNS.phone,
    message: VALIDATION_MESSAGES.phone,
  },
  bio: {
    maxLength: 500,
    message: "বায়ো সর্বোচ্চ ৫০০ অক্ষর হতে পারে।",
  },
};

export const TAG_SCHEMA: ValidationSchema = {
  name: {
    required: true,
    minLength: 1,
    maxLength: 50,
    pattern: VALIDATION_PATTERNS.mixedText,
    message: "ট্যাগের নাম ১-৫০ অক্ষরের মধ্যে হতে হবে।",
  },
  color: {
    pattern: VALIDATION_PATTERNS.hexColor,
    message: "সঠিক রঙের কোড দিন (#000000 ফরম্যাটে)।",
  },
};

export const TEMPLATE_SCHEMA: ValidationSchema = {
  title: {
    required: true,
    minLength: 3,
    maxLength: 100,
    message: "টেমপ্লেটের শিরোনাম ৩-১০০ অক্ষরের মধ্যে হতে হবে।",
  },
  description: {
    maxLength: 500,
    message: "বর্ণনা সর্বোচ্চ ৫০০ অক্ষর হতে পারে।",
  },
  category: {
    required: true,
    pattern: VALIDATION_PATTERNS.alphanumericWithSpaces,
    message: "ক্যাটেগরি প্রয়োজন।",
  },
  content: {
    required: true,
    minLength: 10,
    message: "টেমপ্লেট কন্টেন্ট কমপক্ষে ১০ অক্ষর হতে হবে।",
  },
};

// Real-time validation hook
export const useRealtimeValidation = (
  schema: ValidationSchema,
  debounceMs: number = 300,
) => {
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isValidating, setIsValidating] = React.useState(false);
  const timeoutRef = React.useRef<NodeJS.Timeout>();

  const validateFieldAsync = React.useCallback(
    async (fieldName: string, value: any) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(async () => {
        setIsValidating(true);

        const rule = schema[fieldName];
        if (!rule) {
          setIsValidating(false);
          return;
        }

        try {
          const error = await validateField(value, rule, fieldName);
          setErrors((prev) => {
            if (error) {
              return { ...prev, [fieldName]: error };
            } else {
              const { [fieldName]: removed, ...rest } = prev;
              return rest;
            }
          });
        } catch (err) {
          console.error("Validation error:", err);
        } finally {
          setIsValidating(false);
        }
      }, debounceMs);
    },
    [schema, debounceMs],
  );

  const validateAllFields = React.useCallback(
    async (data: Record<string, any>) => {
      setIsValidating(true);
      try {
        const result = await validateForm(data, schema);
        setErrors(result.errors);
        return result;
      } finally {
        setIsValidating(false);
      }
    },
    [schema],
  );

  const clearErrors = React.useCallback(() => {
    setErrors({});
  }, []);

  const hasErrors = Object.keys(errors).length > 0;
  const getFieldError = (fieldName: string) => errors[fieldName];

  return {
    errors,
    isValidating,
    hasErrors,
    validateField: validateFieldAsync,
    validateAllFields,
    clearErrors,
    getFieldError,
  };
};

// Form data sanitization
export const sanitizeFormData = (
  data: Record<string, any>,
  options?: {
    trim?: boolean;
    removeEmpty?: boolean;
    convertNumbers?: boolean;
  },
): Record<string, any> => {
  const opts = {
    trim: true,
    removeEmpty: false,
    convertNumbers: false,
    ...options,
  };

  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    let sanitizedValue = value;

    // Trim strings
    if (opts.trim && typeof value === "string") {
      sanitizedValue = value.trim();
    }

    // Remove empty values
    if (
      opts.removeEmpty &&
      (sanitizedValue === "" ||
        sanitizedValue === null ||
        sanitizedValue === undefined)
    ) {
      continue;
    }

    // Convert numeric strings to numbers
    if (
      opts.convertNumbers &&
      typeof sanitizedValue === "string" &&
      !isNaN(Number(sanitizedValue))
    ) {
      sanitizedValue = Number(sanitizedValue);
    }

    sanitized[key] = sanitizedValue;
  }

  return sanitized;
};

// Form submission wrapper
export const createFormSubmissionHandler = <T extends Record<string, any>>(
  schema: ValidationSchema,
  onSubmit: (data: T) => Promise<void> | void,
  options?: {
    sanitize?: boolean;
    showSuccessToast?: boolean;
    successMessage?: string;
  },
) => {
  const opts = {
    sanitize: true,
    showSuccessToast: true,
    successMessage: "সফলভাবে সেভ হয়েছে।",
    ...options,
  };

  return async (
    data: T,
    onSuccess?: () => void,
    onError?: (error: AppError) => void,
  ) => {
    try {
      // Sanitize data
      const processedData = opts.sanitize
        ? (sanitizeFormData(data) as T)
        : data;

      // Validate
      const validation = await validateForm(processedData, schema);
      if (!validation.isValid) {
        throw new AppError(
          validation.firstError || "ফরম পূরণে ত্রুটি আছে।",
          ERROR_CODES.VALIDATION_ERROR,
          400,
          { errors: validation.errors },
        );
      }

      // Submit
      await onSubmit(processedData);

      // Success feedback
      if (opts.showSuccessToast) {
        // Will be handled by success toast in the calling component
      }

      onSuccess?.();
    } catch (error) {
      const appError =
        error instanceof AppError
          ? error
          : new AppError(
              "ফরম সাবমিট করতে সমস্যা হয়েছে।",
              ERROR_CODES.UNKNOWN_ERROR,
            );

      onError?.(appError);
      throw appError;
    }
  };
};

// Export React for the hook
import React from "react";
