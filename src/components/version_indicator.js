import React from 'react';
import * as globalCfg from '@app/configs/global';
import { Tag } from 'antd';
const VersionIndicator = (props) => {
  
  const demo_test_tag = globalCfg.env!='prod'
      ? ( <Tag key='demo' color="#eb2f96">{globalCfg.env.toUpperCase()}&nbsp;VERSION</Tag>)
      : null ;
  //
  return (
    
    <>
      {demo_test_tag && props.newline && <br/>}
      {demo_test_tag}
    </>
    );
}
export default VersionIndicator;

