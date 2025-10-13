import { Inject, Injectable } from '@nestjs/common';
import { QueryEntity, QueryType } from '../../../domain/entities';
import type { BioMCPPort } from '../../../domain/ports';
import { BIOMCP_PORT_TOKEN } from '../../constants/tokens';

/**
 * Fetch papers command
 * @description This interface is used to represent the command for fetching papers.
 */
export interface FetchPapersCommand {
  readonly query: string;
  readonly domain: string;
  readonly pageSize?: number;
}

/**
 * Fetch papers use case
 * @description This class is used to fetch papers.
 */
@Injectable()
export class FetchPapersUseCase {
  constructor(
    @Inject(BIOMCP_PORT_TOKEN)
    private readonly biomcpPort: BioMCPPort,
  ) {}

  /**
   * Execute
   * @description This method is used to execute the fetch papers use case.
   */
  async execute(command: FetchPapersCommand): Promise<any[]> {
    const query = QueryEntity.create(
      command.query,
      QueryType.LITERATURE_SEARCH,
      {
        query: command.query,
        domain: command.domain,
        page_size: command.pageSize || 10,
        genes: [],
        diseases: [],
        variants: [],
        keywords: [command.query],
      },
    );

    return await this.biomcpPort.searchLiterature(query);
  }
}
