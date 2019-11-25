import { Col, Icon, Row, Tooltip } from 'antd';

import React from 'react';
import numeral from 'numeral';
import ChartCard, { MiniArea, MiniBar, MiniProgress, Field } from './Charts';
import Trend from './Trend';
import Yuan from './utils/Yuan';
import styles from './style.less';

// import './stolen.css';
import './umi.e70625bc.css';

const topColResponsiveProps = {
  xs: 24,
  sm: 12,
  md: 12,
  lg: 12,
  xl: 6,
  style: { marginBottom: 24 },
};

const MoneyRow = ({ loading, visitData }) => (
  <Row gutter={24} type="flex">
    
    <Col {...topColResponsiveProps}>
      <ChartCard
        borderedx={false}
        title={"Bank Balance"}
        action={
          <Tooltip
            title={"Total issued - IK$  in circulation"}
          >
            <Icon type="info-circle-o" />
          </Tooltip>
        }
        loading={loading}
        total={() => <Yuan>10002563.2</Yuan>}
        contentHeight={77}
      >
        <Field
            label={"Digital IK$"}
            value={`IK$ ${numeral(12423).format('0,0')}`}
          />
        <Field
            label={"Paper IK$"}
            value={`IK$ ${numeral(2423).format('0,0')}`}
          />
        <Field
            label={"Fiat BRL"}
            value={`BRL ${numeral(423).format('0,0')}`}
          />
      </ChartCard>
    </Col>

    <Col {...topColResponsiveProps}>
      <ChartCard
        borderedx={false}
        title={"Total IUGU"}
        action={
          <Tooltip
            title={"IUGU sales"}
          >
            <Icon type="info-circle-o" />
          </Tooltip>
        }
        loading={loading}
        total={() => <Yuan>126560</Yuan>}
        footer={
          <Field
            label={"Daily Sales"}
            value={`BRL ${numeral(12423).format('0,0')}`}
          />
        }
        contentHeight={46}
      >
        <Trend flag="up" style={{ marginRight: 16 }}>
          Weekly Changes
          <span className={'trendText'}>12%</span>
        </Trend>
        <Trend flag="down">
          Daily Changes
          <span className={'trendText'}>11%</span>
        </Trend>
      </ChartCard>
    </Col>

    <Col {...topColResponsiveProps}>
      <ChartCard
        bordered={false}
        loading={loading}
        title={"Volume de Transações"}
        action={
          <Tooltip
            title={
              "Introduce" 
            }
          >
            <Icon type="info-circle-o" />
          </Tooltip>
        }
        total={numeral(8846).format('0,0')}
        footer={
          <Field
            label={"Daily Transactions"}
            value={ `BRL ${numeral(1234).format('0,0')}`}
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
        title={"Total issued"}
        action={
          <Tooltip
            title={"Introduce"}
          >
            <Icon type="info-circle-o" />
          </Tooltip>
        }
        total={numeral(6560).format('0,0')}
        footer={
          <Field
            label={"Daily issuing"}
            value="60%"
          />
        }
        contentHeight={46}
      >
        <MiniBar data={visitData} />
      </ChartCard>
    </Col>
  </Row>
);

export default MoneyRow;
