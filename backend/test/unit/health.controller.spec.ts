import { Test, TestingModule } from '@nestjs/testing';
import { HealthController } from '../../src/health/health.controller';

describe('HealthController', () => {
  let healthController: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
    }).compile();

    healthController = module.get<HealthController>(HealthController);
  });

  describe('check()', () => {
    it('should return health status ok with valid structure', () => {
      const response = healthController.check();

      expect(response).toBeDefined();
      expect(response.status).toBe('ok');
      expect(response.service).toBe('smartstock-backend');
      expect(response.version).toBe('0.1.0');
      expect(typeof response.timestamp).toBe('string');
      expect(typeof response.uptime).toBe('number');
      expect(response.uptime).toBeGreaterThanOrEqual(0);
    });
  });
});
