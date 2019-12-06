import React , {Component} from 'react';
import { Upload, Tag, Button, Icon } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as utils from '@app/utils/utils';
import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';
import moment from 'moment';
import IuguIconImage from '@app/components/TransactionCard/iugu_icon';

export const envelopeIdFromRequest = (request) =>{
  return api.bank.envelopeIdFromRequest(request);
}
export const getRequestId = (request) => {
  return utils.leadingZeros(request.requestCounterId, 5);
}

export const getRequestDate = (request) => {
  return formatDate(request.created_at);
}

export const formatDate = (date) => {
  return moment(date).format('LLLL');
}

export const getExternalRequestDesc = (request) => {

  if(globalCfg.api.isProviderPayment(request))
    return (<>
          Provider:&nbsp;<Tag key={'provider_'+request.id}> { getRequestProviderDesc(request)} </Tag>
          </>);

  if(globalCfg.api.isExchange(request))
    return(<>Bank account:&nbsp;<Tag key={'bank_account_'+request.id}>
          { getBankAccountDesc(request.bank_account)}
       </Tag></>)
}

export const getBankAccountDesc = (bank_account) => {
  return [bank_account.bank_name, bank_account.agency, bank_account.cc].join(', ')
}

export const getRequestProviderDesc = (request) => {
  return request.provider.name + ' - [CNPJ:'+ request.provider.cnpj+']';
}

export const getGoogleDocUrl = (google_doc_id) => {
  return "https://drive.google.com/open?id="+google_doc_id;
}

export const getGoogleDocLink = (google_doc_id, with_icon, name, size) => {
  const icon = with_icon?(<FontAwesomeIcon icon={['fab', 'google-drive']} />):null;
  const href = getGoogleDocUrl(google_doc_id);
  const key = 'key_button_'+Math.random(); 
  return (<Button type="link" href={href} target="_blank" key={key} size={size||'default'} style={{color:'inherit', paddingLeft:0}}>{name || 'Open file'} &nbsp; {icon}</Button>)
}
//
export const getGoogleDocLinkOrNothing = (google_doc_id, with_icon, name, size) => {
  if(!google_doc_id)
    return (null);
  return (<><br/>{getGoogleDocLink (google_doc_id, with_icon, name, size)}</>);
}
//
export const getStateTag = (request) => {
  // const icon = with_icon?(<FontAwesomeIcon icon={['fab', 'google-drive']} />):null;
  // const text = utils.capitalize(globalCfg.api.stateToText(request.state));
  const my_state   = request.flag.ok?request.state:globalCfg.bank.STATE_VIRTUAL_PENDING; 
  const extra_text = request.flag.ok?'':` - ${request.flag.message}`  
  const text       = `${globalCfg.api.stateToText(request.state).toUpperCase()}${extra_text}`;
  return (<Tag color={globalCfg.api.stateToColor(my_state)} key={'state_'+request.id}>{text}</Tag>)
}
//
export const errorStateTag = (text) =>
{
  return (<Tag color='red' key={Math.random()}>{text}</Tag>);
}
//
export const getStateLabel = (request, with_waiting_icon) => {
  const color = globalCfg.api.stateToColor(request.state);
  let icon = null;
  if(with_waiting_icon)
  {
    const fa_icon  = globalCfg.api.isFinished(request)?'flag-checkered':'user-clock';
    const alt_text = globalCfg.api.isFinished(request)?'Done!':'Operation pending/required!';
    icon = (<FontAwesomeIcon icon={fa_icon} size="xs" color="gray" title={alt_text}/>);
  }
  return (<span style={{color:color}} key={'state_'+request.id}>{utils.capitalize(globalCfg.api.stateToText(request.state))}&nbsp;{icon}</span>);
}

//
export const getTypeTag = (request) => {
  // const icon = with_icon?(<FontAwesomeIcon icon={['fab', 'google-drive']} />):null;
  return (<Tag key={'type_'+request.id}>{utils.capitalize(globalCfg.api.typeToText(request.requested_type))}</Tag>)
}
//
// generator   => https://paletton.com/#uid=51E0u0kvc++jb+qpd+XPj+VZCGN
// calculator  => https://www.sessions.edu/color-calculator/
// alpha       => https://www.google.com/search?q=rgb+to+hex&oq=rgb+to+hex&aqs=chrome..69i57j0l5.2827j0j7&sourceid=chrome&ie=UTF-8

