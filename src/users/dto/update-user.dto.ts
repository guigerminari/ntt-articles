import { IsEmail, IsOptional, IsString, MinLength, IsUUID } from 'class-validator';

export class UpdateUserDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;

  @IsUUID()
  @IsOptional()
  permissionId?: string;
}
