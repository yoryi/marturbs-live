import { User } from './user.entity';
export declare class ModelProfile {
    id: string;
    user: User;
    userId: string;
    username: string;
    bio?: string;
    isOnline: boolean;
    pricePerMinute: number;
    rating: number;
    reviewCount: number;
    coverImage?: string;
    tags?: string[];
}
