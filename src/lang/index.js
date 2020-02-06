import Enlang from './entries/en_US';
import Eslang from './entries/es_ES';
import Brlang from './entries/pt_BR';
// import { addLocaleData } from 'react-intl';

export const LocalesMap = {
  en: 'en_US'
  , es: 'es_ES'
  , pt: 'pt_BR'
}

export const LocalesMomentMap = {
  en: 'en-gb'
  , es: 'es'
  , pt: 'pt-br'
}
const AppLocale = {
  en: Enlang,
  es: Eslang,
  pt: Brlang
};
// addLocaleData(AppLocale.en_US.data);
// addLocaleData(AppLocale.es_ES.data);
// addLocaleData(AppLocale.pt_BR.data);

export default AppLocale;
