import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Transaction,
  TransactionType,
} from '../entities/transaction.entity';

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

@Injectable()
export class PayoutService {
  constructor(
    private readonly config: ConfigService,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
  ) {}

  getConfig(): PayoutConfigDto {
    return {
      platformFeePercent: this.getPlatformFeePercent(),
      processingDaysMin: this.getProcessingDaysMin(),
      processingDaysMax: this.getProcessingDaysMax(),
    };
  }

  /** Saldo disponible para retiro (mock hasta agregar ledger real) */
  async getAvailableBalance(userId: string): Promise<number> {
    const completedPayouts = await this.transactionRepo.find({
      where: { userId, type: TransactionType.PAYOUT, status: 'completed' },
    });
    const withdrawn = completedPayouts.reduce(
      (sum, t) => sum + Number(t.amount),
      0,
    );
    const grossEarned = 892_000;
    return Math.max(0, grossEarned - withdrawn);
  }

  async getWithdrawalPreview(
    userId: string,
    amount?: number,
  ): Promise<WithdrawalPreviewDto> {
    const availableBalance = await this.getAvailableBalance(userId);
    const grossAmount =
      amount !== undefined ? Math.min(amount, availableBalance) : availableBalance;

    if (grossAmount <= 0) {
      throw new BadRequestException('No hay saldo disponible para retirar');
    }

    const cfg = this.getConfig();
    const platformFeeAmount = Math.round(
      (grossAmount * cfg.platformFeePercent) / 100,
    );
    const netAmount = grossAmount - platformFeeAmount;

    return {
      ...cfg,
      availableBalance,
      grossAmount,
      platformFeeAmount,
      netAmount,
      currency: 'COP',
    };
  }

  async requestWithdrawal(userId: string, amount?: number) {
    const preview = await this.getWithdrawalPreview(userId, amount);
    const payout = this.transactionRepo.create({
      userId,
      type: TransactionType.PAYOUT,
      amount: preview.grossAmount,
      credits: 0,
      status: 'pending',
    });
    await this.transactionRepo.save(payout);

    return {
      ...preview,
      withdrawalId: payout.id,
      status: 'pending',
      message: `El desembolso se procesará en ${preview.processingDaysMin} a ${preview.processingDaysMax} días hábiles.`,
    };
  }

  private getPlatformFeePercent(): number {
    const raw = this.config.get<string | number>(
      'PAYOUT_PLATFORM_FEE_PERCENT',
      15,
    );
    const n = typeof raw === 'number' ? raw : parseFloat(String(raw));
    if (!Number.isFinite(n) || n < 0 || n > 100) return 15;
    return n;
  }

  private getProcessingDaysMin(): number {
    const n = Number(this.config.get('PAYOUT_PROCESSING_DAYS_MIN', 2));
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 2;
  }

  private getProcessingDaysMax(): number {
    const min = this.getProcessingDaysMin();
    const n = Number(this.config.get('PAYOUT_PROCESSING_DAYS_MAX', 3));
    const max = Number.isFinite(n) && n > 0 ? Math.floor(n) : 3;
    return max >= min ? max : min;
  }
}
