import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { User } from '@supabase/supabase-js';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../auth.service';

describe('AuthGuard', () => {
  const validateToken = jest.fn<Promise<User | null>, [string]>();
  const authService = {
    validateToken,
  } as unknown as AuthService;

  const createContext = (authorization?: string): ExecutionContext => {
    const request: {
      headers: Record<string, string>;
      user?: any;
      ip: string;
    } = {
      headers: authorization ? { authorization } : {},
      user: undefined,
      ip: '127.0.0.1',
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  let guard: AuthGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new AuthGuard(authService);
  });

  it('should allow requests with a valid bearer token', async () => {
    const user = {
      id: 'user-1',
      email: 'user@addu.edu.ph',
    };

    validateToken.mockResolvedValue(user as User);

    const context = createContext('Bearer valid-token');
    const request = context.switchToHttp().getRequest();

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(validateToken).toHaveBeenCalledWith('valid-token');
    expect(request.user).toEqual(user);
  });

  it('should reject requests without an authorization header', async () => {
    await expect(guard.canActivate(createContext())).rejects.toThrow(
      new UnauthorizedException('No token provided'),
    );

    expect(validateToken).not.toHaveBeenCalled();
  });

  it('should reject requests with an invalid authorization format', async () => {
    await expect(
      guard.canActivate(createContext('Basic token')),
    ).rejects.toThrow(new UnauthorizedException('Invalid token format'));

    expect(validateToken).not.toHaveBeenCalled();
  });

  it('should reject requests when the auth service returns no user', async () => {
    validateToken.mockResolvedValue(null);

    await expect(
      guard.canActivate(createContext('Bearer unknown-token')),
    ).rejects.toThrow(new UnauthorizedException('Invalid or expired token'));
  });
});
