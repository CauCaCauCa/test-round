import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe, VersioningType } from "@nestjs/common";
import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from "@nestjs/swagger";
import { join } from "path";
import compression from "compression";
import {
  FastifyAdapter,
  NestFastifyApplication,
} from "@nestjs/platform-fastify";
import multipart from "@fastify/multipart";
import { appSettings } from "./_core/config/appsettings";
import { writeFileSync } from "fs";

export async function bootstrap() {

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: false,
      bodyLimit: 2097152, // 2MB
    }),
  );

  app.use(compression())
  app.useStaticAssets({ root: join(process.cwd(), "public") }); // for fastify
  app.setGlobalPrefix(`${appSettings.prefixApi}`);
  app.enableVersioning({ type: VersioningType.URI });
  app.useGlobalPipes(new ValidationPipe({}));

  await app.register(multipart);
  // CORS settings
  await app.register(require("@fastify/cors"), {
    "origin": ["*"],
    "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allowedHeaders": ["*"],
    "credentials": false,
    "preflightContinue": true,
  });

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle(" API - Documentation")
    .setDescription("API for user interface development")
    .setVersion("1.1")
    .addBearerAuth()
    .addServer(`http://localhost:${appSettings.port || 8080}`, 'Local Development')
    .addServer(`https://47v5h1aj7h.execute-api.ap-southeast-1.amazonaws.com/dev`, 'DEV Environment (AWS Lambda)')
    .build();

  const swagger_document = SwaggerModule.createDocument(app, config);
  
  writeFileSync("./public/swagger-spec.json", JSON.stringify(swagger_document));

  SwaggerModule.setup("swagger", app, swagger_document, {
    "swaggerOptions": {
      "docExpansion": "none",
      "defaultModelsExpandDepth": -1,
    } as SwaggerCustomOptions,
  });

  // Start server
  await app.listen(appSettings.port || 8080, "0.0.0.0"); // for fastify
  return app;
}

bootstrap();