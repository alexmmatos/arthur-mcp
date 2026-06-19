import { Injectable, LoggerService } from '@nestjs/common';

const RESET  = '\x1b[0m';
const DIM    = '\x1b[2m';
const BOLD   = '\x1b[1m';
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const BLUE   = '\x1b[34m';
const GRAY   = '\x1b[90m';

const LEVEL_COLOR: Record<string, string> = {
  info:    GREEN,
  error:   RED,
  warn:    YELLOW,
  debug:   BLUE,
  verbose: GRAY,
};

const LEVEL_LABEL: Record<string, string> = {
  info:    'INFO ',
  error:   'ERROR',
  warn:    'WARN ',
  debug:   'DEBUG',
  verbose: 'VERB ',
};

@Injectable()
export class JsonLogger implements LoggerService {
  private readonly pretty = process.env.NODE_ENV !== 'production';

  private emit(level: string, message: unknown, context?: string): void {
    if (this.pretty) {
      process.stdout.write(this.formatPretty(level, message, context) + '\n');
    } else {
      const entry =
        typeof message === 'object' && message !== null
          ? { level, ...(message as object), timestamp: (message as any).timestamp ?? new Date().toISOString() }
          : { level, message: String(message), timestamp: new Date().toISOString() };
      if (context && !(entry as any).context) (entry as any).context = context;
      process.stdout.write(JSON.stringify(entry) + '\n');
    }
  }

  private formatPretty(level: string, message: unknown, context?: string): string {
    const color = LEVEL_COLOR[level] ?? RESET;
    const label = LEVEL_LABEL[level] ?? level.toUpperCase().padEnd(5);
    const ts    = new Date().toISOString().slice(11, 23); // HH:MM:SS.mmm

    const ctx = context ? `${CYAN}[${context}]${RESET} ` : '';

    let text: string;
    let extras = '';

    if (typeof message === 'object' && message !== null) {
      const { event, message: msg, timestamp: _ts, context: _ctx, ...rest } = message as any;
      text = event ?? msg ?? JSON.stringify(message);
      const pairs = Object.entries(rest)
        .filter(([, v]) => v !== undefined && v !== null)
        .map(([k, v]) => `${GRAY}${k}=${typeof v === 'object' ? JSON.stringify(v) : v}${RESET}`)
        .join(' ');
      if (pairs) extras = `  ${pairs}`;
    } else {
      text = String(message);
    }

    return `${DIM}${ts}${RESET}  ${color}${BOLD}${label}${RESET}  ${ctx}${BOLD}${text}${RESET}${extras}`;
  }

  log(message: unknown, context?: string): void     { this.emit('info',    message, context); }
  warn(message: unknown, context?: string): void    { this.emit('warn',    message, context); }
  debug(message: unknown, context?: string): void   { this.emit('debug',   message, context); }
  verbose(message: unknown, context?: string): void { this.emit('verbose', message, context); }

  error(message: unknown, trace?: string, context?: string): void {
    this.emit('error', message, context);
    if (trace) process.stderr.write(`${GRAY}${trace}${RESET}\n`);
  }
}
