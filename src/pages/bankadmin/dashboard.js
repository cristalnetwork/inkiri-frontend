import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as balanceRedux from '@app/redux/models/balance'
import * as accountsRedux from '@app/redux/models/accounts';

import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';

import { Route, Redirect, withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import IntroduceRow from '@app/components/Dashboard/IntroduceRow';
import ContasRow from '@app/components/Dashboard/ContasRow';
import PendingRow from '@app/components/Dashboard/PendingRow';
import MoneyRow from '@app/components/Dashboard/MoneyRow';

import { Form, Select, Icon, Input, Card, PageHeader, Tag, Tabs, Button, Statistic, Row, Col } from 'antd';

import { notification, Table, Divider, Spin } from 'antd';

import * as utils from '@app/utils/utils';

import moment from 'moment';

class Operations extends Component {
  constructor(props) {
    super(props);
    this.state = {
      routes :             routesService.breadcrumbForPaths(props.location.pathname),
      loading:             false,
      visitData:           this.loadData(),
      accounts:            props.accounts,
      currencyStats:       props.currencyStats
    };

    
    this.openNotificationWithIcon   = this.openNotificationWithIcon.bind(this); 
  }
  
  

  loadData = () => {
    // https://preview.pro.ant.design/dashboard/analysis
    let visitData = [];
    const beginDay = new Date().getTime();

    const fakeY = [7, 5, 4, 2, 4, 7, 5, 6, 5, 9, 6, 3, 1, 5, 3, 6, 5];
    for (let i = 0; i < fakeY.length; i += 1) {
      visitData.push({
        x: moment(new Date(beginDay + 1000 * 60 * 60 * 24 * i)).format('YYYY-MM-DD'),
        y: fakeY[i],
      });
    }
    return visitData;
  }
  componentDidMount(){
  } 

  componentDidUpdate(prevProps, prevState) 
  {
      if(prevProps.accounts !== this.props.accounts )
      {
        this.setState({accounts: this.props.accounts});
      }

      if(prevProps.currencyStats !== this.props.currencyStats )
      {
        this.setState({currencyStats: this.props.currencyStats});
        // console.log('dashboard-didupdate-currencyStats:', this.props.currencyStats)
      }
  }
  
  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }
  
  renderContent = () => {

    const { visitData, accounts, currencyStats, operations } = this.state;
    const { isLoadingAccounts, isLoadingCurrencyStats, isOperationsLoading }      =  this.props;
    
    

    return (<>
        
        <h3>Contas <Button 
                        loading={isLoadingAccounts} 
                        icon="redo"
                        title="Account info is not updated?? Click to reload account's data!"
                        onClick={this.props.loadAccounts}></Button> 
        </h3>
        <ContasRow loading={false} rawData={accounts} />
        
        <h3>Operações Pendentes </h3>
          <PendingRow loading={false} visitData={visitData} />
        
        <h3>Dinheiro em Circulação <Button 
                        loading={isLoadingCurrencyStats} 
                        icon="redo"
                        title="Currency info is not updated?? Click to reload data!"
                        onClick={this.props.loadCurrencyStats}></Button> </h3>
        <MoneyRow loading={isLoadingCurrencyStats} rawData={currencyStats} visitData={visitData} />
        
        </>);
  }

  //
  
  render() {
    const content               = this.renderContent();
    
    const {routes, active_tab}  = this.state;
    return (
      <>
        <PageHeader
          breadcrumb={{ routes:routes, itemRender:components_helper.itemRender }}
          title="Dashboard"
        >
        </PageHeader>
        
        <div className="styles standardList" style={{ marginTop: 24 }}>
            
            {content}

        </div>
      </>
    );
  }
}

//

export default  (withRouter(connect(
    (state)=> ({
        accounts:               accountsRedux.accounts(state),
        isLoadingAccounts:      accountsRedux.isLoading(state),

        currencyStats:          balanceRedux.currencyStats(state),
        isLoadingCurrencyStats: balanceRedux.isLoadingStats(state),
        balance:                balanceRedux.userBalanceFormatted(state),

        actualAccountName:      loginRedux.actualAccountName(state),
        actualRole:             loginRedux.actualRole(state),
        actualRoleId:           loginRedux.actualRoleId(state),
        
        
    }),
    (dispatch)=>({
        loadAccounts:             bindActionCreators(accountsRedux.loadAccounts, dispatch),        
        loadCurrencyStats:        bindActionCreators(balanceRedux.loadCurrencyStats, dispatch),
    })
)(Operations)));