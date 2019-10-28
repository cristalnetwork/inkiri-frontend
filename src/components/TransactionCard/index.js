import React, {Component} from 'react'
import { Alert, Upload, Tag, Spin, Icon, Autocomplete, Button, message } from 'antd';

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';

import debounce from 'lodash/debounce';

// import './style.less'; 

import * as utils from '@app/utils/utils';

import moment from 'moment';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import * as request_helper from '@app/components/TransactionCard/helper';

const { Dragger } = Upload;

const icon_color = '#1890ff';
const icon_color_green = '#3db389';

const props = {
  name: 'file',
  multiple: true,
  action: 'https://www.mocky.io/v2/5cc8019d300000980a055e76',
  onChange(info) {
    const { status } = info.file;
    if (status !== 'uploading') {
      console.log(info.file, info.fileList);
    }
    if (status === 'done') {
      message.success(`${info.file.name} file uploaded successfully.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} file upload failed.`);
    }
  },
};
/*
* ToDo: We should re read https://github.com/ant-design/ant-design/blob/master/components/form/demo/customized-form-controls.md
* up to provide decorator's validation.
*/
class TransactionCard extends Component {
  constructor(props) {
    super(props);
    const request       = props.request || undefined;
    const bank_account  = request?((globalCfg.api.isProviderPayment(request))? request.provider.bank_accounts[0] : request.bank_account):undefined;
    this.state = {
      request:         request,
      bank_account:    bank_account
    };

    // this.fetchProvider = debounce(this.fetchProvider, 800);
    
  }

  fetchProvider = value => {
    // this.lastFetchId += 1;
    // const fetchId = this.lastFetchId;
    // this.setState({ data: [], fetching: true });
    // api.bank.listProviders(value, value)
    //   .then(providers => {
    //     if (fetchId !== this.lastFetchId) {
    //       // for fetch callback order
    //       return;
    //     }
    //     const data = providers.map(provider => ({
    //       text: `${provider.name} - CNPJ: ${provider.cnpj}`,
    //       value: provider.id,
    //     }));
    //     this.setState({ data:data, fetching: false });
    //   });
  };

  handleChange = changedValue => {
    // this.setState({});
    this.triggerChange(changedValue);
  };

  triggerChange = changedValue => {
    // Should provide an event to pass value to Form.
    const { onChange } = this.props;
    if (onChange) {
      onChange(
        changedValue
      );
    }
  };

  handleClick = something => {
    // this.setState({});
    const event = 'The_Event';
    this.triggerChange(something, event);
  };

  triggerEvent = (eventValue, event) => {
    // Should provide an event to pass value to Form.
    const { onEvent } = this.props;
    if (onEvent) {
      onEvent(
        eventValue, event
      );
    }
  };

