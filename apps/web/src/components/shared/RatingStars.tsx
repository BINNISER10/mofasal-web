'use client';
import React, { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Star } from 'lucide-react';

interface RatingStarsProps {
  rating: number;
  maxRating?: number;
  size?: 'sm' | 'md' | 'lg';
  interactive?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

const sizes = {
  sm: 'w-3.5 h-3.5',
  md: 'w-5 h-5',
  lg: 'w-7 h-7',
};

export function RatingStars({
  rating,
  maxRating = 5,
  size = 'md',
  interactive = false,
  onChange,
  showValue = false,
  reviewCount,
  className,
}: RatingStarsProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive && hoverRating ? hoverRating : rating;

  return (
    <div className={cn('inline-flex items-center gap-0.5', className)}>
      {Array.from({ length: maxRating }, (_, i) => {
        const starValue = i + 1;
        const filled = starValue <= Math.floor(displayRating);
        const halfFilled = !filled && starValue - 0.5 <= displayRating;

        return (
          <button
            key={i}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(starValue)}
            onMouseEnter={() => interactive && setHoverRating(starValue)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={cn(
              'transition-transform',
              interactive && 'cursor-pointer hover:scale-110'
            )}
          >
            <Star
              className={cn(
                sizes[size],
                'transition-colors',
                filled && 'fill-gold-500 text-gold-500',
                halfFilled && 'fill-gold-500/50 text-gold-500',
                !filled && !halfFilled && 'fill-gray-200 text-gray-200'
              )}
            />
          </button>
        );
      })}
      {showValue && (
        <span className="mr-1.5 text-sm font-semibold text-gray-700">
          {rating.toFixed(1)}
        </span>
      )}
      {reviewCount !== undefined && (
        <span className="mr-1 text-xs text-gray-500">({reviewCount})</span>
      )}
    </div>
  );
}
