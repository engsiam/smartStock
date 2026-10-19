import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles, CurrentBusiness } from '../auth/decorators/auth.decorators';
import { BusinessRole } from '@prisma/client';
import { IsNotEmpty, IsString } from 'class-validator';

class CategoryDto {
  @IsString()
  @IsNotEmpty()
  name!: string;
}

@ApiTags('Categories')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'List all product categories for current business' })
  async findAll(@CurrentBusiness() businessId: string) {
    return this.categoriesService.findAll(businessId);
  }

  @Post()
  @Roles(BusinessRole.OWNER, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Create a new category' })
  async create(
    @CurrentBusiness() businessId: string,
    @Body() dto: CategoryDto,
  ) {
    return this.categoriesService.create(businessId, dto.name);
  }

  @Put(':id')
  @Roles(BusinessRole.OWNER, BusinessRole.STAFF)
  @ApiOperation({ summary: 'Update a category' })
  async update(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
    @Body() dto: CategoryDto,
  ) {
    return this.categoriesService.update(businessId, id, dto.name);
  }

  @Delete(':id')
  @Roles(BusinessRole.OWNER)
  @ApiOperation({ summary: 'Delete a category' })
  async delete(
    @CurrentBusiness() businessId: string,
    @Param('id') id: string,
  ) {
    return this.categoriesService.delete(businessId, id);
  }
}
