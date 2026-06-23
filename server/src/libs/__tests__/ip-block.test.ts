import { describe, it, expect, vi, beforeEach } from 'vitest';
import { prisma } from '@libs/prisma.js';
import { getRedis } from '@libs/redis.js';
import { ConflictError } from '@shared/errors/errors.js';
import {
  syncBlockedIpsToRedis,
  isIpBlocked,
  blockIp,
  unblockIp,
  getBlockedIps,
  recordRateLimitViolation,
} from '../ip-block.js';

vi.mock('@libs/prisma.js', () => ({
  prisma: {
    blockedIp: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      create: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}));

vi.mock('@libs/redis.js');
vi.mock('@libs/logger.js', () => ({
  logger: { info: vi.fn(), error: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

const redisMock = {
  del: vi.fn(),
  sadd: vi.fn(),
  sismember: vi.fn(),
  srem: vi.fn(),
  zscore: vi.fn(),
  zadd: vi.fn(),
  zrem: vi.fn(),
  zrangebyscore: vi.fn(),
  incr: vi.fn(),
  expire: vi.fn(),
};

describe('IP Block Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getRedis).mockReturnValue(redisMock as never);
  });

  // ─── syncBlockedIpsToRedis ──────────────────────────────────

  describe('syncBlockedIpsToRedis', () => {
    it('should load blocked IPs from DB into Redis', async () => {
      vi.mocked(prisma.blockedIp.findMany).mockResolvedValue([
        { ip: '1.2.3.4' },
        { ip: '5.6.7.8' },
      ] as never);
      redisMock.del.mockResolvedValue(1);
      redisMock.sadd.mockResolvedValue(2);

      await syncBlockedIpsToRedis();

      expect(redisMock.del).toHaveBeenCalledWith('blocked_ips');
      expect(redisMock.sadd).toHaveBeenCalledWith('blocked_ips', '1.2.3.4', '5.6.7.8');
    });

    it('should handle empty blocked IPs list', async () => {
      vi.mocked(prisma.blockedIp.findMany).mockResolvedValue([]);
      redisMock.del.mockResolvedValue(0);

      await syncBlockedIpsToRedis();

      expect(redisMock.del).toHaveBeenCalledWith('blocked_ips');
      expect(redisMock.sadd).not.toHaveBeenCalled();
    });

    it('should not throw if sync fails (logs warning instead)', async () => {
      vi.mocked(prisma.blockedIp.findMany).mockRejectedValue(new Error('DB down'));

      await expect(syncBlockedIpsToRedis()).resolves.not.toThrow();
    });
  });

  // ─── isIpBlocked ────────────────────────────────────────────

  describe('isIpBlocked', () => {
    it('should return true if IP is permanently blocked', async () => {
      redisMock.sismember.mockResolvedValue(1);

      const result = await isIpBlocked('1.2.3.4');
      expect(result).toBe(true);
    });

    it('should return true if IP is auto-blocked and not expired', async () => {
      redisMock.sismember.mockResolvedValue(0);
      redisMock.zscore.mockResolvedValue(String(Date.now() / 1000 + 3600)); // expires in 1 hour

      const result = await isIpBlocked('1.2.3.4');
      expect(result).toBe(true);
    });

    it('should return false and clean up if auto-block is expired', async () => {
      redisMock.sismember.mockResolvedValue(0);
      redisMock.zscore.mockResolvedValue(String(Date.now() / 1000 - 100)); // expired 100s ago
      redisMock.zrem.mockResolvedValue(1);

      const result = await isIpBlocked('1.2.3.4');
      expect(result).toBe(false);
      expect(redisMock.zrem).toHaveBeenCalledWith('auto_blocked_ips', '1.2.3.4');
    });

    it('should return false if IP is not blocked', async () => {
      redisMock.sismember.mockResolvedValue(0);
      redisMock.zscore.mockResolvedValue(null);

      const result = await isIpBlocked('1.2.3.4');
      expect(result).toBe(false);
    });

    it('should fail open if Redis is down', async () => {
      vi.mocked(getRedis).mockImplementation(() => { throw new Error('Redis down'); });

      const result = await isIpBlocked('1.2.3.4');
      expect(result).toBe(false);
    });
  });

  // ─── blockIp ────────────────────────────────────────────────

  describe('blockIp', () => {
    it('should create permanent block in DB and sync to Redis', async () => {
      const blocked = { id: 'b-1', ip: '1.2.3.4', reason: 'Spam', blockedBy: 'admin-1', createdAt: new Date(), updatedAt: new Date() };
      vi.mocked(prisma.blockedIp.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.blockedIp.create).mockResolvedValue(blocked);
      redisMock.sadd.mockResolvedValue(1);

      const result = await blockIp('1.2.3.4', 'admin-1', 'Spam');

      expect(result.ip).toBe('1.2.3.4');
      expect(prisma.blockedIp.create).toHaveBeenCalledWith({
        data: { ip: '1.2.3.4', blockedBy: 'admin-1', reason: 'Spam' },
      });
      expect(redisMock.sadd).toHaveBeenCalledWith('blocked_ips', '1.2.3.4');
    });

    it('should throw ConflictError if IP is already blocked', async () => {
      vi.mocked(prisma.blockedIp.findUnique).mockResolvedValue({ id: 'b-1', ip: '1.2.3.4' } as never);

      await expect(blockIp('1.2.3.4', 'admin-1')).rejects.toThrow(ConflictError);
    });

    it('should still return success if Redis sync fails', async () => {
      vi.mocked(prisma.blockedIp.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.blockedIp.create).mockResolvedValue({
        id: 'b-1', ip: '1.2.3.4', reason: null, blockedBy: 'admin-1', createdAt: new Date(), updatedAt: new Date(),
      });
      redisMock.sadd.mockRejectedValue(new Error('Redis down'));

      const result = await blockIp('1.2.3.4', 'admin-1');
      expect(result.ip).toBe('1.2.3.4');
    });
  });

  // ─── unblockIp ──────────────────────────────────────────────

  describe('unblockIp', () => {
    it('should remove from DB and both Redis lists', async () => {
      vi.mocked(prisma.blockedIp.deleteMany).mockResolvedValue({ count: 1 });
      redisMock.srem.mockResolvedValue(1);
      redisMock.zrem.mockResolvedValue(0);

      await unblockIp('1.2.3.4');

      expect(prisma.blockedIp.deleteMany).toHaveBeenCalledWith({ where: { ip: '1.2.3.4' } });
      expect(redisMock.srem).toHaveBeenCalledWith('blocked_ips', '1.2.3.4');
      expect(redisMock.zrem).toHaveBeenCalledWith('auto_blocked_ips', '1.2.3.4');
    });

    it('should not throw if Redis sync fails', async () => {
      vi.mocked(prisma.blockedIp.deleteMany).mockResolvedValue({ count: 1 });
      redisMock.srem.mockRejectedValue(new Error('Redis down'));

      await expect(unblockIp('1.2.3.4')).resolves.not.toThrow();
    });
  });

  // ─── getBlockedIps ──────────────────────────────────────────

  describe('getBlockedIps', () => {
    it('should return permanent blocks from DB and auto-blocks from Redis', async () => {
      vi.mocked(prisma.blockedIp.findMany).mockResolvedValue([
        { id: 'b-1', ip: '1.2.3.4', reason: 'Spam', blockedBy: 'admin-1', createdAt: new Date() },
      ] as never);
      redisMock.zrangebyscore.mockResolvedValue(['5.6.7.8']);

      const result = await getBlockedIps();

      expect(result.permanent).toHaveLength(1);
      expect(result.permanent[0].ip).toBe('1.2.3.4');
      expect(result.autoBlocked).toEqual(['5.6.7.8']);
    });

    it('should return empty autoBlocked if Redis is down', async () => {
      vi.mocked(prisma.blockedIp.findMany).mockResolvedValue([]);
      redisMock.zrangebyscore.mockRejectedValue(new Error('Redis down'));

      const result = await getBlockedIps();

      expect(result.autoBlocked).toEqual([]);
    });
  });

  // ─── recordRateLimitViolation ───────────────────────────────

  describe('recordRateLimitViolation', () => {
    it('should increment violation counter and set TTL on first violation', async () => {
      redisMock.incr.mockResolvedValue(1);
      redisMock.expire.mockResolvedValue(1);

      await recordRateLimitViolation('1.2.3.4');

      expect(redisMock.incr).toHaveBeenCalledWith('rl_violations:1.2.3.4');
      expect(redisMock.expire).toHaveBeenCalledWith('rl_violations:1.2.3.4', 300);
    });

    it('should not set TTL on subsequent violations', async () => {
      redisMock.incr.mockResolvedValue(3);

      await recordRateLimitViolation('1.2.3.4');

      expect(redisMock.expire).not.toHaveBeenCalled();
    });

    it('should auto-block IP after reaching threshold (10 violations)', async () => {
      redisMock.incr.mockResolvedValue(10);
      redisMock.zadd.mockResolvedValue(1);
      redisMock.del.mockResolvedValue(1);

      await recordRateLimitViolation('1.2.3.4');

      expect(redisMock.zadd).toHaveBeenCalledWith(
        'auto_blocked_ips',
        expect.any(Number),
        '1.2.3.4',
      );
      expect(redisMock.del).toHaveBeenCalledWith('rl_violations:1.2.3.4');
    });

    it('should not throw if Redis fails (non-critical)', async () => {
      vi.mocked(getRedis).mockImplementation(() => { throw new Error('Redis down'); });

      await expect(recordRateLimitViolation('1.2.3.4')).resolves.not.toThrow();
    });

    it('should skip private/reserved IPs (never auto-block infra)', async () => {
      await recordRateLimitViolation('10.0.0.5');

      expect(redisMock.incr).not.toHaveBeenCalled();
      expect(redisMock.zadd).not.toHaveBeenCalled();
    });

    it('should skip loopback addresses', async () => {
      await recordRateLimitViolation('127.0.0.1');

      expect(redisMock.incr).not.toHaveBeenCalled();
    });
  });
});
