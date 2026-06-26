import type { DbConnectionConfig, ExecutionRef } from '../types';

type RedisRef = Extract<ExecutionRef, { type: 'redis' }>;

function interpolate(template: string, args: Record<string, unknown>): string {
  return template.replace(/{{(\w+)}}/g, (_, k) => String(args[k] ?? ''));
}

export async function executeRedis(
  ref: RedisRef,
  args: Record<string, unknown>,
  cfg: DbConnectionConfig,
): Promise<unknown> {
  let Redis: any;
  try { Redis = require('ioredis'); } catch { throw new Error('Redis client not installed. Run: npm install ioredis'); }

  const client = new Redis({
    host: cfg.redisHost ?? cfg.host ?? 'localhost',
    port: cfg.redisPort ?? cfg.port ?? 6379,
    password: cfg.redisPassword ?? cfg.password,
    tls: cfg.redisTls ? {} : undefined,
    lazyConnect: true,
  });
  await client.connect();
  try {
    const key = interpolate(ref.keyPattern, args);
    const cmd = ref.command.toUpperCase();

    switch (cmd) {
      case 'GET':    return client.get(key);
      case 'SET':    return client.set(key, interpolate(ref.valueTemplate ?? '{{value}}', args));
      case 'DEL':    return client.del(key);
      case 'EXISTS': return client.exists(key);
      case 'TTL':    return client.ttl(key);
      case 'EXPIRE': return client.expire(key, Number(args.seconds ?? 60));
      case 'KEYS':   return client.keys(key);
      case 'HGET':   return client.hget(key, String(args.field ?? ''));
      case 'HSET':   return client.hset(key, String(args.field ?? ''), String(args.value ?? ''));
      case 'HGETALL':return client.hgetall(key);
      case 'HDEL':   return client.hdel(key, String(args.field ?? ''));
      case 'LPUSH':  return client.lpush(key, interpolate(ref.valueTemplate ?? '{{value}}', args));
      case 'RPUSH':  return client.rpush(key, interpolate(ref.valueTemplate ?? '{{value}}', args));
      case 'LPOP':   return client.lpop(key);
      case 'RPOP':   return client.rpop(key);
      case 'LRANGE': return client.lrange(key, Number(args.start ?? 0), Number(args.stop ?? -1));
      case 'SADD':   return client.sadd(key, interpolate(ref.valueTemplate ?? '{{value}}', args));
      case 'SMEMBERS': return client.smembers(key);
      case 'SREM':   return client.srem(key, String(args.member ?? ''));
      default:       throw new Error(`Unsupported Redis command: ${cmd}`);
    }
  } finally { client.disconnect(); }
}
