import DataLoader from 'dataloader';
import { db_client } from '../../../config/database/postgres/drizzle';
import * as schema from '../../../config/database/postgres/schema';
import { eq, inArray } from 'drizzle-orm';

// ============ USER LOADER ============

export const createUserLoader = () => {
  return new DataLoader<number, any>(async (userIds) => {
    console.log('Batch loading users:', userIds);
    
    const users = await db_client
      .select({
        id: schema.users.id,
        email: schema.users.email,
        fullName: schema.users.fullName,
        role: schema.users.role,
        isActive: schema.users.isActive,
        createdAt: schema.users.createdAt,
        updatedAt: schema.users.updatedAt,
      })
      .from(schema.users)
      .where(inArray(schema.users.id, [...userIds]));

    // Map results to match requested order
    const userMap = new Map(users.map(user => [user.id, user]));
    return userIds.map(id => userMap.get(id) || null);
  });
};

// ============ CATEGORY LOADER ============

export const createCategoryLoader = () => {
  return new DataLoader<number, any>(async (categoryIds) => {
    console.log('Batch loading categories:', categoryIds);
    
    const categories = await db_client
      .select()
      .from(schema.categories)
      .where(inArray(schema.categories.id, [...categoryIds]));

    const categoryMap = new Map(categories.map(cat => [cat.id, cat]));
    return categoryIds.map(id => categoryMap.get(id) || null);
  });
};

// ============ NEWS LOADER ============

export const createNewsLoader = () => {
  return new DataLoader<number, any>(async (newsIds) => {
    console.log('Batch loading news:', newsIds);
    
    const newsList = await db_client
      .select()
      .from(schema.news)
      .where(inArray(schema.news.id, [...newsIds]));

    const newsMap = new Map(newsList.map(news => [news.id, news]));
    return newsIds.map(id => newsMap.get(id) || null);
  });
};

// ============ NEWS BY AUTHOR LOADER ============

export const createNewsByAuthorLoader = () => {
  return new DataLoader<number, any[]>(async (authorIds) => {
    console.log('Batch loading news by authors:', authorIds);
    
    const newsList = await db_client
      .select()
      .from(schema.news)
      .where(inArray(schema.news.authorId, [...authorIds]));

    // Group by authorId
    const newsMap = new Map<number, any[]>();
    for (const news of newsList) {
      if (!newsMap.has(news.authorId)) {
        newsMap.set(news.authorId, []);
      }
      newsMap.get(news.authorId)!.push(news);
    }

    return authorIds.map(id => newsMap.get(id) || []);
  });
};

// ============ NEWS BY CATEGORY LOADER ============

export const createNewsByCategoryLoader = () => {
  return new DataLoader<number, any[]>(async (categoryIds) => {
    console.log('Batch loading news by categories:', categoryIds);
    
    const newsList = await db_client
      .select()
      .from(schema.news)
      .where(inArray(schema.news.categoryId, [...categoryIds]));

    // Group by categoryId
    const newsMap = new Map<number, any[]>();
    for (const news of newsList) {
      if (!newsMap.has(news.categoryId)) {
        newsMap.set(news.categoryId, []);
      }
      newsMap.get(news.categoryId)!.push(news);
    }

    return categoryIds.map(id => newsMap.get(id) || []);
  });
};

// ============ CATEGORIES BY PARENT LOADER ============

export const createCategoriesByParentLoader = () => {
  return new DataLoader<number, any[]>(async (parentIds) => {
    console.log('Batch loading categories by parent:', parentIds);
    
    const categories = await db_client
      .select()
      .from(schema.categories)
      .where(inArray(schema.categories.parentId, [...parentIds]));

    // Group by parentId
    const categoryMap = new Map<number, any[]>();
    for (const category of categories) {
      if (!categoryMap.has(category.parentId!)) {
        categoryMap.set(category.parentId!, []);
      }
      categoryMap.get(category.parentId!)!.push(category);
    }

    return parentIds.map(id => categoryMap.get(id) || []);
  });
};
