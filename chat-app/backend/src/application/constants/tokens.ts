// Tokens for dependency injection
export const CHAT_SERVICE_TOKEN = Symbol('ChatService');
export const LLM_PROVIDER_TOKEN = Symbol('LLMProvider');
export const BIOMEDICAL_DATA_PROVIDER_TOKEN = Symbol('BiomedicalDataProvider');
export const CHAT_REPOSITORY_TOKEN = Symbol('ChatRepository');

// New hexagonal architecture tokens
export const LLM_PORT_TOKEN = Symbol('LLMPort');
export const BIOMCP_PORT_TOKEN = Symbol('BioMCPPort');
export const CHAT_REPOSITORY_PORT_TOKEN = Symbol('ChatRepositoryPort');
export const BIOMEDICAL_ANALYZER_SERVICE_TOKEN = Symbol(
  'BiomedicalAnalyzerService',
);
export const PDF_EXPORT_PORT_TOKEN = Symbol('PDFExportPort');
