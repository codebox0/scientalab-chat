import { Injectable, Logger } from '@nestjs/common';
import puppeteer, { Browser } from 'puppeteer';
import {
  PDFExportPort,
  PDFExportRequest,
  PDFExportResult,
} from '../../../domain/ports/pdf-export.port';

/**
 * Puppeteer PDF adapter
 * @description This adapter implements PDF export using Puppeteer.
 */
@Injectable()
export class PuppeteerPDFAdapter implements PDFExportPort {
  private readonly logger = new Logger(PuppeteerPDFAdapter.name);
  private browser: Browser | null = null;

  constructor() {
    // Simple constructor - no external markdown dependencies
  }

  async exportConversationToPDF(
    request: PDFExportRequest,
  ): Promise<PDFExportResult> {
    this.logger.log(
      `📄 Génération PDF pour conversation: ${request.conversation.id.toString()}`,
    );

    try {
      // Initialize browser if not already done
      if (!this.browser) {
        try {
          this.browser = await puppeteer.launch({
            headless: true, // Mode headless standard (compatible avec tous les environnements)
            executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage', // Évite /dev/shm small en Docker
              '--disable-gpu', // Pas de GPU en container
              '--disable-web-security',
              '--disable-features=VizDisplayCompositor',
              '--single-process', // Évite les problèmes de processus multiples
              '--no-zygote', // Évite les problèmes de fork
            ],
          });
          this.logger.log('✅ Puppeteer browser lancé avec succès');
        } catch (browserError) {
          this.logger.error(
            '❌ Erreur lors du lancement du browser:',
            browserError,
          );
          // Fallback avec args minimaux
          this.browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
          });
          this.logger.log('✅ Puppeteer browser lancé en mode fallback');
        }
      }

      const page = await this.browser.newPage();

      // Generate HTML content
      const htmlContent = this.generateHTMLContent(request);

      // Set content and generate PDF
      await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

      const pdfBuffer = await page.pdf({
        format: request.format || 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm',
        },
      });

      await page.close();

      const filename = `conversation-${request.conversation.id.toString()}-${new Date().toISOString().split('T')[0]}.pdf`;

      this.logger.log(`✅ PDF généré: ${filename} (${pdfBuffer.length} bytes)`);

      return {
        buffer: Buffer.from(pdfBuffer),
        filename,
        size: pdfBuffer.length,
      };
    } catch (error) {
      this.logger.error(`❌ Erreur génération PDF:`, error);
      throw new Error(`Failed to generate PDF: ${error.message}`);
    }
  }

  private generateHTMLContent(request: PDFExportRequest): string {
    const { conversation, includeMetadata = false } = request;
    const messages = conversation.getLastMessages(1000); // Get all messages

    this.logger.log(`📊 Messages récupérés pour PDF: ${messages.length}`);
    if (messages.length > 0) {
      this.logger.log(
        `📝 Premier message: ${messages[0].content.substring(0, 50)}...`,
      );
    }

    const formatTimestamp = (timestamp: string) => {
      return new Date(timestamp).toLocaleString('fr-FR');
    };

    const formatMessageContent = (content: string) => {
      // Simple markdown to HTML conversion without external dependencies
      try {
        return content
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/\*(.*?)\*/g, '<em>$1</em>')
          .replace(/`(.*?)`/g, '<code>$1</code>')
          .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
          .replace(/\n/g, '<br>');
      } catch (error) {
        this.logger.warn(
          'Markdown parsing error, falling back to simple conversion:',
          error,
        );
        return content.replace(/\n/g, '<br>');
      }
    };

    const generateMetadataSection = () => {
      if (!includeMetadata) return '';

      const metadataMessages = messages.filter(
        (msg) =>
          msg.metadata &&
          ((msg.metadata.biomedicalData &&
            msg.metadata.biomedicalData.length > 0) ||
            (msg.metadata.sources && msg.metadata.sources.length > 0) ||
            msg.metadata.queryAnalysis),
      );

      if (metadataMessages.length === 0) return '';

      return `
        <div class="metadata-section">
          <h2>📊 Métadonnées BioMCP</h2>
          ${metadataMessages
            .map(
              (msg) => `
            <div class="metadata-item">
              <h3>Message du ${formatTimestamp(msg.timestamp.toString())}</h3>
              ${
                msg.metadata?.biomedicalData &&
                msg.metadata.biomedicalData.length > 0
                  ? `
                <p><strong>Données biomédicales:</strong> ${msg.metadata.biomedicalData.length} résultat(s)</p>
              `
                  : ''
              }
              ${
                msg.metadata?.sources && msg.metadata.sources.length > 0
                  ? `
                <p><strong>Sources:</strong> ${msg.metadata.sources.join(', ')}</p>
              `
                  : ''
              }
              ${
                msg.metadata?.confidence
                  ? `
                <p><strong>Confiance:</strong> ${Math.round(msg.metadata.confidence * 100)}%</p>
              `
                  : ''
              }
              ${
                msg.metadata?.queryAnalysis
                  ? `
                <p><strong>Type de requête:</strong> ${msg.metadata.queryAnalysis.type || 'Général'}</p>
              `
                  : ''
              }
            </div>
          `,
            )
            .join('')}
        </div>
      `;
    };

    return `
      <!DOCTYPE html>
      <html lang="fr">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Conversation - ${conversation.title}</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
          }
          .header {
            text-align: center;
            border-bottom: 2px solid #3B82F6;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .header h1 {
            color: #3B82F6;
            margin: 0;
            font-size: 24px;
          }
          .header .subtitle {
            color: #666;
            margin: 5px 0;
            font-size: 14px;
          }
          .message {
            margin-bottom: 20px;
            padding: 15px;
            border-radius: 8px;
            border-left: 4px solid #ddd;
          }
          .message.user {
            background-color: #f8f9fa;
            border-left-color: #3B82F6;
          }
          .message.assistant {
            background-color: #f0f8ff;
            border-left-color: #34D399;
          }
          .message-header {
            font-weight: bold;
            margin-bottom: 8px;
            font-size: 12px;
            color: #666;
          }
          .message-content {
            font-size: 14px;
          }
          .message-content code {
            background-color: #f1f1f1;
            padding: 2px 4px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
          }
          .message-content pre {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 16px;
            margin: 12px 0;
            overflow-x: auto;
            font-family: 'Courier New', monospace;
            font-size: 13px;
            line-height: 1.4;
          }
          .message-content pre code {
            background-color: transparent;
            padding: 0;
            border-radius: 0;
            font-size: inherit;
          }
          .message-content h1, .message-content h2, .message-content h3, 
          .message-content h4, .message-content h5, .message-content h6 {
            margin: 16px 0 8px 0;
            font-weight: 600;
            line-height: 1.3;
          }
          .message-content h1 { font-size: 20px; color: #3B82F6; }
          .message-content h2 { font-size: 18px; color: #3B82F6; }
          .message-content h3 { font-size: 16px; color: #34D399; }
          .message-content h4 { font-size: 14px; color: #34D399; }
          .message-content h5 { font-size: 13px; color: #666; }
          .message-content h6 { font-size: 12px; color: #666; }
          .message-content ul, .message-content ol {
            margin: 8px 0;
            padding-left: 24px;
          }
          .message-content li {
            margin: 4px 0;
          }
          .message-content blockquote {
            border-left: 4px solid #3B82F6;
            margin: 12px 0;
            padding: 8px 16px;
            background-color: #f8f9fa;
            font-style: italic;
            color: #555;
          }
          .message-content table {
            border-collapse: collapse;
            width: 100%;
            margin: 12px 0;
            font-size: 13px;
          }
          .message-content th, .message-content td {
            border: 1px solid #ddd;
            padding: 8px 12px;
            text-align: left;
          }
          .message-content th {
            background-color: #f8f9fa;
            font-weight: 600;
            color: #3B82F6;
          }
          .message-content a {
            color: #3B82F6;
            text-decoration: none;
          }
          .message-content a:hover {
            text-decoration: underline;
          }
          .message-content strong {
            font-weight: 600;
            color: #333;
          }
          .message-content em {
            font-style: italic;
            color: #555;
          }
          /* Highlight.js styles for code syntax highlighting */
          .hljs {
            background: #f8f9fa !important;
            color: #333 !important;
          }
          .hljs-comment, .hljs-quote { color: #6a737d; font-style: italic; }
          .hljs-keyword, .hljs-selector-tag, .hljs-type { color: #d73a49; }
          .hljs-string, .hljs-doctag { color: #032f62; }
          .hljs-title, .hljs-section, .hljs-attribute { color: #6f42c1; }
          .hljs-literal, .hljs-number { color: #005cc5; }
          .hljs-name, .hljs-tag { color: #22863a; }
          .hljs-meta { color: #6f42c1; }
          .hljs-built_in, .hljs-class .hljs-title { color: #6f42c1; }
          .hljs-params { color: #24292e; }
          .hljs-variable { color: #e36209; }
          .hljs-regexp { color: #032f62; }
          .hljs-symbol { color: #005cc5; }
          .hljs-bullet { color: #735c0f; }
          .hljs-link { color: #032f62; text-decoration: underline; }
          .hljs-emphasis { font-style: italic; }
          .hljs-strong { font-weight: bold; }
          .metadata-section {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
          }
          .metadata-section h2 {
            color: #34D399;
            font-size: 18px;
            margin-bottom: 20px;
          }
          .metadata-item {
            background-color: #f8f9fa;
            padding: 15px;
            margin-bottom: 15px;
            border-radius: 5px;
            border-left: 3px solid #34D399;
          }
          .metadata-item h3 {
            margin: 0 0 10px 0;
            font-size: 14px;
            color: #333;
          }
          .metadata-item p {
            margin: 5px 0;
            font-size: 12px;
            color: #666;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Scienta Lab Assistant</h1>
          <div class="subtitle">${conversation.title}</div>
          <div class="subtitle">Utilisateur: ${conversation.userId}</div>
          <div class="subtitle">Exporté le: ${new Date().toLocaleString('fr-FR')}</div>
        </div>

        <div class="messages">
          ${messages
            .map(
              (message) => `
            <div class="message ${message.role.toString() === 'user' ? 'user' : 'assistant'}">
              <div class="message-header">
                ${message.role.toString() === 'user' ? '👤 Utilisateur' : '🤖 Assistant'} - ${formatTimestamp(message.timestamp.toString())}
              </div>
              <div class="message-content">
                ${formatMessageContent(message.content)}
              </div>
            </div>
          `,
            )
            .join('')}
        </div>

        ${generateMetadataSection()}

        <div class="footer">
          <p>Généré par Scienta Lab Assistant</p>
          <p>${messages.length} message(s) • ${conversation.createdAt} - ${conversation.updatedAt}</p>
        </div>
      </body>
      </html>
    `;
  }

  async onModuleDestroy() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
    }
  }
}
