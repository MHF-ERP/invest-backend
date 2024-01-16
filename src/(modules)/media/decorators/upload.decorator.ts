import {
  applyDecorators,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import {
  FileFieldsInterceptor,
  FileInterceptor,
} from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import * as path from 'path';
import { v4 } from 'uuid';
import { UploadTypes } from '../configs/upload.config';

const uploadOptions = (filePath: string, type?: UploadTypes) => {
  const uploadTypes = (file) => {
    switch (type !== 'many' ? type : file.fieldname) {
      case 'image':
        return {
          condition: !Boolean(file.mimetype.match(/(jpg|jpeg|png|heif)/)),
          message: 'image should be jpg|jpeg|png only',
        };
      case 'video':
        return {
          condition: !Boolean(file.mimetype.match(/(mp4|webm|ogg|mov)/)),
          message: 'video should be mp4|webm|ogg|mov only',
        };
      default:
        return {
          condition: !Boolean(
            file.mimetype.match(/(jpg|jpeg|png|heif|mp4|webm|ogg|mov)/),
          ),
          message: 'file should be jpg|jpeg|png|mp4|webm|ogg|mov only',
        };
    }
  };

  let fileKey = '';
  let fileCondition = false;
  let fileMessage = '';

  const uploadOptions = {
    fileFilter: (req, file, callback) => {
      const { condition, message } = uploadTypes(file);
      fileCondition = condition;
      fileMessage = message;
      fileKey = file.fieldname;
      if (fileCondition) callback(new BadRequestException(fileMessage), false);
      callback(null, true);
    },
    // limits: { fileSize: 1024 * 1024 },

    storage: diskStorage({
      filename(req, file, callback) {
        let fileName = '';
        if (type === 'many')
          fileName =
            env('TEMP_FILE_KEY') +
            fileKey +
            '-' +
            v4() +
            path.extname(file.originalname);
        else
          fileName =
            env('TEMP_FILE_KEY') + v4() + path.extname(file.originalname);
        callback(null, fileName);
      },

      destination(req, file, callback) {
        const uploadPath = `${env('UPLOADS_PATH')}/${filePath}`;
        if (!existsSync(env('UPLOADS_PATH'))) {
          mkdirSync(env('UPLOADS_PATH'));
        }
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath, { recursive: true });
        }
        callback(null, uploadPath);
      },
    }),
  };

  return uploadOptions;
};

export const UploadImage = (imagePath: string, key = 'image') => {
  return applyDecorators(
    UseInterceptors(FileInterceptor(key, uploadOptions(imagePath))),
    ApiConsumes('multipart/form-data'),
  );
};

export const UploadVideo = (videoPath: string, key = 'video') => {
  return applyDecorators(
    UseInterceptors(FileInterceptor(key, uploadOptions(videoPath))),
  );
};

export const UploadMany = (
  keys: {
    name: string;
    maxCount: number;
  }[],
  filesPath: string,
  type?: UploadTypes,
) => {
  const uploadManyOptions = keys.map((key) => ({
    name: key.name,
    maxCount: key.maxCount,
  }));

  return applyDecorators(
    UseInterceptors(
      FileFieldsInterceptor(
        uploadManyOptions,
        uploadOptions(filesPath, type || 'many'),
      ),
    ),
    ApiConsumes('multipart/form-data'),
  );
};
