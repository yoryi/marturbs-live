import { OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { ModelProfile } from '../entities/model-profile.entity';
import { LoginDto, RegisterDto } from './dto/auth.dto';
export declare class AuthService implements OnModuleInit {
    private usersRepo;
    private modelRepo;
    private jwtService;
    constructor(usersRepo: Repository<User>, modelRepo: Repository<ModelProfile>, jwtService: JwtService);
    onModuleInit(): Promise<void>;
    private seedDemoUsers;
    register(dto: RegisterDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: UserRole;
            credits: number;
            avatar: string | undefined;
        };
    }>;
    login(dto: LoginDto): Promise<{
        accessToken: string;
        user: {
            id: string;
            email: string;
            name: string;
            role: UserRole;
            credits: number;
            avatar: string | undefined;
        };
    }>;
    private createUser;
    private buildAuthResponse;
    validateUser(userId: string): Promise<User | null>;
}
