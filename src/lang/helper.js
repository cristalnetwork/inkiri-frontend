import { getLanguage } from '@app/services/localStorage'
import AppLocale from "@app/lang";

export const getLocale = () => {
  const lang  = getLanguage()
  const lan_key = Object.keys(AppLocale).filter(key => AppLocale[key].locale==lang)  
  let the_key = 'en'
  if(Array.isArray(lan_key) && lan_key.length>0)
    the_key = lan_key[0];
  return AppLocale[the_key];
}
