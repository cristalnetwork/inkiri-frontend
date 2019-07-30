import React, {useState, Component} from 'react'
import { Layout, Icon, Select, Button } from 'antd';

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';
import * as userRedux from '@app/redux/models/user'
import * as loginRedux from '@app/redux/models/login'
import styles from './index.less';

// import AvatarDropdown from '@app/components/GlobalHeader';

const { Header, Sider, Content } = Layout;
const { Option } = Select;

class InkiriHeader extends Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
    };
  }


  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  accountToString(account){
    return JSON.stringify(account);
  }
  
  handleChange(value) {
    console.log(`selected ${value}`);
  }

  render(){
    return (
       <Header style={{ background: '#fff', padding: 0 }}>
          <div className="ant-pro-global-header">  
            <Icon
              className="trigger"
              type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />
            <div className="right">
               <Select defaultValue="lucy" style={{ width: 120 }} onChange={this.handleChange}>
                <Option value="jack">Jack</Option>
                <Option value="lucy">Lucy</Option>
                <Option value="disabled" disabled>
                  Disabled
                </Option>
                <Option value="Yiminghe">yiminghe</Option>
              </Select>
              <Button style={{marginLeft: '10px'}}icon={'logout'} onClick={this.props.logout}>Logout</Button>
            </div>
          </div>
        </Header>
    )
  }

}

export default connect(
    (state)=> ({
        userAccount:   userRedux.defaultAccount(state),
        allAccounts:   userRedux.allAccounts(state),
        isLoading:     userRedux.isLoading(state)
    }),
    (dispatch)=>({
        try: bindActionCreators(userRedux.tryUserState , dispatch),
        logout: bindActionCreators(loginRedux.logout, dispatch)
    })
)(InkiriHeader)