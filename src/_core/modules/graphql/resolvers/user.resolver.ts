import { Resolver, Query, Mutation, Args, Int, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UserService } from '../services/user.service';
import { AdminGuard } from '../../_auth/guards/admin.guard';
import { CreateUserInput, FilterUserInput, UpdateUserInput, User, UserListResponse } from '../types/user.type';


@Resolver(() => User)
export class UserResolver {
  constructor(private userService: UserService) { }

  @Query(() => UserListResponse, { name: 'users', description: 'Get all users' })
  async getUsers(
    @Args('filter', { type: () => FilterUserInput, nullable: true }) filter?: FilterUserInput
  ) {
    return this.userService.findAll(filter);
  }

  @Query(() => UserListResponse, { name: 'publishers', description: 'Get all publishers' })
  async getPublishers(
    @Args('filter', { type: () => FilterUserInput, nullable: true }) filter?: FilterUserInput
  ) {
    filter = { ...filter, role: ['eq', 'publisher'], isActive: ['eq', true] };
    return this.userService.findAll(filter);
  }

  @Query(() => User, { name: 'user', description: 'Get user by ID', nullable: true })
  async getUser(
    @Args('id', { type: () => Int }) id: number
  ) {
    return this.userService.findOne(id);
  }

  // ============ MUTATIONS ============
  @Mutation(() => User, { description: 'Create new user' })
  @UseGuards(AdminGuard)
  async createUser(
    @Args('input') input: CreateUserInput,
    @Context() ctx: any
  ) {
    const user = await this.userService.create(input);

    // Prime DataLoader cache if available
    if (ctx.loaders?.userLoader) {
      ctx.loaders.userLoader.prime(user.id, user);
    }

    return user;
  }

  @Mutation(() => User, { description: 'Update user', nullable: true })
  @UseGuards(AdminGuard)
  async updateUser(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateUserInput,
    @Context() ctx: any
  ) {
    const user = await this.userService.update(id, input);

    // Clear DataLoader cache if available
    if (ctx.loaders?.userLoader) {
      ctx.loaders.userLoader.clear(id);
    }

    return user;
  }

  @Mutation(() => User, { description: 'Delete user', nullable: true })
  @UseGuards(AdminGuard)
  async deleteUser(
    @Args('id', { type: () => Int }) id: number,
    @Context() ctx: any
  ) {
    const user = await this.userService.delete(id);

    // Clear DataLoader cache if available
    if (ctx.loaders?.userLoader) {
      ctx.loaders.userLoader.clear(id);
    }

    return user;
  }

}
