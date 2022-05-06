import { Module } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CommentController } from './comment.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ArticleEntity } from '@app/article/article.entity';
import { CommentEntity } from './comment.entity';
import { ArticleModule } from '@app/article/article.module';

@Module({
  imports: [ArticleModule, TypeOrmModule.forFeature([CommentEntity, ArticleEntity])],
  providers: [CommentService],
  controllers: [CommentController]
})
export class CommentModule {}
