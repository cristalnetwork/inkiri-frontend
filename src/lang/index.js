import Enlang from './entries/en_US';
import Eslang from './entries/es_ES';
import Brlang from './entries/pt_BR';
// import { addLocaleData } from 'react-intl';

const AppLocale = {
  en: Enlang,
  es: Eslang,
  pt: Brlang
};
// addLocaleData(AppLocale.en_US.data);
// addLocaleData(AppLocale.es_ES.data);
// addLocaleData(AppLocale.pt_BR.data);

export default AppLocale;
