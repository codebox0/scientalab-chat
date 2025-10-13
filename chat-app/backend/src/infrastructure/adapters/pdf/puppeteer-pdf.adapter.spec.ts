import { Test, TestingModule } from '@nestjs/testing';
import { PuppeteerPDFAdapter } from './puppeteer-pdf.adapter';

// Mock puppeteer
jest.mock('puppeteer', () => ({
  launch: jest.fn().mockResolvedValue({
    newPage: jest.fn().mockResolvedValue({
      setContent: jest.fn().mockResolvedValue(undefined),
      pdf: jest.fn().mockResolvedValue(Buffer.from('mock-pdf-content')),
      close: jest.fn().mockResolvedValue(undefined),
    }),
    close: jest.fn().mockResolvedValue(undefined),
  }),
}));

describe('PuppeteerPDFAdapter', () => {
  let adapter: PuppeteerPDFAdapter;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PuppeteerPDFAdapter],
    }).compile();

    adapter = module.get<PuppeteerPDFAdapter>(PuppeteerPDFAdapter);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('exportConversationToPDF', () => {
    it('should be defined', () => {
      expect(adapter).toBeDefined();
    });

    it('should have exportConversationToPDF method', () => {
      expect(typeof adapter.exportConversationToPDF).toBe('function');
    });
  });
});
