import { getLanguage } from '@app/services/localStorage'
import AppLocale from "@app/lang";
import * as globalCfg from '@app/configs/global';

import * as moment from 'moment';
import 'moment/locale/pt-br';
import 'moment/locale/es';
// import 'moment/locale/en';

export const getLocale = () => {
  const lang  = getLanguage()
  const lan_key = Object.keys(AppLocale).filter(key => AppLocale[key].locale==lang)  
  let the_key = globalCfg.language.simple;
  if(Array.isArray(lan_key) && lan_key.length>0)
    the_key = lan_key[0];
  
  console.log('lang:', lang)
  console.log('lan_key:', lan_key)
  moment.locale(globalCfg.language.moment);

  return AppLocale[the_key];
}


// export const getLocale = () => {
//   const lang  = getLanguage()
//   const lan_key = Object.keys(AppLocale).filter(key => AppLocale[key].locale==lang)  
//   let the_key = 'en'
//   if(Array.isArray(lan_key) && lan_key.length>0)
//     the_key = lan_key[0];
//   return AppLocale[the_key];
// }
