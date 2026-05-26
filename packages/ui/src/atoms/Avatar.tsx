import React from 'react';
import { cn } from '../lib/utils';

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  status?: 'online' | 'offline' | 'away' | null;
  className?: string;
}

const sizeMap: Record<string, { dim: number; text: string; status: string }> = {
  sm: { dim: 32, text: 'text-xs', status: 'w-2.5 h-2.5 border-[1.5px]' },
  md: { dim: 40, text: 'text-sm', status: 'w-3 h-3 border-2' },
  lg: { dim: 56, text: 'text-lg', status: 'w-3.5 h-3.5 border-2' },
  xl: { dim: 80, text: 'text-2xl', status: 'w-4 h-4 border-[3px]' },
};

const statusColors: Record<string, string> = {
  online: 'bg-[#0A5A64]',
  offline: 'bg-gray-400',
  away: 'bg-yellow-500',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = '',
  fallback,
  size = 'md',
  status = null,
  className,
}) => {
  const [imgError, setImgError] = React.useState(false);
  const sizeConfig = sizeMap[size];
  const showImage = src && !imgError;

  const initials = fallback
    ? fallback.slice(0, 2).toUpperCase()
    : alt
      ? alt.slice(0, 2).toUpperCase()
      : '?';

  return (
    <div className={cn('relative inline-flex shrink-0', className)}>
      <div
        className={cn(
          'flex items-center justify-center rounded-full overflow-hidden bg-[#00373E] text-white font-semibold',
          sizeConfig.text
        )}
        style={{ width: sizeConfig.dim, height: sizeConfig.dim }}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>
      {status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-white',
            statusColors[status],
            sizeConfig.status
          )}
          style={{ transform: 'translate(2px, 2px)' }}
        />
      )}
    </div>
  );
};
