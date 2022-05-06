import { ArticleService } from '@app/article/article.service';
import { BackendValidationPipe } from '@app/shared/pipes/backendValidation.pipe';
import { User } from '@app/user/decorators/user.decorator';
import { AuthGuard } from '@app/user/guards/auth.guard';
import { UserEntity } from '@app/user/user.entity';
import { Body, Controller, Get, Param, Post, UseGuards, UsePipes } from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/createComment.dto';
import { CommentResponseInterface } from './types/commentResponse.interface';
import { CommentsResponseInterface } from './types/commentsResponse.interface';

@Controller('articles/:slug/comments')
export class CommentController {
    constructor(
        private readonly commentsService: CommentService,
        private readonly articleService: ArticleService,
    ) {}

    @Post()
    @UseGuards(AuthGuard)
    @UsePipes(new BackendValidationPipe())
    async addComment(
        @User() currentUser: UserEntity,
        @Body('comment') createCommentDto: CreateCommentDto,
        @Param('slug') slug: string,
    ): Promise<CommentResponseInterface> {
        const article = await this.articleService.getArticleBySlug(slug);
        const comment = await this.commentsService.createComment(currentUser, article, createCommentDto);
        return this.commentsService.buildCommentResponse(comment);
    }

    @Get()
    async getComments(
        @Param('slug') slug: string,
    ): Promise<CommentsResponseInterface> {
        return await this.commentsService.getComments(slug);
    }
}
