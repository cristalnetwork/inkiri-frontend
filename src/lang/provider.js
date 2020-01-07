import {getLocale} from '@app/lang/helper';
import {createIntl, createIntlCache, RawIntlProvider} from 'react-intl'

const currentAppLocale = getLocale();
// This is optional but highly recommended
// since it prevents memory leak
const cache = createIntlCache()
const intl = createIntl({
  locale: currentAppLocale.locale
  , messages: currentAppLocale.messages
}, cache)

// Call imperatively
// intl.formatNumber(20)

const  { formatMessage } = intl;
export { formatMessage as i18n };