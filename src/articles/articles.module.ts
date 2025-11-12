import { Module } from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { ArticlesController } from './articles.controller';
import { ArticleStorageRepository } from '../infrastructure/persistence/article-storage.repository';
import { ARTICLE_REPOSITORY } from '../domain/articles/article.repository.interface';
import { StorageModule } from '../infrastructure/storage/storage.module';
import { CategoryModule } from '../category/category.module';

@Module({
  imports: [StorageModule, CategoryModule],
  controllers: [ArticlesController],
  providers: [
    ArticlesService,
    {
      provide: ARTICLE_REPOSITORY,
      useClass: ArticleStorageRepository,
    },
  ],
})
export class ArticlesModule {}
