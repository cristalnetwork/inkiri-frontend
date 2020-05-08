import { Col, Icon, Row, Tooltip } from 'antd';

import React, { useState, useEffect } from 'react';
import numeral from 'numeral';
import ChartCard, { MiniArea, MiniBar, MiniProgress, Field } from './Charts';
import Trend from './Trend';
import Yuan from './utils/Yuan';
import styles from './style.less';

import _ from 'lodash';

import { injectIntl } from "react-intl";

import * as globalCfg from '@app/configs/global';

// import './stolen.css';
// import './umi.e70625bc.css';

const topColResponsiveProps = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 6,
  style: { marginBottom: 24 },
};

const ContasRow = ({ loading, rawData , intl}) => {

  const [data, setData] = useState(rawData||{})
  
  useEffect(() => {
      setData(rawData||{});
  });

  const display_ = [globalCfg.bank.ACCOUNT_TYPE_PERSONAL, globalCfg.bank.ACCOUNT_TYPE_BUSINESS, globalCfg.bank.ACCOUNT_TYPE_FOUNDATION];
  const total    = data?data.length:0;
  const _data     = !data
    ?display_:
    display_
    .map( (_type) => 
      {
        const _count = data.filter(acc => globalCfg.bank.isAccountOfType(acc, _type)).length;
        return{ 
          key:     _type,
          count:   _count,
          percent: total>0?((_count/total)*100).toFixed(2):0
        };
      }
    );
    
  const display_data  = _.reduce(_data, function(result, value, key) {
          result[value.key] = value||{};
          return result;
        }, {});

  const {formatMessage} = intl;
  return (
    <Row gutter={24} type="flex">
      <Col {...topColResponsiveProps}>
        <ChartCard
          loading={loading}
          bordered={false}
          title={ formatMessage({id:'components.dashboard.account_widget.personal_accounts'}) }
          total={display_data[globalCfg.bank.ACCOUNT_TYPE_PERSONAL].count}
          footer={
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <Tooltip title={ formatMessage({id:'components.dashboard.account_widget.negative_balance_accounts'}) }>
                <Trend flag="up" style={{ marginRight: 16 }}>
                  { formatMessage({id:'components.dashboard.account_widget.negative_balance_accounts_mini'}) }
                  <span className={'trendText'}>?%</span>
                </Trend>
              </Tooltip>
              <Tooltip title={ formatMessage({id:'components.dashboard.account_widget.active_accounts'}) }>
                <Trend flag="down">
                  { formatMessage({id:'components.dashboard.account_widget.active_accounts_mini'}) }
                  <span className={'trendText'}>?%</span>
                </Trend>
              </Tooltip>
            </div>
          }
          contentHeight={46}
        >
          <MiniProgress percent={display_data[globalCfg.bank.ACCOUNT_TYPE_PERSONAL].percent} strokeWidth={8} target={100} color="#13C2C2" />
        </ChartCard>
      </Col>
      
      <Col {...topColResponsiveProps}>
        <ChartCard
          loading={loading}
          bordered={false}
          title={ formatMessage({id:'components.dashboard.account_widget.business_accounts'}) }
          total={display_data[globalCfg.bank.ACCOUNT_TYPE_BUSINESS].count}
          footer={
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <Tooltip title={ formatMessage({id:'components.dashboard.account_widget.negative_balance_accounts'}) }>
                <Trend flag="up" style={{ marginRight: 16 }}>
                  { formatMessage({id:'components.dashboard.account_widget.negative_balance_accounts_mini'}) }
                  <span className={'trendText'}>?%</span>
                </Trend>
              </Tooltip>
              <Tooltip title={ formatMessage({id:'components.dashboard.account_widget.active_accounts'}) }>
                <Trend flag="down">
                  { formatMessage({id:'components.dashboard.account_widget.active_accounts_mini'}) }
                  <span className={'trendText'}>?%</span>
                </Trend>
              </Tooltip>
            </div>
          }
          contentHeight={46}
        >
          <MiniProgress percent={display_data[globalCfg.bank.ACCOUNT_TYPE_BUSINESS].percent} strokeWidth={8} target={100} color="#13C2C2" />
        </ChartCard>
      </Col>

      <Col {...topColResponsiveProps}>
        <ChartCard
          loading={loading}
          bordered={false}
          title={ formatMessage({id:'components.dashboard.account_widget.foundation_accounts'}) }
          total={display_data[globalCfg.bank.ACCOUNT_TYPE_FOUNDATION].count}
          footer={
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden' }}>
              <Tooltip title={ formatMessage({id:'components.dashboard.account_widget.negative_balance_accounts'}) }>
                <Trend flag="up" style={{ marginRight: 16 }}>
                  { formatMessage({id:'components.dashboard.account_widget.negative_balance_accounts_mini'}) }
                  <span className={'trendText'}>?%</span>
                </Trend>
              </Tooltip>
              <Tooltip title={ formatMessage({id:'components.dashboard.account_widget.active_accounts'}) }>
                <Trend flag="down">
                  { formatMessage({id:'components.dashboard.account_widget.active_accounts_mini'}) }
                  <span className={'trendText'}>?%</span>
                </Trend>
              </Tooltip>
            </div>
          }
          contentHeight={46}
        >
          <MiniProgress percent={display_data[globalCfg.bank.ACCOUNT_TYPE_FOUNDATION].percent} strokeWidth={8} target={100} color="#13C2C2" />
        </ChartCard>
      </Col>
    </Row>
  );
};

export default injectIntl(ContasRow);