export const getTypeConf = () => {
  return {
      [globalCfg.api.TYPE_DEPOSIT]     : {icon:'arrow-up',             rotation: 0,  color:{primary: '#1890ff' /*azul*/          , secondary:'#e6f7ff'}, style: {borderTop: '1px solid #1890ff'}},
      [globalCfg.api.TYPE_WITHDRAW]    : {icon:'arrow-down',           rotation: 0,  color:{primary: '#18ff88' /*verde*/         , secondary:'#d6ffea'}, style: {borderTop: '1px solid #18ff88'}},
      [globalCfg.api.TYPE_EXCHANGE]    : {icon:'exchange-alt',         rotation: 90, color:{primary: '#ff9606' /*naranja*/       , secondary:'#fce9cf'}, style: {}},
      [globalCfg.api.TYPE_PAYMENT]     : {icon:'shopping-bag',         rotation: 0,  color:{primary: '#FF06A3' /*fuccia*/        , secondary:'#facae8'}, style: {}},
      [globalCfg.api.TYPE_PROVIDER]    : {icon:'truck-moving',         rotation: 0,  color:{primary: '#ff5906' /*naranjrojo*/    , secondary:'#fcdecf'}, style: {}},
      [globalCfg.api.TYPE_SEND]        : {icon:'paper-plane',          rotation: 0,  color:{primary: '#ffd606' /*amarillo*/      , secondary:'#fcf4c7'}, style: {}},
      [globalCfg.api.TYPE_SERVICE]     : {icon:'store',                rotation: 0,  color:{primary: '#9DFF06' /*lima*/          , secondary:'#e7fcc5'}, style: {}},
      [globalCfg.api.TYPE_SALARY]      : {icon:['fab', 'pagelines'],   rotation: 0,  color:{primary: '#25AEFF' /*celeste dark*/  , secondary:'#d7eefc'}, style: {}},
      [globalCfg.api.TYPE_ISSUE]       : {icon:'credit-card',          rotation: 0,  color:{primary: '#067748' /*verde dark*/    , secondary:'#c5fce5'}, style: {}},
      [globalCfg.api.TYPE_IUGU]        : {icon:'credit-card',          rotation: 0,  color:{primary: '#A115FF' /*violeta*/       , secondary:'#e2c3f7'}, style: {}},
      [globalCfg.api.TYPE_REFUND]      : {icon:'credit-card',          rotation: 0,  color:{primary: '#0DD1FF' /*celeste*/       , secondary:'#b1ecfa'}, style: {}},
      
      [globalCfg.api.TYPE_NEW_ACCOUNT] : {icon:'user-plus',            rotation: 0,  color:{primary: '#0DD1FF' /*celeste*/        , secondary:'#b1ecfa'}, style: {}},
      [globalCfg.api.TYPE_ERASE_CUST]  : {icon:'user-minus',           rotation: 0,  color:{primary: '#0DD1FF' /*celeste*/        , secondary:'#b1ecfa'}, style: {}},
      [globalCfg.api.TYPE_UPSERT_PAP]  : {icon:'file-signature',       rotation: 0,  color:{primary: '#0DD1FF' /*celeste*/        , secondary:'#b1ecfa'}, style: {}},
      [globalCfg.api.TYPE_ERASE_PAP]   : {icon:'minus-circle',         rotation: 0,  color:{primary: '#0DD1FF' /*celeste*/        , secondary:'#b1ecfa'}, style: {}},
      [globalCfg.api.TYPE_CHARGE_PAP]  : {icon:'file-invoice-dollar',  rotation: 0,  color:{primary: '#0DD1FF' /*celeste*/        , secondary:'#b1ecfa'}, style: {}},
      [globalCfg.api.TYPE_UPSERT_CUST] : {icon:'user-plus',            rotation: 0,  color:{primary: '#0DD1FF' /*celeste*/        , secondary:'#b1ecfa'}, style: {}},
      [globalCfg.api.TYPE_UNKNOWN]     : {icon:'question-circle',      rotation: 0,  color:{primary: '#FF0619' /*rojo*/           , secondary:'#f7c6ca'}, style: {}},
      'hack_service'                   : {icon:'shapes',               rotation: 0,  color:{primary: '#EBCE54' /*yellow*/         , secondary:'rgba(235, 205, 86, 0.4)'}, style: {}},
      'hack_user'                      : {icon:'user',                 rotation: 0,  color:{primary: '#0DD1FF' /*celeste*/        , secondary:'#b1ecfa'}, style: {}}
  }
}
//
export const getCircledTypeIcon = (request) => {
  
  if(typeof request !== 'string')
    request = request.requested_type  

  const my_icon = getTypeConf()[request]; 
  
  // const className = 'ui-avatar__content circled_action_type flex_center';
  const className = 'ui-avatar__content--small circled_action_type flex_center';
  const style     = {border: `0.0625em solid ${my_icon.color.primary}` , background: `${my_icon.color.secondary}`}
  const size      = '1x';
  let icon        = null;
  if(my_icon.rotation>0)
    icon = (<FontAwesomeIcon icon={my_icon.icon} rotation={my_icon.rotation} style={my_icon.style} size={size} color={my_icon.color.primary}/>);
  else
    icon = (<FontAwesomeIcon icon={my_icon.icon} style={my_icon.style} size={size} color={my_icon.color.primary}/>);
  return (<div className={className} style={style}>
            {icon} 
          </div>);
}
//
export const getTypeIcon = (request, size, color) => {
  
  const my_icon = getTypeConf()[request.requested_type]; 
  if(!my_icon)
    return (<FontAwesomeIcon icon="question-circle" size="1x" color="gray" />);
  // style={my_icon.style} 
  if(my_icon.rotation>0)
    return (<FontAwesomeIcon icon={my_icon.icon} rotation={my_icon.rotation} style={my_icon.style} size={size||'1x'} color={color||'gray'}/>);
  return (<FontAwesomeIcon icon={my_icon.icon} style={my_icon.style} size={size||'1x'} color={color||'gray'}/>);
}
//
export const getAccountTypeIcon = (account_type) => {
  if(isNaN(account_type))
    account_type = globalCfg.bank.ACCOUNT_TYPES.indexOf(account_type);
  return (<Icon type={globalCfg.bank.ACCOUNT_ICONS[account_type]} />)
}
//
export const getAccountStateTag = (account, include_br) => {
  if(globalCfg.bank.isEnabledAccount(account.state))
    return (null);
  return (<><br/>
      <Tag key={account.key+account.state}>
        { globalCfg.bank.getAccountState(account.state).toUpperCase() }
        </Tag>
      </>)
}
//
export const getProfileName = (profile) => {
  if(globalCfg.bank.isBusinessAccount(profile.account_type))
    return profile.business_name;
  return profile.first_name + ' ' + profile.last_name;
}
//
export const getBlockchainLink = (tx_id, withIcon, size, text) => {
  if(!tx_id)
    return (null);
  const _text = (typeof text === 'undefined')?'Blockchain':'';
  const _href = api.dfuse.getBlockExplorerTxLink(tx_id);
  const icon = (typeof withIcon==='undefined' || withIcon)?(<FontAwesomeIcon icon="external-link-alt" />):(null);
  // return (<Button type="link" href={_href} size={size||'default'} target="_blank" key={'view-on-blockchain_'+tx_id} icon={withIcon?'cloud':null} title="View on Blockchain" style={{color:'inherit', paddingLeft:0}}>{text||'Blockchain'}</Button>)
  return (<Button title="View transaction on blockchain explorer" type="link" href={_href} size={size||'default'} target="_blank" key={'view-on-blockchain_'+tx_id} title="View on Blockchain" style={{color:'inherit', paddingLeft:0}}>{_text}&nbsp;{icon}</Button>)
}
//
export const getProcessButton = (request, callback, text) => {
  const title = (typeof text==='undefined')?((globalCfg.api.isFinished(request))?"Details":"Process"):text;

  const buttonClick = (callback, request) => {
    if(typeof callback === 'function')
    {
      callback(request)
      return;
    }
  }
  return (<Button key={'details_'+request.id} size="small" onClick={()=>{ buttonClick(callback, request) }}>{title}</Button>);
}
//

