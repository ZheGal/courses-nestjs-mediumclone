import { ArticleEntity } from '@app/article/article.entity';
import { UserEntity } from '@app/user/user.entity';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { getRepository, Repository } from 'typeorm';
import { CommentEntity } from './comment.entity';
import { CreateCommentDto } from './dto/createComment.dto';
import { CommentResponseInterface } from './types/commentResponse.interface';
import { CommentsResponseInterface } from './types/commentsResponse.interface';

@Injectable()
export class CommentService {
    constructor(
        @InjectRepository(CommentEntity)
        private readonly commentRepository: Repository<CommentEntity>,
    ) {}

    async createComment(
        currentUser: UserEntity,
        article: ArticleEntity,
        createCommentDto: CreateCommentDto
    ) {
        const comment = new CommentEntity()
        Object.assign(comment, createCommentDto);

        comment.article = article;
        comment.author = currentUser;

        return await this.commentRepository.save(comment);
    }

    async getComments(slug: string): Promise<CommentsResponseInterface> {
        const queryBuilder = getRepository(CommentEntity)
            .createQueryBuilder('comments')
            .leftJoinAndSelect('comments.article', 'article')
            .leftJoinAndSelect('comments.author', 'author')
            .andWhere('article.slug = :slug', { slug });
        queryBuilder.orderBy('comments.createdAt', 'DESC');

        const comments = await queryBuilder.getMany();

        comments.map(comment => {
            delete comment.article;
            delete comment.author.id;
            delete comment.author.email;
        });

        return { comments };
    }

    buildCommentResponse(comment: CommentEntity): CommentResponseInterface {
        delete comment.article;
        delete comment.author.email;
        return { comment };
    }
}
