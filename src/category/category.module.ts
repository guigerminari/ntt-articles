import { Module } from '@nestjs/common';
import { CategoryService } from './category.service';
import { CategoryController } from './category.controller';
import { CategoryStorageRepository } from '../infrastructure/persistence/category-storage.repository';
import { CATEGORY_REPOSITORY } from '../domain/category/category.repository.interface';

@Module({
  controllers: [CategoryController],
  providers: [
    CategoryService,
    {
      provide: CATEGORY_REPOSITORY,
      useClass: CategoryStorageRepository,
    },
  ],
  exports: [CATEGORY_REPOSITORY],
})
export class CategoryModule {}
