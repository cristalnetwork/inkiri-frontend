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

const IntroduceRow = ({ loading, visitData, intl }) => {

  const {formatMessage} = intl;

  return (
    <Row gutter={24} type="flex">
      <Col {...topColResponsiveProps}>
        <ChartCard
          bordered={false}
          title={ formatMessage({id:'total_iugu'}) }
          action={
            <Tooltip
              title={ formatMessage({id:'money_issued'}) }
            >
              <Icon type="info-circle-o" />
            </Tooltip>
          }
          loading={loading}
          total={() => <Yuan>126560</Yuan>}
          contentHeight={46}
        >
          <Trend flag="up" style={{ marginRight: 16 }}>
            { formatMessage({id:'weekly_changes'}) }
            <span className={'trendText'}>12%</span>
          </Trend>
          <Trend flag="down">
            { formatMessage({id:'daily_changes'}) }
            <span className={'trendText'}>11%</span>
          </Trend>
        </ChartCard>
      </Col>

      <Col {...topColResponsiveProps}>
        <ChartCard
          bordered={false}
          loading={loading}
          title={ formatMessage({id:'transactions_volume'}) }
          total={numeral(8846).format('0,0')}
          footer={
            <Field
              label={formatMessage({id:'daily_volume'})}
              value={numeral(1234).format('0,0')}
            />
          }
          contentHeight={46}
        >
          <MiniArea color="#975FE4" data={visitData} />
        </ChartCard>
      </Col>
      <Col {...topColResponsiveProps}>
        <ChartCard
          bordered={false}
          loading={loading}
          title={formatMessage({id:'payments'})}
          total={numeral(6560).format('0,0')}
          footer={
            <Field
              label={formatMessage({id:'something'})}
              value="60%"
            />
          }
          contentHeight={46}
        >
          <MiniBar data={visitData} />
        </ChartCard>
      </Col>
      <Col {...topColResponsiveProps}>
        <ChartCard
          loading={loading}
          bordered={false}
          title={formatMessage({id:'transactions_volume'})}
          action={
            <Tooltip
              title={formatMessage({id:'transactions_volume'})}
            >
              <Icon type="info-circle-o" />
            </Tooltip>
          }
          total="78%"
          footer={
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <Trend flag="up" style={{ marginRight: 16 }}>
                {formatMessage({id:'transactions_volume'})}
                <span className={'trendText'}>12%</span>
              </Trend>
              <Trend flag="down">
                {formatMessage({id:'transactions_volume'})}
                <span className={'trendText'}>11%</span>
              </Trend>
            </div>
          }
          contentHeight={46}
        >
          <MiniProgress percent={78} strokeWidth={8} target={80} color="#13C2C2" />
        </ChartCard>
      </Col>
    </Row>
  );
}

export default injectIntl(IntroduceRow);