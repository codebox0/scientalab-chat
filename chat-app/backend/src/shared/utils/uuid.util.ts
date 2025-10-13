import { randomUUID } from 'node:crypto';

/**
 * UUID utility functions
 * @description This utility provides UUID generation functions.
 */

/**
 * Generate a random UUID
 * @returns A random UUID string
 */
export function generateUUID(): string {
  return randomUUID();
}
