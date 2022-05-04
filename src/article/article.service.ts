import { UserEntity } from '@app/user/user.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, getRepository, Repository } from 'typeorm';
import { ArticleEntity } from './article.entity';
import { CreateArticleDto } from './dto/createArticle.dto';
import { ArticleResponseInterface } from './types/articleResponse.interface';
import slugify from 'slugify';
import { ArticlesResponseInterface } from './types/articlesResponse.interface';

@Injectable()
export class ArticleService {
    constructor(
        @InjectRepository(ArticleEntity)
        private readonly articleRepository: Repository<ArticleEntity>,
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    async findAll(currentUserId: number, query: any): Promise<ArticlesResponseInterface> {
        const queryBuilder = getRepository(ArticleEntity)
            .createQueryBuilder('articles')
            .leftJoinAndSelect('articles.author', 'author');
        queryBuilder.orderBy('articles.createdAt', 'DESC');

        const articlesCount = await queryBuilder.getCount();

        if (query.tag) {
            queryBuilder.andWhere('articles.tagList LIKE :tag', {
                tag: `%${query.tag}%`
            })
        }

        if (query.author) {
            const author = await this.userRepository.findOne({
                username: query.author
            })
            queryBuilder.andWhere('articles.author.id = :id', {
                id: author.id
            })
        }

        if (query.limit) {
            queryBuilder.limit(query.limit);
        }
       
        if (query.offset) {
            queryBuilder.offset(query.offset);
        }

        const articles = await queryBuilder.getMany();

        return { articles, articlesCount };
    }

    async createArticle(
        currentUser: UserEntity,
        createArticleDto: CreateArticleDto,
    ): Promise<ArticleEntity> {
        const article = new ArticleEntity()
        Object.assign(article, createArticleDto);

        if (!article.tagList) {
            article.tagList = [];
        }

        article.slug = this.getSlug(createArticleDto.title);
        article.author = currentUser;

        return await this.articleRepository.save(article);
    }

    async updateArticle(
        currentUserId: number,
        updateArticleDto: CreateArticleDto,
        slug: string,
    ): Promise<ArticleEntity> {
        const article = await this.getArticleBySlug(slug);

        if (article.author.id !== currentUserId) {
            throw new HttpException(
                'You are not an author',
                HttpStatus.FORBIDDEN,
            );
        }

        Object.assign(article, updateArticleDto);

        if (article.title !== updateArticleDto.title) {
            article.slug = this.getSlug(updateArticleDto.title);
        }
        
        return await this.articleRepository.save(article);
    }

    async getArticleBySlug(slug: string ): Promise<ArticleEntity> {
        const article = await this.articleRepository.findOne({ slug });

        if (!article) {
            throw new HttpException(
                'Article does not exist',
                HttpStatus.NOT_FOUND,
            );
        }

        return article;
    }

    async deleteArticle(slug: string, currentUserId: number): Promise<DeleteResult> {
        const article = await this.getArticleBySlug(slug);

        if (article.author.id !== currentUserId) {
            throw new HttpException(
                'You are not an author',
                HttpStatus.FORBIDDEN,
            );
        }

        return this.articleRepository.delete({slug});
    }

    async addArticleToFavorites(
        slug: string,
        currentUserId: number,
    ): Promise<ArticleEntity> {
        const article = await this.getArticleBySlug(slug)
        const user = await this.userRepository.findOne(currentUserId, {
            relations: ['favorites']
        });
        const isNotFavorited = user.favorites.findIndex(
            (articleInFavorites) => articleInFavorites.id === article.id
        ) === -1;
        
        if (isNotFavorited) {
            user.favorites.push(article);
            article.favouritesCount++;
            await this.userRepository.save(user);
            await this.articleRepository.save(article);
        }

        return article;
    }

    buildArticleResponse(article: ArticleEntity): ArticleResponseInterface {
        return { article };
    }

    private getSlug(title: string): string {
        return slugify(title, {lower: true}) +
        '-' +
        ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
    }
}
