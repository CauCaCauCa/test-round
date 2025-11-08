import { Inject, Injectable } from '@nestjs/common';
import * as schema from '../../../config/database/postgres/schema';
import { BaseCrudService } from 'src/_core/common/base/service.base';
import { AuthService } from '../../_auth/auth.service';

@Injectable()
export class UserService extends BaseCrudService {

  constructor(
    @Inject("AUTH_SERVICE_TIENNT")
    private readonly authService: AuthService,
  ) {
    super(schema.users, schema.users.id);
  }

  // Overwrite create function to hash password before saving
  async create(data: any) {
    if (data.password) {
      data.password = await this.authService.hashPassword(data.password);
    }
    return super.create(data);
  }

  // Overwrite update function to hash password before updating
  async update(id: number, data: any) {
    if (data.password) {
      data.password = await this.authService.hashPassword(data.password);
    }
    return super.update(id, data);
  }
  
}
