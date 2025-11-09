import { Int, InputType, Field, ObjectType } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { AdminGuard } from '../../_auth/guards/admin.guard';
import GraphQLJSON from 'graphql-type-json';

@InputType()
export class FilterUserInput {
  @Field(() => GraphQLJSON, { nullable: true })
  email?: [string, any];

  @Field(() => GraphQLJSON, { nullable: true })
  fullName?: [string, any];

  @Field(() => GraphQLJSON, { nullable: true })
  role?: [string, any];

  @Field(() => GraphQLJSON, { nullable: true })
  isActive?: [string, any];
}

@ObjectType()
export class User {
  @Field(() => Int)
  id!: number;

  @Field()
  email!: string;

  @Field()
  fullName!: string;

  @Field()
  role!: string;

  @Field()
  isActive!: boolean;

  @Field()
  createdAt!: Date;

  @Field()
  updatedAt!: Date;
}

@ObjectType()
export class UserListResponse {
  @Field(() => [User])
  data!: User[];

  @Field(() => GraphQLJSON)
  meta!: any;
}

@InputType()
export class CreateUserInput {
  @Field()
  email!: string;

  @Field()
  password!: string;

  @Field()
  fullName!: string;

  @Field({ defaultValue: 'user' })
  role!: string;

  @Field({ defaultValue: true })
  isActive!: boolean;
}

@InputType()
export class UpdateUserInput {
  @Field({ nullable: true })
  email?: string;

  @Field({ nullable: true })
  password?: string;

  @Field({ nullable: true })
  fullName?: string;

  @Field({ nullable: true })
  role?: string;

  @Field({ nullable: true })
  isActive?: boolean;
}