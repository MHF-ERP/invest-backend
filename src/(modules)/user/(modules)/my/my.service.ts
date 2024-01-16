import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/globals/services/prisma.service';

@Injectable()
export class MyService {
  constructor(private prisma: PrismaService) {}
}
