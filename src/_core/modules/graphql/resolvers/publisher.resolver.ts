import { Resolver, Query, Mutation, Args, Int, ResolveField, Parent, Context } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { NewsService } from '../services/news.service';
import { CategoryService } from '../services/category.service';
import { PublisherGuard } from '../../_auth/guards/publisher.guard';
import { News, CreateNewsInput, UpdateNewsInput, FilterNewsInput, NewsListResponse } from '../types/news.type';
import { Category } from '../types/category.type';

@Resolver(() => News)
export class PublisherResolver {
  constructor(
    private newsService: NewsService,
    private categoryService: CategoryService
  ) { }

  // ============ QUERIES ============
  @Query(() => NewsListResponse, { name: 'myNewsList', description: 'Get list of news created by the authenticated publisher' })
  @UseGuards(PublisherGuard)
  async getMyNewsList(
    @Context() ctx: any,
    @Args('filter', { type: () => FilterNewsInput, nullable: true }) filter?: FilterNewsInput
  ) {
    const user = ctx.req?.headers?.user;

    // Add authorId filter to only show publisher's own news
    const publisherFilter = {
      ...filter,
      authorId: ['eq', user.id]
    };

    return this.newsService.findAll(publisherFilter);
  }

  @Query(() => News, { name: 'myNews', description: 'Get a specific news by ID (only if owned by publisher)', nullable: true })
  @UseGuards(PublisherGuard)
  async getMyNews(
    @Args('id', { type: () => Int }) id: number,
    @Context() ctx: any
  ) {
    const user = ctx.req?.headers?.user;
    const news = await this.newsService.findOne(id);

    // Check if the news belongs to the publisher
    if (!news || news.authorId !== user.id) {
      throw new Error('News not found or you do not have permission to access it');
    }

    return news;
  }

  // ============ MUTATIONS ============
  @Mutation(() => News, { description: 'Create new news as publisher' })
  @UseGuards(PublisherGuard)
  async publisherCreateNews(
    @Args('input') input: CreateNewsInput,
    @Context() ctx: any
  ) {
    const user = ctx.req?.headers?.user;

    // Override authorId with the authenticated publisher's ID
    const newsData = {
      ...input,
      authorId: user.id
    };

    const news = await this.newsService.create(newsData);

    // Prime DataLoader cache if available
    if (ctx.loaders?.newsLoader) {
      ctx.loaders.newsLoader.prime(news.id, news);
    }

    return news;
  }

  @Mutation(() => News, { description: 'Update own news as publisher', nullable: true })
  @UseGuards(PublisherGuard)
  async publisherUpdateNews(
    @Args('id', { type: () => Int }) id: number,
    @Args('input') input: UpdateNewsInput,
    @Context() ctx: any
  ) {
    const user = ctx.req?.headers?.user;
    const news = await this.newsService.findOne(id);

    // Check if the news belongs to the publisher
    if (!news || news.authorId !== user.id) {
      throw new Error('News not found or you do not have permission to update it');
    }

    // Prevent changing authorId
    const { authorId, ...updateData } = input as any;

    const updatedNews = await this.newsService.update(id, updateData);

    // Clear DataLoader cache if available
    if (ctx.loaders?.newsLoader) {
      ctx.loaders.newsLoader.clear(id);
    }

    return updatedNews;
  }

  @Mutation(() => News, { description: 'Delete own news as publisher', nullable: true })
  @UseGuards(PublisherGuard)
  async publisherDeleteNews(
    @Args('id', { type: () => Int }) id: number,
    @Context() ctx: any
  ) {
    const user = ctx.req?.headers?.user;
    const news = await this.newsService.findOne(id);

    // Check if the news belongs to the publisher
    if (!news || news.authorId !== user.id) {
      throw new Error('News not found or you do not have permission to delete it');
    }

    const deletedNews = await this.newsService.delete(id);

    // Clear DataLoader cache if available
    if (ctx.loaders?.newsLoader) {
      ctx.loaders.newsLoader.clear(id);
    }

    return deletedNews;
  }

  // ============ RESOLVE FIELDS ============
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

}
