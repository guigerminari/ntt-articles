import { User } from '../../users/entities/user.entity';
import { CreateUserDto } from '../../users/dto/create-user.dto';
import { UpdateUserDto } from '../../users/dto/update-user.dto';

export interface IUserRepository {
  create(createUserDto: CreateUserDto): Promise<User>;
  findAll(): Promise<User[]>;
  findOne(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  update(id: string, updateUserDto: UpdateUserDto): Promise<User>;
  remove(id: string): Promise<void>;
}

export const USER_REPOSITORY = Symbol('IUserRepository');
