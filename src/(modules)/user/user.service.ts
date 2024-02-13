import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, UserStatus } from '@prisma/client';
import { PrismaService } from 'src/globals/services/prisma.service';
import {
  hashPassword,
  validateUserPassword,
} from 'src/helpers/password.helpers';
import { HandelFiles } from '../media/helpers/handel-files';
import { UserIdInfoDTO } from './dto/create/id-info.dto';
import { UserPersonalInfoDTO } from './dto/create/personal-info.dto';
import { UserPinCodeDTO } from './dto/create/set-bin.dto';
import { PlainUserSelect } from './user.prisma.args';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async init(data: Prisma.UserCreateInput) {
    const existUser = await this.validateUniqueValues(data);
    if (
      existUser &&
      existUser.status !== UserStatus.ACTIVE &&
      existUser.status !== UserStatus.BLOCKED
    ) {
      validateUserPassword(data.password, existUser.password);
      return existUser;
    }

    if (existUser) throw new ConflictException('Email already exists');

    data.password = hashPassword(data.password);
    const user = await this.prisma.user.create({ data });
    return user;
  }

  // ----------------------------------------------------------------------------------------------

  async uploadPersonalInfo(id: Id, body: UserPersonalInfoDTO) {
    await this.prisma.user.update({
      where: { id },
      data: { ...body, status: UserStatus.ID_VERIFICATION },
    });
  }

  // ----------------------------------------------------------------------------------------------

  async uploadIdInfo(id: Id, file: Express.Multer.File, body: UserIdInfoDTO) {
    const { nationalId } = body;
    const nationalIdAlreadyExist = await this.prisma.user.findUnique({
      where: { nationalId },
    });
    if (nationalIdAlreadyExist && id !== nationalIdAlreadyExist['id'])
      throw new ConflictException('NationalID already exists');
    const handelFiles = new HandelFiles(id);
    HandelFiles.generatePath(file, body, id);
    await this.prisma.user.update({
      where: { id },
      data: body,
    });
    handelFiles.handelFileTemp(file);

    await this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.PIN_SETUP },
    });
  }

  async uploadIdInfoWithoutImg(id: Id, body: UserIdInfoDTO) {
    const { nationalId } = body;
    const nationalIdAlreadyExist = await this.prisma.user.findUnique({
      where: { nationalId },
    });
    if (nationalIdAlreadyExist && id !== nationalIdAlreadyExist['id'])
      throw new ConflictException('NationalID already exists');
    await this.prisma.user.update({
      where: { id },
      data: body,
    });

    await this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.PIN_SETUP },
    });
  }

  // ----------------------------------------------------------------------------------------------

  async setPin(id: Id, body: UserPinCodeDTO) {
    body.pinCode = hashPassword(body.pinCode);
    await this.prisma.user.update({
      where: { id },
      data: { ...body, status: UserStatus.ACTIVE },
    });
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  }

  // ----------------------------------------------------------------------------------------------

  async getProfile(userId: Id) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: PlainUserSelect,
    });
    return user;
  }

  // ----------------------------------------------------------------------------------------------

  private async returnExist(idOrEmail: Id | string) {
    const user = await this.prisma.user.findFirst({
      where: {
        OR: [{ id: idOrEmail }, { email: idOrEmail }],
      },
    });

    return user;
  }

  // ----------------------------------------------------------------------------------------------

  private async isExist(idOrEmail: Id | string) {
    const user = await this.returnExist(idOrEmail);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // ----------------------------------------------------------------------------------------------

  private async validateUniqueValues(
    {
      email,
    }: {
      email?: string;
    },
    mine?: {
      email?: string;
    },
  ) {
    if (email && email !== mine?.email) {
      return await this.prisma.user.findUnique({
        where: { email },
      });
    }
  }
}
