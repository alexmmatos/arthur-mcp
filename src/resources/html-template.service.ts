import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import type { DocsData } from './mcp-docs.service';

const PALETTE = [
  '#7c3aed', '#1d4ed8', '#0891b2', '#059669',
  '#b45309', '#dc2626', '#be185d', '#7c3aed',
  '#4338ca', '#0369a1',
];

const TOOLS = [
  { name: 'getUsers',          description: 'List all users' },
  { name: 'getUserById',       description: 'Get user by ID' },
  { name: 'getBookings',       description: 'List all bookings' },
  { name: 'createBooking',     description: 'Create a new booking' },
  { name: 'getDashboardCard',  description: 'Server dashboard HTML card' },
  { name: 'getUsersCardList',  description: 'All users as HTML card grid' },
  { name: 'getUserProfileCard',description: 'User profile HTML card' },
];

const RESOURCES = [
  { uri: 'api://users',                  type: 'Static',   typeLower: 'static' },
  { uri: 'api://users/{userId}',         type: 'Template', typeLower: 'template' },
  { uri: 'ui://dashboard',              type: 'Static',   typeLower: 'static' },
  { uri: 'ui://users/cards',            type: 'Static',   typeLower: 'static' },
  { uri: 'ui://users/{userId}/profile', type: 'Template', typeLower: 'template' },
];

@Injectable()
export class HtmlTemplateService {
  private readonly cache = new Map<string, Handlebars.TemplateDelegate>();

  private compile(name: string): Handlebars.TemplateDelegate {
    if (!this.cache.has(name)) {
      const file = path.join(__dirname, '..', 'templates', `${name}.hbs`);
      const source = fs.readFileSync(file, 'utf-8');
      this.cache.set(name, Handlebars.compile(source));
    }
    return this.cache.get(name);
  }

  dashboard(userCount: number): string {
    return this.compile('dashboard')({
      now: new Date().toISOString(),
      toolCount: TOOLS.length,
      resourceCount: RESOURCES.length,
      userCount,
      tools: TOOLS,
      resources: RESOURCES,
    });
  }

  userProfile(user: any): string {
    return this.compile('user-profile')({
      user,
      initials: this.initials(user.name),
      avatarColor: this.colorFromId(user.id),
    });
  }

  userCardList(users: any[]): string {
    return this.compile('user-card-list')({
      totalCount: users.length,
      users: users.map((u) => {
        const color = this.colorFromId(u.id);
        return { ...u, initials: this.initials(u.name), color, colorLight: `${color}33` };
      }),
    });
  }

  docs(data: DocsData): string {
    return this.compile('docs')(data);
  }

  private initials(name: string): string {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  private colorFromId(id: number): string {
    return PALETTE[(id - 1) % PALETTE.length];
  }
}
