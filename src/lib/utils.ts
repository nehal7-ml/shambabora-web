import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}



export function camelToSnakeCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(camelToSnakeCase);
  }

  if (obj !== null && typeof obj === "object" && obj.constructor === Object) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const snakeKey = key
        .replace(/([A-Z])/g, "_$1")
        .toLowerCase();

      acc[snakeKey] = camelToSnakeCase(value);
      return acc;
    }, {} as Record<string, any>);
  }

  return obj;
}

export function snakeToCamelCase(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(snakeToCamelCase);
  }

  if (obj !== null && typeof obj === "object" && obj.constructor === Object) {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      acc[camelKey] = snakeToCamelCase(value);
      return acc;
    }, {} as Record<string, any>);
  }

  return obj;
}
