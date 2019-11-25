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

const PendingRow = ({ loading, visitData }) => (
  <Row gutter={24} type="flex">
    <Col {...topColResponsiveProps}>
      <ChartCard
        borderedx={false}
        title={"Câmbio por R$"}
        action={
          <Tooltip
            title={"Introduce"}
          >
            <Icon type="info-circle-o" />
          </Tooltip>
        }
        loading={loading}
        total={() => 8}
        footer={
          <Field
            label={"Total requested"}
            value={`BRL ${numeral(12423).format('0,0')}`}
          />
        }
        contentHeight={46}
        style={{backgroundColor:'#fcf4c7'}}
      >
    
      </ChartCard>
    </Col>

    <Col {...topColResponsiveProps}>
      <ChartCard
        borderedx={false}
        title={"Pago a fornecedores"}
        action={
          <Tooltip
            title={"Introduce"}
          >
            <Icon type="info-circle-o" />
          </Tooltip>
        }
        loading={loading}
        total={() => 5}
        footer={
          <Field
            label={"Total requested"}
            value={`BRL ${numeral(654321).format('0,0')}`}
          />
        }
        contentHeight={46}
        style={{backgroundColor:'#fcf4c7'}}
        
      >
        <Trend flag="right" style={{ marginRight: 16 }}>
          "Investimento"
          <span className={'trendText'}>12%</span>
        </Trend>
        <Trend flag="down">
          "Insumos"
          <span className={'trendText'}>11%</span>
        </Trend>
      </ChartCard>
    </Col>

  </Row>
);

export default PendingRow;
