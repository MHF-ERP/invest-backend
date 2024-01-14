import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { ResponseService } from 'src/globals/services/response.service';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private responses: ResponseService;
  catch(exception: HttpException, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse();
    const responses = new ResponseService();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const error = exception['response']['error'];
      const message = exception['response']['message'];

      switch (status) {
        case 500:
          console.log(exception);
          responses.internalServerError(response);
          break;
        case 400:
          if (Array.isArray(message)) {
            responses.badRequest(response, message[0], error);
            break;
          }
          responses.badRequest(response, message, error);
          break;
        case 401:
          responses.unauthorized(response, message);
          break;
        case 403:
          responses.forbidden(response, message);
          break;
        case 404:
          responses.notFound(response, message);
          break;
        case 409:
          responses.conflict(response, message);
          break;
        case 413:
          responses.badRequest(response, message);
          break;
        case 422:
          responses.unProcessableData(response, message, error);
          break;
        default:
          console.log(exception);
          break;
      }
    } else {
      console.log(exception);
      responses.internalServerError(response);
    }
  }
}
