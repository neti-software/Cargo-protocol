import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsString, Max, Min, Validate, IsOptional } from 'class-validator';
import { IsAddressRule } from '@shares/validators/IsAddressRule';
import { DEFAULT_ADDRESS } from '@constant/common';
import { Pool } from '@components/pool/pool.entity';

@Entity({ name: 'strategy' })
export class Strategy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Pool, (pool) => pool.strategies) pool: Pool;
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
  poolId: string;

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
    default: 'Low risk',
    required: true
  })
  name: string;

  @Column({
    type: Number
  })
  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(100)
  @ApiProperty({
    type: Number,
    default: 90,
    minimum: 1,
    maximum: 100,
    required: true
  })
  rangePercentage: number;

  @Column()
  @IsNotEmpty()
  @ApiProperty({
    required: true,
    default: '10 hours'
  })
  executionPeriod: string;

  @Column()
  lastExecutionTimestamp: Date;

  @Column({
    type: String
  })
  @IsOptional()
  @IsString()
  @ApiProperty({
    type: String,
    default: DEFAULT_ADDRESS,
    required: false
  })
  stakingProtocolAddress: string;

  @Column({
    type: String
  })
  @IsOptional()
  @ApiProperty({
    type: String
  })
  feesWeekly: string;

  @Column({
    type: String
  })
  @IsOptional()
  @ApiProperty({
    type: String
  })
  totalFeesWeekly: string;

  @Column({
    type: String
  })
  @IsOptional()
  @ApiProperty({
    type: String
  })
  feesAnnual: string;

  @Column({
    type: String
  })
  @IsOptional()
  @ApiProperty({
    type: String
  })
  totalFeesAnnual: string;

  @Column({
    type: Number
  })
  @IsOptional()
  @ApiProperty({
    type: Number
  })
  apy: number;

  @Column({
    type: String
  })
  @IsOptional()
  @ApiProperty({
    type: String
  })
  apyAnnual: string;
}
