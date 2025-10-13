import { generateUUID } from '../../shared/utils/uuid.util';

/**
 * Value Object for session ID
 * @description This value object is used to represent a session ID.
 */
export class SessionIdVO {
  private constructor(private readonly value: string) {
    this.validate();
  }

  /**
   * Create a session ID value object
   * @returns The session ID value object
   */
  static create(): SessionIdVO {
    return new SessionIdVO(generateUUID());
  }

  /**
   * Create a session ID value object from a string
   * @param id - The string to create a session ID value object from
   * @returns The session ID value object
   */
  static fromString(id: string): SessionIdVO {
    return new SessionIdVO(id);
  }

  /**
   * Get the value of the session ID
   * @returns The value of the session ID
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Check if the session ID is equal to another session ID
   * @param other - The other session ID
   * @returns True if the session ID is equal to another session ID, false otherwise
   */
  equals(other: SessionIdVO): boolean {
    return this.value === other.value;
  }

  /**
   * Convert the session ID to a string
   * @returns The string representation of the session ID
   */
  toString(): string {
    return this.value;
  }

  /**
   * Validate the session ID
   */
  private validate(): void {
    if (!this.value || this.value.length === 0) {
      throw new Error('Session ID cannot be empty');
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(this.value)) {
      throw new Error('Invalid session ID format');
    }
  }
}
