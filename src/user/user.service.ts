import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateUserDto } from './dto/createUser.dto';
import { UserEntity } from './user.entity';
import { sign } from 'jsonwebtoken';
import { JWT_SECRET } from '@app/config';
import { UserResponseInterface } from './types/userResponse.interface';
import {compare} from 'bcrypt';
import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>
    ) {}

    async createUser(createUserDto: CreateUserDto): Promise<UserEntity> {
        const errorResponse = {
            errors: {}
        };
        const userByEmail = await this.userRepository.findOne({
            email: createUserDto.email,
        });
        const userByUsername = await this.userRepository.findOne({
            username: createUserDto.username,
        });

        if (userByEmail) {
            errorResponse.errors['email'] = 'Has already been taken';
        }

        if (userByUsername) {
            errorResponse.errors['username'] = 'Has already been taken';
        }

        if (userByEmail || userByUsername) {
            throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
        }

        const newUser = new UserEntity();
        Object.assign(newUser, createUserDto);
        return await this.userRepository.save(newUser);
    }

    async updateUser(
        userId: number,
        updateUserDto: UpdateUserDto,
    ): Promise<UserEntity> {
        const userByEmail = await this.userRepository.findOne({
            email: updateUserDto.email,
            id: Not(userId),
        });
        const userByUsername = await this.userRepository.findOne({
            username: updateUserDto.username,
            id: Not(userId),
        });

        if (userByEmail || userByUsername) {
            throw new HttpException(
                'Email or username are taken',
                HttpStatus.UNPROCESSABLE_ENTITY,
            );
        }

        const user = await this.findById(userId);
        Object.assign(user, updateUserDto);
        return await this.userRepository.save(user);
    }

    async loginUser(loginUserDto): Promise<UserEntity> {
        const errorResponse = {
            errors: {
                'email or password': 'Is invalid'
            }
        };

        const user = await this.userRepository.findOne(
            { email: loginUserDto.email },
            { select: ['id', 'username', 'email', 'bio', 'image', 'password'] }
        );
        
        if (!user) {
            throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
        }

        const isPasswordCorrect = await compare(loginUserDto.password, user.password)
        
        if (!isPasswordCorrect) {
            throw new HttpException(errorResponse, HttpStatus.UNPROCESSABLE_ENTITY);
        }

        delete user.password;
        return user;
    }

    findById(id: number): Promise<UserEntity> {
        return this.userRepository.findOne(id);
    }

    generateJwt(user: UserEntity): string {
        return sign({
            id: user.id,
            username: user.username,
            email: user.email
        }, JWT_SECRET)
    }

    buildUserResponse(user: UserEntity): UserResponseInterface {
        return {
            user: {
                ...user,
                token: this.generateJwt(user)
            }
        }
    }
}
