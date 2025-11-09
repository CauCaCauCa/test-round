import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent, Context, InputType, Field, ObjectType } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { CategoryService } from '../services/category.service';
import { AdminGuard } from '../../_auth/guards/admin.guard';
import { Category, CategoryListResponse, CreateCategoryInput, FilterCategoryInput, UpdateCategoryInput } from '../types/category.type';

@Resolver(() => Category)
export class CategoryResolver {
  constructor(private categoryService: CategoryService) { }

  @Query(() => CategoryListResponse, { name: 'categories', description: 'Get all categories' })
  async getCategories(
    @Args('filter', { type: () => FilterCategoryInput, nullable: true }) filter?: FilterCategoryInput
  ) {
    return this.categoryService.findAll(filter);
  }

  @Query(() => Category, { name: 'category', description: 'Get category by ID', nullable: true })
  async getCategory(
    @Args('id', { type: () => Int }) id: number
  ) {
    return this.categoryService.findOne(id);
  }

  // ============ RESOLVE FIELDS ============
  @ResolveField(() => Category, { nullable: true, description: 'Get parent category' })
  async parent(
    @Parent() category: Category,
    @Context() ctx: any
  ) {
    if (!category.parentId) return null;

    // Use DataLoader if available
    if (ctx.loaders?.categoryLoader) {
      return ctx.loaders.categoryLoader.load(category.parentId);
    }

    return this.categoryService.findOne(category.parentId);
  }

  // ============ MUTATIONS ============
  @Mutation(() => Category, { description: 'Create new category' })
  @UseGuards(AdminGuard)
  async createCategory(
    @Args('input') input: CreateCategoryInput,
    @Context() ctx: any
  ) {
    const category = await this.categoryService.create(input);

    // Prime DataLoader cache if available
    if (ctx.loaders?.categoryLoader) {
      ctx.loaders.categoryLoader.prime(category.id, category);
    }

    return category;
  }

  @Mutation(() => Category, { description: 'Update category', nullable: true })
  @UseGuards(AdminGuard)
  async updateCategory(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateCategoryInput,
    @Context() ctx: any
  ) {
    const category = await this.categoryService.update(id, input);

    // Clear DataLoader cache if available
    if (ctx.loaders?.categoryLoader) {
      ctx.loaders.categoryLoader.clear(id);
    }

    return category;
  }

  @Mutation(() => Category, { description: 'Delete category', nullable: true })
  @UseGuards(AdminGuard)
  async deleteCategory(
    @Args('id', { type: () => Int }) id: number,
    @Context() ctx: any
  ) {
    const category = await this.categoryService.delete(id);

    // Clear DataLoader cache if available
    if (ctx.loaders?.categoryLoader) {
      ctx.loaders.categoryLoader.clear(id);
    }

    return category;
  }

}