export const getButtonIcon = (icon, callback, param) => {
  const buttonClick = (callback, request) => {
    if(typeof callback === 'function')
    {
      callback(request)
      return;
    }
  }
  return (<Button key={Math.random()} size="small" title="Operation details" onClick={()=>{ buttonClick(callback, param) }} icon={icon} />);
}
//
export const getStyledAmount = (request, mp_style, negative) => {

  const style = {color:((!globalCfg.api.onOkPath(request))?'gray':(negative?'red':'inherit')), fontSize:16};

  if(mp_style)
    return(
      <span className="price-tag c-activity-row__price--classic price-tag-billing">
        <span className={"price-tag-negative-symbol " + (negative?'':'hidden')} style={style}>-</span>
        <span className="price-tag-fraction" style={style}>{globalCfg.currency.toCurrencyString(request.amount)}</span>
      </span>
    );
  //
  return (<span style={style} key={'amount_'+request.id}>{ (negative?'-':'') + globalCfg.currency.toCurrencyString(request.amount)}</span>)
}
//
export const getStyledDate = (request) => {
  const my_date = formatBlockTime(request);
  return (<time className="c-activity-row__time">{my_date.replace('T',' ')}</time>)
}
//
export const formatBlockTime = (request) => {
  const my_date = (request.block_time?request.block_time:request.paid_at)
  return my_date.replace('T',' ');
}
//
export const getStyledBalance = (record, full) => {

  const real_balance = parseFloat(record.balance) - parseFloat(record.overdraft);
  const is_negative  = real_balance<0;
  const style        = {color:(is_negative?'red':'inherit'), fontSize:16};

  return (
    <>
      <span style={style} key={'amount_'+record.key}>{ globalCfg.currency.toCurrencyString(real_balance)}</span>
      <time className="c-activity-row__time">Balance: {globalCfg.currency.toCurrencyString(record.balance)}</time>
      <time className="c-activity-row__time">Overdraft: {globalCfg.currency.toCurrencyString(record.overdraft)}</time>
    </>
  )
}

