import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ArticlesModule } from './articles/articles.module';
import { PermissionsModule } from './permissions/permissions.module';
import { StorageModule } from './infrastructure/storage/storage.module';
import { AppController } from './app.controller';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    StorageModule,
    AuthModule,
    UsersModule,
    ArticlesModule,
    PermissionsModule,
    CategoryModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
