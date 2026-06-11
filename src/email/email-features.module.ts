import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { MongooseModule } from '@nestjs/mongoose';
import { EmailService } from './email.service';
import { DigestService } from './digest.service';
import { ExecutionLogsModule } from '../execution-logs/execution-logs.module';
import { SwaggerProject, SwaggerProjectSchema } from '../swagger/swagger-project.schema';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ExecutionLogsModule,
    MongooseModule.forFeature([{ name: SwaggerProject.name, schema: SwaggerProjectSchema }]),
  ],
  providers: [EmailService, DigestService],
  exports: [EmailService, DigestService],
})
export class EmailFeaturesModule {}
