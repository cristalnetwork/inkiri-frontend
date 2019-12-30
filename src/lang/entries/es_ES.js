import antdEs from "antd/lib/locale-provider/es_ES";
// import appLocaleData from "react-intl/locale-data/es";
import esMessages from "../locales/es_ES.json";

const EsLang = {
  messages: {
    ...esMessages
  },
  antd: antdEs,
  locale: "es",
  // data: appLocaleData
};
export default EsLang;
