import { Module } from "@nestjs/common";
import { NestGraphQLModule } from "./modules/graphql/graphql.module";
import { AuthModule } from "./modules/_auth/auth.module";
import { SqsModule } from "./modules/_sqs/sqs.module";

@Module({
    imports: [
        AuthModule,
        SqsModule,
        NestGraphQLModule,
    ],
})
export class CoreModule {}