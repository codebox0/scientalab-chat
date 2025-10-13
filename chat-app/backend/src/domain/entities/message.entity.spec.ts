import { MessageRoleVO } from '../value-objects/message-role.vo';
import { SessionIdVO } from '../value-objects/session-id.vo';
import { MessageEntity } from './message.entity';

describe('MessageEntity', () => {
  const mockSessionId = SessionIdVO.create();
  const mockUserRole = MessageRoleVO.create('user');
  const mockAssistantRole = MessageRoleVO.create('assistant');

  describe('create', () => {
    it('should create a message with all properties', () => {
      const content = 'Hello, world!';
      const message = MessageEntity.create(
        content,
        mockUserRole,
        mockSessionId,
      );

      expect(message).toBeInstanceOf(MessageEntity);
      expect(message.content).toBe(content);
      expect(message.role).toBe(mockUserRole);
      expect(message.sessionId).toBe(mockSessionId);
      expect(message.timestamp).toBeInstanceOf(Date);
      expect(message.id).toBeDefined();
    });

    it('should create a message with metadata', () => {
      const content = 'Test message';
      const metadata = {
        biomedicalData: [{ title: 'Test Paper' }],
        sources: ['PubMed'],
        confidence: 0.95,
      };

      const message = MessageEntity.create(
        content,
        mockAssistantRole,
        mockSessionId,
        metadata,
      );

      expect(message.metadata).toEqual(metadata);
    });
  });

  describe('fromPrimitives', () => {
    it('should create message from primitive data', () => {
      const primitiveData = {
        id: 'msg-123',
        content: 'Hello from primitives',
        role: 'user',
        timestamp: new Date(),
        sessionId: mockSessionId.getValue(),
        metadata: {
          biomedicalData: [],
          sources: [],
          confidence: 0.8,
        },
      };

      const message = MessageEntity.fromPrimitives(primitiveData);

      expect(message.id).toBe(primitiveData.id);
      expect(message.content).toBe(primitiveData.content);
      expect(message.role.toString()).toBe(primitiveData.role);
      expect(message.timestamp).toBe(primitiveData.timestamp);
      expect(message.sessionId.getValue()).toBe(primitiveData.sessionId);
      expect(message.metadata).toEqual(primitiveData.metadata);
    });
  });

  describe('role checks', () => {
    it('should identify user messages', () => {
      const message = MessageEntity.create(
        'Hello',
        mockUserRole,
        mockSessionId,
      );
      expect(message.isUserMessage()).toBe(true);
      expect(message.isAssistantMessage()).toBe(false);
      expect(message.isSystemMessage()).toBe(false);
    });

    it('should identify assistant messages', () => {
      const message = MessageEntity.create(
        'Response',
        mockAssistantRole,
        mockSessionId,
      );
      expect(message.isUserMessage()).toBe(false);
      expect(message.isAssistantMessage()).toBe(true);
      expect(message.isSystemMessage()).toBe(false);
    });
  });

  describe('biomedical data', () => {
    it('should detect biomedical data', () => {
      const metadata = {
        biomedicalData: [{ title: 'Cancer Research' }],
        sources: ['PubMed'],
        confidence: 0.9,
      };

      const message = MessageEntity.create(
        'Test',
        mockAssistantRole,
        mockSessionId,
        metadata,
      );
      expect(message.hasBiomedicalData()).toBe(true);
    });

    it('should return false when no biomedical data', () => {
      const message = MessageEntity.create('Test', mockUserRole, mockSessionId);
      expect(message.hasBiomedicalData()).toBe(false);
    });

    it('should return false when empty biomedical data', () => {
      const metadata = {
        biomedicalData: [],
        sources: [],
        confidence: 0.5,
      };

      const message = MessageEntity.create(
        'Test',
        mockAssistantRole,
        mockSessionId,
        metadata,
      );
      expect(message.hasBiomedicalData()).toBe(false);
    });
  });

  describe('confidence', () => {
    it('should return confidence from metadata', () => {
      const metadata = {
        biomedicalData: [],
        sources: [],
        confidence: 0.85,
      };

      const message = MessageEntity.create(
        'Test',
        mockAssistantRole,
        mockSessionId,
        metadata,
      );
      expect(message.getConfidence()).toBe(0.85);
    });

    it('should return 0 when no confidence', () => {
      const message = MessageEntity.create('Test', mockUserRole, mockSessionId);
      expect(message.getConfidence()).toBe(0);
    });
  });

  describe('toPrimitives', () => {
    it('should convert to primitive data', () => {
      const metadata = {
        biomedicalData: [{ title: 'Test' }],
        sources: ['PubMed'],
        confidence: 0.9,
      };

      const message = MessageEntity.create(
        'Test message',
        mockAssistantRole,
        mockSessionId,
        metadata,
      );
      const primitives = message.toPrimitives();

      expect(primitives).toEqual({
        id: message.id,
        content: 'Test message',
        role: 'assistant',
        timestamp: message.timestamp,
        sessionId: mockSessionId.getValue(),
        metadata,
      });
    });
  });

  describe('validation', () => {
    it('should throw error for empty content', () => {
      expect(() => {
        MessageEntity.create('', mockUserRole, mockSessionId);
      }).toThrow('Message content cannot be empty');
    });

    it('should throw error for content too long', () => {
      const longContent = 'a'.repeat(10001);
      expect(() => {
        MessageEntity.create(longContent, mockUserRole, mockSessionId);
      }).toThrow('Message content is too long (max 10000 characters)');
    });
  });
});
