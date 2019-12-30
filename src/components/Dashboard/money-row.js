import React, { useState, useEffect } from 'react';

import { Col, Icon, Row, Tooltip } from 'antd';

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

const MoneyRow = ({ loading, rawData, visitData, intl }) => {

  const [data, setData] = useState(rawData||{})
  
  useEffect(() => {
      setData(rawData);
    }, [rawData]);
  
  const {formatMessage} = intl;

  return (
    <Row gutter={24} type="flex">
    
    <Col {...topColResponsiveProps}>
      <ChartCard
        bordered={false}
        title={formatMessage({id:'components.dashboard.money_widget.money_supply'})}
        action={
          <Tooltip
            title={ formatMessage({id:'components.dashboard.money_widget.money_supply_description'}) }
          >
            <Icon type="info-circle-o" />
          </Tooltip>
        }
        loading={loading}
        total={() => <Yuan>{data.supply||0}</Yuan>}
        contentHeight={77}
      >
        <Field
            label={ formatMessage({id:'components.dashboard.money_widget.money_supply_digital'}) }
            value={`IK$ ${numeral(0).format('0,0')}`}
          />
        <Field
            label={ formatMessage({id:'components.dashboard.money_widget.money_supply_paper'}) }
            value={`IK$ ${numeral(0).format('0,0')}`}
          />
        <Field
            label={ formatMessage({id:'components.dashboard.money_widget.money_supply_fiat_brl'}) }
            value={`BRL ${numeral(0).format('0,0')}`}
          />
      </ChartCard>
    </Col>

    <Col {...topColResponsiveProps}>
      <ChartCard
        bordered={false}
        title={ formatMessage({id:'components.dashboard.money_widget.total_iugu'}) }
        action={
          <Tooltip
            title={ formatMessage({id:'components.dashboard.money_widget.total_iugu_description'}) }
          >
            <Icon type="info-circle-o" />
          </Tooltip>
        }
        loading={loading}
        total={() => <Yuan>0</Yuan>}
        footer={
          <Field
            label={ formatMessage({id:'components.dashboard.money_widget.daily_sales'}) }
            value={`BRL ${numeral(0).format('0,0')}`}
          />
        }
        contentHeight={46}
      >
        <Trend flag="up" style={{ marginRight: 16 }}>
          { formatMessage({id:'components.dashboard.money_widget.weekly_changes'}) }
          <span className={'trendText'}>?%</span>
        </Trend>
        <Trend flag="down">
          { formatMessage({id:'components.dashboard.money_widget.daily_changes'}) }
          <span className={'trendText'}>?%</span>
        </Trend>
      </ChartCard>
    </Col>

    <Col {...topColResponsiveProps}>
      <ChartCard
        bordered={false}
        loading={loading}
        title={ formatMessage({id:'components.dashboard.money_widget.transaction_volume'}) }
        action={
          <Tooltip title={ formatMessage({id:'components.dashboard.money_widget.transaction_volume_description'}) }>
            <Icon type="info-circle-o" />
          </Tooltip>
        }
        total={numeral(0).format('0,0')}
        footer={
          <Field
            label={formatMessage({id:'components.dashboard.money_widget.daily_transactions'})}
            value={ `BRL ${numeral(0).format('0,0')}`}
          />
        }
        contentHeight={46}
      >
        <MiniArea color="#975FE4" data={visitData} />
      </ChartCard>
    </Col>
  </Row>
);
}
export default injectIntl(MoneyRow);
