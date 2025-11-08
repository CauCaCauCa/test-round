import { SQSEvent } from 'aws-lambda';
import { processor } from 'src/_core/modules/_sqs/sub-services/_index';

export const handler = async (event: SQSEvent) => {
  return await Promise.all(
    event.Records.map(async (record) => {
      try {
        return await processor(record);
      } catch (error) {
        return { success: false, error: (error as Error).message };
      }
    })
  );
};
