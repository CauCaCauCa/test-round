import { Test, TestingModule } from '@nestjs/testing';
import { PublisherResolver } from '../src/_core/modules/graphql/resolvers/publisher.resolver';
import { NewsService } from '../src/_core/modules/graphql/services/news.service';
import { CategoryService } from '../src/_core/modules/graphql/services/category.service';

describe('PublisherResolver', () => {
  let resolver: PublisherResolver;
  let newsService: jest.Mocked<NewsService>;

  const mockPublisher = { id: 1, name: 'John', role: 'publisher' };
  const mockNews = { id: 1, title: 'Test', authorId: 1, categoryId: 1 };
  const mockContext = { req: { headers: { user: mockPublisher } }, loaders: null };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PublisherResolver,
        { provide: NewsService, useValue: { findAll: jest.fn(), findOne: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() } },
        { provide: CategoryService, useValue: { findOne: jest.fn() } },
      ],
    })
      .overrideGuard(require('../src/_core/modules/_auth/guards/publisher.guard').PublisherGuard)
      .useValue({ canActivate: () => true })
      .compile();

    resolver = module.get<PublisherResolver>(PublisherResolver);
    newsService = module.get(NewsService);
  });

  // 1. List of their own news
  it('should list own news only', async () => {
    newsService.findAll.mockResolvedValue([mockNews]);

    const result = await resolver.getMyNewsList(mockContext);

    expect(result).toEqual([mockNews]);
    expect(newsService.findAll).toHaveBeenCalledWith({ authorId: ['eq', 1] });
  });

  // 2. Create news
  it('should create news with auto authorId', async () => {
    const input = { title: 'New', slug: 'new', longDescription: 'desc', categoryId: 1 } as any;
    newsService.create.mockResolvedValue({ ...mockNews, ...input, authorId: 1 });

    const result = await resolver.publisherCreateNews(input, mockContext);

    expect(newsService.create).toHaveBeenCalledWith({ ...input, authorId: 1 });
    expect(result.authorId).toBe(1);
  });

  // 3. Update news
  it('should update own news', async () => {
    newsService.findOne.mockResolvedValue(mockNews);
    newsService.update.mockResolvedValue({ ...mockNews, title: 'Updated' });

    const result = await resolver.publisherUpdateNews(1, { title: 'Updated' }, mockContext);

    expect(result.title).toBe('Updated');
    expect(newsService.findOne).toHaveBeenCalledWith(1);
  });

  // 4. Delete news
  it('should delete own news', async () => {
    newsService.findOne.mockResolvedValue(mockNews);
    newsService.delete.mockResolvedValue(mockNews);

    const result = await resolver.publisherDeleteNews(1, mockContext);

    expect(result).toEqual(mockNews);
    expect(newsService.delete).toHaveBeenCalledWith(1);
  });
});
