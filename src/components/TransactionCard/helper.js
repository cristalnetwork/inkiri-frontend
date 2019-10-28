import React from 'react';
import { Tag, Button } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import * as utils from '@app/utils/utils';
import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';

export const getGoogleDocUrl = (google_doc_id) => {
  return "https://drive.google.com/open?id="+google_doc_id;
}

export const getGoogleDocLink = (google_doc_id, with_icon, name, size) => {
  const icon = with_icon?(<FontAwesomeIcon icon={['fab', 'google-drive']} />):null;
  const href = getGoogleDocUrl(google_doc_id);
  const key = 'key_button_'+Math.random(); 
  return (<Button type="link" href={href} target="_blank" key={key} size={size||'default'}>{name || 'Open file'} &nbsp; {icon}</Button>)
}
//
export const getGoogleDocLinkOrNothing = (google_doc_id, with_icon, name, size) => {
  if(!google_doc_id)
    return (null);
  return (<>{getGoogleDocLink (google_doc_id, with_icon, name, size)}<br/></>);
}
//
export const getStateTag = (request) => {
  // const icon = with_icon?(<FontAwesomeIcon icon={['fab', 'google-drive']} />):null;
  return (<Tag color={globalCfg.api.stateToColor(request.state)} key={'state_'+request.id}>{utils.capitalize(globalCfg.api.stateToText(request.state))}</Tag>)
}
//
export const getTypeTag = (request) => {
  // const icon = with_icon?(<FontAwesomeIcon icon={['fab', 'google-drive']} />):null;
  return (<Tag key={'type_'+request.id}>{utils.capitalize(globalCfg.api.typeToText(request.requested_type))}</Tag>)
}
//
export const getBlockchainLink = (request, withIcon, size) => {
  // const icon = with_icon?(<FontAwesomeIcon icon={['fab', 'google-drive']} />):null;
  const onBlockchain = globalCfg.api.isOnBlockchain(request);
  if(!onBlockchain)
    return (null);
  const _href = api.dfuse.getBlockExplorerTxLink(onBlockchain);
  return (<Button type="link" href={_href} size={size||'default'} target="_blank" key={'view-on-blockchain_'+request.id} icon={withIcon?'cloud':null} title="View on Blockchain">B-Chain</Button>)
}
//
export const getProcessButton = (request, cb) => {
  const title = (globalCfg.api.isFinished(request))?"Details":"Process";
  return (<Button key={'details_'+request.id} size="small" onClick={()=>{ if(cb) cb(request) }}>{title}</Button>);
}
