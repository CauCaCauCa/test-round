import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { join } from "path";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import multipart from "@fastify/multipart";
import { Context, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { proxy } from 'aws-serverless-fastify';
import { appSettings } from "./_core/config/appsettings";

let cachedApp: NestFastifyApplication;

async function bootstrapServer() {
  if (!cachedApp) {
    const app = await NestFactory.create<NestFastifyApplication>(
      AppModule,
      new FastifyAdapter({
        logger: true,
        // bodyLimit: 50 * 1024 * 1024, // 50MB
      }),
    );
    app.useStaticAssets({ root: join(process.cwd(), "public") }); // for fastify
    app.register(multipart);
    app.setGlobalPrefix(`${appSettings.prefixApi}`);
    app.enableVersioning({ type: VersioningType.URI });
    app.useGlobalPipes(new ValidationPipe({}));
    app.register(require("@fastify/cors"), {
      "origin": ["*"],
      "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      "allowedHeaders": ["*"],
      "credentials": false,
      "preflightContinue": true,
    });

    await app.init();
    cachedApp = app;
  }
  return cachedApp;
}

export const handler = async (
  event: APIGatewayProxyEvent,
  context: Context,
): Promise<APIGatewayProxyResult> => {
  const app = await bootstrapServer();
  const server = app.getHttpAdapter().getInstance();
  return await proxy(server, event, context, { binaryTypes: ['PROMISE'] });
};
