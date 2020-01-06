import React, { useState, useEffect } from 'react';
import { Icon } from 'antd';
import { connect } from 'react-redux'
import { injectIntl } from "react-intl";

const TransactionBankAccount = (props) => {
    
    const [bank_account, setBankAccount]       = useState(null);
    const [alone_component, setAloneComponent] = useState(true);
    const [edit_button, setEditButton]         = useState(null);

    useEffect(() => {
        // console.log(' >> useEffect >> me llamaring');
        setBankAccount(props.bank_account);
        setAloneComponent(props.alone_component);
        setEditButton(props.button);
    }, [props.bank_account]);

    const [bank_name_text, setBankName]           = useState('');    
    const [bank_agency_text, setBankAgency]       = useState('');    
    const [bank_cc_text, setBankCC]               = useState('');    

    useEffect(() => {
      setBankName(props.intl.formatMessage({id:'components.Forms.bank_account.bank_name_placeholder'}));
      setBankAgency(props.intl.formatMessage({id:'components.Forms.bank_account.bank_agency_placeholder'}));
      setBankCC(props.intl.formatMessage({id:'components.Forms.bank_account.bank_cc_placeholder'}));
    }, []);

    if(!bank_account)
      return (null);

    const item = (<li className="ui-row ui-info-row ui-info-row--medium ui-info-row">
                      <div style={{position:'absolute', right:'10px', top:'10px'}}>{edit_button}</div>
                      <div className="ui-row__col ui-row__col--heading">
                          <div className="ui-avatar ">
                              <div className="ui-avatar__content ui-avatar__content--icon">
                                <Icon type="bank" theme="twoTone" style={{fontSize:30}} />
                              </div>
                          </div>
                      </div>
                      <div className="ui-row__col ui-row__col--content">
                          <div className="ui-info-row__content">
                              <div className="ui-info-row__title">{bank_account.bank_name}</div>
                              <div className="ui-info-row__details name_value_row">
                                 <div className="row_name">{bank_agency_text}</div> 
                                 <div className="row_value">{bank_account.agency}</div> 
                              </div>
                              <div className="ui-info-row__details name_value_row">
                                <div className="row_name">{bank_cc_text}</div> 
                                 <div className="row_value">{bank_account.cc}</div> 
                              </div>
                          </div>
                      </div>
                </li>);
    if(!alone_component)
      return item;
    return(
      <div className="ui-list">
        <ul className="ui-list__content">
          {item}        
        </ul>
      </div>
    )
    
}
//
export default connect(
    (state)=> ({
        // allAccounts:     loginRedux.allAccounts(state),
        // actualAccountName:   loginRedux.actualAccountName(state),
        // currentAccount:  loginRedux.currentAccount(state),
        // isLoading:       loginRedux.isLoading(state)
    })
)(injectIntl(TransactionBankAccount))