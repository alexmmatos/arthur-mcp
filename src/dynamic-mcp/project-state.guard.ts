import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import type { Request, Response } from 'express';
import { SwaggerProject, SwaggerProjectDocument } from '../swagger/swagger-project.schema';

function currentHourInTz(timezone: string): number {
  try {
    const parts = new Intl.DateTimeFormat('en-US', { hour: 'numeric', hour12: false, timeZone: timezone }).formatToParts(new Date());
    const h = parts.find(p => p.type === 'hour');
    return h ? parseInt(h.value, 10) : new Date().getUTCHours();
  } catch {
    return new Date().getUTCHours();
  }
}

@Injectable()
export class ProjectStateGuard implements CanActivate {
  constructor(
    @InjectModel(SwaggerProject.name)
    private readonly projectModel: Model<SwaggerProjectDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const res = context.switchToHttp().getResponse<Response>();
    const projectId = req.params['projectId'];

    const project = await this.projectModel
      .findById(projectId)
      .select('isPaused maintenanceMode availabilityWindow name')
      .exec();

    if (!project) return true;

    if (project.isPaused) {
      res.status(503).json({
        error: 'Project paused',
        message: `The project "${project.name}" is temporarily paused by its manager. Please try again later.`,
      });
      return false;
    }

    if (project.maintenanceMode?.enabled) {
      const msg = project.maintenanceMode.message?.trim()
        || `The project "${project.name}" is under maintenance. Please try again later.`;
      res.status(503).json({ error: 'Maintenance mode', message: msg });
      return false;
    }

    if (project.availabilityWindow?.enabled) {
      const { startHour, endHour, timezone } = project.availabilityWindow;
      const currentHour = currentHourInTz(timezone ?? 'UTC');
      const inWindow = startHour <= endHour
        ? currentHour >= startHour && currentHour < endHour
        : currentHour >= startHour || currentHour < endHour; // overnight window

      if (!inWindow) {
        res.status(503).json({
          error: 'Outside availability window',
          message: `This project only accepts requests between ${startHour}:00 and ${endHour}:00 (${timezone ?? 'UTC'}). Current hour: ${currentHour}:xx.`,
        });
        return false;
      }
    }

    return true;
  }
}
