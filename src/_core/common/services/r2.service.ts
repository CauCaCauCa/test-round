import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { appSettings } from 'src/_core/config/appsettings';
import { IUploadedMulterFileR2, r2Client } from 'src/_core/config/storage/r2';

const { bucketName, folder } = appSettings.r2;

export interface ThirtPartStorageInterfaceService {
    uploadFile(file: any, fileName: string): Promise<any>;
    deleteFile(key: string): Promise<any>;
}

export class R2Service implements ThirtPartStorageInterfaceService {

    private readonly s3Client: S3Client = r2Client;

    async uploadFile(
        file: IUploadedMulterFileR2,
        file_name: string,
    ) {
        try {
            return await this.s3Client.send(
                new PutObjectCommand({
                    Bucket: bucketName,
                    Key: `${folder}/${file_name}`,
                    Body: file.buffer,
                    ContentType: file.mimetype,
                    // ACL: 'public-read',
                    ContentLength: file.size,
                }),
            );
        } catch (error) {
            throw new Error('Failed to upload file to R2', { cause: error });
        }
    }

    async deleteFile(file_name: string) {
        let result = await this.s3Client.send(
            new DeleteObjectCommand({
                Bucket: bucketName,
                Key: `${folder}/${file_name}`,
            }),
        );
        return result;

    }

}
