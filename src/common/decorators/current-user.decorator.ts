import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (
    data: keyof { userId: string; isModerator: boolean } | undefined,
    ctx: ExecutionContext,
  ) => {
    const request = ctx.switchToHttp().getRequest();
    const user = {
      userId: request.headers['x-user-id'],
      isModerator: request.headers['x-is-moderator'] === 'true',
    };

    return data ? user[data] : user;
  },
);
