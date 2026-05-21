import { ModelsService } from './models.service';
export declare class ModelsController {
    private modelsService;
    constructor(modelsService: ModelsService);
    findAll(online?: string): Promise<{
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
    dashboard(req: {
        user: {
            id: string;
        };
    }): Promise<{
        earningsToday: number;
        earningsMonth: number;
        sessionsToday: number;
        hoursLive: number;
        isOnline: boolean;
        pricePerMinute: number;
    }>;
    setOnline(req: {
        user: {
            id: string;
        };
    }, isOnline: boolean): Promise<import("../entities/model-profile.entity").ModelProfile>;
    setPrice(req: {
        user: {
            id: string;
        };
    }, pricePerMinute: number): Promise<import("../entities/model-profile.entity").ModelProfile>;
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
}
