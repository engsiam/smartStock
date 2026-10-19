import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsIn,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductDto {
  @ApiProperty({ example: 'TEA-ISP-400G' })
  @IsString()
  @IsNotEmpty()
  sku!: string;

  @ApiProperty({ example: 'Ispahani Mirzapore Tea 400g' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 'cat_beverages', required: false })
  @IsString()
  @IsOptional()
  categoryId?: string;

  @ApiProperty({ example: '8901030000000', required: false })
  @IsString()
  @IsOptional()
  barcode?: string;

  @ApiProperty({ example: 'Aisle 3, Shelf B', required: false })
  @IsString()
  @IsOptional()
  location?: string;

  @ApiProperty({ example: 'pcs', default: 'pcs' })
  @IsString()
  @IsOptional()
  unit?: string = 'pcs';

  @ApiProperty({ example: 240.0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sellingPrice!: number;

  @ApiProperty({ example: 210.0, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  costPrice?: number = 0;

  @ApiProperty({ example: 50.0, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  stockQty?: number = 0;

  @ApiProperty({ example: 15.0, required: false })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  reorderLevel?: number = 0;

  @ApiProperty({ example: 2, default: 3 })
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  leadTimeDays?: number = 3;
}

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  barcode?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsString()
  @IsOptional()
  unit?: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  sellingPrice?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  costPrice?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @IsOptional()
  reorderLevel?: number;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @IsOptional()
  leadTimeDays?: number;
}

export class StockAdjustmentDto {
  @ApiProperty({ enum: ['ADJUSTMENT_IN', 'ADJUSTMENT_OUT'] })
  @IsIn(['ADJUSTMENT_IN', 'ADJUSTMENT_OUT'])
  type!: 'ADJUSTMENT_IN' | 'ADJUSTMENT_OUT';

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber()
  @Min(0.001)
  quantity!: number;

  @ApiProperty({ example: 'Damaged item write-off or physical count adjustment', required: false })
  @IsString()
  @IsOptional()
  note?: string;
}
