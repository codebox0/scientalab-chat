/**
 * Query text value object
 * @description This class is used to represent a query text.
 */
export class QueryTextVO {
  private constructor(private readonly value: string) {
    this.validate();
  }

  /**
   * Create a query text value object
   * @param text - The text to create a query text value object for
   * @returns The query text value object
   */
  static create(text: string): QueryTextVO {
    return new QueryTextVO(text.trim());
  }

  /**
   * Get the value of the query text
   * @returns The value of the query text
   */
  getValue(): string {
    return this.value;
  }

  /**
   * Check if the query text is empty
   * @returns True if the query text is empty, false otherwise
   */
  isEmpty(): boolean {
    return this.value.length === 0;
  }

  /**
   * Get the length of the query text
   * @returns The length of the query text
   */
  length(): number {
    return this.value.length;
  }

  /**
   * Check if the query text contains a keyword
   * @param keyword - The keyword to check for
   * @returns True if the query text contains a keyword, false otherwise
   */
  contains(keyword: string): boolean {
    return this.value.toLowerCase().includes(keyword.toLowerCase());
  }

  /**
   * Convert the query text to lowercase
   * @returns The query text in lowercase
   */
  toLowerCase(): string {
    return this.value.toLowerCase();
  }

  /**
   * Extract keywords from the query text
   * @returns The keywords extracted from the query text
   */
  extractKeywords(): string[] {
    // Extract biomedical keywords using regex patterns
    const patterns = {
      genes: /\b[A-Z]{2,}[A-Z0-9]*\b/g,
      variants: /\brs\d+\b/g,
      diseases:
        /\b(cancer|diabetes|melanoma|ibd|crohn|colitis|arthritis|alzheimer|parkinson)\b/g,
      drugs: /\b(adalimumab|pembrolizumab|infliximab|methotrexate|aspirin)\b/g,
    };

    const keywords: string[] = [];

    Object.values(patterns).forEach((pattern) => {
      const matches = this.value.match(pattern);
      if (matches) {
        keywords.push(...matches);
      }
    });

    return [...new Set(keywords)]; // Remove duplicates
  }

  /**
   * Detect the query type
   * @returns The query type
   */
  detectQueryType(): 'literature' | 'trial' | 'variant' | 'drug' | 'general' {
    this.toLowerCase();

    if (
      this.contains('paper') ||
      this.contains('article') ||
      this.contains('study') ||
      this.contains('literature')
    ) {
      return 'literature';
    }

    if (
      this.contains('trial') ||
      this.contains('clinical') ||
      this.contains('phase') ||
      this.contains('nct')
    ) {
      return 'trial';
    }

    if (
      this.contains('variant') ||
      this.contains('rs') ||
      this.contains('mutation') ||
      this.contains('gene')
    ) {
      return 'variant';
    }

    if (
      this.contains('drug') ||
      this.contains('medication') ||
      this.contains('therapeutic')
    ) {
      return 'drug';
    }

    return 'general';
  }

  /**
   * Check if the query text is equal to another query text
   * @param other - The other query text
   * @returns True if the query text is equal to another query text, false otherwise
   */
  equals(other: QueryTextVO): boolean {
    return this.value === other.value;
  }

  /**
   * Convert the query text to a string
   * @returns The string representation of the query text
   */
  toString(): string {
    return this.value;
  }

  /**
   * Validate the query text
   */
  private validate(): void {
    if (this.value.length === 0) {
      throw new Error('Query text cannot be empty');
    }

    if (this.value.length > 1000) {
      throw new Error('Query text is too long (max 1000 characters)');
    }
  }
}
