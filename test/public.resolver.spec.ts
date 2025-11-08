import { Test, TestingModule } from '@nestjs/testing';
import { NewsResolver } from '../src/_core/modules/graphql/resolvers/news.resolver';
import { CategoryResolver } from '../src/_core/modules/graphql/resolvers/category.resolver';
import { UserResolver } from '../src/_core/modules/graphql/resolvers/user.resolver';
import { NewsService } from '../src/_core/modules/graphql/services/news.service';
import { UserService } from '../src/_core/modules/graphql/services/user.service';
import { CategoryService } from '../src/_core/modules/graphql/services/category.service';
import { SqsService } from '../src/_core/modules/_sqs/sqs.service';

describe('Public Access (Unauthenticated)', () => {
  let newsResolver: NewsResolver;
  let categoryResolver: CategoryResolver;
  let userResolver: UserResolver;
  let newsService: jest.Mocked<NewsService>;
  let categoryService: jest.Mocked<CategoryService>;
  let userService: jest.Mocked<UserService>;

  const mockNews = {
    id: 1,
    title: 'Test News',
    slug: 'test-news',
    authorId: 1,
    categoryId: 1,
    status: 'published',
    viewCount: 100,
  };

  const mockCategory = {
    id: 1,
    name: 'Technology',
    slug: 'technology',
    isActive: true,
  };

  const mockPublisher = {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    role: 'publisher',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NewsResolver,
        CategoryResolver,
        UserResolver,
        { provide: NewsService, useValue: { findAll: jest.fn(), findOne: jest.fn() } },
        { provide: CategoryService, useValue: { findAll: jest.fn(), findOne: jest.fn() } },
        { provide: UserService, useValue: { findAll: jest.fn(), findOne: jest.fn().mockResolvedValue(mockPublisher) } },
        { provide: SqsService, useValue: { sendMessage: jest.fn() } },
      ],
    })
      .overrideGuard(require('../src/_core/modules/_auth/guards/jwt-nullable.guard').JWTGuardNullAble)
      .useValue({ canActivate: () => true })
      .overrideGuard(require('../src/_core/modules/_auth/guards/admin.guard').AdminGuard)
      .useValue({ canActivate: () => true })
      .compile();

    newsResolver = module.get<NewsResolver>(NewsResolver);
    categoryResolver = module.get<CategoryResolver>(CategoryResolver);
    userResolver = module.get<UserResolver>(UserResolver);
    newsService = module.get(NewsService);
    categoryService = module.get(CategoryService);
    userService = module.get(UserService);
  });

  // 1. List of news (search, filter, pagination)
  describe('List of news', () => {
    it('should get all news without filter', async () => {
      newsService.findAll.mockResolvedValue([mockNews]);

      const result = await newsResolver.getNewsList();

      expect(result).toEqual([mockNews]);
      expect(newsService.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should search news by title', async () => {
      const filter = { title: ['like', '%test%'] } as any;
      newsService.findAll.mockResolvedValue([mockNews]);

      const result = await newsResolver.getNewsList(filter);

      expect(result).toEqual([mockNews]);
      expect(newsService.findAll).toHaveBeenCalledWith(filter);
    });

    it('should filter news by status', async () => {
      const filter = { status: ['eq', 'published'] } as any;
      newsService.findAll.mockResolvedValue([mockNews]);

      const result = await newsResolver.getNewsList(filter);

      expect(newsService.findAll).toHaveBeenCalledWith(filter);
    });

    it('should filter news by category', async () => {
      const filter = { categoryId: ['eq', 1] } as any;
      newsService.findAll.mockResolvedValue([mockNews]);

      const result = await newsResolver.getNewsList(filter);

      expect(newsService.findAll).toHaveBeenCalledWith(filter);
    });
  });

  // 2. List of category
  describe('List of category', () => {
    it('should get all categories', async () => {
      categoryService.findAll.mockResolvedValue([mockCategory]);

      const result = await categoryResolver.getCategories();

      expect(result).toEqual([mockCategory]);
      expect(categoryService.findAll).toHaveBeenCalledWith(undefined);
    });

    it('should filter categories by name', async () => {
      const filter = { name: ['like', '%tech%'] } as any;
      categoryService.findAll.mockResolvedValue([mockCategory]);

      const result = await categoryResolver.getCategories(filter);

      expect(categoryService.findAll).toHaveBeenCalledWith(filter);
    });
  });

  // 3. Detail of a news
  describe('Detail of a news', () => {
    it('should get news detail by id', async () => {
      newsService.findOne.mockResolvedValue(mockNews);

      const result = await newsResolver.getNews(1);

      expect(result).toEqual(mockNews);
      expect(newsService.findOne).toHaveBeenCalledWith(1);
    });

    it('should return null when news not found', async () => {
      newsService.findOne.mockResolvedValue(null as any);

      const result = await newsResolver.getNews(999);

      expect(result).toBeNull();
    });
  });

  // 4. List of publishers
  describe('List of publishers', () => {
    it('should get all publishers with auto role filter', async () => {
      const mockPublishers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'publisher' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'publisher' },
      ];
      userService.findAll.mockResolvedValue(mockPublishers);

      const result = await userResolver.getPublishers();

      expect(result).toEqual(mockPublishers);
      expect(userService.findAll).toHaveBeenCalledWith({ role: ['eq', 'publisher'], isActive: ['eq', true] });
    });

    it('should filter publishers by name while maintaining role filter', async () => {
      const filter = { name: ['like', '%John%'] } as any;
      const mockPublishers = [
        { id: 1, name: 'John Doe', email: 'john@example.com', role: 'publisher' },
      ];
      userService.findAll.mockResolvedValue(mockPublishers);

      const result = await userResolver.getPublishers(filter);

      expect(result).toEqual(mockPublishers);
      expect(userService.findAll).toHaveBeenCalledWith({
        name: ['like', '%John%'],
        role: ['eq', 'publisher'],
        isActive: ['eq', true],
      });
    });

    it('should return empty array when no publishers found', async () => {
      userService.findAll.mockResolvedValue([]);

      const result = await userResolver.getPublishers();

      expect(result).toEqual([]);
      expect(userService.findAll).toHaveBeenCalledWith({ role: ['eq', 'publisher'], isActive: ['eq', true] });
    });

    it('should override role filter if client tries to change it', async () => {
      const filter = { role: ['eq', 'admin'] } as any;
      userService.findAll.mockResolvedValue([]);

      await userResolver.getPublishers(filter);

      expect(userService.findAll).toHaveBeenCalledWith({
        role: ['eq', 'publisher'],
        isActive: ['eq', true],
      });
    });

    it('should handle multiple filters with role filter', async () => {
      const filter = {
        name: ['like', '%John%'],
        email: ['like', '%@example.com%'],
        _sort: 'name',
        _order: 'ASC',
      } as any;
      userService.findAll.mockResolvedValue([]);

      await userResolver.getPublishers(filter);

      expect(userService.findAll).toHaveBeenCalledWith({
        name: ['like', '%John%'],
        email: ['like', '%@example.com%'],
        _sort: 'name',
        _order: 'ASC',
        role: ['eq', 'publisher'],
        isActive: ['eq', true],
      });
    });
  });
});
