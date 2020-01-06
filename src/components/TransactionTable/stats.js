import React, {useEffect, useState} from 'react';
import { Card, Row, Col, Statistic, Icon, Switch } from 'antd';
import { connect } from 'react-redux'
import * as globalCfg from '@app/configs/global';

import './stats.css';

export const STAT_UP_GREEN             = 'stat_up_green';
export const STAT_DOWN_RED             = 'stat_down_red';
export const STAT_DATA_ONLY            = 'stat_data_only';
export const STAT_DATA_MONEY           = 'stat_data_money';
export const STAT_DATA_PENDING         = 'stat_data_pending';
export const STAT_DATA_MONEY_PENDING   = 'stat_data_money_pending';

const stats = {
  [STAT_UP_GREEN] : {
    color:  'green'
    , icon:   'arrow-up'
  },
  [STAT_DOWN_RED] : {
    color:  'red'
    , icon:   'arrow-down'
  },
  [STAT_DATA_ONLY]: {
    precision: 0
  },
  [STAT_DATA_MONEY]: {
    precision: 2,
    suffix:    globalCfg.currency.symbol
  },
  [STAT_DATA_PENDING]: {
    precision: 2,
    color:     '#fadb14',
    suffix     : (<Icon type="clock-circle" />)
  },
  [STAT_DATA_MONEY_PENDING]: {
    precision: 2,
    color:     '#fadb14',
    icon:      'clock-circle',
    suffix:    globalCfg.currency.symbol
  },
    
};

export const buildItem        = (title, value, type, color)  => {
  let returnedTarget = Object.assign({}, stats[type]);
  returnedTarget.title = title;
  returnedTarget.value = value;
  if(color!==undefined)
    returnedTarget.color = color;
  return returnedTarget;
}

export const buildItemUp           = (title, value) => { return buildItem(title, value, STAT_UP_GREEN) }
export const buildItemDown         = (title, value) => { return buildItem(title, value, STAT_DOWN_RED) }
export const buildItemCompute      = (title, value) => { return buildItem(title, value, (value>=0)?STAT_UP_GREEN:STAT_DOWN_RED) }
export const buildItemSimple       = (title, value, color) => { return buildItem(title, value, STAT_DATA_ONLY, color) }
export const buildItemMoney        = (title, value, color) => { return buildItem(title, value, STAT_DATA_MONEY, color) }
export const buildItemPending      = (title, value) => { return buildItem(title, value, STAT_DATA_PENDING) }
export const buildItemMoneyPending = (title, value) => { return buildItem(title, value, STAT_DATA_MONEY_PENDING) }

const TableStats = ({stats_array, title, visible, can_close=true}) => {
    

    // const [my_visible, setVisible]          = useState((visible===false)||true);
    const [my_visible, setVisible]          = useState((visible===undefined)?false:visible);

    useEffect(() => {
      // if(visible===undefined)
      //   visible = true;
      // setVisible(visible);
    });

    const onChange = (checked) => {
      console.log(' => checked => ', checked)
      setVisible(checked);
    }

    const _xl = Math.floor(24 / (stats_array.length + (title?1:0)))

    const getTitle = (title) => {
      return (<Col xs={24} sm={12} md={6} lg={_xl} xl={_xl}>
               <Statistic title="" value={title} />
            </Col>);
    }
    //
    const getStatItem = (item) =>{
      if(!item)
        return (null);
      return (<Col key={Math.random()} xs={24} sm={12} md={6} lg={_xl} xl={_xl}>
                <Statistic
                    title={item.title}
                    value={item.value}
                    precision={(item.precision===undefined)?2:item.precision}
                    valueStyle={{ color: item.color||'inherit' }}
                    prefix={item.icon?(<Icon type={item.icon} />):(null)}
                    suffix={item.suffix||null}
                  />
              </Col>);
    }
    // size="small" 
    // console.log(' display stats? -> ', my_visible)
    /*  
      checkedChildren={<Icon type="eye" />}
      unCheckedChildren={<Icon type="eye-invisible" />}
    */
    return (
      <div className={"styles standardList statsWidget "+(my_visible?'':'content_hidden')}>
        { can_close && <Switch 
          defaultChecked={my_visible} 
          onChange={onChange} 
          style={{zIndex:10, position:'absolute', top:6, right:6}} 
          checkedChildren={<Icon type="eye" />}
          unCheckedChildren={<>Stats&nbsp;<Icon type="eye-invisible" /></>}
          /> }

        <Card key="the_card_key" bordered={false} style={{background: '#F5F5F5'}} className={(my_visible?'':'hidden')} >
          <Row>
            
            { title?getTitle(title):(null) }

            { stats_array.map((stat)=> getStatItem(stat)) }
            
          </Row>
        </Card>
      </div>
    );
    
    
}
//
export default connect(
    (state)=> ({
        // allAccounts:     loginRedux.allAccounts(state),
        // actualAccountName:   loginRedux.actualAccountName(state),
        // currentAccount:  loginRedux.currentAccount(state),
        // isLoading:       loginRedux.isLoading(state)
    })
)(TableStats)