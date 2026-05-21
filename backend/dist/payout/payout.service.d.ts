import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Transaction } from '../entities/transaction.entity';
export interface PayoutConfigDto {
    platformFeePercent: number;
    processingDaysMin: number;
    processingDaysMax: number;
}
export interface WithdrawalPreviewDto extends PayoutConfigDto {
    availableBalance: number;
    grossAmount: number;
    platformFeeAmount: number;
    netAmount: number;
    currency: string;
}
export declare class PayoutService {
    private readonly config;
    private readonly transactionRepo;
    constructor(config: ConfigService, transactionRepo: Repository<Transaction>);
    getConfig(): PayoutConfigDto;
    getAvailableBalance(userId: string): Promise<number>;
    getWithdrawalPreview(userId: string, amount?: number): Promise<WithdrawalPreviewDto>;
    requestWithdrawal(userId: string, amount?: number): Promise<{
        withdrawalId: string;
        status: string;
        message: string;
        availableBalance: number;
        grossAmount: number;
        platformFeeAmount: number;
        netAmount: number;
        currency: string;
        platformFeePercent: number;
        processingDaysMin: number;
        processingDaysMax: number;
    }>;
    private getPlatformFeePercent;
    private getProcessingDaysMin;
    private getProcessingDaysMax;
}
