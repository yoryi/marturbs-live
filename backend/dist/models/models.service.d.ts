import { Repository } from 'typeorm';
import { ModelProfile } from '../entities/model-profile.entity';
import { User } from '../entities/user.entity';
export declare class ModelsService {
    private modelRepo;
    private userRepo;
    constructor(modelRepo: Repository<ModelProfile>, userRepo: Repository<User>);
    findAll(onlineOnly?: boolean): Promise<{
        id: string;
        userId: string;
        name: string;
        username: string;
        avatar: string | undefined;
        cover: string | undefined;
        isOnline: boolean;
        pricePerMinute: number;
        rating: number;
        reviewCount: number;
        tags: string[];
        bio: string | undefined;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        userId: string;
        name: string;
        username: string;
        avatar: string | undefined;
        cover: string | undefined;
        isOnline: boolean;
        pricePerMinute: number;
        rating: number;
        reviewCount: number;
        tags: string[];
        bio: string | undefined;
    }>;
    findByUserId(userId: string): Promise<ModelProfile | null>;
    setOnline(userId: string, isOnline: boolean): Promise<ModelProfile>;
    updatePrice(userId: string, pricePerMinute: number): Promise<ModelProfile>;
    getDashboardStats(userId: string): Promise<{
        earningsToday: number;
        earningsMonth: number;
        sessionsToday: number;
        hoursLive: number;
        isOnline: boolean;
        pricePerMinute: number;
    }>;
    private formatModel;
    seedIfEmpty(): Promise<void>;
}
