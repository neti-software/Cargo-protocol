import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsOptional, IsString, Validate } from 'class-validator';
import { IsAddressRule } from '@shares/validators/IsAddressRule';
import { DEFAULT_ADDRESS } from '@constant/common';
import { Pool } from '@components/pool/pool.entity';
import { Token } from '@components/token/token.entity';

export enum TransportProtocol {
  HTTPS = 'https',
  WSS = 'wss'
}

@Entity({ name: 'network' })
export class Network {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: String
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    required: true,
    default: 'Celo'
  })
  name: string;

  @Column({
    type: String
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    required: true,
    default: 'Uniswap'
  })
  platform: string;

  @Column({
    type: String
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    required: true,
    default: 'https://forno.celo.org'
  })
  networkUrl: string;

  @Column({
    type: String
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    required: true,
    default: 'https://forno.celo.org'
  })
  rpcUrl: string;

  @Column({
    type: String
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    required: true,
    default: '0000'
  })
  chainId: string;

  @Column({
    type: 'enum',
    enum: TransportProtocol
  })
  @IsEnum(TransportProtocol)
  @IsNotEmpty()
  @ApiProperty({
    type: 'enum',
    enum: TransportProtocol,
    default: TransportProtocol.HTTPS,
    required: true
  })
  transportProtocol: TransportProtocol;

  @Column({
    type: String
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    default: DEFAULT_ADDRESS,
    required: true
  })
  @Validate(IsAddressRule)
  cargoServiceAddress: string;

  @Column({
    type: String
  })
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    type: String,
    required: true,
    default: 'https://api.thegraph.com/subgraphs/name/jesse-sawa/uniswap-celo'
  })
  graphqlUrl: string;

  @Column({
    type: Boolean,
    default: false
  })
  @IsOptional()
  @IsBoolean()
  @ApiProperty({
    type: Boolean,
    default: false,
    required: false
  })
  isActive: boolean;

  @Column()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    default: '10 hours'
  })
  executionPeriod: string;

  @Column()
  lastExecutionTimestamp: Date;

  @OneToMany(() => Pool, (pool) => pool.network)
  pools: Pool[];

  @OneToMany(() => Token, (token) => token.network)
  tokens: Token[];
}
