import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent, Context, InputType, Field, ObjectType } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NewsService } from '../services/news.service';
import { UserService } from '../services/user.service';
import { CategoryService } from '../services/category.service';
import { AdminGuard } from '../../_auth/guards/admin.guard';
import { JWTGuardNullAble } from '../../_auth/guards/jwt-nullable.guard';
import { User } from '../types/user.type';
import { SqsService } from '../../_sqs/sqs.service';
import { Category } from '../types/category.type';
import { CreateNewsInput, FilterNewsInput, News, UpdateNewsInput } from '../types/news.type';

@Resolver(() => News)
export class NewsResolver {
  constructor(
    private newsService: NewsService,
    private userService: UserService,
    private categoryService: CategoryService,
    private sqsService: SqsService,
  ) { }

  @Query(() => [News], { name: 'newsList', description: 'Get all news' })
  @UseGuards(JWTGuardNullAble)
  async getNewsList(
    @Args('filter', { type: () => FilterNewsInput, nullable: true }) filter?: FilterNewsInput
  ) {
    return this.newsService.findAll(filter);
  }

  @Query(() => News, { name: 'news', description: 'Get news by ID', nullable: true })
  @UseGuards(JWTGuardNullAble)
  async getNews(
    @Args('id', { type: () => Int }) id: number
  ) {
    const result = await this.newsService.findOne(id);
    await this.sqsService.sendMessage({
      type: "trigger_view_news",
      data: { id, id_author: result?.authorId || null }
    });
    return result;
  }

  // ============ RESOLVE FIELDS ============
  @ResolveField(() => User, { description: 'Get news author' })
  async author(
    @Parent() news: News,
    @Context() ctx: any
  ) {
    // Use DataLoader if available
    if (ctx.loaders?.userLoader) {
      return ctx.loaders.userLoader.load(news.authorId);
    }

    return this.userService.findOne(news.authorId);
  }

  @ResolveField(() => Category, { description: 'Get news category' })
  async category(
    @Parent() news: News,
    @Context() ctx: any
  ) {
    // Use DataLoader if available
    if (ctx.loaders?.categoryLoader) {
      return ctx.loaders.categoryLoader.load(news.categoryId);
    }

    return this.categoryService.findOne(news.categoryId);
  }

  // ============ MUTATIONS ============
  @Mutation(() => News, { description: 'Create new news' })
  @UseGuards(AdminGuard)
  async createNews(
    @Args('input') input: CreateNewsInput,
    @Context() ctx: any
  ) {
    const news = await this.newsService.create(input);

    // Prime DataLoader cache if available
    if (ctx.loaders?.newsLoader) {
      ctx.loaders.newsLoader.prime(news.id, news);
    }

    return news;
  }

  @Mutation(() => News, { description: 'Update news', nullable: true })
  @UseGuards(AdminGuard)
  async updateNews(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateNewsInput,
    @Context() ctx: any
  ) {
    const news = await this.newsService.update(id, input);

    // Clear DataLoader cache if available
    if (ctx.loaders?.newsLoader) {
      ctx.loaders.newsLoader.clear(id);
    }

    return news;
  }

  @Mutation(() => News, { description: 'Delete news', nullable: true })
  @UseGuards(AdminGuard)
  async deleteNews(
    @Args('id', { type: () => Int }) id: number,
    @Context() ctx: any
  ) {
    const news = await this.newsService.delete(id);

    // Clear DataLoader cache if available
    if (ctx.loaders?.newsLoader) {
      ctx.loaders.newsLoader.clear(id);
    }

    return news;
  }

  @Mutation(() => News, { description: 'Increment view count', nullable: true })
  @UseGuards(JWTGuardNullAble)
  async incrementViewCount(
    @Args('id', { type: () => Int }) id: number,
    @Context() ctx: any
  ) {
    const news = await this.newsService.findOne(id);
    if (!news) return null;

    const updatedNews = await this.newsService.update(id, {
      viewCount: news.viewCount + 1
    });

    // Clear DataLoader cache if available
    if (ctx.loaders?.newsLoader) {
      ctx.loaders.newsLoader.clear(id);
    }

    return updatedNews;
  }

}
