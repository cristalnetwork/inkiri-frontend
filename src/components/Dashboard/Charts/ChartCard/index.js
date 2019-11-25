import { Card } from 'antd';
// import { CardProps } from 'antd/es/card';
import React from 'react';
import classNames from 'classnames';
import styles from './index.less';

// type totalType = () => React.ReactNode;

const renderTotal = (total) => {
  if (!total && total !== 0) {
    return null;
  }
  let totalDom;
  switch (typeof total) {
    case 'undefined':
      totalDom = null;
      break;
    case 'function':
      totalDom = <div className={'total'}>{total()}</div>;
      break;
    default:
      totalDom = <div className={'total'}>{total}</div>;
  }
  return totalDom;
};

// export interface ChartCardProps extends CardProps {
//   title: React.ReactNode;
//   action?: React.ReactNode;
//   total?: React.ReactNode | number | (() => React.ReactNode | number);
//   footer?: React.ReactNode;
//   contentHeight?: number;
//   avatar?: React.ReactNode;
//   style?: React.CSSProperties;
// }

class ChartCard extends React.Component {

  constructor(props) {
    super(props);
  }
  
  renderContent = () => {
    const { contentHeight, title, avatar, action, total, footer, children, loading } = this.props;
    if (loading) {
      return false;
    }
    return (
      <div className={'chartCard'}>
        <div
          className={classNames('chartTop', {
            ['chartTopMargin']: !children && !footer,
          })}
        >
          <div className={'avatar'}>{avatar}</div>
          <div className={'metaWrap'}>
            <div className={'meta'}>
              <span className={'title'}>{title}</span>
              <span className={'action'}>{action}</span>
            </div>
            {renderTotal(total)}
          </div>
        </div>
        {children && (
          <div className={'content'} style={{ height: contentHeight || 'auto' }}>
            <div className={contentHeight && 'contentFixed'}>{children}</div>
          </div>
        )}
        {footer && (
          <div
            className={classNames('footer', {
              ['footerMargin']: !children,
            })}
          >
            {footer}
          </div>
        )}
      </div>
    );
  };

  render() {
    const {
      loading = false,
      contentHeight,
      title,
      avatar,
      action,
      total,
      footer,
      children,
      ...rest
    } = this.props;
    return (
      <Card loading={loading} bodyStyle={{ padding: '20px 24px 8px 24px' }} {...rest}>
        {this.renderContent()}
      </Card>
    );
  }
}

export default ChartCard;
