import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import type { CountrySales } from "../../types/dataset";
import { TOOLTIP_STYLE, AXIS_TICK, GRID_STROKE, BAR_FILL } from "../../constants/chart";
import { formatCurrencyShort, formatTooltipValue } from "../../utils/format";
import styles from "./CountryChart.module.css";

interface CountryChartProps {
  data: CountrySales[];
}

export default function CountryChart({ data = [] }: Readonly<CountryChartProps>) {
  const formatted = data.map((d) => ({
    name: d.country,
    sales: Math.round(d.total_sales),
  }));

  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>Top Countries by Sales</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={formatted} layout="vertical" margin={{ top: 5, right: 20, bottom: 5, left: 80 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={GRID_STROKE} horizontal={false} />
          <XAxis type="number" tick={AXIS_TICK} tickFormatter={(v: number) => formatCurrencyShort(v)} />
          <YAxis type="category" dataKey="name" tick={AXIS_TICK} width={75} />
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={formatTooltipValue} />
          <Bar dataKey="sales" fill={BAR_FILL} radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
