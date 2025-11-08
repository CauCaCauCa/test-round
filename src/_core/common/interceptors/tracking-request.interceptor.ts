import {
    CallHandler,
    ExecutionContext,
    Injectable,
    Logger,
    NestInterceptor,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class TrackingRequestInterceptor implements NestInterceptor {

    private readonly logger = new Logger(TrackingRequestInterceptor.name);

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        if (context.getType() === 'graphql' as unknown as string) {
            const gqlContext = GqlExecutionContext.create(context);
            const { req } = gqlContext.getContext();
            const controller = context.getClass().name;
            const handler = context.getHandler().name;
            this.logger.debug(
                `GraphQL request to ${req.url} handled by ${controller} ${handler}`
            );
            return next.handle();
        }
        const request = context.switchToHttp().getRequest();
        const controller = context.getClass().name;
        const handler = context.getHandler().name;
        const now = Date.now();
        return next.handle().pipe(
            tap(() => {
                const responseTime = Date.now() - now;
                this.logger.debug(
                    `Request to ${request.url} handled by ${controller} ${handler} - ${responseTime}ms`
                );
            }),
        );
    }
}