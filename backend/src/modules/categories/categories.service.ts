import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(businessId: string) {
    return this.prisma.category.findMany({
      where: { businessId },
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: 'asc' },
    });
  }

  async create(businessId: string, name: string) {
    const existing = await this.prisma.category.findUnique({
      where: { businessId_name: { businessId, name: name.trim() } },
    });

    if (existing) {
      throw new ConflictException(`Category "${name}" already exists`);
    }

    return this.prisma.category.create({
      data: {
        businessId,
        name: name.trim(),
      },
    });
  }

  async update(businessId: string, id: string, name: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, businessId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.category.update({
      where: { id },
      data: { name: name.trim() },
    });
  }

  async delete(businessId: string, id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, businessId },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
