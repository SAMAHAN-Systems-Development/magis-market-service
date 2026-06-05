import {
  createParamDecorator,
  ExecutionContext,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

type AuthenticatedRequest = {
  user?: Record<string, unknown>;
  accessToken?: string;
};

export const CurrentUser = createParamDecorator(
  (data: string | undefined, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.user) {
      throw new UnauthorizedException('Authenticated user not found');
    }

    if (!data) {
      return request.user;
    }

    const value = request.user[data];
    if (value === undefined || value === null) {
      throw new InternalServerErrorException(
        `Authenticated user is missing "${data}"`,
      );
    }

    return value;
  },
);

export const CurrentAccessToken = createParamDecorator(
  (_data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();

    if (!request.accessToken) {
      throw new UnauthorizedException('Access token not found');
    }

    return request.accessToken;
  },
);
