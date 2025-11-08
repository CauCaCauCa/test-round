import { Injectable } from '@nestjs/common';
import * as schema from '../../../config/database/postgres/schema';
import { BaseCrudService } from 'src/_core/common/base/service.base';

@Injectable()
export class NewsService extends BaseCrudService {

  constructor() {
    super(schema.news, schema.news.id);
  }

}
