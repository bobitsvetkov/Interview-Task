import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { TOOLTIP_STYLE, AXIS_TICK, GRID_STROKE, BAR_FILL } from "../../constants/chart";
import { formatCurrencyShort, formatTooltipValue } from "../../utils/format";
import styles from "./BarChartCard.module.css";

interface ChartDataPoint {
  name: string;
  sales: number;
}

interface BarChartCardProps {
  title: string;
  data: ChartDataPoint[];
  horizontal?: boolean;
  labelWidth?: number;
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
}

export default function BarChartCard({
  title,
  data,
  horizontal = false,
  labelWidth = 75,
  margin = { top: 5, right: 20, bottom: 5, left: 10 },
}: Readonly<BarChartCardProps>) {
  return (
    <div className={styles.wrapper}>
      <h3 className={styles.title}>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} layout={horizontal ? "vertical" : "horizontal"} margin={margin}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={GRID_STROKE}
            vertical={!horizontal}
            horizontal={horizontal}
          />
          {horizontal ? (
            <>
              <XAxis type="number" tick={AXIS_TICK} tickFormatter={(v: number) => formatCurrencyShort(v)} />
              <YAxis type="category" dataKey="name" tick={AXIS_TICK} width={labelWidth} />
            </>
          ) : (
            <>
              <XAxis dataKey="name" tick={AXIS_TICK} />
              <YAxis tick={AXIS_TICK} tickFormatter={(v: number) => formatCurrencyShort(v)} />
            </>
          )}
          <Tooltip contentStyle={TOOLTIP_STYLE} formatter={formatTooltipValue} />
          <Bar dataKey="sales" fill={BAR_FILL} radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
