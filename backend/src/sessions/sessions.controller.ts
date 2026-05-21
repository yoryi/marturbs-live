import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { SessionsService } from './sessions.service';

@Controller('sessions')
export class SessionsController {
  constructor(private sessionsService: SessionsService) {}

  @Post('start')
  @UseGuards(JwtAuthGuard)
  start(
    @Request() req: { user: { id: string } },
    @Body('modelId') modelId: string,
  ) {
    return this.sessionsService.startSession(req.user.id, modelId);
  }

  @Post(':id/tick')
  @UseGuards(JwtAuthGuard)
  tick(
    @Param('id') id: string,
    @Body('pricePerMinute') pricePerMinute: number,
  ) {
    return this.sessionsService.tickSession(id, pricePerMinute);
  }

  @Post(':id/end')
  @UseGuards(JwtAuthGuard)
  end(@Param('id') id: string) {
    return this.sessionsService.endSession(id);
  }

  @Get('active')
  @UseGuards(JwtAuthGuard)
  active() {
    return this.sessionsService.getActiveSessions();
  }
}
