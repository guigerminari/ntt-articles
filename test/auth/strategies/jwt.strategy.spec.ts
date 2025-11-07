import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from '../../../src/auth/strategies/jwt.strategy';
import { ConfigService } from '@nestjs/config';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let configService: ConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test-secret'),
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    configService = module.get<ConfigService>(ConfigService);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user object from JWT payload', async () => {
      const payload = {
        sub: '1',
        email: 'test@example.com',
        permission: 'Admin',
      };

      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: '1',
        email: 'test@example.com',
        permission: 'Admin',
      });
    });

    it('should map sub to id correctly', async () => {
      const payload = {
        sub: 'user-123',
        email: 'user@example.com',
        permission: 'Editor',
      };

      const result = await strategy.validate(payload);

      expect(result.id).toBe('user-123');
    });

    it('should preserve permission information', async () => {
      const payload = {
        sub: '1',
        email: 'reader@example.com',
        permission: 'Reader',
      };

      const result = await strategy.validate(payload);

      expect(result.permission).toBe('Reader');
    });
  });
});
