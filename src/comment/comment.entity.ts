import { ArticleEntity } from "@app/article/article.entity";
import { UserEntity } from "@app/user/user.entity";
import { BeforeUpdate, Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({name: 'comments'})
export class CommentEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    body: string;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    createdAt: Date;

    @Column({type: 'timestamp', default: () => 'CURRENT_TIMESTAMP'})
    updatedAt: Date;
    comment: { username: string; bio: string; image: string; };

    @BeforeUpdate()
    updateTimestamp() {
        this.updatedAt = new Date();
    }

    @ManyToOne(() => UserEntity, user => user.comments)
    author: UserEntity;

    @ManyToOne(() => ArticleEntity, article => article.comments)
    article: ArticleEntity;
}