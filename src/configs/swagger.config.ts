import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export const swaggerConfig = (app: INestApplication) => {
  const config = new DocumentBuilder()
    .setTitle(env('PROJECT_NAME'))
    .setDescription(env('PROJECT_DESCRIPTION'))
    .setVersion('1.0')
    .setContact(
      env('PROJECT_CONTACT_NAME'),
      env('PROJECT_CONTACT_URL'),
      env('PROJECT_CONTACT_EMAIL'),
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
      },
      'Access Token',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
      },
      'Refresh Token',
    )

    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup(`${env('API_PREFIX')}/docs`, app, document);
};
