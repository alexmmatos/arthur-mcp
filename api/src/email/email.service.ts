import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: Transporter | null = null;
  private readonly from: string;
  readonly isConfigured: boolean;

  constructor(private readonly config: ConfigService) {
    const host = config.get<string>('SMTP_HOST');
    const port = config.get<number>('SMTP_PORT') ?? 587;
    const user = config.get<string>('SMTP_USER');
    const pass = config.get<string>('SMTP_PASS');
    this.from = config.get<string>('SMTP_FROM') ?? user ?? 'noreply@mcp-convert.local';
    this.isConfigured = !!(host && user && pass);

    if (this.isConfigured) {
      this.transporter = nodemailer.createTransport({ host, port, secure: port === 465, auth: { user, pass } });
      this.logger.log(`Email service configured — SMTP ${host}:${port}`);
    } else {
      this.logger.warn('Email not configured — set SMTP_HOST, SMTP_USER, SMTP_PASS in .env to enable email features');
    }
  }

  async send(opts: SendMailOptions): Promise<boolean> {
    if (!this.transporter) {
      this.logger.warn(`Email not sent to ${opts.to} — SMTP not configured`);
      return false;
    }
    try {
      await this.transporter.sendMail({ from: this.from, ...opts });
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send email to ${opts.to}: ${err?.message}`);
      return false;
    }
  }

  buildWeeklyDigest(data: {
    serverName: string;
    totalCalls: number;
    errors: number;
    successRate: number;
    topTools: { name: string; count: number }[];
    periodLabel: string;
  }): string {
    const rows = data.topTools.map(t =>
      `<tr><td style="padding:4px 8px">${t.name}</td><td style="padding:4px 8px;text-align:right">${t.count}</td></tr>`
    ).join('');

    return `
<!DOCTYPE html><html><body style="font-family:sans-serif;color:#333;max-width:560px;margin:0 auto;padding:24px">
<h2 style="margin:0 0 4px">📊 Weekly summary — ${data.serverName}</h2>
<p style="color:#666;margin:0 0 24px">${data.periodLabel}</p>
<table style="width:100%;border-collapse:collapse;margin-bottom:24px">
  <tr>
    <td style="background:#f5f5f5;padding:12px;border-radius:6px;text-align:center">
      <div style="font-size:28px;font-weight:700">${data.totalCalls}</div>
      <div style="color:#666;font-size:13px">Total requests</div>
    </td>
    <td style="width:12px"></td>
    <td style="background:${data.successRate >= 95 ? '#f0fdf4' : data.successRate >= 80 ? '#fffbeb' : '#fef2f2'};padding:12px;border-radius:6px;text-align:center">
      <div style="font-size:28px;font-weight:700;color:${data.successRate >= 95 ? '#16a34a' : data.successRate >= 80 ? '#d97706' : '#dc2626'}">${data.successRate}%</div>
      <div style="color:#666;font-size:13px">Success rate</div>
    </td>
    <td style="width:12px"></td>
    <td style="background:#fef2f2;padding:12px;border-radius:6px;text-align:center">
      <div style="font-size:28px;font-weight:700;color:#dc2626">${data.errors}</div>
      <div style="color:#666;font-size:13px">Errors</div>
    </td>
  </tr>
</table>
${data.topTools.length > 0 ? `
<h3 style="margin:0 0 8px">Most used tools</h3>
<table style="width:100%;border-collapse:collapse;font-size:14px">
  <thead><tr style="background:#f5f5f5"><th style="padding:4px 8px;text-align:left">Tool</th><th style="padding:4px 8px;text-align:right">Calls</th></tr></thead>
  <tbody>${rows}</tbody>
</table>` : ''}
<hr style="margin:24px 0;border:none;border-top:1px solid #e5e7eb">
<p style="color:#999;font-size:12px">Sent by MCP Convert · <a href="#" style="color:#999">Unsubscribe</a></p>
</body></html>`;
  }

  buildAlertEmail(data: {
    serverName: string;
    errorRate: number;
    threshold: number;
    recentErrors: { toolName: string; message?: string; time: string }[];
    projectUrl: string;
  }): string {
    const rows = data.recentErrors.map(e =>
      `<tr><td style="padding:4px 8px">${e.toolName}</td><td style="padding:4px 8px;color:#dc2626">${e.message ?? 'Unknown error'}</td><td style="padding:4px 8px;color:#999">${e.time}</td></tr>`
    ).join('');

    return `
<!DOCTYPE html><html><body style="font-family:sans-serif;color:#333;max-width:560px;margin:0 auto;padding:24px">
<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:16px;margin-bottom:24px">
  <h2 style="margin:0 0 8px;color:#dc2626">⚠️ Alert — ${data.serverName}</h2>
  <p style="margin:0">Error rate reached <strong>${data.errorRate}%</strong> (threshold: ${data.threshold}%) in the last 15 minutes.</p>
</div>
${data.recentErrors.length > 0 ? `
<h3 style="margin:0 0 8px">Recent failures</h3>
<table style="width:100%;border-collapse:collapse;font-size:13px">
  <thead><tr style="background:#f5f5f5"><th style="padding:4px 8px;text-align:left">Tool</th><th style="padding:4px 8px;text-align:left">Error</th><th style="padding:4px 8px;text-align:left">Time</th></tr></thead>
  <tbody>${rows}</tbody>
</table>` : ''}
<p style="margin-top:24px"><a href="${data.projectUrl}" style="background:#3b82f6;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none">View project logs →</a></p>
</body></html>`;
  }
}
