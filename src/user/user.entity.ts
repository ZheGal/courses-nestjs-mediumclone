import { BeforeInsert, BeforeUpdate, Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import {hash} from 'bcrypt';
import { ArticleEntity } from "@app/article/article.entity";
import { CommentEntity } from "@app/comment/comment.entity";

@Entity({ name: 'users' })
export class UserEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    username: string;

    @Column()
    email: string;

    @Column({ default: '' })
    bio: string;

    @Column({ default: '' })
    image: string;

    @Column({ select: false })
    password: string;

    @BeforeInsert()
    @BeforeUpdate()
    async hashPassword() {
        this.password = await hash(this.password, 12);
    }

    @OneToMany(() => ArticleEntity, article => article.author)
    articles: ArticleEntity[];

    @OneToMany(() => CommentEntity, comment => comment.author)
    comments: CommentEntity[];

    @ManyToMany(() => ArticleEntity)
    @JoinTable()
    favorites: ArticleEntity[];
}