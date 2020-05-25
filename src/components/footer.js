import React from 'react';
import * as globalCfg from '@app/configs/global';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const UIFooter = (props) => {
  
  return (
    <>
      <FontAwesomeIcon icon={['fab', 'creative-commons']} /> { ` ${(new Date()).getFullYear()} Version ${globalCfg.version}`}
      {!props.one_line && (<br/>)} • by <a href="https://github.com/cristalnetwork" target="_blank">@cristalnetwork</a>
    </>
    );
}
export default UIFooter;

