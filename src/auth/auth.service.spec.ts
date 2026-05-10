import { Test, TestingModule } from '@nestjs/testing';
import { SupabaseService } from '../supabase';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  const getUser = jest.fn();
  const supabaseService = {
    getClient: jest.fn(() => ({
      auth: {
        getUser,
      },
    })),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: SupabaseService,
          useValue: supabaseService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateToken', () => {
    it('should return the Supabase user when the token is valid', async () => {
      const user = {
        id: 'user-1',
        email: 'user@example.com',
      };
      getUser.mockResolvedValue({
        data: { user },
        error: null,
      });

      await expect(service.validateToken('valid-token')).resolves.toEqual(user);
      expect(supabaseService.getClient).toHaveBeenCalledTimes(1);
      expect(getUser).toHaveBeenCalledWith('valid-token');
    });

    it('should return null when Supabase returns an error', async () => {
      getUser.mockResolvedValue({
        data: { user: null },
        error: new Error('invalid token'),
      });

      await expect(service.validateToken('bad-token')).resolves.toBeNull();
      expect(getUser).toHaveBeenCalledWith('bad-token');
    });

    it('should return null when Supabase returns no user', async () => {
      getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(service.validateToken('unknown-token')).resolves.toBeNull();
      expect(getUser).toHaveBeenCalledWith('unknown-token');
    });
  });
});
