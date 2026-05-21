import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { PayoutService } from './payout.service';

@Controller()
export class PayoutController {
  constructor(private readonly payoutService: PayoutService) {}

  @Get('payout/config')
  getConfig() {
    return this.payoutService.getConfig();
  }

  @Get('models/me/withdrawal-preview')
  @UseGuards(JwtAuthGuard)
  preview(
    @Request() req: { user: { id: string } },
    @Query('amount') amount?: string,
  ) {
    const parsed = amount !== undefined ? Number(amount) : undefined;
    return this.payoutService.getWithdrawalPreview(
      req.user.id,
      Number.isFinite(parsed) ? parsed : undefined,
    );
  }

  @Post('models/me/withdraw')
  @UseGuards(JwtAuthGuard)
  withdraw(
    @Request() req: { user: { id: string } },
    @Body('amount') amount?: number,
  ) {
    return this.payoutService.requestWithdrawal(req.user.id, amount);
  }
}
