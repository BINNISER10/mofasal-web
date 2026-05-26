'use client';
import { useState, useCallback } from 'react';
import { shopsApi, Shop } from '@/lib/api/shops';

export function useShops() {
  const [shops, setShops] = useState<Shop[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShops = useCallback(async (params?: Record<string, string>) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await shopsApi.list(params);
      setShops(response.shops);
      setTotal(response.total);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getNearbyShops = useCallback(
    async (lat: number, lng: number, radius?: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await shopsApi.getNearby(lat, lng, radius);
        setShops(response.shops);
        setTotal(response.total);
        return response.shops;
      } catch (err: any) {
        setError(err.message);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const searchShops = useCallback(
    async (query: string, params?: Record<string, string>) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await shopsApi.search(query, params);
        setShops(response.shops);
        setTotal(response.total);
        return response.shops;
      } catch (err: any) {
        setError(err.message);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  return {
    shops,
    total,
    isLoading,
    error,
    fetchShops,
    getNearbyShops,
    searchShops,
  };
}
