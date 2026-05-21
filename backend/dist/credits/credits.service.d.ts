import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Transaction } from '../entities/transaction.entity';
export declare class CreditsService {
    private userRepo;
    private txRepo;
    constructor(userRepo: Repository<User>, txRepo: Repository<Transaction>);
    getPackages(): ({
        id: string;
        credits: number;
        price: number;
        popular?: undefined;
    } | {
        id: string;
        credits: number;
        price: number;
        popular: boolean;
    })[];
    getBalance(userId: string): Promise<{
        credits: number;
    }>;
    purchase(userId: string, packageId: string): Promise<{
        credits: number;
        added: number;
    }>;
    deduct(userId: string, amount: number, sessionId?: string): Promise<{
        credits: number;
        sessionId: string | undefined;
    } | null>;
    getTransactions(userId: string): Promise<Transaction[]>;
}
