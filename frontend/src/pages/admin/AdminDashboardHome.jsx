import { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import api from "../../api/axios.js";

const GOLD = "#D4A94F";
const IVORY_DIM = "rgb(var(--color-ivory) / 0.4)";
const NAVY_GRID = "rgba(148, 163, 184, 0.10)";

const STATUS_COLORS = {
  paid: "#4ADE80",
  pending: "#D4A94F",
  failed: "#F87171",
};

const formatMoney = (n) => `$${Number(n).toFixed(2)}`;

const formatShortDate = (isoDate) => {
  const [, m, d] = isoDate.split("-");
  return `${m}/${d}`;
};

function SectionCard({ title, eyebrow, children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-navy-700/50 bg-navy-900/60 p-6 backdrop-blur-sm ${className}`}>
      {(title || eyebrow) && (
        <div className="mb-5">
          {eyebrow && (
            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold-400/70">{eyebrow}</p>
          )}
          {title && <p className="mt-1 font-display text-base text-ivory">{title}</p>}
        </div>
      )}
      {children}
    </div>
  );
}

function StatItem({ label, value, sub }) {
  return (
    <div className="flex-1 border-l border-navy-700/60 pl-4 first:border-l-0 first:pl-0">
      <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-ivory/40">{label}</p>
      <p className="mt-1.5 font-display text-xl text-ivory">{value}</p>
      {sub && <p className="mt-0.5 text-[11px] text-ivory/35">{sub}</p>}
    </div>
  );
}

function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-md border border-navy-700 bg-navy-800 px-3 py-2 text-xs text-ivory shadow-xl">
      <p className="text-ivory/50">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="mt-0.5 text-ivory">
          {formatter ? formatter(p.value) : p.value}
        </p>
      ))}
    </div>
  );
}

function TopBooksList({ books }) {
  const maxUnits = Math.max(...books.map((b) => b.unitsSold), 1);

  return (
    <div className="space-y-3">
      {books.slice(0, 5).map((book, i) => {
        const pct = (book.unitsSold / maxUnits) * 100;
        const isTop = i === 0;
        return (
          <div key={book.title} className="flex items-center gap-4">
            <span
              className={`w-5 shrink-0 text-center font-display text-sm ${
                isTop ? "text-gold-400" : "text-ivory/30"
              }`}
            >
              {i + 1}
            </span>

            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center justify-between gap-2">
                <p className="truncate text-sm text-ivory">{book.title}</p>
                <p className={`shrink-0 text-sm font-medium ${isTop ? "text-gold-400" : "text-ivory/60"}`}>
                  {book.unitsSold} sold
                </p>
              </div>
              <div className="h-1.5 overflow-hidden rounded-full bg-navy-800">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    backgroundColor: isTop ? "#D4A94F" : "rgba(212,169,79,0.4)",
                  }}
                />
              </div>
            </div>
          </div>
        );
      })}

      {books.length > 5 && (
        <button className="mt-2 text-xs text-gold-400/80 hover:text-gold-400">
          View all {books.length} →
        </button>
      )}
    </div>
  );
}

export default function AdminDashboardHome() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    api
      .get("/stats/dashboard")
      .then(({ data }) => {
        if (!cancelled) setStats(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.response?.data?.message || "Could not load dashboard stats.");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) return <p className="text-ivory/50">Loading dashboard…</p>;
  if (error) return <p className="text-sm text-red-400">{error}</p>;
  if (!stats) return null;

  const { totals, revenueByDay, userGrowthByDay, topBooks, orderStatus } = stats;
  const totalOrderCount = orderStatus.reduce((sum, s) => sum + s.count, 0) || 1;
  const totalSignups = userGrowthByDay.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-5">
      <SectionCard eyebrow="Total Revenue" className="overflow-hidden">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[auto_1fr] lg:items-end">
          <div>
            <p className="font-display text-5xl text-ivory">{formatMoney(totals.totalRevenue)}</p>
            <p className="mt-1 text-xs text-ivory/40">Paid orders, all time</p>

            <div className="mt-8 flex gap-6">
              <StatItem label="Orders" value={totals.totalOrders} />
              <StatItem label="Active Users" value={totals.activeUsers} />
              <StatItem label="Books Listed" value={totals.totalBooks} />
            </div>
          </div>

          <div className="h-40 lg:h-44">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueByDay} margin={{ left: 0, right: 0, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={GOLD} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={GOLD} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  stroke={IVORY_DIM}
                  tick={{ fontSize: 10, fill: IVORY_DIM }}
                  interval={4}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis hide domain={["dataMin", "dataMax"]} />
                <Tooltip content={<ChartTooltip formatter={formatMoney} />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke={GOLD}
                  strokeWidth={2}
                  fill="url(#revenueFill)"
                  activeDot={{ r: 4, fill: GOLD }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </SectionCard>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <SectionCard eyebrow="Last 30 Days" title="New Signups" className="lg:col-span-2">
          <p className="mb-4 font-display text-2xl text-ivory">
            {totalSignups}
            <span className="ml-2 text-xs font-normal text-ivory/40">new members</span>
          </p>

          <div className="text-ivory">
            <ResponsiveContainer width="100%" height={180}>
              <AreaChart data={userGrowthByDay} margin={{ left: 0, right: 10 }}>
                <defs>
                  <linearGradient id="signupsFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="currentColor" stopOpacity={0.2} />
                    <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={NAVY_GRID} vertical={false} />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                  stroke={IVORY_DIM}
                  tick={{ fontSize: 11, fill: IVORY_DIM }}
                  interval={6}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  stroke={IVORY_DIM}
                  tick={{ fontSize: 11, fill: IVORY_DIM }}
                  width={30}
                  allowDecimals={false}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<ChartTooltip />} />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="currentColor"
                  strokeWidth={2}
                  fill="url(#signupsFill)"
                  activeDot={{ r: 4, fill: "currentColor" }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard eyebrow="Fulfillment" title="Order Status">
          {orderStatus.length === 0 ? (
            <p className="py-8 text-center text-sm text-ivory/40">No orders yet.</p>
          ) : (
            <>
              <div className="relative mx-auto h-40 w-40">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={orderStatus}
                      dataKey="count"
                      nameKey="status"
                      innerRadius={52}
                      outerRadius={72}
                      paddingAngle={3}
                      stroke="none"
                    >
                      {orderStatus.map((s) => (
                        <Cell key={s.status} fill={STATUS_COLORS[s.status] || GOLD} />
                      ))}
                    </Pie>
                    <Tooltip content={<ChartTooltip formatter={(v) => `${v} orders`} />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                  <p className="font-display text-2xl text-ivory">{totalOrderCount}</p>
                  <p className="text-[10px] uppercase tracking-widest text-ivory/40">Orders</p>
                </div>
              </div>

              <div className="mt-6 space-y-2.5">
                {orderStatus.map((s) => {
                  const pct = Math.round((s.count / totalOrderCount) * 100);
                  return (
                    <div key={s.status} className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-2 capitalize text-ivory/70">
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ backgroundColor: STATUS_COLORS[s.status] || GOLD }}
                        />
                        {s.status}
                      </span>
                      <span className="text-ivory/45">
                        {s.count} · {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </SectionCard>
      </div>

      <SectionCard eyebrow="Best Performers" title="Top-Selling Books">
        {topBooks.length === 0 ? (
          <p className="py-8 text-center text-sm text-ivory/40">No paid orders yet.</p>
        ) : (
          <TopBooksList books={topBooks} />
        )}
      </SectionCard>
    </div>
  );
}