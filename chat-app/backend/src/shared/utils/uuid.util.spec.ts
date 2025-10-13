import { generateUUID } from './uuid.util';

describe('UUID Utility', () => {
  describe('generateUUID', () => {
    it('should generate a valid UUID v4', () => {
      const uuid = generateUUID();

      // UUID v4 format: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

      expect(uuid).toMatch(uuidRegex);
      expect(uuid).toHaveLength(36); // Standard UUID length
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUUID();
      const uuid2 = generateUUID();

      expect(uuid1).not.toBe(uuid2);
    });

    it('should generate multiple unique UUIDs', () => {
      const uuids = Array.from({ length: 100 }, () => generateUUID());
      const uniqueUuids = new Set(uuids);

      expect(uniqueUuids.size).toBe(100);
    });

    it('should generate UUIDs with correct version (4)', () => {
      const uuid = generateUUID();
      const versionChar = uuid.charAt(14);

      expect(versionChar).toBe('4');
    });

    it('should generate UUIDs with correct variant', () => {
      const uuid = generateUUID();
      const variantChar = uuid.charAt(19);

      // Variant should be 8, 9, a, or b
      expect(['8', '9', 'a', 'b']).toContain(variantChar.toLowerCase());
    });
  });
});
