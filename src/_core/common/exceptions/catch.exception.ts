import { ExceptionFilter, Catch, ArgumentsHost, HttpException, HttpStatus } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { appSettings } from 'src/_core/config/appsettings';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly httpAdapterHost: HttpAdapterHost) { }

  catch(exception: unknown, host: ArgumentsHost): void {
    console.log('🚀 ~ AllExceptionsFilter ~ exception:', exception);

    if (host.getType() === 'graphql' as unknown as string) {

      throw (exception as any)?.cause || exception;
    }

    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    if (!(exception instanceof HttpException)) {
      const httpStatus =
        exception instanceof HttpException
          ? exception.getStatus()
          : HttpStatus.INTERNAL_SERVER_ERROR;
      const responseBody = {
        statusCode: httpStatus,
        timestamp: new Date().toISOString(),
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
        message: (exception as Error).toString(),
      };
      httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    } else {
      const status = exception?.getStatus();
      const response = exception.getResponse();

      let message = typeof response === 'object' && 'message' in response ? (response as any)['message'] : response;
      if (Array.isArray(message) || typeof response === 'string') {
        message = response;
      }
      const errorResponse = {
        statusCode: status,
        timestamp: new Date(appSettings.timeZoneDB.getCurrentTime()),
        path: httpAdapter.getRequestUrl(ctx.getRequest()),
        message: message,
      };
      httpAdapter.reply(ctx.getResponse(), errorResponse, status);
    }
  }
}
