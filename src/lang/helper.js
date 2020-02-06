import { getLanguage } from '@app/services/localStorage'
import AppLocale, {LocalesMomentMap} from "@app/lang";
import moment from 'moment';

import moment_pt from 'moment/locale/pt-br';
import moment_en from 'moment/locale/en-gb';
import moment_es from 'moment/locale/es';

const moment_i18n_map = {
   en:   moment_pt
   , es: moment_en
   , pt: moment_es
}

export const getLocale = () => {
  const lang  = getLanguage()
  const lan_key = Object.keys(AppLocale).filter(key => AppLocale[key].locale==lang)  
  let the_key = 'en'
  if(Array.isArray(lan_key) && lan_key.length>0)
    the_key = lan_key[0];

  moment.locale(LocalesMomentMap[the_key], moment_i18n_map[the_key]);

  return AppLocale[the_key];
}
