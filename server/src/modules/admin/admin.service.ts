/**
 * Admin Module — Service
 *
 * Business logic for admin-only operations.
 */

import { prisma } from '@libs/prisma.js';

interface DashboardStats {
  products: { total: number; active: number };
  articles: { total: number; published: number };
  orders: { total: number };
  revenue: number;
}

class AdminService {
  async getDashboardStats(): Promise<DashboardStats> {
    const [
      productGroups,
      articleGroups,
      totalOrders,
      revenueResult,
    ] = await Promise.all([
      prisma.product.groupBy({ by: ['isActive'], _count: true }),
      prisma.article.groupBy({ by: ['isPublished'], _count: true }),
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: 'COMPLETED' },
      }),
    ]);

    const totalProducts = productGroups.reduce((sum, g) => sum + g._count, 0);
    const activeProducts = productGroups.find((g) => g.isActive === true)?._count ?? 0;

    const totalArticles = articleGroups.reduce((sum, g) => sum + g._count, 0);
    const publishedArticles = articleGroups.find((g) => g.isPublished === true)?._count ?? 0;

    return {
      products: { total: totalProducts, active: activeProducts },
      articles: { total: totalArticles, published: publishedArticles },
      orders: { total: totalOrders },
      revenue: revenueResult._sum.total ?? 0,
    };
  }
}

export const adminService = new AdminService();
