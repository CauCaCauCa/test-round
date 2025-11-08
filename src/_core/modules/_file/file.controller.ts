import { FileInterceptor, UploadedFile } from '@blazity/nest-file-fastify';
import type { MemoryStorageFile } from '@blazity/nest-file-fastify';
import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpException,
  Inject,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiConsumes, ApiQuery, ApiTags } from '@nestjs/swagger';
import { MODULE_VERSION } from '../version.config';
import { FileService } from './file.service';

@ApiTags(`file v${MODULE_VERSION}`)
@Controller({
  version: MODULE_VERSION,
  path: 'file',
})
export class FileController {
  constructor(
    @Inject() readonly fileService: FileService
  ) { }

  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        'media[0][title]': { type: 'string' },
        'media[0][alt]': { type: 'string' },
        'media[0][file]': {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('media[0][file]', {
      limits: {
        fileSize: 1024 * 1024 * 2048, // 2gb
      },
    })
  )
  @Post()
  async uploadFile(
    @Body() data: any,
    @UploadedFile() file: MemoryStorageFile,
    @Headers('user') user: any,
    @Headers('x-tenant-id') tenant_id: any
  ) {
    if (!file || !file.buffer) {
      throw new HttpException('File not found', 400);
    }
    data.title = data['media[0][title]'];
    data.alt = data['media[0][alt]'];
    return this.fileService.createMedia(data, file, user);
  }


  // @ApiBearerAuth()
  // @Delete()
  // async forceDelete(
  //   @Query('ids') ids: string,
  //   @Headers('user') user: any,
  //   @Headers('x-tenant-id') tenant_id: any
  // ) {
  //   let ids_handled = ids.split(',');
  //   for (let i = 0; i < ids_handled.length; i++) {
  //     let id = ids_handled[i];
  //     await this.fileService.deleteMedia(id, tenant_id);
  //   }
  //   return {
  //     message: 'Delete success',
  //   };
  // }

}
