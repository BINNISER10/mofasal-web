import { RankingService } from '../src/services/RankingService';

describe('RankingService', () => {
  it('يُفضّل المحل الأعلى تقييماً والأقرب', () => {
    const near = RankingService.computeScore(
      { id: 'a', rating: 4.8, orderCount: 100, lat: 24.71, lng: 46.67, subscriptionPlan: 'PREMIUM' },
      { lat: 24.72, lng: 46.68 },
    );
    const far = RankingService.computeScore(
      { id: 'b', rating: 4.0, orderCount: 10, lat: 21.48, lng: 39.19, subscriptionPlan: 'FREE_TRIAL' },
      { lat: 24.72, lng: 46.68 },
    );
    expect(near.score).toBeGreaterThan(far.score);
  });

  it('يرتّب قائمة محلات تنازلياً', async () => {
    const shops = [
      { id: '1', rating: 3.5, orderCount: 5 },
      { id: '2', rating: 4.9, orderCount: 200 },
      { id: '3', rating: 4.2, orderCount: 50 },
    ];
    const ranked = await RankingService.rankShops(shops);
    expect(ranked[0].id).toBe('2');
    expect(ranked[ranked.length - 1].id).toBe('1');
  });
});
