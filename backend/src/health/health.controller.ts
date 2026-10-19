import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Health')
@Controller()
export class HealthController {
  private readonly startTime = Date.now();

  @Get(['health', 'api/health'])
  @ApiOperation({ summary: 'System health check and uptime probe' })
  @ApiResponse({
    status: 200,
    description: 'Service is healthy and accepting requests',
    schema: {
      example: {
        status: 'ok',
        service: 'smartstock-backend',
        version: '0.1.0',
        timestamp: '2026-10-19T10:15:00.000Z',
        uptime: 42.5,
      },
    },
  })
  check() {
    return {
      status: 'ok',
      service: 'smartstock-backend',
      version: '0.1.0',
      timestamp: new Date().toISOString(),
      uptime: Math.round((Date.now() - this.startTime) / 1000),
    };
  }
}