  render() {
    const { request, bank_account }   = this.state;
    
    if(!request)
      return(<></>);
    //
    
    let alert = (null);
    if(globalCfg.api.isProcessing(request))
      alert = ( <Alert
                  message="Bank transfer required!"
                  description={(<>
                      <span>Please complete the following tasks required for this operation:</span>
                      <br/><span>1.- Log into your Commercial Bank online service and proceed to send the money by wire transfer.</span>
                      <br/><span>2.- Attach a copy of the bank transfer voucher/receipt pdf file.</span>
                      <br/><span>3.- Press 'Finish' button</span>
                    </>)} 
                  type="warning"
                  style={{marginTop: '24px'}}
                  banner
                  closable
                  showIcon
              />)

    return (
      <>
      {alert}
        <div className="c-detail">
          <div className="c-header-detail ">
              <div className="c-header-detail__head u-clearfix">
                  <div className="c-header-detail__title">Op. #<b>{utils.leadingZeros(request.requestCounterId, 5)}</b> • Created on <b>{moment(request.created_at).format('LLLL')}</b></div>
                  <div className="c-header-detail__actions">
                    {request_helper.getStateTag(request)}
                  </div>
              </div>
          </div>

          <div className="c-header-detail hidden">
              <div className="c-header-detail__head u-clearfix">
                  <div className="c-header-detail__title">Operación {utils.leadingZeros(request.requestCounterId, 5)} • Creada el {moment(request.created_at).format('LLLL')}</div>
                  <div className="c-header-detail__actions"><button className="u-button-link">Imprimir</button></div>
              </div>
          </div>

          <div className="ui-list">
              <ul className="ui-list__content">
                  <li>
                      <div className="c-ticket ">
                          <ul>
                              <li className="c-ticket__section ">
                                  <ul>
                                      <li className="c-ticket__item c-ticket-subtotal">
                                          <div className="c-ticket__row">
                                            <div className="c-ticket__title "><b>{globalCfg.api.typeToText(request.requested_type).toUpperCase()}</b> request</div>
                                              <div className="c-ticket__amount ">
                                                <span className="price-tag price-tag-billing">
                                                  <span className="price-tag price-tag-symbol-text hidden">{globalCfg.currency.fiat.plural}</span>
                                                  <span className="price-tag price-tag-symbol">{globalCfg.currency.fiat.symbol} </span>
                                                  <span className="price-tag price-tag-fraction">{request.amount}</span>
                                                </span>
                                              </div>
                                          </div>
                                      </li>
                                  </ul>
                              </li>
                          </ul>
                      </div>
                  </li>
              </ul>
          </div>

          <div className="ui-list">
            <ul className="ui-list__content">
                <li className="ui-row ui-info-row ui-info-row--medium ui-info-row">
                    <div className="ui-row__col ui-row__col--heading">
                        <div className="ui-avatar">
                            <div className="ui-avatar__content ui-avatar__content--initials"><span>{utils.firsts(request.requested_by.account_name, 1)}</span></div>
                        </div>
                    </div>
                    <div className="ui-row__col ui-row__col--content">
                        <div className="ui-info-row__content">
                            <div className="ui-info-row__title">Requested by: <b>{request.requested_by.business_name}</b></div>
                              <div className="ui-info-row__details">
                                  <ul>
                                      <li>@{request.requested_by.account_name}</li>
                                  </ul>
                              </div>
                        </div>
                    </div>
                </li>
            </ul>
          </div>
        
          <div className="ui-list">
            <ul className="ui-list__content">
                <li className="ui-row ui-info-row ui-info-row--medium ui-info-row">
                    <div className="ui-row__col ui-row__col--heading">
                        <div className="ui-avatar">
                            <div className="ui-avatar__content ui-avatar__content--icon">
                              <FontAwesomeIcon icon="truck-moving" size="lg" color={icon_color}/>
                            </div>
                        </div>
                    </div>
                    <div className="ui-row__col ui-row__col--content">
                          <div className="ui-info-row__content">
                              <div className="ui-info-row__title">{request.provider.name} ({request.provider.cnpj})</div>
                              <div className="ui-info-row__details name_value_row">
                                 <div className="row_name">Category</div> 
                                 <div className="row_value">{request.provider.category}</div> 
                              </div>
                              <div className="ui-info-row__details name_value_row">
                                <div className="row_name">Products/services</div> 
                                 <div className="row_value">{request.provider.products_services}</div> 
                              </div>

                              <div className="ui-info-row__details">
                                  <ul>
                                      <li>Provider</li>
                                  </ul>
                              </div>
                          </div>
                      </div>
                </li>
                <li className="ui-row ui-info-row ui-info-row--medium ui-info-row">
                      <div className="ui-row__col ui-row__col--heading">
                          <div className="ui-avatar ">
                              <div className="ui-avatar__content ui-avatar__content--icon">
                                <Icon type="bank" theme="twoTone" style={{fontSize:30}} />
                              </div>
                          </div>
                      </div>
                      <div className="ui-row__col ui-row__col--content">
                          <div className="ui-info-row__content">
                              <div className="ui-info-row__title">{bank_account.bank_name}</div>
                              <div className="ui-info-row__details name_value_row">
                                 <div className="row_name">Agency</div> 
                                 <div className="row_value">{bank_account.agency}</div> 
                              </div>
                              <div className="ui-info-row__details name_value_row">
                                <div className="row_name">CC</div> 
                                 <div className="row_value">{bank_account.cc}</div> 
                              </div>
                          </div>
                      </div>
                </li>
                <li className="ui-row ui-action-row ui-action-row--no-truncate">
                      <div className="ui-row__col ui-row__col--heading">
                          <div className="ui-avatar">
                              <div className="ui-avatar__content ui-avatar__content--icon">
                                <Icon type="shopping" theme="twoTone" style={{fontSize:30}} />
                              </div>
                          </div>
                      </div>
                      <div className="ui-row__col ui-row__col--content">
                          <div className="ui-action-row__content">
                              <div className="ui-action-row__title u-truncate" title="Description">{request.description || 'Product/Service description Not Available'}</div>
                              <div className="ui-action-row__description hidden">
                                  <div className="ui-info-row__details">
                                      <ul>
                                          <li></li>
                                      </ul>
                                  </div>
                              </div>
                          </div>
                      </div>
                </li>

                <li className="ui-row ui-info-row ui-info-row--medium ui-info-row">
                      <div className="ui-row__col ui-row__col--heading">
                          <div className="ui-avatar ">
                              <div className="ui-avatar__content ui-avatar__content--icon">
                                <Icon type="unordered-list" theme="twoTone" style={{fontSize:30}} />
                              </div>
                          </div>
                      </div>
                      <div className="ui-row__col ui-row__col--content">
                          <div className="ui-info-row__content">
                              <div className="ui-info-row__title">Payment details</div>
                              <div className="ui-info-row__details name_value_row">
                                 <div className="row_name">Vehicle</div> 
                                 <div className="row_value">{request.provider_extra.payment_vehicle}</div> 
                              </div>
                              <div className="ui-info-row__details name_value_row">
                                 <div className="row_name">Category</div> 
                                 <div className="row_value">{request.provider_extra.payment_category}</div> 
                              </div>
                              <div className="ui-info-row__details name_value_row">
                                 <div className="row_name">Type</div> 
                                 <div className="row_value">{request.provider_extra.payment_type}</div> 
                              </div>
                              <div className="ui-info-row__details name_value_row">
                                 <div className="row_name">Mode</div> 
                                 <div className="row_value">{request.provider_extra.payment_mode}</div> 
                              </div>
                          </div>
                      </div>
                </li>
                
                <div className="ui-accordion ui-accordion--close ui-accordion--gray hidden">
                  <ul>
                    <li className="ui-row ui-accordion__row" role="presentation">
                      <div className="ui-row__col ui-row__col--content">
                        <div className="ui-accordion__content">
                          <div className="ui-accordion__title">Payment details</div>
                        </div>
                      </div>
                      <div className="ui-row__col ui-row__col--content">
                          <div className="ui-info-row__content">
                              

                              <div className="ui-info-row__details name_value_row">
                                 <div className="row_name">Vehicle</div> 
                                 <div className="row_value">{request.provider_extra.payment_vehicle}</div> 
                              </div>
                              <div className="ui-info-row__details name_value_row">
                                 <div className="row_name">Category</div> 
                                 <div className="row_value">{request.provider_extra.payment_category}</div> 
                              </div>
                              <div className="ui-info-row__details name_value_row">
                                 <div className="row_name">Type</div> 
                                 <div className="row_value">{request.provider_extra.payment_type}</div> 
                              </div>
                              <div className="ui-info-row__details name_value_row">
                                 <div className="row_name">Mode</div> 
                                 <div className="row_value">{request.provider_extra.payment_mode}</div> 
                              </div>
                          </div>
                      </div>

                    </li>
                  </ul>
                </div>
            </ul>
          </div>

          <div className="c-header-detail ">
            <div className="c-header-detail__head u-clearfix">
                <div className="c-header-detail__title">Blockchain</div>
                <div className="c-header-detail__actions">
                </div>
            </div>
        </div>

          <div className="ui-list">
              <ul className="ui-list__content">
                  <li className="ui-row ui-info-row ui-info-row--medium ui-info-row--background-gray">
                      <div className="ui-row__col ui-row__col--heading">
                          <div className="ui-avatar ">
                              <div className="ui-avatar__content ui-avatar__content--icon">
                                <FontAwesomeIcon icon="cloud" size="2x" color={icon_color_green}/>
                              </div>
                          </div>
                      </div>
                      <div className="ui-row__col ui-row__col--content">
                        <div className="ui-info-row__content">
                            <div className="ui-info-row__title">
                              {request_helper.getBlockchainLink(request, false, 'large')}
                            </div>
                        </div>
                      </div>

                      <div className="ui-row__col ui-row__col--actions">
                          <FontAwesomeIcon icon="chevron-right"  color="gray"/>
                      </div>
                  </li>
              </ul>
          </div>

        <div className="c-header-detail ">
            <div className="c-header-detail__head u-clearfix">
                <div className="c-header-detail__title">Attachments</div>
                <div className="c-header-detail__actions">
                </div>
            </div>
        </div>

        {  
          request.attach_nota_fiscal_id?
            (<div className="ui-list">
                      <ul className="ui-list__content">
                          <li className="ui-row ui-info-row ui-info-row--medium ui-info-row--background-gray">
                              <div className="ui-row__col ui-row__col--heading">
                                  <div className="ui-avatar ">
                                      <div className="ui-avatar__content ui-avatar__content--icon">
                                        <FontAwesomeIcon icon="receipt" size="2x" color={icon_color_green}/>
                                      </div>
                                  </div>
                              </div>
                              <div className="ui-row__col ui-row__col--content">
                                <div className="ui-info-row__content">
                                    <div className="ui-info-row__title">
                                      {request_helper.getGoogleDocLink(request.attach_nota_fiscal_id, true, 'Nota fiscal', 'large')}
                                    </div>
                                </div>
                              </div>

                              <div className="ui-row__col ui-row__col--actions">
                                  <FontAwesomeIcon icon="chevron-right"  color="gray"/>
                              </div>
                          </li>
                      </ul>
                  </div>)
            :    
            (<div className="ui-list">
                    <ul className="ui-list__content">
                      <div className="ui-list c-notes">
                        <ul className="ui-list__content">
                          <li id="addNote" className="c-notes__container-add-note">
                            <Dragger {...this.props.uploder[globalCfg.api.NOTA_FISCAL]}  multiple={false}>
                              <p className="ant-upload-drag-icon">
                                <FontAwesomeIcon icon="receipt" size="3x" color={icon_color}/>
                              </p>
                              <p className="ant-upload-text">Click or drag <b>Nota Fiscal</b> file to this area to upload</p>
                            </Dragger>    

                          </li>
                        </ul>
                      </div>
                    </ul>
                </div>)
        }

        {  
          request.attach_boleto_pagamento_id?
            (<div className="ui-list">
              <ul className="ui-list__content">
                  <li className="ui-row ui-info-row ui-info-row--medium ui-info-row--background-gray">
                      <div className="ui-row__col ui-row__col--heading">
                          <div className="ui-avatar ">
                              <div className="ui-avatar__content ui-avatar__content--icon">
                                <FontAwesomeIcon icon="file-invoice-dollar" size="2x" color={icon_color_green}/>
                              </div>
                          </div>
                      </div>
                      <div className="ui-row__col ui-row__col--content">
                        <div className="ui-info-row__content">
                            <div className="ui-info-row__title">
                              {request_helper.getGoogleDocLink(request.attach_boleto_pagamento_id, true, 'Boleto de pagamento', 'large')}
                            </div>
                        </div>
                    </div>
                  </li>
              </ul>
          </div>)
          :
          (request.provider_extra.payment_mode==globalCfg.api.PAYMENT_MODE_BOLETO)?
          (<div className="ui-list">
            <ul className="ui-list__content">
              <div className="ui-list c-notes">
                <ul className="ui-list__content">
                  <li id="addNote" className="c-notes__container-add-note">
                    <Dragger {...this.props.uploder[globalCfg.api.BOLETO_PAGAMENTO]}  multiple={false}>
                      <p className="ant-upload-drag-icon">
                        <FontAwesomeIcon icon="file-invoice-dollar" size="3x" color={icon_color}/>
                      </p>
                      <p className="ant-upload-text">Click or drag <b>Boleto de Pagamento</b> file to this area to upload</p>
                    </Dragger>    

                  </li>
                </ul>
              </div>
            </ul>
          </div>):(null)
        }

        {  
          request.attach_comprobante_id?
            (
          <div className="ui-list">
              <ul className="ui-list__content">
                  <li className="ui-row ui-info-row ui-info-row--medium ui-info-row--background-gray">
                      <div className="ui-row__col ui-row__col--heading">
                          <div className="ui-avatar ">
                              <div className="ui-avatar__content ui-avatar__content--icon">
                                <FontAwesomeIcon icon="file-pdf" size="2x" color={icon_color_green}/>
                              </div>
                          </div>
                      </div>
                      <div className="ui-row__col ui-row__col--content">
                        <div className="ui-info-row__content">
                            <div className="ui-info-row__title">
                              {request_helper.getGoogleDocLink(request.attach_comprobante_id, true, 'Comprobante', 'large')}
                            </div>
                        </div>
                    </div>
                  </li>
              </ul>
          </div>)
          :
          globalCfg.api.isProcessing(request)?
            (<div className="ui-list">
              <ul className="ui-list__content">
                <div className="ui-list c-notes">
                  <ul className="ui-list__content">
                    <li id="addNote" className="c-notes__container-add-note">
                      <Dragger {...this.props.uploder[globalCfg.api.COMPROBANTE]}  multiple={false}>
                        <p className="ant-upload-drag-icon">
                          <FontAwesomeIcon icon="file-pdf" size="3x" color={icon_color}/>
                        </p>
                        <p className="ant-upload-text">Click or drag <b>Comprobante</b> file to this area to upload</p>
                      </Dragger>    

                    </li>
                  </ul>
                </div>
              </ul>
          </div>) : (null)
      }

          
          
      </div>
    </>);
  }

}
//
export default (TransactionCard)
