import {
  Column,
  Entity,
  Generated,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Validate } from 'class-validator';
import { IsAddressRule } from '@shares/validators/IsAddressRule';
import { DEFAULT_ADDRESS } from '@constant/common';
import { Strategy } from '@components/strategy/strategy.entity';
import { Network } from '@components/network/network.entity';

@Entity({ name: 'pool' })
export class Pool {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Network, (network) => network.pools) network: Network;
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
  token0Address: string;

  @Column({
    type: String
  })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    default: 'token0',
    required: true
  })
  token0Name: string;

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
  token1Address: string;

  @Column({
    type: String
  })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    default: 'token1',
    required: true
  })
  token1Name: string;

  @Column({
    type: String
  })
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    type: String,
    default: '3000',
    required: true
  })
  fee: string;

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
  uniswapPoolAddress: string;

  @Column({
    type: Boolean,
    default: true
  })
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    type: Boolean,
    default: true,
    required: false
  })
  isActive: boolean;

  @Column({
    type: Number
  })
  @Generated('increment')
  @IsOptional()
  @IsNumber()
  @ApiProperty({
    type: Number,
    required: false
  })
  order: number;

  @OneToMany(() => Strategy, (strategy) => strategy.pool)
  strategies: Strategy[];
}
