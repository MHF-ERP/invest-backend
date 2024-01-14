import { Global, Module } from '@nestjs/common';
import { ResponseService } from './services/response.service';
import { PrismaService } from './services/prisma.service';
@Global()
@Module({
  imports: [],
  providers: [ResponseService, PrismaService],
  exports: [ResponseService, PrismaService],
})
export class GlobalModule {}
