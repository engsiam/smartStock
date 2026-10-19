import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsArray,
  ValidateNested,
  Min,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSaleItemDto {
  @ApiProperty({ example: 'prod_id_here' })
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @ApiProperty({ example: 2, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  @IsOptional()
  qty?: number;

  @ApiProperty({ example: 2, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  @IsOptional()
  quantity?: number;

  @ApiProperty({ example: 240.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice!: number;

  @ApiProperty({ example: 0, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number = 0;
}

export class CreateSaleDto {
  @ApiProperty({ example: 'cust_alamin_01', required: false })
  @IsString()
  @IsOptional()
  customerId?: string;

  @ApiProperty({ type: [CreateSaleItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSaleItemDto)
  items!: CreateSaleItemDto[];

  @ApiProperty({ example: 0, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  discount?: number = 0;

  @ApiProperty({ enum: ['CASH', 'BKASH', 'NAGAD', 'BANK', 'CARD', 'OTHER'], default: 'CASH' })
  @IsString()
  @IsIn(['CASH', 'BKASH', 'NAGAD', 'BANK', 'CARD', 'OTHER'])
  @IsOptional()
  paymentMethod?: string = 'CASH';

  @ApiProperty({ example: 480.0, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  paidAmount?: number;

  @ApiProperty({ example: 480.0, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  amountPaid?: number;

  @ApiProperty({ example: 'POS counter sale', required: false })
  @IsString()
  @IsOptional()
  note?: string;

  @ApiProperty({ example: 'POS counter sale', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ example: 'pos-txn-uuid', required: false })
  @IsString()
  @IsOptional()
  idempotencyKey?: string;
}
