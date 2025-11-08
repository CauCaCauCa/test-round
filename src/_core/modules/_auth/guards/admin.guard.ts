import {
    Injectable,
    CanActivate,
    ExecutionContext,
    Inject,
  } from '@nestjs/common';
  import { JWTGuard } from './jwt.guard';
  import { JwtService } from '@nestjs/jwt';
import { AuthService } from '../auth.service';
import { GqlExecutionContext } from '@nestjs/graphql';
  
  @Injectable()
  export class AdminGuard extends JWTGuard implements CanActivate {
    constructor(
      protected readonly jwtService: JwtService,
      @Inject('AUTH_SERVICE_TIENNT') protected authService: AuthService,
    ) {
      super(jwtService, authService);
    }
    async canActivate(context: ExecutionContext): Promise<boolean> {
      if (!super.canActivate(context)) {
        return false;
      }
      try {
        const request = context.switchToHttp().getRequest() || GqlExecutionContext.create(context).getContext().req;
        const user = request?.headers?.user as any;
        if (user && user.role === 'admin' ) {
          return true;
        } else return false;
      } catch (error) {
        return false;
      }
    }
  }
  