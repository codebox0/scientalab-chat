import { SessionIdVO } from './session-id.vo';

describe('SessionIdVO', () => {
  describe('create', () => {
    it('should create a valid session ID', () => {
      const sessionId = SessionIdVO.create();

      expect(sessionId).toBeInstanceOf(SessionIdVO);
      expect(sessionId.getValue()).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      );
    });

    it('should create unique session IDs', () => {
      const sessionId1 = SessionIdVO.create();
      const sessionId2 = SessionIdVO.create();

      expect(sessionId1.getValue()).not.toBe(sessionId2.getValue());
    });
  });

  describe('fromString', () => {
    it('should create session ID from valid string', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const sessionId = SessionIdVO.fromString(validUuid);

      expect(sessionId.getValue()).toBe(validUuid);
    });

    it('should throw error for invalid UUID format', () => {
      const invalidUuid = 'invalid-uuid';

      expect(() => SessionIdVO.fromString(invalidUuid)).toThrow(
        'Invalid session ID format',
      );
    });

    it('should throw error for empty string', () => {
      expect(() => SessionIdVO.fromString('')).toThrow(
        'Session ID cannot be empty',
      );
    });
  });

  describe('getValue', () => {
    it('should return the session ID value', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const sessionId = SessionIdVO.fromString(validUuid);

      expect(sessionId.getValue()).toBe(validUuid);
    });
  });

  describe('equals', () => {
    it('should return true for equal session IDs', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const sessionId1 = SessionIdVO.fromString(validUuid);
      const sessionId2 = SessionIdVO.fromString(validUuid);

      expect(sessionId1.equals(sessionId2)).toBe(true);
    });

    it('should return false for different session IDs', () => {
      const sessionId1 = SessionIdVO.create();
      const sessionId2 = SessionIdVO.create();

      expect(sessionId1.equals(sessionId2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return string representation', () => {
      const validUuid = '123e4567-e89b-12d3-a456-426614174000';
      const sessionId = SessionIdVO.fromString(validUuid);

      expect(sessionId.toString()).toBe(validUuid);
    });
  });
});
