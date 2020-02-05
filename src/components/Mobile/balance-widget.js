import React, {useEffect, useState, Component} from 'react'
import { connect } from 'react-redux'
import * as balanceRedux from '@app/redux/models/balance'
import { bindActionCreators } from 'redux';
import { Spin, Button, Carousel } from 'antd';
import * as globalCfg from '@app/configs/global';

const MobileBalanceWidget = (props) => {
    
  const [full_balance, setFullBalance] = useState(props.balanceAndOverdraft);
  const [balance, setBalance] = useState(props.balance);
  const [loading, setLoading] = useState(props.loading);
  const [userId, setUserId] = useState(props.userId);
  const [showFullBalance, setShowFullBalance] = useState(false);

  useEffect(() => {
      setLoading(props.loading);
    }, [props.loading]);

  useEffect(() => {
      setFullBalance(props.balanceAndOverdraft);
    }, [props.balanceAndOverdraft]);

  useEffect(() => {
      setBalance(props.balance);
    }, [props.balance]);
  
  useEffect(() => {
      setUserId(props.userId);
    }, [props.userId]);
  

  const reloadBalance = async() =>{
    if(userId)
      props.loadBalance(userId);
  }

  const currency = <span className="currency_symbol">{globalCfg.currency.symbol}&nbsp;</span>;
  //

  const overdraft_widget = (balance!=full_balance)
    ?(<div className="balance_wrapper">
              {
                loading 
                  ? <Spin size={'small'} />
                  : <Button className="currency_button" type="link" onClick={() => {reloadBalance()}}>
                      {currency} <span className="amount" >{full_balance}</span>
                    </Button>
              }
              <span className="balance_overdraft_hint">BALANCE+OVERDRAFT</span>
            </div>)
    :(null);
  return(
      <Carousel effect="fade">
        <div className="balance_wrapper">
          {
            loading 
              ? <Spin size={'small'} />
              : <Button className="currency_button" type="link" onClick={() => {reloadBalance()}}>
                  {currency} <span className="amount" >{balance}</span>
                </Button>
          }
        </div>
        {overdraft_widget}
      </Carousel>
  );
  //
}
//
export default connect(
    (state)=> ({
        balance:             balanceRedux.userBalanceNoOftFormatted(state),
        balanceAndOverdraft: balanceRedux.userBalanceFormatted(state),
        loading:             balanceRedux.isLoading(state),
    }),
    (dispatch)=>({
        loadBalance: bindActionCreators(balanceRedux.loadBalance, dispatch)
      
    })
)(MobileBalanceWidget)
