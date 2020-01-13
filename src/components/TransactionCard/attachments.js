import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux'
import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as request_helper from '@app/components/TransactionCard/helper';
import TransactionTitle from '@app/components/TransactionCard/title';

import { injectIntl } from "react-intl";

const TransactionAttachments = (props) => {
    
    const [request, setRequest]              = useState(props.request);    
    // const [uploader, setUploader]            = useState(props.uploader);    

    const [nota_text, setNotaText]           = useState('');    
    const [boleto_text, setBoletoText]       = useState('');    
    const [comprobante_text, setComproText]  = useState('');    

    useEffect(() => {
      setRequest(props.request);
      // setUploader(props.uploader)
    }, [props.request]);

    useEffect(() => {
      setNotaText(props.intl.formatMessage({id:'global.invoice'}));
      setBoletoText(props.intl.formatMessage({id:'global.payment_slip'}));
      setComproText(props.intl.formatMessage({id:'global.receipt'}));
    }, []);

    if(!request || !props.uploader)
      return (null);
    
    if(!globalCfg.api.canAddAttachment(request))
      return (null);

    return( 
      <>
          <TransactionTitle title="Attachments" />
        
          {  
            request.attach_nota_fiscal_id?
              request_helper.getFileLink(request.attach_nota_fiscal_id, nota_text, "icon_color_green")
              :    
              request_helper.getFileUploader(nota_text, props.uploader[globalCfg.api.NOTA_FISCAL])
          }

          {  
            request.attach_boleto_pagamento_id?
              request_helper.getFileLink(request.attach_boleto_pagamento_id, boleto_text, "icon_color_green")
            :
            (request.provider_extra && request.provider_extra.payment_mode==globalCfg.api.PAYMENT_MODE_BOLETO)?
              request_helper.getFileUploader(boleto_text, props.uploader[globalCfg.api.BOLETO_PAGAMENTO]):(null)
          }

          {  
            request.attach_comprobante_id?
              request_helper.getFileLink(request.attach_comprobante_id, comprobante_text, "icon_color_green")
            :
            (globalCfg.api.isProcessing(request)&&props.isAdmin)?
              request_helper.getFileUploader(comprobante_text, props.uploader[globalCfg.api.COMPROBANTE]):(null)
          }
      </>)  
}
//
export default connect(
    (state)=> ({
        isAdmin:            loginRedux.isAdmin(state),
    })
)( injectIntl(TransactionAttachments))