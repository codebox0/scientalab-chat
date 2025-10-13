import { Module } from '@nestjs/common';
import { BIOMCP_PORT_TOKEN } from '../../application/constants/tokens';
import { BioMCPAdapter } from '../adapters/biomcp/biomcp.adapter';

@Module({
  providers: [
    {
      provide: BIOMCP_PORT_TOKEN,
      useClass: BioMCPAdapter,
    },
  ],
  exports: [BIOMCP_PORT_TOKEN],
})
export class BioMCPModule {}
