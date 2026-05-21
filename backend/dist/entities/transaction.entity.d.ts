export declare enum TransactionType {
    PURCHASE = "purchase",
    CALL = "call",
    PAYOUT = "payout"
}
export declare class Transaction {
    id: string;
    userId: string;
    type: TransactionType;
    amount: number;
    credits: number;
    status: string;
    createdAt: Date;
}
