import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { ModelProfile } from '../entities/model-profile.entity';
import { Transaction } from '../entities/transaction.entity';
import { SessionsService } from '../sessions/sessions.service';
export declare class AdminController {
    private userRepo;
    private modelRepo;
    private txRepo;
    private sessionsService;
    constructor(userRepo: Repository<User>, modelRepo: Repository<ModelProfile>, txRepo: Repository<Transaction>, sessionsService: SessionsService);
    stats(): Promise<{
        totalUsers: number;
        totalModels: number;
        activeSessions: number;
        totalTransactions: number;
        revenueTotal: number;
        onlineModels: number;
    }>;
    users(): Promise<User[]>;
    transactions(): Promise<Transaction[]>;
}
