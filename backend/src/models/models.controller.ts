import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { ModelsService } from './models.service';

@Controller('models')
export class ModelsController {
  constructor(private modelsService: ModelsService) {}

  @Get()
  findAll(@Query('online') online?: string) {
    return this.modelsService.findAll(online === 'true');
  }

  @Get('me/dashboard')
  @UseGuards(JwtAuthGuard)
  dashboard(@Request() req: { user: { id: string } }) {
    return this.modelsService.getDashboardStats(req.user.id);
  }

  @Patch('me/online')
  @UseGuards(JwtAuthGuard)
  setOnline(@Request() req: { user: { id: string } }, @Body('isOnline') isOnline: boolean) {
    return this.modelsService.setOnline(req.user.id, isOnline);
  }

  @Patch('me/price')
  @UseGuards(JwtAuthGuard)
  setPrice(
    @Request() req: { user: { id: string } },
    @Body('pricePerMinute') pricePerMinute: number,
  ) {
    return this.modelsService.updatePrice(req.user.id, pricePerMinute);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.modelsService.findOne(id);
  }
}
