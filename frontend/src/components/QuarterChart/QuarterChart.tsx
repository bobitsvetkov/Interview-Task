import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { QuarterlySales } from "../../types/dataset";
import { TOOLTIP_STYLE, AXIS_TICK, GRID_STROKE, BAR_FILL } from "../../constants/chart";
import { formatCurrencyShort, formatTooltipValue } from "../../utils/format";
import styles from "./QuarterChart.module.css";

interface QuarterChartProps {
  data: QuarterlySales[];
}

export default function QuarterChart({ data = [] }: Readonly<QuarterChartProps>) {
  const formatted = data.map((d) => ({
    name: `${d.year} ${d.quarter}`,
    sales: Math.round(d.total_sales),
  }));

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Sales by Quarter</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formatted} margin={{ top: 5, right: 20, bottom: 5, left: 10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} vertical={false} />
          <XAxis dataKey="name" tick={AXIS_TICK} />
          <YAxis tick={AXIS_TICK} tickFormatter={(v: number) => formatCurrencyShort(v)} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={formatTooltipValue} />
          <Bar dataKey="sales" fill={BAR_FILL} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
