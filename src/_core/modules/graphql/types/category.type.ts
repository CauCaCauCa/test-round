import { Int, InputType, Field, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class FilterCategoryInput {
  @Field(() => GraphQLJSON, { nullable: true })
  name?: [string, any];

  @Field(() => GraphQLJSON, { nullable: true })
  slug?: [string, any];

  @Field(() => GraphQLJSON, { nullable: true })
  icon?: [string, any];

  @Field(() => GraphQLJSON, { nullable: true })
  parentId?: [string, any];

  @Field(() => GraphQLJSON, { nullable: true })
  isActive?: [string, any];
}

@ObjectType()
export class Category {
  @Field(() => Int)
  id!: number;

  @Field()
  name!: string;

  @Field()
  slug!: string;

  @Field({ nullable: true })
  icon?: string;

  @Field(() => Int, { nullable: true })
  parentId?: number;

  @Field()
  isActive!: boolean;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class CategoryListResponse {
  @Field(() => [Category])
  data!: Category[];

  @Field(() => GraphQLJSON)
  meta!: any;
}

@InputType()
export class CreateCategoryInput {
  @Field()
  name!: string;

  @Field()
  slug!: string;

  @Field({ nullable: true })
  icon?: string;

  @Field(() => Int, { nullable: true })
  parentId?: number;

  @Field({ defaultValue: true })
  isActive!: boolean;
}

@InputType()
export class UpdateCategoryInput {
  @Field({ nullable: true })
  name?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  icon?: string;

  @Field(() => Int, { nullable: true })
  parentId?: number;

  @Field({ nullable: true })
  isActive?: boolean;
}
