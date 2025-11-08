import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { AuthRequestDto } from './dto/request.dto';
import { REDIS_CONNECT_COMMON } from 'src/_core/config/database/redis';
import { users } from 'src/_core/config/database/postgres/schema';
import { db_client } from 'src/_core/config/database/postgres/drizzle';

@Injectable()
export class AuthService {

  constructor(
    private readonly jwtService: JwtService,
  ) { }
  async login(email: string, password: string): Promise<any> {
    const user = await db_client.select().from(users).where(eq(users.email, email)).limit(1).then(res => res[0]) as any;
    if (!user)
      throw new HttpException('Us not found', HttpStatus.NOT_FOUND);
    if (
      !bcrypt.compareSync(password, user.password) ||
      user.is_active === false
    )
      throw new HttpException(
        'User info is not valid',
        HttpStatus.BAD_REQUEST,
      );
    let accessToken = await this.jwtService.signAsync({
      ...user,
      password: undefined,
      hashKey: await this.assignToken(),
    });
    return {
      accessToken,
      user: {
        ...user,
        password: undefined,
      },
    };
  }

  async logout(user_decoded: any): Promise<void> {
    await this.removeToken(user_decoded.hashKey);
  }

  async register(data: AuthRequestDto.RegisterDataDto): Promise<any> {
    const account = await db_client.select().from(users).where(eq(users.email, data.email)).limit(1).then(res => res[0]) as any;
    if (account)
      throw new HttpException('User is exist', HttpStatus.BAD_REQUEST);
    data.password = await this.hashPassword(data.password);
    const result = await db_client.insert(users).values(data).returning().then(res => res[0]) as any;
    result.password = undefined;  
    return result;
  }

  async hashPassword(password: string): Promise<string> {
    return bcrypt.hashSync(password, 10);
  }

  async assignToken(): Promise<string> {
    const hashKey = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    await REDIS_CONNECT_COMMON.setex(":token-session:" + hashKey, 60 * 60 * 24 * 7, 'true');
    return hashKey;
  }

  async removeToken(key: string): Promise<void> {
    await REDIS_CONNECT_COMMON.del(":token-session:" + key);
  }

  async validateToken(key: string): Promise<boolean> {
    const result = await REDIS_CONNECT_COMMON.get(":token-session:" + key);
    return result ? true : false;
  }

}
