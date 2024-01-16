import './declares';
// organize-imports-disable-above
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as cookieParser from 'cookie-parser';
import { config } from 'dotenv';
import { AppModule } from './app/app.module';
import { corsConfig } from './configs/cors.config';
import { globalValidationPipeOptions } from './configs/pipes.config';
import { swaggerConfig } from './configs/swagger.config';
import { GlobalExceptionFilter } from './filters/global.exception.filter';

const environment = process.env.NODE_ENV || 'development';
const envFileName = environment == 'production ' ? '.env.prod' : '.env';
config({ path: envFileName, override: true });

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: corsConfig });
  app.use(cookieParser(env('COOKIE_SECRET'), {}));

  app.setGlobalPrefix(env('API_PREFIX'));

  app.useGlobalPipes(new ValidationPipe(globalValidationPipeOptions));

  app.useGlobalFilters(new GlobalExceptionFilter());

  swaggerConfig(app);

  await app.listen(+env('PORT'), () => {
    console.log(`server is running on port ${env('PORT')}`);
    console.log(
      `Swagger is running on http://localhost:${env('PORT')}${env(
        'API_PREFIX',
      )}/docs`,
    );
  });
}
bootstrap();
