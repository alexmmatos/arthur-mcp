import { SettingsService } from './settings.service';
import { ISettingsRepository, SettingsRecord } from './settings.repository';

const settingsRecord = (override: Partial<SettingsRecord> = {}): SettingsRecord => ({
  _id: 'settings-1',
  key: 'global',
  serverBaseUrl: 'http://localhost:3000',
  defaultTimeoutMs: 30000,
  smtpHost: 'smtp.example.com',
  smtpPort: 587,
  smtpUser: 'mailer',
  smtpPass: 'secret',
  smtpFrom: 'noreply@example.com',
  globalRequestHeaders: [],
  ...override,
});

describe('SettingsService', () => {
  const repo: jest.Mocked<ISettingsRepository> = {
    getGlobal: jest.fn(),
    updateGlobal: jest.fn(),
  };

  let service: SettingsService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SettingsService(repo);
  });

  it('returns global settings from the repository', async () => {
    const record = settingsRecord();
    repo.getGlobal.mockResolvedValue(record);

    await expect(service.get()).resolves.toBe(record);
    expect(repo.getGlobal).toHaveBeenCalledTimes(1);
  });

  it('updates global settings through the repository', async () => {
    const updated = settingsRecord({ defaultTimeoutMs: 15000 });
    repo.updateGlobal.mockResolvedValue(updated);

    await expect(service.update({ defaultTimeoutMs: 15000 })).resolves.toBe(updated);
    expect(repo.updateGlobal).toHaveBeenCalledWith({ defaultTimeoutMs: 15000 });
  });

  it('removes smtpPass from safe settings and exposes smtpPassSet', async () => {
    repo.getGlobal.mockResolvedValue(settingsRecord({ smtpPass: 'very-secret' }));

    const safe = await service.getSafe();

    expect(safe.smtpPassSet).toBe(true);
    expect(safe).not.toHaveProperty('smtpPass');
  });

  it('marks smtpPassSet false when no SMTP password exists', async () => {
    repo.getGlobal.mockResolvedValue(settingsRecord({ smtpPass: '' }));

    await expect(service.getSafe()).resolves.toMatchObject({ smtpPassSet: false });
  });
});
