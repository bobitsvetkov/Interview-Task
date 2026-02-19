import { PieChart, Pie, Tooltip, ResponsiveContainer, Legend } from "recharts";
import type { DealSizeBreakdown } from "../../types/dataset";
import { TOOLTIP_STYLE } from "../../constants/chart";
import { formatTooltipValue } from "../../utils/format";
import styles from "./DealSizeChart.module.css";

interface DealSizeChartProps {
  data: DealSizeBreakdown[];
}

const COLORS: Record<string, string> = {
  Small: "#60a5fa",
  Medium: "#2563eb",
  Large: "#1e40af",
};

const DEFAULT_COLOR = "#94a3b8";

export default function DealSizeChart({ data = [] }: Readonly<DealSizeChartProps>) {
  const total = data.reduce((sum, d) => sum + d.total_sales, 0);

  const formatted = data.map((d) => ({
    name: d.deal_size,
    value: Math.round(d.total_sales),
    percent: total > 0 ? ((d.total_sales / total) * 100).toFixed(1) : "0",
    fill: COLORS[d.deal_size] || DEFAULT_COLOR,
  }));

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Sales by Deal Size</h3>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={formatted}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) => `${name} (${percent}%)`}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={formatTooltipValue} />
          <Legend wrapperStyle={{ fontSize: 12, color: "#64748b" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
