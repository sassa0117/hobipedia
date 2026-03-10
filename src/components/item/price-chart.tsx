"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

interface PricePoint {
  date: string;
  price: number;
  priceType: string;
  source: string;
}

const PRICE_TYPE_COLORS: Record<string, string> = {
  SOLD: "#22c55e",
  LISTING: "#38bdf8",
  STORE_FIND: "#f59e0b",
  WANT_TO_BUY: "#f472b6",
  WANT_TO_SELL: "#a78bfa",
};

const PRICE_TYPE_LABELS: Record<string, string> = {
  SOLD: "実売",
  LISTING: "出品中",
  STORE_FIND: "店舗",
  WANT_TO_BUY: "買希望",
  WANT_TO_SELL: "売希望",
};

function formatYen(value: number) {
  return `¥${value.toLocaleString()}`;
}

function formatShortDate(dateStr: string) {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload as PricePoint;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs border border-white/[0.1] shadow-lg"
      style={{ background: "var(--bg-card, #1a1d2e)" }}
    >
      <div className="text-slate-400 mb-1">{data.date}</div>
      <div className="font-bold text-white">{formatYen(data.price)}</div>
      <div className="text-slate-500">
        {PRICE_TYPE_LABELS[data.priceType] || data.priceType} / {data.source}
      </div>
    </div>
  );
}

export function PriceChart({ reports }: { reports: PricePoint[] }) {
  if (reports.length < 2) {
    return (
      <div className="text-center text-xs text-slate-600 py-6">
        グラフ表示には2件以上のデータが必要です
      </div>
    );
  }

  // Sort by date ascending
  const sorted = [...reports].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Determine which price types are present
  const types = [...new Set(sorted.map((r) => r.priceType))];

  // If only one type, single line. Otherwise, split by type.
  if (types.length === 1) {
    const color = PRICE_TYPE_COLORS[types[0]] || "#a78bfa";
    return (
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={sorted} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
          <XAxis
            dataKey="date"
            tickFormatter={formatShortDate}
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
            tickLine={false}
          />
          <YAxis
            tickFormatter={formatYen}
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={60}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="price"
            stroke={color}
            strokeWidth={2}
            dot={{ r: 3, fill: color }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  // Multiple types: add typed price fields
  const dataMap = new Map<string, Record<string, number | string>>();
  for (const r of sorted) {
    const key = r.date;
    if (!dataMap.has(key)) {
      dataMap.set(key, { date: key });
    }
    dataMap.get(key)![r.priceType] = r.price;
  }
  const chartData = [...dataMap.values()];

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="date"
          tickFormatter={formatShortDate}
          tick={{ fontSize: 10, fill: "#64748b" }}
          axisLine={{ stroke: "rgba(255,255,255,0.06)" }}
          tickLine={false}
        />
        <YAxis
          tickFormatter={formatYen}
          tick={{ fontSize: 10, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
          width={60}
        />
        <Tooltip content={<CustomTooltip />} />
        {types.map((type) => (
          <Line
            key={type}
            type="monotone"
            dataKey={type}
            name={PRICE_TYPE_LABELS[type] || type}
            stroke={PRICE_TYPE_COLORS[type] || "#a78bfa"}
            strokeWidth={2}
            dot={{ r: 3, fill: PRICE_TYPE_COLORS[type] || "#a78bfa" }}
            activeDot={{ r: 5 }}
            connectNulls
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
