import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import {
  Transaction,
  TransactionType,
} from '../entities/transaction.entity';

const PACKAGES = [
  { id: '1', credits: 100, price: 9.99 },
  { id: '2', credits: 300, price: 24.99, popular: true },
  { id: '3', credits: 600, price: 44.99 },
];

@Injectable()
export class CreditsService {
  constructor(
    @InjectRepository(User) private userRepo: Repository<User>,
    @InjectRepository(Transaction) private txRepo: Repository<Transaction>,
  ) {}

  getPackages() {
    return PACKAGES;
  }

  async getBalance(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    return { credits: user?.credits ?? 0 };
  }

  async purchase(userId: string, packageId: string) {
    const pkg = PACKAGES.find((p) => p.id === packageId);
    if (!pkg) throw new BadRequestException('Paquete inválido');

    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) throw new BadRequestException('Usuario no encontrado');

    const totalCredits = pkg.credits;
    user.credits += totalCredits;
    await this.userRepo.save(user);

    await this.txRepo.save({
      userId,
      type: TransactionType.PURCHASE,
      amount: pkg.price,
      credits: totalCredits,
      status: 'completed',
    });

    return { credits: user.credits, added: totalCredits };
  }

  async deduct(userId: string, amount: number, sessionId?: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) return null;

    user.credits = Math.max(0, user.credits - amount);
    await this.userRepo.save(user);

    await this.txRepo.save({
      userId,
      type: TransactionType.CALL,
      amount: 0,
      credits: -amount,
      status: 'completed',
    });

    return { credits: user.credits, sessionId };
  }

  async getTransactions(userId: string) {
    return this.txRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 20,
    });
  }
}
