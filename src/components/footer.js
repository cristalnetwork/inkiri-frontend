import React from 'react';
import * as globalCfg from '@app/configs/global';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import VersionIndicator from '@app/components/version_indicator';

const UIFooter = (props) => {
  
  if(props.with_version)
  {
    return (<>{ `CRISTAL NETWORK © ${(new Date()).getFullYear()} v ${globalCfg.version}`} <VersionIndicator /></>);
  }
  return (
    <>
      <FontAwesomeIcon icon={['fab', 'creative-commons']} /> { ` ${(new Date()).getFullYear()} Version ${globalCfg.version}`}
      {!props.one_line && (<br/>)} • by <a href="https://github.com/dargonar" target="_blank">@dargonar</a>
    </>
    );
}
export default UIFooter;

