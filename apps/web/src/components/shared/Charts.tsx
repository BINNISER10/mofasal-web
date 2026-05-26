'use client';
import React from 'react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export const CHART_COLORS = {
  primary: '#00373E',
  primaryMid: '#1A6470',
  primaryLight: '#4A949B',
  secondary: '#481719',
  gold: '#F59E0B',
  goldDark: '#D97706',
  green: '#22C55E',
  greenDark: '#16A34A',
  blue: '#3B82F6',
  red: '#EF4444',
  gray: '#9CA3AF',
  orange: '#F97316',
  purple: '#8B5CF6',
};

const tooltipStyle = {
  backgroundColor: '#fff',
  border: '1px solid #E5E7EB',
  borderRadius: '12px',
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)',
  fontSize: '13px',
};

interface AreaData {
  name: string;
  value: number;
  value2?: number;
}

interface BarData {
  name: string;
  value: number;
  value2?: number;
}

interface PieData {
  name: string;
  value: number;
  color: string;
}

interface AreaChartProps {
  data: AreaData[];
  height?: number;
  color?: string;
  label?: string;
  prefix?: string;
  suffix?: string;
}

interface DualBarChartProps {
  data: BarData[];
  height?: number;
  color?: string;
  color2?: string;
  label1?: string;
  label2?: string;
  prefix?: string;
}

interface PieChartProps {
  data: PieData[];
  height?: number;
  innerRadius?: number;
}

const RADIAN = Math.PI / 180;

const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight="bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export function MufasalAreaChart({
  data,
  height = 260,
  color = CHART_COLORS.primary,
  label = '',
  prefix = '',
  suffix = '',
}: AreaChartProps) {
  const gradId = `grad-${color.replace('#', '')}`;
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.18} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#9CA3AF' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${prefix}${v.toLocaleString()}${suffix}`}
          width={50}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number) => [
            `${prefix}${value.toLocaleString()}${suffix}`,
            label,
          ]}
        />
        <Area
          type="monotone"
          dataKey="value"
          stroke={color}
          strokeWidth={2.5}
          fill={`url(#${gradId})`}
          dot={false}
          activeDot={{ r: 5, fill: color, strokeWidth: 2, stroke: '#fff' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MufasalDualAreaChart({
  data,
  height = 260,
  color = CHART_COLORS.primary,
  color2 = CHART_COLORS.gold,
  label1 = '',
  label2 = '',
  prefix = '',
}: DualBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="dual1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.18} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="dual2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color2} stopOpacity={0.18} />
            <stop offset="95%" stopColor={color2} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${prefix}${v.toLocaleString()}`} width={50} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [`${prefix}${value.toLocaleString()}`, name]} />
        <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: '12px', color: '#6B7280' }}>{value}</span>} />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill="url(#dual1)" dot={false} name={label1} activeDot={{ r: 4 }} />
        <Area type="monotone" dataKey="value2" stroke={color2} strokeWidth={2.5} fill="url(#dual2)" dot={false} name={label2} activeDot={{ r: 4 }} />
      </AreaChart>
    </ResponsiveContainer>
  );
}

export function MufasalBarChart({
  data,
  height = 260,
  color = CHART_COLORS.primary,
  color2,
  label1 = '',
  label2 = '',
  prefix = '',
}: DualBarChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${prefix}${v.toLocaleString()}`} width={50} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [`${prefix}${value.toLocaleString()}`, name || label1]} />
        {color2 && <Legend iconType="square" iconSize={10} formatter={(value) => <span style={{ fontSize: '12px', color: '#6B7280' }}>{value}</span>} />}
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} name={label1} maxBarSize={44} />
        {color2 && (
          <Bar dataKey="value2" fill={color2} radius={[6, 6, 0, 0]} name={label2} maxBarSize={44} />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MufasalPieChart({ data, height = 260, innerRadius = 55 }: PieChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={innerRadius}
          outerRadius={innerRadius + 65}
          dataKey="value"
          labelLine={false}
          label={renderPieLabel}
          strokeWidth={2}
          stroke="#fff"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(value: number, name: string) => [value.toLocaleString(), name]}
        />
        <Legend
          iconType="circle"
          iconSize={9}
          formatter={(value) => (
            <span style={{ fontSize: '12px', color: '#6B7280' }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MufasalLineChart({
  data,
  height = 260,
  color = CHART_COLORS.primary,
  label = '',
  prefix = '',
}: AreaChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#9CA3AF' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${prefix}${v.toLocaleString()}`} width={50} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${prefix}${value.toLocaleString()}`, label]} />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: color, strokeWidth: 2, stroke: '#fff' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
