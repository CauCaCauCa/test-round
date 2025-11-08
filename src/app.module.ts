import { Module } from '@nestjs/common';
import { CoreModule } from './_core/core.module';
import { AddonsModule } from './addons/addons.module';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { ResponseInterceptor } from './_core/common/interceptors/response.interceptor';
import { AllExceptionsFilter } from './_core/common/exceptions/catch.exception';
import { TrackingRequestInterceptor } from './_core/common/interceptors/tracking-request.interceptor';
import { appSettings } from './_core/config/appsettings';

const DEV_INTERCEPTORS = appSettings.development ? [{
  provide: APP_INTERCEPTOR,
  useClass: TrackingRequestInterceptor,
}] : [];

@Module({
  imports: [
    CoreModule,
    AddonsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    ...DEV_INTERCEPTORS,
  ],
})
export class AppModule { }
