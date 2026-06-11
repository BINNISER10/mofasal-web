import { useState, useEffect, useCallback } from 'react';
import { ordersApi, Order, TrackingStep } from '../services/api/orders';
import socketClient from '../services/socket/SocketClient';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [orderHistory, setOrderHistory] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [tracking, setTracking] = useState<TrackingStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const allOrders = await ordersApi.list();
      setOrders(allOrders);
      setActiveOrders(allOrders.filter((o) => o.status !== 'delivered' && o.status !== 'cancelled'));
      setOrderHistory(allOrders.filter((o) => o.status === 'delivered' || o.status === 'cancelled'));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOrderDetail = useCallback(async (orderId: string) => {
    setLoading(true);
    try {
      const order = await ordersApi.getById(orderId);
      setCurrentOrder(order);
      setTracking(order.tracking);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch order');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchTracking = useCallback(async (orderId: string) => {
    try {
      const data = await ordersApi.getTracking(orderId);
      setTracking(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tracking');
    }
  }, []);

  const confirmOrder = useCallback(async (orderId: string, confirmed: boolean, changes?: string) => {
    setLoading(true);
    try {
      const updated = await ordersApi.submitConfirmation(orderId, {
        confirmed,
        changesRequested: changes,
      });
      setCurrentOrder(updated);
      return updated;
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to confirm order');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const handleTrackingUpdate = (data: unknown) => {
      const update = data as { orderId: string; tracking: TrackingStep[] };
      if (currentOrder && update.orderId === currentOrder.id) {
        setTracking(update.tracking);
      }
    };

    socketClient.on('order:tracking', handleTrackingUpdate);

    return () => {
      socketClient.off('order:tracking', handleTrackingUpdate);
    };
  }, [currentOrder]);

  return {
    orders,
    activeOrders,
    orderHistory,
    currentOrder,
    tracking,
    loading,
    error,
    fetchOrders,
    fetchOrderDetail,
    fetchTracking,
    confirmOrder,
  };
};

export default useOrders;
