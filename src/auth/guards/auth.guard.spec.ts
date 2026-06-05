import { ExecutionContext, Logger, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from './auth.guard';
import { AuthService } from '../auth.service';

describe('AuthGuard', () => {
  const validateToken = jest.fn();
  const authService = {
    validateToken,
  } as unknown as AuthService;

  const createContext = (authorization?: string): ExecutionContext => {
    const request: {
      headers: Record<string, string>;
      user?: any;
      accessToken?: string;
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
  let warnSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    warnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation();
    guard = new AuthGuard(authService);
  });

  afterEach(() => {
    warnSpy.mockRestore();
  });

  it('should allow requests with a valid bearer token', async () => {
    const user = {
      id: 'user-1',
      email: 'user@addu.edu.ph',
    };

    validateToken.mockResolvedValue({
      data: { user },
      error: null,
    });

    const context = createContext('Bearer valid-token');
    const request = context.switchToHttp().getRequest();

    await expect(guard.canActivate(context)).resolves.toBe(true);

    expect(validateToken).toHaveBeenCalledWith('valid-token');
    expect(request.user).toEqual(user);
    expect(request.accessToken).toBe('valid-token');
  });

  it('should allow ADDU emails with uppercase letters or surrounding spaces', async () => {
    const user = {
      id: 'user-1',
      email: ' User@ADDU.EDU.PH ',
    };

    validateToken.mockResolvedValue({
      data: { user },
      error: null,
    });

    await expect(
      guard.canActivate(createContext('Bearer mixed-case-token')),
    ).resolves.toBe(true);
  });

  it('should reject non-ADDU domains without logging raw PII', async () => {
    const user = {
      id: 'user-2',
      email: 'person@gmail.com',
    };

    validateToken.mockResolvedValue({
      data: { user },
      error: null,
    });

    await expect(
      guard.canActivate(createContext('Bearer non-addu-token')),
    ).rejects.toThrow(
      new UnauthorizedException('Only ADDU email addresses allowed'),
    );

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('domain: gmail.com'),
    );

    const loggedMessage = warnSpy.mock.calls.flat().join(' ');
    expect(loggedMessage).not.toContain('person@gmail.com');
    expect(loggedMessage).not.toContain('user-2');
    expect(loggedMessage).not.toContain('127.0.0.1');
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
    validateToken.mockResolvedValue({
      data: { user: null },
      error: null,
    });

    await expect(
      guard.canActivate(createContext('Bearer unknown-token')),
    ).rejects.toThrow(new UnauthorizedException('Invalid or expired token'));
  });
});
