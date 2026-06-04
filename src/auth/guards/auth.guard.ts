import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { createHash } from 'crypto';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private authService: AuthService) {}

  private normalizeEmail(email?: string): string | undefined {
    return email?.trim().toLowerCase();
  }

  private getEmailDomain(email?: string): string {
    const normalizedEmail = this.normalizeEmail(email);
    if (!normalizedEmail) {
      return 'missing';
    }

    const atIndex = normalizedEmail.lastIndexOf('@');
    if (atIndex === -1 || atIndex === normalizedEmail.length - 1) {
      return 'invalid';
    }

    return normalizedEmail.slice(atIndex + 1);
  }

  private hashUserId(userId?: string): string {
    if (!userId) {
      return 'unknown';
    }

    return createHash('sha256').update(userId).digest('hex').slice(0, 12);
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      this.logger.warn('Failed auth: No token');
      throw new UnauthorizedException('No token provided');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      this.logger.warn('Failed auth: Invalid token format');
      throw new UnauthorizedException('Invalid token format');
    }

    const { data, error } = await this.authService.validateToken(token);

    if (error || !data?.user) {
      this.logger.warn('Failed auth: Invalid or expired token');
      throw new UnauthorizedException('Invalid or expired token');
    }

    const email = this.normalizeEmail(data.user.email);

    if (!email || !email.endsWith('@addu.edu.ph')) {
      this.logger.warn(
        `Failed auth: Invalid email domain | domain: ${this.getEmailDomain(data.user.email)} | user: ${this.hashUserId(data.user.id)}`,
      );
      throw new UnauthorizedException('Only ADDU email addresses allowed');
    }

    request.user = data.user;
    request.accessToken = token;

    return true;
  }
}
