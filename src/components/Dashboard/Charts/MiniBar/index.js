import { Chart, Geom, Tooltip } from 'bizcharts';

import React from 'react';
import autoHeight from '../autoHeight';
import styles from '../index.less';

// export interface MiniBarProps {
//   color?: string;
//   height?: number;
//   data: {
//     x: number | string;
//     y: number;
//   }[];
//   forceFit?: boolean;
//   style?: React.CSSProperties;
// }

const MiniBar = (props) => {
  const { height = 0, forceFit = true, color = '#1890FF', data = [] } = props;

  const scale = {
    x: {
      type: 'cat',
    },
    y: {
      min: 0,
    },
  };

  const padding = [36, 5, 30, 5];

  const tooltip = [
    'x*y',
    (x, y) => ({
      name: x,
      value: y,
    }),
  ];

  // for tooltip not to be hide
  const chartHeight = height + 54;

  return (
    <div className={'miniChart'} style={{ height }}>
      <div className={'chartContent'}>
        <Chart scale={scale} height={chartHeight} forceFit={forceFit} data={data} padding={padding}>
          <Tooltip showTitle={false} crosshairs={false} />
          <Geom type="interval" position="x*y" color={color} tooltip={tooltip} />
        </Chart>
      </div>
    </div>
  );
};
export default autoHeight()(MiniBar);