//
export const getFileLink = (attach_id, title, icon_color) => {
  return (<div className="ui-list">
              <ul className="ui-list__content">
                  <li className="ui-row ui-info-row ui-info-row--medium ui-info-row--background-grayNOHACK">
                      <div className="ui-row__col ui-row__col--heading">
                          <div className="ui-avatar ">
                              <div className="ui-avatar__content ui-avatar__content--icon">
                                <FontAwesomeIcon icon="receipt" size="2x" className={icon_color}/>
                              </div>
                          </div>
                      </div>
                      <div className="ui-row__col ui-row__col--content">
                        <div className="ui-info-row__content">
                          {getGoogleDocLink(attach_id, true, title, 'large')}
                        </div>
                      </div>

                      <div className="ui-row__col ui-row__col--actions">
                          <FontAwesomeIcon icon="chevron-right"  color="gray"/>
                      </div>
                  </li>
              </ul>
          </div>)
}
//
export const getFileUploader = (title, props, icon_color) => {
  return (<div className="ui-list">
            <ul className="ui-list__content">
              <div className="ui-list c-notes">
                <ul className="ui-list__content">
                  <li id="addNote" className="c-notes__container-add-note">
                    <Upload.Dragger {...props}  multiple={false}>
                      <p className="ant-upload-drag-icon">
                        <FontAwesomeIcon icon="receipt" size="3x" className={icon_color}/>
                      </p>
                      <p className="ant-upload-text">Click or drag <b>{title}</b> file to this area to upload</p>
                    </Upload.Dragger>    

                  </li>
                </ul>
              </div>
            </ul>
        </div>);
}

