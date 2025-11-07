import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../auth/guards/permissions.guard';
import { RequirePermissions } from '../auth/decorators/permissions.decorator';

@Controller('articles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @Post()
  @RequirePermissions('Admin', 'Editor')
  create(@Body() createArticleDto: CreateArticleDto, @Request() req) {
    return this.articlesService.create(createArticleDto, req.user.id);
  }

  @Get()
  @RequirePermissions('Admin', 'Editor', 'Reader')
  findAll() {
    return this.articlesService.findAll();
  }

  @Get(':id')
  @RequirePermissions('Admin', 'Editor', 'Reader')
  findOne(@Param('id') id: string) {
    return this.articlesService.findOne(id);
  }

  @Patch(':id')
  @RequirePermissions('Admin', 'Editor')
  update(@Param('id') id: string, @Body() updateArticleDto: UpdateArticleDto) {
    return this.articlesService.update(id, updateArticleDto);
  }

  @Delete(':id')
  @RequirePermissions('Admin', 'Editor')
  remove(@Param('id') id: string) {
    return this.articlesService.remove(id);
  }
}
