import React, {useEffect, useState} from 'react';
import { Card, Row, Col, Statistic, Icon, Switch } from 'antd';
import { connect } from 'react-redux'
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';

import './stats.css';

export const STAT_UP_GREEN   = 'stat_up_green';
export const STAT_DOWN_RED   = 'stat_down_red';
export const STAT_DATA_ONLY  = 'stat_data_only';

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
  }
};

export const buildItem        = (title, value, type)  => {
  let returnedTarget = Object.assign({}, stats[type]);
  returnedTarget.title = title;
  returnedTarget.value = value;
  return returnedTarget;
}

export const buildItemUp      = (title, value) => { return buildItem(title, value, STAT_UP_GREEN) }
export const buildItemDown    = (title, value) => { return buildItem(title, value, STAT_DOWN_RED) }
export const buildItemCompute = (title, value) => { return buildItem(title, value, (value>0)?STAT_UP_GREEN:STAT_DOWN_RED) }
export const buildItemSimple  = (title, value) => { return buildItem(title, value, STAT_DATA_ONLY) }

const TableStats = ({stats_array, title, visible}) => {
    

    // const [my_visible, setVisible]          = useState((visible===false)||true);
    const [my_visible, setVisible]          = useState((visible===undefined)?true:visible);

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
      return (<Col xs={24} sm={12} md={6} lg={_xl} xl={_xl}>
                <Statistic
                    title={item.title}
                    value={item.value}
                    precision={item.precision||2}
                    valueStyle={{ color: item.color||'inherit' }}
                    prefix={item.icon?(<Icon type={item.icon} />):(null)}
                  />
              </Col>);
    }
    //
    console.log(' display stats? -> ', my_visible)
    return (
      <div className="styles standardList statsWidget">
        <Switch defaultChecked={my_visible} onChange={onChange} style={{zIndex:10, position:'absolute', top:6, right:6}} />

        <Card key="the_card_key" bordered={false} style={{background: '#ECECEC'}} className={(my_visible?'':'hidden')} >
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