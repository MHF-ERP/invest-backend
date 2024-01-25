import { Prisma } from '@prisma/client';

export const JoinedUserDataSelect = {
  id: true,
  name: true,
  email: true,
  phone: true,
  gender: true,
  dob: true,
  image: true,
} satisfies Prisma.UserSelect;

export const UserDataSelect = {
  ...JoinedUserDataSelect,
} satisfies Prisma.UserSelect;

export const PlainUserSelect = {
  ...UserDataSelect,
  status: true,
} satisfies Prisma.UserSelect;

export const UsersSelect = {
  ...PlainUserSelect,
} satisfies Prisma.UserSelect;

export const UserSelect = {
  ...UsersSelect,
} satisfies Prisma.UserSelect;

export const joinedUserArgs = {
  select: JoinedUserDataSelect,
} satisfies Prisma.UserFindManyArgs;
