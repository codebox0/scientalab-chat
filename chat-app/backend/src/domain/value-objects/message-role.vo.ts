/**
 * Message role enum
 * @description This enum is used to represent the role of a message.
 */
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

/**
 * Message role value object
 * @description This class is used to represent a message role.
 */
export class MessageRoleVO {
  private constructor(private readonly value: MessageRole) {
    this.validate();
  }

  /**
   * Create a message role value object
   * @param role - The role to create a message role value object for
   * @returns The message role value object
   */
  static create(role: string): MessageRoleVO {
    const normalizedRole = role.toLowerCase() as MessageRole;
    return new MessageRoleVO(normalizedRole);
  }

  /**
   * Create a user message role value object
   * @returns The user message role value object
   */
  static user(): MessageRoleVO {
    return new MessageRoleVO(MessageRole.USER);
  }

  /**
   * Create a assistant message role value object
   * @returns The assistant message role value object
   */
  static assistant(): MessageRoleVO {
    return new MessageRoleVO(MessageRole.ASSISTANT);
  }

  /**
   * Create a system message role value object
   * @returns The system message role value object
   */
  static system(): MessageRoleVO {
    return new MessageRoleVO(MessageRole.SYSTEM);
  }

  /**
   * Get the value of the message role
   * @returns The value of the message role
   */
  getValue(): MessageRole {
    return this.value;
  }

  /**
   * Check if the message role is a user
   * @returns True if the message role is a user, false otherwise
   */
  isUser(): boolean {
    return this.value === MessageRole.USER;
  }

  /**
   * Check if the message role is a assistant
   * @returns True if the message role is a assistant, false otherwise
   */
  isAssistant(): boolean {
    return this.value === MessageRole.ASSISTANT;
  }

  /**
   * Check if the message role is a system
   * @returns True if the message role is a system, false otherwise
   */
  isSystem(): boolean {
    return this.value === MessageRole.SYSTEM;
  }

  /**
   * Check if the message role is equal to another message role
   * @param other - The other message role
   * @returns True if the message role is equal to another message role, false otherwise
   */
  equals(other: MessageRoleVO): boolean {
    return this.value === other.value;
  }

  /**
   * Convert the message role to a string
   * @returns The string representation of the message role
   */
  toString(): string {
    return this.value;
  }

  /**
   * Validate the message role
   */
  private validate(): void {
    if (!Object.values(MessageRole).includes(this.value)) {
      throw new Error(`Invalid message role: ${this.value}`);
    }
  }
}
