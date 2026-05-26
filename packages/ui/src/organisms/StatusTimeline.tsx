import React from 'react';
import { Check } from 'lucide-react';
import { cn } from '../lib/utils';

export interface TimelineStep {
  key: string;
  label: string;
  labelAr?: string;
  date?: string;
  completed?: boolean;
  active?: boolean;
  icon?: React.ReactNode;
}

export interface StatusTimelineProps {
  steps: TimelineStep[];
  currentStep?: string;
  orientation?: 'horizontal' | 'vertical';
  size?: 'sm' | 'md';
  className?: string;
}

const stepCircleSize: Record<string, { w: string; iconSize: number; lineStyle: string }> = {
  sm: { w: 'w-6 h-6', iconSize: 12, lineStyle: 'h-0.5' },
  md: { w: 'w-8 h-8', iconSize: 16, lineStyle: 'h-0.5' },
};

export const StatusTimeline: React.FC<StatusTimelineProps> = ({
  steps,
  currentStep,
  orientation = 'vertical',
  size = 'md',
  className,
}) => {
  const circle = stepCircleSize[size];

  const renderStep = (step: TimelineStep, index: number) => {
    const isCompleted = step.completed ?? (currentStep ? steps.findIndex((s) => s.key === currentStep) > index : false);
    const isActive = step.active ?? (currentStep ? step.key === currentStep : false);
    const isLast = index === steps.length - 1;

    const stepContent = (
      <div
        className={cn(
          'flex items-center',
          orientation === 'vertical' ? 'flex-row' : 'flex-col'
        )}
      >
        {/* Circle */}
        <div
          className={cn(
            'relative flex items-center justify-center rounded-full shrink-0 transition-all duration-300 z-10',
            circle.w,
            isCompleted
              ? 'bg-[#0A5A64] text-white'
              : isActive
                ? 'bg-[#481719] text-white shadow-lg shadow-[#E8D4D4]'
                : 'bg-gray-200 text-gray-400'
          )}
        >
          {isCompleted ? (
            <Check size={circle.iconSize} strokeWidth={3} />
          ) : step.icon ? (
            step.icon
          ) : (
            <span
              className={cn(
                'font-semibold',
                size === 'sm' ? 'text-xs' : 'text-sm'
              )}
            >
              {index + 1}
            </span>
          )}
        </div>

        {/* Labels */}
        <div
          className={cn(
            orientation === 'vertical'
              ? 'ml-4 rtl:mr-4 rtl:ml-0'
              : 'mt-2 text-center',
            'flex-1 min-w-0'
          )}
        >
          <p
            className={cn(
              'font-medium',
              isCompleted || isActive ? 'text-gray-900' : 'text-gray-400',
              size === 'sm' ? 'text-xs' : 'text-sm',
              'rtl:text-right'
            )}
          >
            {step.label}
          </p>
          {step.date && (
            <p
              className={cn(
                'text-gray-400',
                size === 'sm' ? 'text-[10px]' : 'text-xs',
                'rtl:text-right'
              )}
            >
              {step.date}
            </p>
          )}
        </div>
      </div>
    );

    const connector = !isLast && (
      <div
        className={cn(
          orientation === 'vertical'
            ? 'w-0.5 h-8 ml-3.5 rtl:mr-3.5 rtl:ml-0'
            : 'flex-1 h-0.5 mx-2',
          isCompleted ? 'bg-[#0A5A64]' : isActive ? 'bg-gradient-to-r from-[#481719] to-gray-200' : 'bg-gray-200',
          circle.lineStyle
        )}
      />
    );

    return (
      <div
        key={step.key}
        className={cn(
          orientation === 'vertical' ? 'flex items-start' : 'flex-1 flex flex-col items-center',
          isActive && 'scale-105'
        )}
      >
        {orientation === 'horizontal' ? (
          <div className="flex items-center w-full">
            {stepContent}
            {connector}
          </div>
        ) : (
          <>
            {stepContent}
            {connector}
          </>
        )}
      </div>
    );
  };

  return (
    <div
      className={cn(
        orientation === 'horizontal'
          ? 'flex items-center overflow-x-auto py-2'
          : 'flex flex-col gap-1 py-2',
        'rtl:flex-row-reverse',
        className
      )}
    >
      {steps.map((step, index) => (
        <React.Fragment key={step.key}>
          {orientation === 'horizontal' ? (
            renderStep(step, index)
          ) : (
            renderStep(step, index)
          )}
        </React.Fragment>
      ))}
    </div>
  );
};
