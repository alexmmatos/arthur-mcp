import { Controller, Get, Param } from '@nestjs/common';
import { SwaggerService } from '../swagger/swagger.service';

/** Public endpoint — no JWT guard. Returns project info for the client setup page. */
@Controller('share')
export class ShareController {
  constructor(private readonly swaggerService: SwaggerService) {}

  @Get(':token')
  getShareInfo(@Param('token') token: string) {
    return this.swaggerService.getProjectForShare(token);
  }
}
