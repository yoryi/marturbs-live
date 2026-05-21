import { CreditsService } from './credits.service';
export declare class CreditsController {
    private creditsService;
    constructor(creditsService: CreditsService);
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
    balance(req: {
        user: {
            id: string;
        };
    }): Promise<{
        credits: number;
    }>;
    purchase(req: {
        user: {
            id: string;
        };
    }, packageId: string): Promise<{
        credits: number;
        added: number;
    }>;
    transactions(req: {
        user: {
            id: string;
        };
    }): Promise<import("../entities/transaction.entity").Transaction[]>;
}
