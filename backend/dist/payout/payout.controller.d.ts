import { PayoutService } from './payout.service';
export declare class PayoutController {
    private readonly payoutService;
    constructor(payoutService: PayoutService);
    getConfig(): import("./payout.service").PayoutConfigDto;
    preview(req: {
        user: {
            id: string;
        };
    }, amount?: string): Promise<import("./payout.service").WithdrawalPreviewDto>;
    withdraw(req: {
        user: {
            id: string;
        };
    }, amount?: number): Promise<{
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
}
