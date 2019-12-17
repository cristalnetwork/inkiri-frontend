import React from 'react'
import { connect } from 'react-redux'
import * as balanceRedux from '@app/redux/models/balance'
import { bindActionCreators } from 'redux';
import { Result, Button, Typography, Icon } from 'antd';
import * as globalCfg from '@app/configs/global';

const { Paragraph, Text } = Typography;

export const  RESET_PAGE   = 'reset_page';
export const  RESET_RESULT = 'reset_result';
export const  DASHBOARD    = 'dashboard';

const TxResult = ({result_type, title, message, tx_id, error, cb}) => {
    
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

    const default_title_suc   = 'Transaction completed successfully!';
    const default_title_err   = 'Transaction Failed';
    const default_message_suc = 'Cloud server takes up to 30 seconds, please wait!';
    const default_message_err = 'Please check and modify the following information before resubmitting.';

    let buttons = [ <Button type="primary" icon="close-circle" key="close" onClick={()=>reset()}>Close</Button>,
                    <Button key="go-to-dashboard" onClick={()=>backToDashboard()}>Go to dashboard</Button>];
    //
    if(result_type=='ok') result_type='success'
    if(result_type=='success' && tx_id)
    {
      const _href = globalCfg.dfuse.getBlockExplorerTxLink( tx_id);
      buttons.push(<Button type="link" href={_href} target="_blank" key="view-on-blockchain" icon="cloud" title="View on Blockchain">B-Chain</Button>)
    }
    //

    const default_title  = (result_type=='error')?default_title_err:default_title_suc;
    const default_mesage = (result_type=='error')?default_message_err:default_message_suc;
    let desc = (null);
    if(result_type=='error')
    {
      desc = (<div className="desc">
                  <Paragraph>
                    <Text strong style={{ fontSize: 16, }}>The content you submitted has the following error(s):</Text>
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
        // balance:   balanceRedux.userBalanceFormatted(state),
        // loading:   balanceRedux.isLoading(state),
    }),
    (dispatch) => ({
        // loadBalance: bindActionCreators(balanceRedux.loadBalance, dispatch)
    })
)(TxResult)