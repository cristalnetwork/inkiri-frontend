import React, { useState, useEffect } from 'react';
import { Menu, Dropdown, Button, Icon, message } from 'antd';
import { connect } from 'react-redux'
import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as utils from '@app/utils/utils';
import * as request_helper from '@app/components/TransactionCard/helper';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const TransactionAttachments = (props) => {
    
    const Header = (<div className="c-header-detail ">
            <div className="c-header-detail__head u-clearfix">
                <div className="c-header-detail__title">Attachments</div>
                <div className="c-header-detail__actions">
                </div>
            </div>
        </div>)
    

    const [request, setRequest]          = useState(props.request);    
    const [uploader, setUploader]        = useState(props.uploader);    

    useEffect(() => {
      setRequest(props.request);
      setUploader(props.uploader)
    });

    if(!request || !uploader)
      return (null);
    
    if(!globalCfg.api.canAddAttachment(request))
      return (null);

    return( 
      <>
          {Header}
        
          {  
            request.attach_nota_fiscal_id?
              request_helper.getFileLink(request.attach_nota_fiscal_id, 'Nota Fiscal', "icon_color_green")
              :    
              request_helper.getFileUploader('Nota Fiscal', uploader[globalCfg.api.NOTA_FISCAL], "icon_color_default")
          }

          {  
            request.attach_boleto_pagamento_id?
              request_helper.getFileLink(request.attach_boleto_pagamento_id, 'Boleto de pagamento', "icon_color_green")
            :
            (request.provider_extra && request.provider_extra.payment_mode==globalCfg.api.PAYMENT_MODE_BOLETO)?
              request_helper.getFileUploader('Boleto de Pagamento', uploader[globalCfg.api.BOLETO_PAGAMENTO], "icon_color_default"):(null)
          }

          {  
            request.attach_comprobante_id?
              request_helper.getFileLink(request.attach_comprobante_id, 'Comprobante', "icon_color_green")
            :
            (globalCfg.api.isProcessing(request)&&props.isAdmin)?
              request_helper.getFileUploader('Comprobante', uploader[globalCfg.api.COMPROBANTE], "icon_color_default"):(null)
          }
      </>)  
}
//
export default connect(
    (state)=> ({
        isAdmin:            loginRedux.isAdmin(state),
    })
)(TransactionAttachments)