import { Col, Icon, Row, Tooltip } from 'antd';

import React from 'react';
import numeral from 'numeral';
import ChartCard, { MiniArea, MiniBar, MiniProgress, Field } from './Charts';
import Trend from './Trend';
import Yuan from './utils/Yuan';
import styles from './style.less';

// import './stolen.css';
import './umi.e70625bc.css';

import { injectIntl } from "react-intl";

const topColResponsiveProps = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 6,
  style: { marginBottom: 24 },
};

const PendingRow = ({ loading, visitData, intl }) => 
{
  const {formatMessage} = intl;
  return (
    <Row gutter={24} type="flex">
      <Col {...topColResponsiveProps}>
        <ChartCard
          bordered={false}
          title={ formatMessage({id:'components.dashboard.pending_widget.exchanges'}) }
          loading={loading}
          total={() => '?'}
          footer={
            <Field
              label={ formatMessage({id:'components.dashboard.pending_widget.total_amount_requested'})}
              value={`BRL ${numeral(0).format('0,0')}`}
            />
          }
          contentHeight={46}
          style={{backgroundColor:'#fcf4c7'}}
        >
      
        </ChartCard>
      </Col>

      <Col {...topColResponsiveProps}>
        <ChartCard
          bordered={false}
          title={ formatMessage({id:'components.dashboard.pending_widget.providers_payments'}) }
          loading={loading}
          total={() => '?'}
          footer={
            <Field
              label={ formatMessage({id:'components.dashboard.pending_widget.total_amount_requested'})}
              value={`BRL ${numeral(0).format('0,0')}`}
            />
          }
          contentHeight={46}
          style={{backgroundColor:'#fcf4c7'}}
          
        >
          <Trend flag="right" style={{ marginRight: 16 }}>
            { formatMessage({id:'components.dashboard.pending_widget.providers_payments_investments'}) }
            <span className={'trendText'}>?%</span>
          </Trend>
          <Trend flag="down">
            { formatMessage({id:'components.dashboard.pending_widget.providers_payments_spendings'}) }
            <span className={'trendText'}>?%</span>
          </Trend>
        </ChartCard>
      </Col>

    </Row>
  );
}
//
export default injectIntl(PendingRow);
