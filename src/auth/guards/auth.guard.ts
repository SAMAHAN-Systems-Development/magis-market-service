import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];

    if (!authHeader) {
      this.logger.warn(`Failed auth: No token | IP: ${request.ip}`);
      throw new UnauthorizedException('No token provided');
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      this.logger.warn(`Failed auth: Invalid token format | IP: ${request.ip}`);
      throw new UnauthorizedException('Invalid token format');
    }

    const { data, error } = await this.authService.validateToken(token);

    if (error || !data?.user) {
      this.logger.warn(
        `Failed auth: Invalid or expired token | IP: ${request.ip}`,
      );
      throw new UnauthorizedException('Invalid or expired token');
    }

    const email = data.user.email;

    if (!email || !email.endsWith('@addu.edu.ph')) {
      this.logger.warn(
        `Failed auth: Invalid domain ${email} | IP: ${request.ip}`,
      );
      throw new UnauthorizedException('Only ADDU email addresses allowed');
    }

    request.user = data.user;

    return true;
  }
}
