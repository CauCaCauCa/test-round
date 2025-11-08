import { SQSRecord } from "aws-lambda";
import { executeSendEmail, MailerNodeType } from "./sender-email.service";
import { triggerViewNews, TriggerViewNewsPayload } from "./trigger-view-news.service";

export type DateProcessor = {
  type: 'notification' | 'email' | 'trigger_view_news';
  data: any;
};

export async function processor(record: SQSRecord) {
  if (!record.body) {
    throw new Error('Record body is empty');
  }
  let data = (typeof record.body === 'string' ? JSON.parse(record.body) : record.body) as DateProcessor;
  switch (data.type) {
    case 'email':
      return await executeSendEmail(data?.data as MailerNodeType);
    case 'trigger_view_news':
      return await triggerViewNews(data?.data as TriggerViewNewsPayload);
    default:
      throw new Error(`Unsupported processor type: ${data.type}`);
  }
}