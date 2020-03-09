import React from 'react';
import * as globalCfg from '@app/configs/global';
import { Tag, Button } from 'antd';
import { withRouter } from "react-router-dom";

const VersionIndicator = (props) => {
  
  const gotoInfo = () => {
    props.history.push({pathname: '/common/info'})
  }
  const demo_test_tag = globalCfg.env!='prod'
      ? ( <Tag key='demo' color="#eb2f96" onClick={gotoInfo}>{globalCfg.env.toUpperCase()}&nbsp;VERSION</Tag>)
      : (<Button icon="info" size="small" shape="circle" onClick={gotoInfo} title="Info"></Button>) ;
  //
  return (
    
    <>
      {demo_test_tag && props.newline && <br/>}
      {demo_test_tag}
    </>
    );
}
export default withRouter(VersionIndicator);

