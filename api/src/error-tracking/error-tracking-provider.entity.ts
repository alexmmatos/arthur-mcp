import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm'

@Entity('error_tracking_providers')
export class ErrorTrackingProviderEntity {
  @PrimaryGeneratedColumn('uuid', { name: 'id' }) id: string
  @Column({ name: 'name' }) name: string
  @Column({ name: 'description', nullable: true }) description?: string
  @Column({ name: 'tool' }) tool: string
  @Column('text', { name: 'dsn' }) dsn: string
  @Column({ name: 'project_name', nullable: true }) projectName?: string
  @Column({ name: 'environment', nullable: true }) environment?: string
  @Column({ name: 'is_active', default: false }) isActive: boolean
  @CreateDateColumn({ name: 'created_at' }) createdAt: Date
  @UpdateDateColumn({ name: 'updated_at' }) updatedAt: Date
}
