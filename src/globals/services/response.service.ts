import { HttpStatus, Injectable } from '@nestjs/common';
import { Response } from 'express';

@Injectable()
export class ResponseService {
  constructor() {}

  success<Type>(
    response: Response,
    message: string,
    data?: Type | Type[] | null,
    total?: number,
    code?: number,
  ) {
    response.status(code || HttpStatus.OK).json({
      type: 'Success',
      message,
      data,
      total,
    });
  }
  created(response: Response, message: string, data?: object) {
    response.status(HttpStatus.CREATED).json({
      type: 'Created',
      message,
      data,
    });
  }
  forbidden(response: Response, message: string) {
    return response
      .status(HttpStatus.FORBIDDEN)
      .json({ type: 'Forbidden', message });
  }
  conflict(response: Response, message: string, data?: object, type?: string) {
    return response.status(HttpStatus.CONFLICT).json({
      type: type || 'Conflict has occurred',
      message,
      data: data,
    });
  }
  notFound(response: Response, message: string) {
    return response
      .status(HttpStatus.NOT_FOUND)
      .json({ type: 'NotFound', message });
  }
  internalServerError(response: Response) {
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      type: 'InternalServerError',
      message: 'An error has been occurred, Please try again later.',
    });
  }
  unauthorized(response: Response, message?: string) {
    return response.status(HttpStatus.UNAUTHORIZED).json({
      type: 'Unauthorized',
      message: message || 'Authentication Required',
    });
  }
  badRequest(response: Response, message: string, type?: string) {
    return response
      .status(HttpStatus.BAD_REQUEST)
      .json({ type: type || 'validation error', message });
  }
  unProcessableData(response: Response, message: string, type?: string) {
    return response
      .status(HttpStatus.UNPROCESSABLE_ENTITY)
      .json({ type: type || 'invalid Data', message });
  }
}
