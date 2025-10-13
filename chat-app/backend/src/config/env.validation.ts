import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

/**
 * Environment variables
 * @description This class is used to validate the environment variables.
 */
export class EnvironmentVariables {
  @IsNotEmpty()
  @IsString()
  OPENAI_API_KEY: string;

  @IsNotEmpty()
  @IsString()
  BIOMCP_URL: string;

  @IsOptional()
  @IsString()
  BIO_MCP_SSE_PATH?: string;

  @IsOptional()
  @IsNumber()
  PORT?: number;

  @IsOptional()
  @IsString()
  HOST?: string;

  @IsOptional()
  @IsString()
  NODE_ENV?: string;

  @IsOptional()
  @IsString()
  CORS_ORIGIN?: string;

  @IsOptional()
  @IsString()
  @IsIn(['error', 'warn', 'info', 'debug'])
  LOG_LEVEL?: string;
}
