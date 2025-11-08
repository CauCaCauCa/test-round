import { MemoryStorageFile } from '@blazity/nest-file-fastify';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { extname } from 'path';
import { appSettings } from 'src/_core/config/appsettings';
import { FileTypeR2, IUploadedMulterFileR2, uploadFileR2 } from 'src/_core/config/storage/r2';
import { v4 as uuidv4 } from 'uuid';


@Injectable()
export class FileService {


  async createMedia(
    createDto: any,
    file: MemoryStorageFile,
    user: any = null,
  ) {

    if (!file) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    createDto.created_by = user?.id;
    createDto.updated_by = user?.id;

    const { title, alt } = createDto;
    let { buffer, encoding, mimetype, size, fieldname } = file;

    fieldname = this.generateFileName(title);

    const mediaFile: IUploadedMulterFileR2 = {
      buffer: buffer,
      encoding,
      fieldName: fieldname,
      mimetype,
      size,
      originalname: fieldname,
    };

    let minetype_check = mimetype.split('/');

    if (
      !Object.values(FileTypeR2).includes(minetype_check[0] as FileTypeR2) &&
      !Object.values(FileTypeR2).includes(minetype_check[1] as FileTypeR2)
    ) {
      throw new HttpException('File type not supported', HttpStatus.BAD_REQUEST);
    }

    // check buck name
    let bucket_name = appSettings.r2.bucketName || '';

    return await uploadFileR2(mediaFile, fieldname);
  }

  // async deleteMedia(id: string, tenant_id?: string) {

  //   const deletedMedia = await this.findOne(id, [], tenant_id);
  //   if (!deletedMedia) {
  //     throw new HttpException('Media not found', HttpStatus.NOT_FOUND);
  //   }
  //   if (storage_type === 'minio') {
  //     await this.minioClientService.deleteFile(deletedMedia.filename);
  //   } else if (storage_type === 'r2') {
  //     await this.r2ClientService.deleteFile(deletedMedia.filename);
  //   }
  //   return await this.hardDelete(id);
  // }

  private generateFileName(title: string): string {
    let file_extension = extname(title);
    return `${uuidv4()}${file_extension}`;
  }

}
