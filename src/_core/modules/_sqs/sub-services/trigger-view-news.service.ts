import { db_client } from 'src/_core/config/database/postgres/drizzle';
import * as schema from 'src/_core/config/database/postgres/schema';
import { eq, sql } from 'drizzle-orm';

export type TriggerViewNewsPayload = {
  id: number;
  id_author: number;
};

// call url webhook of author when news is viewed with http
export async function callWebhookAuthor(url: string, headers: any, news: schema.News): Promise<void> {
  try {
    await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify({ 
        news,
        message: 'Your news has a new view!'
      })
    });
  } catch (error) {
    console.error('Error calling webhook:', error);
  }
}

export async function triggerViewNews(payload: TriggerViewNewsPayload): Promise<any> {
  const result = await db_client
    .update(schema.news)
    .set({
      viewCount: sql`view_count + 1`
    })
    .where(eq(schema.news.id, payload.id))
    .returning();

  // call to webhook if user pre-signed before
  if (payload.id_author) {
    // find data of author
    const author = await db_client
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, payload.id_author))
      .limit(1)
      .then(res => res[0]);

    if (author && author.urlWebhook) {
      await callWebhookAuthor(author.urlWebhook, author.urlWebhookHeaders || {}, result[0]);
    }
  }

  return result[0];
}
