import { ApiProperty } from '@nestjs/swagger';
import { IsAddressRule } from '@shares/validators/IsAddressRule';
import {
  IsDefined,
  IsNotEmpty,
  IsNotEmptyObject,
  IsObject,
  IsString,
  Validate,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

class MsgDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  nonce: string;
}

export class LoginDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Validate(IsAddressRule)
  address: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  signature: string;

  @IsDefined()
  @IsNotEmptyObject()
  @IsObject()
  @ValidateNested()
  @Type(() => MsgDto)
  msg!: MsgDto;
}

export class LoginResponseDto {
  @ApiProperty()
  token: string;
}

export class GetNonceDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @Validate(IsAddressRule)
  address: string;
}

export class NonceResponseDto {
  @ApiProperty()
  nonce: string;
}

export class CheckRoleResponseDto {
  @ApiProperty()
  role: string;
}
