import { User } from '@app/user/decorators/user.decorator';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { UserEntity } from '@app/user/user.entity';
import {
    Body, Controller, Delete,
    Get, Param, Post, Put, 
    Query, 
    UseGuards, UsePipes, ValidationPipe
} from '@nestjs/common';
import { DeleteResult } from 'typeorm';
import { ArticleService } from './article.service';
import { CreateArticleDto } from './dto/createArticle.dto';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';

@Controller('articles')
export class ArticleController {
    constructor(
        private readonly articleService: ArticleService,
    ) {}

    @Get()
    async findAll(
        @User('id') currentUserId: number,
        @Query() query: any,
    ): Promise<ArticlesResponseInterface> {
        return await this.articleService.findAll(currentUserId, query);
    }

    @Get('feed')
    @UseGuards(AuthGuard)
    async getFeed(
        @User('id') currentUserId: number,
        @Query() query: any,
    ): Promise<ArticlesResponseInterface> {
        return await this.articleService.getFeed(currentUserId, query);
    }

    @Post()
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe())
    async create(
        @User() currentUser: UserEntity,
        @Body('article') createArticleDto: CreateArticleDto,
    ): Promise<ArticleResponseInterface> {
        const article = await this.articleService.createArticle(currentUser, createArticleDto);
        return this.articleService.buildArticleResponse(article);
    }

    @Put(':slug')
    @UseGuards(AuthGuard)
    @UsePipes(new ValidationPipe())
    async update(
        @User('id') currentUserId: number,
        @Body('article') updateArticleDto: CreateArticleDto,
        @Param('slug') slug: string,
    ) {
        const article = await this.articleService.updateArticle(
            currentUserId, updateArticleDto, slug
        );
        return this.articleService.buildArticleResponse(article);
    }

    @Get(':slug')
    async getArticleBySlug(
        @Param('slug') slug: string,
    ): Promise<ArticleResponseInterface> {
        const article = await this.articleService.getArticleBySlug(slug);
        return this.articleService.buildArticleResponse(article);
    }

    @Delete(':slug')
    @UseGuards(AuthGuard)
    async deleteArticle(
        @User('id') currentUserId: number,
        @Param('slug') slug: string,
    ): Promise<DeleteResult> {
        return await this.articleService.deleteArticle(slug, currentUserId);
    }

    @Post(':slug/favorite')
    @UseGuards(AuthGuard)
    async addArticleToFavorites(
        @User('id') currentUserId: number,
        @Param('slug') slug: string,
    ): Promise<ArticleResponseInterface> {
        const article = await this.articleService.addArticleToFavorites(
            slug,
            currentUserId,
        );
        return this.articleService.buildArticleResponse(article);
    }

    @Delete(':slug/favorite')
    @UseGuards(AuthGuard)
    async deleteArticleFromFavorites(
        @User('id') currentUserId: number,
        @Param('slug') slug: string,
    ): Promise<ArticleResponseInterface> {
        const article = await this.articleService.deleteArticleFromFavorites(
            slug,
            currentUserId,
        );
        return this.articleService.buildArticleResponse(article);
    }
}
