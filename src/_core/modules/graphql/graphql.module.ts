import { ApolloDriver, ApolloDriverConfig } from "@nestjs/apollo";
import { GraphQLModule } from '@nestjs/graphql';
import { Logger, Module } from "@nestjs/common";
import { join } from "path";
import { CategoryResolver } from "./resolvers/category.resolver";
import { CategoryService } from "./services/category.service";
import {
  createUserLoader,
  createCategoryLoader,
  createNewsLoader,
  createNewsByAuthorLoader,
  createNewsByCategoryLoader,
  createCategoriesByParentLoader,
} from './dataloaders';
import GraphQLJSON from "graphql-type-json";
import { UserResolver } from "./resolvers/user.resolver";
import { NewsResolver } from "./resolvers/news.resolver";
import { UserService } from "./services/user.service";
import { NewsService } from "./services/news.service";
import { PublisherResolver } from "./resolvers/publisher.resolver";

const logger = new Logger('GraphQLModule');
const schemaPath = join(process.cwd(), 'public/graphql/schema.gql');

let canWriteSchema = true;
try {
    const fs = require('fs');
    const dir = require('path').dirname(schemaPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
    fs.accessSync(dir, fs.constants.W_OK);
} catch (error) {
    logger.warn(`Cannot write schema file: ${error instanceof Error ? error.message : String(error)}`);
    canWriteSchema = false;
}

@Module({
    imports: [
        GraphQLModule.forRoot<ApolloDriverConfig>({
            driver: ApolloDriver,
            autoSchemaFile: canWriteSchema ? schemaPath : true,
            sortSchema: true,
            playground: true,
            introspection: true,
            resolvers: { JSON: GraphQLJSON },
            context: ({ request, reply }: any) => {
                const loaders = {
                    userLoader: createUserLoader(),
                    categoryLoader: createCategoryLoader(),
                    newsLoader: createNewsLoader(),
                    newsByAuthorLoader: createNewsByAuthorLoader(),
                    newsByCategoryLoader: createNewsByCategoryLoader(),
                    categoriesByParentLoader: createCategoriesByParentLoader(),
                };

                return {
                    req: request,
                    reply,
                    loaders,
                };
            },
        }),
    ],
    providers: [
        // Resolvers
        CategoryResolver,
        UserResolver,
        NewsResolver,
        PublisherResolver,
        
        // Services
        CategoryService,
        UserService,
        NewsService,
    ],
})
export class NestGraphQLModule { }
