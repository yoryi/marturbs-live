import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreditsService } from './credits.service';

@Controller('credits')
export class CreditsController {
  constructor(private creditsService: CreditsService) {}

  @Get('packages')
  getPackages() {
    return this.creditsService.getPackages();
  }

  @Get('balance')
  @UseGuards(JwtAuthGuard)
  balance(@Request() req: { user: { id: string } }) {
    return this.creditsService.getBalance(req.user.id);
  }

  @Post('purchase')
  @UseGuards(JwtAuthGuard)
  purchase(
    @Request() req: { user: { id: string } },
    @Body('packageId') packageId: string,
  ) {
    return this.creditsService.purchase(req.user.id, packageId);
  }

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  transactions(@Request() req: { user: { id: string } }) {
    return this.creditsService.getTransactions(req.user.id);
  }
}
