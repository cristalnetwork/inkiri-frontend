import antdBr from "antd/lib/locale-provider/pt_BR";
// import appLocaleData from "react-intl/locale-data/pt";
import ptMessages from "../locales/pt_BR.json";

const BrLang = {
  messages: {
    ...ptMessages
  },
  antd: antdBr,
  locale: "pt-BR",
  // data: appLocaleData
};
export default BrLang;
