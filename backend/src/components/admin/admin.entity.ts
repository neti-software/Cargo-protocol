import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { IsAddressRule } from '@shares/validators/IsAddressRule';

@Entity({ name: 'admin' })
export class Admin {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: String,
    unique: true
  })
  @IsNotEmpty()
  @IsString()
  @Validate(IsAddressRule)
  @ApiProperty({
    type: String,
    required: true
  })
  address: string;

  @Column({
    type: String,
    unique: true
  })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    required: true
  })
  name: string;

  @Column({
    type: String
  })
  nonce: string;

  @Column({
    type: 'timestamp'
  })
  nonceTimestamp: Date;

  @Column({
    type: String
  })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    required: true
  })
  role: string;
}
