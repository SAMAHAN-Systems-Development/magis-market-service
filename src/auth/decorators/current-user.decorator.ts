import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: string, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    if (!data) {
      throw new Error('No ID provided to CurrentUser decorator');
    }

    return request.user.id;
  },
);
