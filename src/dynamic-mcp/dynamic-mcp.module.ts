import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  SwaggerProject,
  SwaggerProjectSchema,
} from '../swagger/swagger-project.schema';
import { DynamicMcpController } from './dynamic-mcp.controller';
import { DynamicMcpService } from './dynamic-mcp.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SwaggerProject.name, schema: SwaggerProjectSchema },
    ]),
  ],
  controllers: [DynamicMcpController],
  providers: [DynamicMcpService],
  exports: [DynamicMcpService],
})
export class DynamicMcpModule {}
