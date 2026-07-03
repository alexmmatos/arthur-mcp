export const config = {
  get port(): number {
    return parseInt(process.env.PORT, 10) || 3000;
  },
  get databaseUri(): string {
    return process.env.DATABASE_URI ?? 'sqlite:database.sqlite';
  },
  get dashboardUser(): string {
    return process.env.DASHBOARD_USER ?? 'admin';
  },
  get dashboardPassword(): string {
    return process.env.DASHBOARD_PASSWORD ?? 'admin';
  },
  get dashboardEmail(): string {
    return process.env.DASHBOARD_EMAIL ?? 'admin@arthurmcp.io';
  },
  get jwtSecret(): string {
    return process.env.JWT_SECRET ?? 'change-me-in-production-secret';
  },
};
