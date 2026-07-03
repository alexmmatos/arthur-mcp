import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('settings')
export class SettingsEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' })
  id: string;

  @Column({ name: 'key', unique: true, default: 'global' })
  key: string;

  @Column({ name: 'server_base_url', default: '' })
  serverBaseUrl: string;

  @Column({ name: 'default_timeout_ms', default: 30000 })
  defaultTimeoutMs: number;

  @Column({ name: 'smtp_host', default: '' })
  smtpHost: string;

  @Column({ name: 'smtp_port', default: 587 })
  smtpPort: number;

  @Column({ name: 'smtp_user', default: '' })
  smtpUser: string;

  @Column({ name: 'smtp_pass', default: '' })
  smtpPass: string;

  @Column({ name: 'smtp_from', default: '' })
  smtpFrom: string;

  @Column({ name: 'jwt_secret', default: '' })
  jwtSecret: string;

  @Column({ name: 'global_request_headers', type: 'simple-json', nullable: true })
  globalRequestHeaders: { name: string; value: string }[] | null;

  @Column({ name: 'observability_environment', type: 'simple-json', nullable: true })
  observabilityEnvironment: Record<string, string> | null;
}
