import { Icon } from 'antd';
import React from 'react';
import classNames from 'classnames';
import styles from './index.less';

// export interface TrendProps {
//   colorful?: boolean;
//   flag: 'up' | 'down';
//   style?: React.CSSProperties;
//   reverseColor?: boolean;
//   className?: string;
// }

const Trend= ({
  colorful = true,
  reverseColor = false,
  flag,
  children,
  className,
  ...rest
}) => {
  const classString = classNames(
    'trendItem',
    {
      ['trendItemGrey']: !colorful,
      ['reverseColor']: reverseColor && colorful,
    },
    className,
  );
  return (
    <div {...rest} className={classString} title={typeof children === 'string' ? children : ''}>
      <span>{children}</span>
      {flag && (
        <span className={flag}>
          <Icon type={`caret-${flag}`} />
        </span>
      )}
    </div>
  );
};

export default Trend;
