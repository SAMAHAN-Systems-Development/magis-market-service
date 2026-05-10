import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../auth.service';

describe('AuthGuard', () => {
  const authService = {
    validateToken: jest.fn(),
  } as unknown as jest.Mocked<AuthService>;

  const reflector = {} as Reflector;

  const createContext = (authorization?: string): ExecutionContext => {
    const request = {
      headers: authorization ? { authorization } : {},
      user: undefined,
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

  it('should allow requests with a valid bearer token and ADDU email', async () => {
    const user = {
      id: 'user-1',
      email: 'user@addu.edu.ph',
    };

    authService.validateToken.mockResolvedValue({
      data: { user },
      error: null,
    } as any);

    const context = createContext('Bearer valid-token');
    const request = context.switchToHttp().getRequest();

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(authService.validateToken).toHaveBeenCalledWith('valid-token');
    expect(request.user).toEqual(user);
  });

  it('should reject requests without an authorization header', async () => {
    await expect(guard.canActivate(createContext())).rejects.toThrow(
      new UnauthorizedException('No token provided'),
    );

    expect(authService.validateToken).not.toHaveBeenCalled();
  });

  it('should reject requests with an invalid authorization format', async () => {
    await expect(
      guard.canActivate(createContext('Basic token')),
    ).rejects.toThrow(new UnauthorizedException('Invalid token format'));

    expect(authService.validateToken).not.toHaveBeenCalled();
  });

  it('should reject requests when Supabase returns no user', async () => {
    authService.validateToken.mockResolvedValue({
      data: { user: null },
      error: null,
    } as any);

    await expect(
      guard.canActivate(createContext('Bearer unknown-token')),
    ).rejects.toThrow(new UnauthorizedException('Invalid or expired token'));
  });

  it('should reject requests when Supabase returns an error', async () => {
    authService.validateToken.mockResolvedValue({
      data: { user: null },
      error: new Error('Invalid token'),
    } as any);

    await expect(
      guard.canActivate(createContext('Bearer bad-token')),
    ).rejects.toThrow(new UnauthorizedException('Invalid or expired token'));
  });

  it('should reject users without ADDU email', async () => {
    const user = {
      id: 'user-2',
      email: 'user@gmail.com',
    };

    authService.validateToken.mockResolvedValue({
      data: { user },
      error: null,
    } as any);

    await expect(
      guard.canActivate(createContext('Bearer valid-token')),
    ).rejects.toThrow(
      new UnauthorizedException('Only ADDU email addresses allowed'),
    );
  });
});