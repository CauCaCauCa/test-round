import { Injectable } from "@nestjs/common";
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";
import 'dotenv/config';
import { DateProcessor } from "./sub-services/_index";
import { appSettings } from "src/_core/config/appsettings";

@Injectable()
export class SqsService {

    private sqs = new SQSClient({
        region: appSettings.aws.sqs.region,
        credentials: {
            accessKeyId: appSettings.aws.sqs.credentials.accessKeyId,
            secretAccessKey: appSettings.aws.sqs.credentials.secretAccessKey
        }
    });
    private QUEUE_URL = appSettings.aws.sqs.queue_url;

    async sendMessage(data: DateProcessor) {
        return this.sqs.send(new SendMessageCommand({
            QueueUrl: this.QUEUE_URL,
            MessageBody: JSON.stringify(data)
        }));
    }
    
}