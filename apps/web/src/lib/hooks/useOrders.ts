'use client';
import { useState, useCallback } from 'react';
import { ordersApi, Order, OrderStatus } from '@/lib/api/orders';

interface UseOrdersOptions {
  initialParams?: Record<string, string>;
}

export function useOrders(options: UseOrdersOptions = {}) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(
    async (params?: Record<string, string>) => {
      setIsLoading(true);
      setError(null);
      try {
        const mergedParams = { ...options.initialParams, ...params };
        const response = await ordersApi.list(mergedParams);
        setOrders(response.orders);
        setTotal(response.total);
        setPage(response.page);
        setLimit(response.limit);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    },
    [options.initialParams]
  );

  const getOrder = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await ordersApi.getById(id);
      return response.order;
    } catch (err: any) {
      setError(err.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateStatus = useCallback(
    async (id: string, status: OrderStatus, note?: string) => {
      setError(null);
      try {
        const response = await ordersApi.updateStatus(id, { status, note });
        setOrders((prev) =>
          prev.map((o) => (o.id === id ? response.order : o))
        );
        return response.order;
      } catch (err: any) {
        setError(err.message);
        throw err;
      }
    },
    []
  );

  return {
    orders,
    total,
    page,
    limit,
    isLoading,
    error,
    fetchOrders,
    getOrder,
    updateStatus,
  };
}
