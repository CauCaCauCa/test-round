import { Int, InputType, Field, ObjectType } from '@nestjs/graphql';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class FilterNewsInput {
  @Field(() => GraphQLJSON, { nullable: true })
  title?: [string, any];

  @Field(() => GraphQLJSON, { nullable: true })
  slug?: [string, any];

  @Field(() => GraphQLJSON, { nullable: true })
  authorId?: [string, any];

  @Field(() => GraphQLJSON, { nullable: true })
  categoryId?: [string, any];

  @Field(() => GraphQLJSON, { nullable: true })
  status?: [string, any];

  @Field(() => GraphQLJSON, { nullable: true })
  viewCount?: [string, any];

  // Pagination fields
  @Field(() => Int, { nullable: true, description: 'Page number (starts from 1)' })
  page?: number;

  @Field(() => Int, { nullable: true, description: 'Number of items per page' })
  limit?: number;

  // Sorting fields
  @Field({ nullable: true, description: 'Field to sort by' })
  sortBy?: string;

  @Field({ nullable: true, description: 'Sort order: asc or desc' })
  sortOrder?: string;
}

@ObjectType()
export class News {
  @Field(() => Int)
  id!: number;

  @Field()
  title!: string;

  @Field()
  slug!: string;

  @Field({ nullable: true })
  shortDescription?: string;

  @Field()
  longDescription!: string;

  @Field({ nullable: true })
  thumbnail?: string;

  @Field(() => Int)
  authorId!: number;

  @Field(() => Int)
  categoryId!: number;

  @Field()
  status!: string;

  @Field(() => Int)
  viewCount!: number;

  @Field({ nullable: true })
  publishedAt?: Date;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class NewsListResponse {
  @Field(() => [News])
  data!: News[];

  @Field(() => GraphQLJSON)
  meta!: any;
}



@InputType()
export class CreateNewsInput {
  @Field()
  title!: string;

  @Field()
  slug!: string;

  @Field({ nullable: true })
  shortDescription?: string;

  @Field()
  longDescription!: string;

  @Field({ nullable: true })
  thumbnail?: string;

  @Field(() => Int, { nullable: true })
  authorId!: number;

  @Field(() => Int, { nullable: true })
  categoryId!: number;

  @Field({ defaultValue: 'draft' })
  status!: string;

  @Field(() => Int, { defaultValue: 0 })
  viewCount!: number;

  @Field({ nullable: true })
  publishedAt?: Date;
}

@InputType()
export class UpdateNewsInput {
  @Field({ nullable: true })
  title?: string;

  @Field({ nullable: true })
  slug?: string;

  @Field({ nullable: true })
  shortDescription?: string;

  @Field({ nullable: true })
  longDescription?: string;

  @Field({ nullable: true })
  thumbnail?: string;

  @Field(() => Int, { nullable: true })
  authorId?: number;

  @Field(() => Int, { nullable: true })
  categoryId?: number;

  @Field({ nullable: true })
  status?: string;

  @Field(() => Int, { nullable: true })
  viewCount?: number;

  @Field({ nullable: true })
  publishedAt?: Date;
}
