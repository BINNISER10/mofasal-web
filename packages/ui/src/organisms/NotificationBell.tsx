import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Info, AlertTriangle, AlertCircle, ShoppingBag, MessageSquare, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../lib/utils';
import { Badge } from '../atoms/Badge';

export interface NotificationItem {
  id: string;
  title: string;
  body?: string;
  isRead: boolean;
  time?: string;
  type?: 'info' | 'warning' | 'error' | 'order' | 'message';
}

export interface NotificationBellProps {
  count?: number;
  onPress?: () => void;
  items?: NotificationItem[];
  onItemPress?: (item: NotificationItem) => void;
  onMarkAllRead?: () => void;
  className?: string;
}

const typeIcons: Record<string, React.ReactNode> = {
  info: <Info size={18} className="text-blue-500" />,
  warning: <AlertTriangle size={18} className="text-yellow-500" />,
  error: <AlertCircle size={18} className="text-red-500" />,
  order: <ShoppingBag size={18} className="text-[#0A5A64]" />,
  message: <MessageSquare size={18} className="text-blue-500" />,
};

const defaultIcon = <Info size={18} className="text-gray-400" />;

export const NotificationBell: React.FC<NotificationBellProps> = ({
  count = 0,
  onPress,
  items = [],
  onItemPress,
  onMarkAllRead,
  className,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = items.filter((i) => !i.isRead).length;
  const displayCount = count > 0 ? count : unreadCount;

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          onPress?.();
        }}
        className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
        aria-label={`Notifications${displayCount > 0 ? ` (${displayCount} unread)` : ''}`}
      >
        <Bell size={22} />
        {displayCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold leading-none border-2 border-white">
            {displayCount > 99 ? '99+' : displayCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 z-50 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
              <div className="flex items-center gap-2">
                {unreadCount > 0 && onMarkAllRead && (
                  <button
                    onClick={onMarkAllRead}
                    className="flex items-center gap-1 text-xs text-[#0A5A64] hover:text-[#00373E] font-medium transition-colors"
                  >
                    <CheckCheck size={14} />
                    Mark all read
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center py-10 px-4 text-center">
                  <Bell size={32} className="text-gray-200 mb-2" />
                  <p className="text-sm text-gray-400">No notifications yet</p>
                </div>
              ) : (
                items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      onItemPress?.(item);
                      setIsOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-gray-50 border-b border-gray-50 last:border-b-0',
                      !item.isRead && 'bg-[#D0E4E6]/50'
                    )}
                  >
                    <div className="shrink-0 mt-0.5">
                      {typeIcons[item.type || ''] || defaultIcon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={cn(
                            'text-sm',
                            !item.isRead ? 'font-semibold text-gray-900' : 'text-gray-700'
                          )}
                        >
                          {item.title}
                        </p>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#0A5A64] shrink-0 mt-1.5" />
                        )}
                      </div>
                      {item.body && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{item.body}</p>
                      )}
                      {item.time && (
                        <p className="text-[10px] text-gray-400 mt-1">{item.time}</p>
                      )}
                    </div>
                  </button>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
