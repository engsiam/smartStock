import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSupplierDto {
  @ApiProperty({ example: 'City Group Distribution Ltd.' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: '+8801711000001', required: false })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiProperty({ example: 'sales@citygroup.bd', required: false })
  @IsString()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'Kawran Bazar, Dhaka', required: false })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiProperty({ example: 0, required: false })
  @Type(() => Number)
  @IsNumber()
  @IsOptional()
  openingBalance?: number = 0;
}

export class CreatePurchaseItemDto {
  @ApiProperty({ example: 'prod_id_here' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 20, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  @IsOptional()
  qty?: number;

  @ApiProperty({ example: 20, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  @IsOptional()
  quantity?: number;

  @ApiProperty({ example: 210.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitCost!: number;
}

export class CreatePurchaseDto {
  @ApiProperty({ example: 'sup_city_group_01', required: false })
  @IsString()
  @IsOptional()
  supplierId?: string;

  @ApiProperty({ type: [CreatePurchaseItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePurchaseItemDto)
  items!: CreatePurchaseItemDto[];

  @ApiProperty({ example: 0, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number = 0;

  @ApiProperty({ example: 'Urgent restocking order', required: false })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ example: 'Urgent restocking order', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: '2026-10-25', required: false })
  @IsString()
  @IsOptional()
  expectedDate?: string;

  @ApiProperty({ example: 'po-txn-uuid', required: false })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}