/*
* Helper functions for blockchain transcations
*/
//
export const blockchain = {
  isValidTransaction : (tx) => {
    const request = tx.request?tx.request:tx;
    return request.state?globalCfg.api.onOkPath(request):true;
  },
  isNegativeTransaction : (tx) => {
    const request = tx.request?tx.request:tx;
    if(!tx.i_send&& globalCfg.api.isDeposit(request)) return false;

    // ToDo: Review this function !!!!!!!!!!!!!!!!!!!
    return [
      globalCfg.api.TYPE_WITHDRAW, 
      globalCfg.api.TYPE_EXCHANGE, 
      globalCfg.api.TYPE_PAYMENT, 
      globalCfg.api.TYPE_PROVIDER, 
      globalCfg.api.TYPE_SEND, 
      globalCfg.api.TYPE_SERVICE].includes(request.requested_type);
    
    // TYPE_DEPOSIT
    // TYPE_ISSUE
    // TYPE_IUGU
    // TYPE_REFUND
    // TYPE_UPSERT
    // TYPE_UNKNOWN
  }
}

/*
* Helper functions for blockchain transcations
*/
//
export const iugu = {
  STATE_NOT_PROCESSED : 'state_not_processed'
  , STATE_ISSUED        : 'state_issued'
  , STATE_ERROR         : 'state_error'
  , STATE_ISSUE_ERROR   : 'state_issue_error'
  , getStates : () => { 
        return {[iugu.STATE_NOT_PROCESSED] : { color:'#fa8c16', icon:'user-clock' , description: 'NOT PROCESSED YET'},
                [iugu.STATE_ISSUED]        : { color:'green',   icon:'flag-checkered' , description: 'ISSUED!'},
                [iugu.STATE_ERROR]         : { color:'red',     icon:'exclamation-circle' , description: 'ERROR'},
                [iugu.STATE_ISSUE_ERROR]   : { color:'red',     icon:'exclamation-circle' , description: 'ISSUE ERROR'}};
  }
      
  , inState : (state, ref) => {
    if(typeof state !== 'string')
      state = state.state
    return state==ref;  
  }
  , isProcessing  : (invoice) => { return iugu.inState(invoice, iugu.STATE_NOT_PROCESSED);} 
  , inError       : (invoice) => { return iugu.inState(invoice, iugu.STATE_ERROR);} 
  , isIssued      : (invoice) => { return iugu.inState(invoice, iugu.STATE_ISSUED);} 
  , stateIcon     : (invoice) => { return (IuguIconImage); }
  , header        : (invoice) => { return `${globalCfg.currency.toCurrencyString(invoice.amount)} paid to ${invoice.receipt_alias}`}
  , stateTag      : (invoice) => {
      const my_state = iugu.getStates()[invoice.state];                    
      // const icon     = (<FontAwesomeIcon icon={my_state.icon} size="xs" color={my_state.color} />);
      return (<Tag color={my_state.color} key={'state_'+invoice.id}>{my_state.description}</Tag>)
  }
  //
  , stateLabel    : (invoice) => { 
      const my_state = iugu.getStates()[invoice.state];                    
      const icon     = (<FontAwesomeIcon icon={my_state.icon} size="xs" color={my_state.color} />);
      return (<span style={{color:my_state.color}} key={'state_'+invoice.id}>{my_state.description}&nbsp;{icon}</span>)
    }
    //
  , iuguLink : (invoice, with_icon) => {
      const icon = (with_icon===undefined || with_icon)?(<FontAwesomeIcon icon="external-link-alt" />):(null);
      const href = invoice.original.secure_url;
      const key = 'key_iugu_link_'+Math.random(); 
      return (<Button type="link" href={href} target="_blank" key={key} size={'default'} style={{color:'inherit', paddingLeft:0}}>IUGU invoice &nbsp; {icon}</Button>)
    }
 //
  , styledAmount : (invoice, negative, show_negative) => {
    const style = {color:(negative?'red':'inherit'), fontSize:16};
    return (<span style={style} key={'amount_'+invoice.id}>{ ((negative&&show_negative)?'-':'') + globalCfg.currency.toCurrencyString(invoice.amount)}</span>)
  }
//
  , getDate : (date) =>{
    return date.replace('T',' ').split('.')[0];
  }
  , styledDate : (invoice, title) => {
    const my_date = iugu.getDate(invoice.paid_at) ;
    return (<time className="c-activity-row__time" title={title||''}>{my_date}</time>)
  }
}