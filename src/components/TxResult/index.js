import React from 'react'
import { connect } from 'react-redux'
import { Result, Button, Typography, Icon } from 'antd';
import * as globalCfg from '@app/configs/global';

import { injectIntl } from "react-intl";
import InjectMessage from "@app/components/intl-messages";

const { Paragraph, Text } = Typography;

export const  RESET_PAGE   = 'reset_page';
export const  RESET_RESULT = 'reset_result';
export const  DASHBOARD    = 'dashboard';

const TxResult = ({result_type, title, message, tx_id, error, cb, intl}) => {
    
    const onEvent = (evt_type) => {
       if(!cb)
         return;   
       if(typeof cb === 'function') {
         cb(evt_type);
       }
    }
    const backToDashboard = () =>{ onEvent(DASHBOARD)}
    const resetResult     = () =>{ onEvent(RESET_RESULT)}
    const resetPage       = () =>{ onEvent(RESET_PAGE)}
    const reset           = () =>{ result_type=='success'?resetPage():resetResult()}

    const default_title_suc   = intl.formatMessage({id:'components.TxResult.index.tx_succeed'}) ;
    const default_title_err   = intl.formatMessage({id:'components.TxResult.index.tx_failed'}) ;
    const default_message_suc = intl.formatMessage({id:'components.TxResult.index.wait'}) ;
    const default_message_err = intl.formatMessage({id:'components.TxResult.index.check_and_resubmit'}) ;

    let buttons = [ <Button type="primary" icon="close-circle" key="close" onClick={()=>reset()}>&nbsp;<InjectMessage id="components.TxResult.index.close" /></Button>,
                    <Button key="go-to-dashboard" onClick={()=>backToDashboard()}>&nbsp;<InjectMessage id="components.TxResult.index.go_to_dashboard" /></Button>];
    //
    if(result_type=='ok') result_type='success'
    if(result_type=='success' && tx_id)
    {
      const _href = globalCfg.eos.getBlockExplorerTxLink( tx_id);
      const view_on_blockchain = intl.formatMessage({id:'components.TxResult.index.view_on_blockchain'}) ;
      const blockchain         = intl.formatMessage({id:'components.TxResult.index.blockchain'}) ;
      buttons.push(<Button type="link" href={_href} target="_blank" key="view-on-blockchain" icon="cloud" title={view_on_blockchain}>{blockchain}</Button>)
    }
    //

    const default_title  = (result_type=='error')?default_title_err:default_title_suc;
    const default_mesage = (result_type=='error')?default_message_err:default_message_suc;
    let desc = (null);
    if(result_type=='error')
    {
      desc = (<div className="desc">
                  <Paragraph>
                    <Text strong style={{ fontSize: 16, }}><InjectMessage id="components.TxResult.index.errors" />:</Text>
                  </Paragraph>
                  <Paragraph>
                    <Icon style={{ color: 'red' }} type="close-circle" /> {error}
                  </Paragraph>
                </div>)
    }

    return (<Result
              status={result_type}
              title={title || default_title}
              subTitle={message || default_mesage}
              extra={buttons}>
                {desc}
              </Result>);
    // 
}

export default connect(
    (state)=> ({
    }),
    (dispatch) => ({
    })
)( injectIntl(TxResult))