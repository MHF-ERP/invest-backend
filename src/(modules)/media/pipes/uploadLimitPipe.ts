import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';

@Injectable()
export class FileLimitPipe implements PipeTransform {
  transform(
    files: Express.Multer.File | Express.Multer.File[],
  ): Express.Multer.File | Express.Multer.File[] {
    if (files === undefined || files === null) {
      throw new BadRequestException('file expected');
    }

    if (Array.isArray(files) && files.length === 0) {
      throw new BadRequestException('files expected');
    }

    return files;
  }
}
