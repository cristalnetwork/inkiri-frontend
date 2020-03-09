import React, {Component} from 'react'

import * as globalCfg from '@app/configs/global';

import { connect } from 'react-redux';
import { withRouter } from "react-router-dom";
import * as routesService from '@app/services/routes';
import * as components_helper from '@app/components/helper';

import { Result, Button, Typography, Icon } from 'antd';
import { PageHeader } from 'antd';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import { injectIntl } from "react-intl";
import InjectMessage from "@app/components/intl-messages";

const { Paragraph, Text } = Typography;

class Info extends Component {
  constructor(props) {
    super(props);
    this.state = {
      intl:                {}
    };

  }
  
  componentDidMount(){
    const {formatMessage} = this.props.intl;
    const title = formatMessage({id:'pages.common.info.title'});
    const subtitle = formatMessage({id:'pages.common.info.sub_title'});
    const app_version = formatMessage({id:'pages.common.info.app_version'});
    const blockchain_network = formatMessage({id:'pages.common.info.blockchain_network'});

    this.setState({intl:{title, subtitle, app_version, blockchain_network}});

  }
  

  render() {
    
    return (
      <>
        <PageHeader
          title={this.state.intl.title}
          subTitle={this.state.intl.subtitle}
        />
        
        <div className="styles standardList" style={{backgroundColor:'#fff', marginTop: 24, padding: 8 }}>
          <Result
            title={this.state.intl.title}
            subTitle={this.state.intl.subtitle || ''} >
              <div className="desc">
                <Paragraph>
                  <Text strong style={{ fontSize: 16, }}>{this.state.intl.app_version}</Text>
                </Paragraph>
                <Paragraph>
                  {globalCfg.version}
                </Paragraph>
              </div>
              <div className="desc">
                <Paragraph>
                  <Text strong style={{ fontSize: 16, }}>{this.state.intl.blockchain_network}</Text>
                </Paragraph>
                <Paragraph>
                  <a link={globalCfg.eos.info_link} target="_blank">
                    {globalCfg.eos.info}
                  </a>
                </Paragraph>
              </div>
          </Result>
        </div>
      </>
    );
  }
}

//
export default (withRouter(injectIntl(Info))) ;