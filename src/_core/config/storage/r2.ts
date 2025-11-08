import { DeleteObjectCommand, PutObjectCommand, S3 } from "@aws-sdk/client-s3";
import { appSettings } from "../appsettings";

interface IUploadedMulterFileR2 {
  fieldName: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export enum FileTypeR2 {
  IMAGE = 'image',
  VIDEO = 'video',
  AUDIO = 'audio',
  PDF = 'pdf',
  DOC = 'msword',
  DOCX = 'vnd.openxmlformats-officedocument.wordprocessingml.document',
  XLS = 'vnd.ms-excel',
  XLSX = 'vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  PPT = 'vnd.ms-powerpoint',
  PPTX = 'vnd.openxmlformats-officedocument.presentationml.presentation',
}

const r2Client = new S3({
  endpoint: appSettings.r2.endpoint,
  region: "auto",
  credentials: {
    accessKeyId: appSettings.r2.credentials.accessKeyId,
    secretAccessKey: appSettings.r2.credentials.secretAccessKey,
  }
});

export async function uploadFileR2(
  file: IUploadedMulterFileR2,
  file_name: string,
) {
  try {
    return await r2Client.send(
      new PutObjectCommand({
        Bucket: appSettings.r2.bucketName,
        Key: `${file_name}`,
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

export async function deleteFileR2(file_name: string) {
  let result = await r2Client.send(
    new DeleteObjectCommand({
      Bucket: appSettings.r2.bucketName,
      Key: `${file_name}`,
    }),
  );
  return result;
}

export { r2Client };
export type { IUploadedMulterFileR2 };