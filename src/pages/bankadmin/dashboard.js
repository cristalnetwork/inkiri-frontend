import React, {useState, Component} from 'react'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as menuRedux from '@app/redux/models/menu';
import * as loginRedux from '@app/redux/models/login'
import * as balanceRedux from '@app/redux/models/balance'

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
      visitData:           this.loadData()
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
    // this.loadAllTransactions(true);  
  } 

  
  openNotificationWithIcon(type, title, message) {
    notification[type]({
      message: title,
      description:message,
    });
  }
  
  renderContent = () => {
    const {visitData} = this.state;
    // <h3>Dinheiro em Circulação</h3><IntroduceRow loading={false} visitData={visitData} />
    return (<>
        
        <h3>Contas</h3><ContasRow loading={false} visitData={visitData} />
        <h3>Operações Pendentes</h3><PendingRow loading={false} visitData={visitData} />
        <h3>Dinheiro em Circulação</h3><MoneyRow loading={false} visitData={visitData} />
        
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
          subTitle="Dummy data"
        >
        </PageHeader>
        
        <div className="styles standardList" style={{ marginTop: 24 }}>
            
            {content}

        </div>
      </>
    );
  }
}


export default  (withRouter(connect(
    (state)=> ({
        actualAccountName:    loginRedux.actualAccountName(state),
        actualRole:           loginRedux.actualRole(state),
        actualRoleId:         loginRedux.actualRoleId(state),
        balance:              balanceRedux.userBalanceFormatted(state),
    }),
    (dispatch)=>({
        setLastRootMenuFullpath: bindActionCreators(menuRedux.setLastRootMenuFullpath , dispatch)
    })
)(Operations)));