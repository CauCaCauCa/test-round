import { Global, Module } from '@nestjs/common';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { appSettings } from 'src/_core/config/appsettings';

@Global()
@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: appSettings.jwtSecret,
      signOptions: { expiresIn: appSettings.expireIn , algorithm: 'HS256' } as JwtSignOptions,
    }),
  ],
  controllers: [AuthController],
  providers: [
    {
      provide: 'AUTH_SERVICE_TIENNT',
      useClass: AuthService,
    },
  ],
  exports: [
    {
      provide: 'AUTH_SERVICE_TIENNT',
      useClass: AuthService,
    },
  ],
})
export class AuthModule { }
