import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Validate } from 'class-validator';
import { IsAddressRule } from '@shares/validators/IsAddressRule';
import { DEFAULT_ADDRESS } from '@constant/common';
import { Network } from '@components/network/network.entity';

@Entity({ name: 'token' })
export class Token {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Network, (network) => network.tokens) network: Network;
  @JoinColumn()
  @Column({
    type: String
  })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    required: true
  })
  networkId: string;

  @Column({
    type: String
  })
  @IsNotEmpty()
  @IsString()
  @Validate(IsAddressRule)
  @ApiProperty({
    type: String,
    default: DEFAULT_ADDRESS,
    required: true
  })
  address: string;

  @Column({
    type: String
  })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    default: 'token',
    required: true
  })
  name: string;

  @Column({
    type: String
  })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    default: 'red',
    required: true
  })
  color: string;
}
