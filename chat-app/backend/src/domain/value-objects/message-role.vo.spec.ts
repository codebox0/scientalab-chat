import { MessageRoleVO } from './message-role.vo';

describe('MessageRoleVO', () => {
  describe('create', () => {
    it('should create user role', () => {
      const role = MessageRoleVO.create('user');

      expect(role).toBeInstanceOf(MessageRoleVO);
      expect(role.toString()).toBe('user');
    });

    it('should create assistant role', () => {
      const role = MessageRoleVO.create('assistant');

      expect(role).toBeInstanceOf(MessageRoleVO);
      expect(role.toString()).toBe('assistant');
    });

    it('should create system role', () => {
      const role = MessageRoleVO.create('system');

      expect(role).toBeInstanceOf(MessageRoleVO);
      expect(role.toString()).toBe('system');
    });

    it('should throw error for invalid role', () => {
      expect(() => MessageRoleVO.create('invalid')).toThrow(
        'Invalid message role',
      );
    });
  });

  describe('isUser', () => {
    it('should return true for user role', () => {
      const role = MessageRoleVO.create('user');
      expect(role.isUser()).toBe(true);
    });

    it('should return false for non-user roles', () => {
      const assistantRole = MessageRoleVO.create('assistant');
      const systemRole = MessageRoleVO.create('system');

      expect(assistantRole.isUser()).toBe(false);
      expect(systemRole.isUser()).toBe(false);
    });
  });

  describe('isAssistant', () => {
    it('should return true for assistant role', () => {
      const role = MessageRoleVO.create('assistant');
      expect(role.isAssistant()).toBe(true);
    });

    it('should return false for non-assistant roles', () => {
      const userRole = MessageRoleVO.create('user');
      const systemRole = MessageRoleVO.create('system');

      expect(userRole.isAssistant()).toBe(false);
      expect(systemRole.isAssistant()).toBe(false);
    });
  });

  describe('isSystem', () => {
    it('should return true for system role', () => {
      const role = MessageRoleVO.create('system');
      expect(role.isSystem()).toBe(true);
    });

    it('should return false for non-system roles', () => {
      const userRole = MessageRoleVO.create('user');
      const assistantRole = MessageRoleVO.create('assistant');

      expect(userRole.isSystem()).toBe(false);
      expect(assistantRole.isSystem()).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const userRole = MessageRoleVO.create('user');
      const assistantRole = MessageRoleVO.create('assistant');
      const systemRole = MessageRoleVO.create('system');

      expect(userRole.toString()).toBe('user');
      expect(assistantRole.toString()).toBe('assistant');
      expect(systemRole.toString()).toBe('system');
    });
  });
});
