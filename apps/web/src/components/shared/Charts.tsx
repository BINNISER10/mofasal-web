'use client';
import React, { useState, useEffect } from 'react';
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
import { CHART_COLORS } from '@/lib/chartColors';

export { CHART_COLORS };

const tooltipStyle = {
  backgroundColor: '#FFFFFF',
  border: '1px solid #D0D6D7',
  borderRadius: '12px',
  boxShadow: '0 4px 16px rgba(0, 55, 62, 0.1)',
  fontSize: '13px',
  color: '#00373E',
  padding: '12px 16px',
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const gradId = `grad-${color.replace('#', '')}`;

  if (!mounted) {
    return <div style={{ height, width: '100%' }} className="bg-[#F2E8D4]/20 animate-pulse rounded-xl" />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.15} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#D0D6D7" vertical={false} opacity={0.3} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11, fill: '#735B4D' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#735B4D' }}
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
          activeDot={{ r: 5, fill: color, strokeWidth: 2, stroke: '#F2E8D4' }}
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div style={{ height, width: '100%' }} className="bg-[#F2E8D4]/20 animate-pulse rounded-xl" />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="dual1" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.15} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
          <linearGradient id="dual2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color2} stopOpacity={0.15} />
            <stop offset="95%" stopColor={color2} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#D0D6D7" vertical={false} opacity={0.3} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#735B4D' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#735B4D' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${prefix}${v.toLocaleString()}`} width={50} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [`${prefix}${value.toLocaleString()}`, name]} />
        <Legend iconType="circle" iconSize={8} formatter={(value) => <span style={{ fontSize: '12px', color: '#735B4D' }}>{value}</span>} />
        <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} fill="url(#dual1)" dot={false} name={label1} activeDot={{ r: 4, fill: color, stroke: '#F2E8D4', strokeWidth: 2 }} />
        <Area type="monotone" dataKey="value2" stroke={color2} strokeWidth={2.5} fill="url(#dual2)" dot={false} name={label2} activeDot={{ r: 4, fill: color2, stroke: '#F2E8D4', strokeWidth: 2 }} />
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div style={{ height, width: '100%' }} className="bg-[#F2E8D4]/20 animate-pulse rounded-xl" />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D0D6D7" vertical={false} opacity={0.3} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#735B4D' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#735B4D' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${prefix}${v.toLocaleString()}`} width={50} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [`${prefix}${value.toLocaleString()}`, name || label1]} />
        {color2 && <Legend iconType="square" iconSize={10} formatter={(value) => <span style={{ fontSize: '12px', color: '#735B4D' }}>{value}</span>} />}
        <Bar dataKey="value" fill={color} radius={[6, 6, 0, 0]} name={label1} maxBarSize={44} />
        {color2 && (
          <Bar dataKey="value2" fill={color2} radius={[6, 6, 0, 0]} name={label2} maxBarSize={44} />
        )}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function MufasalPieChart({ data, height = 260, innerRadius = 55 }: PieChartProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div style={{ height, width: '100%' }} className="bg-[#F2E8D4]/20 animate-pulse rounded-xl" />;
  }

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
          stroke="#F2E8D4"
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
            <span style={{ fontSize: '12px', color: '#735B4D' }}>{value}</span>
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  if (!mounted) {
    return <div style={{ height, width: '100%' }} className="bg-[#F2E8D4]/20 animate-pulse rounded-xl" />;
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#D0D6D7" vertical={false} opacity={0.3} />
        <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#735B4D' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: '#735B4D' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${prefix}${v.toLocaleString()}`} width={50} />
        <Tooltip contentStyle={tooltipStyle} formatter={(value: number) => [`${prefix}${value.toLocaleString()}`, label]} />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2.5} dot={false} activeDot={{ r: 5, fill: color, strokeWidth: 2, stroke: '#F2E8D4' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}
