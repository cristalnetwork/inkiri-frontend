import React, {Component} from 'react'
import { Upload, Tag, Spin, Icon, Autocomplete, Button, message } from 'antd';

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'
import * as globalCfg from '@app/configs/global';
import * as api from '@app/services/inkiriApi';

import debounce from 'lodash/debounce';

import './style.less'; 
import styles from './style.less';

import * as utils from '@app/utils/utils';

import moment from 'moment';

const { Dragger } = Upload;

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
    return (
      <div className="c-detail">
        <div className="c-header-detail ">
            <div className="c-header-detail__head u-clearfix">
                <div className="c-header-detail__title">Operation #<b>{utils.leadingZeros(request.requestCounterId, 5)}</b> • Created on <b>{moment(request.created_at).format('LLLL')}</b></div>
                <div className="c-header-detail__actions">
                  <Tag color={globalCfg.api.stateToColor(request.state)}>{utils.capitalize(globalCfg.api.stateToText(request.state))}</Tag>
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
                                                <span className="price-tag price-tag-symbol-text">{globalCfg.currency.fiat.plural}</span>
                                                <span className="price-tag price-tag-symbol">{globalCfg.currency.fiat.symbol} </span>
                                                <span className="price-tag price-tag-fraction">400</span>
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

        <div className="ui-list hidden">
            <ul className="ui-list__content">
                <li className="ui-row ui-info-row ui-info-row--medium ui-info-row--background-gray">
                    <div className="ui-row__col ui-row__col--heading">
                        <div className="ui-avatar rectangle-avatar">
                            <div className="ui-avatar__content ui-avatar__content--border">
                              <img className="ui-avatar__content--img" src="https://http2.mlstatic.com/storage/logos-api-admin/312238e0-571b-11e8-823a-758d95db88db-xl.png" />
                            </div>
                        </div>
                    </div>
                    <div className="ui-row__col ui-row__col--content">
                        <div className="ui-info-row__content">
                            <div className="ui-info-row__title">Visa Argentina S.A. terminada en 1305</div>
                            <div className="ui-info-row__details">
                                <ul>
                                    <li>#5256233277</li>
                                    <li>Pago aprobado</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
          </div>

        
          <div className="ui-list hidden">
            <ul className="ui-list__content">
              <li className="ui-row ui-info-row ui-info-row--medium ui-info-row--background-gray">
                  <div className="ui-row__col ui-row__col--heading">
                      <div className="ui-avatar">
                          <div className="ui-avatar__content ui-avatar__content--icon">
                            <Icon type="message" theme="twoTone" style={{fontSize:30}} />
                          </div>
                      </div>
                  </div>
                  <div className="ui-row__col ui-row__col--content">
                      <div className="ui-info-row__content">
                          <div className="ui-info-row__title">devolvemela!</div>
                      </div>
                  </div>
              </li>
              <li className="ui-row ui-info-row ui-info-row--medium ui-info-row--background-gray">
                  <div className="ui-row__col ui-row__col--heading">
                      <div className="ui-avatar">
                          <div className="ui-avatar__content ui-avatar__content--initials"><span>M</span></div>
                      </div>
                  </div>
                  <div className="ui-row__col ui-row__col--content">
                      <div className="ui-info-row__content">
                          <div className="ui-info-row__title">Memotes</div>
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
                            <Icon type="build" theme="twoTone" style={{fontSize:30}} />
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
                            <div className="ui-action-row__title u-truncate">Materiales para la construcción</div>
                            <div className="ui-action-row__description">
                                <div className="ui-info-row__details">
                                    <ul>
                                        <li>-</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>

          </ul>
      </div>
      
      {  
        request.nota_fiscal_url?
          (<div className="ui-list">
                    <ul className="ui-list__content">
                        <li className="ui-row ui-info-row ui-info-row--medium ui-info-row--background-gray">
                            <div className="ui-row__col ui-row__col--heading">
                                <div className="ui-avatar ">
                                    <div className="ui-avatar__content ui-avatar__content--icon">
                                      <Icon type="file" theme="twoTone" style={{fontSize:30}} />
                                    </div>
                                </div>
                            </div>
                            <div className="ui-row__col ui-row__col--content">
                              <div className="ui-info-row__content">
                                  <div className="ui-info-row__title">
                                    <Button type="link">Nota fiscal</Button>
                                  </div>
                              </div>
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
                          <Dragger {...props}>
                            <p className="ant-upload-drag-icon">
                              <Icon type="cloud" />
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
        request.boleto_pagamento?
          (<div className="ui-list">
            <ul className="ui-list__content">
                <li className="ui-row ui-info-row ui-info-row--medium ui-info-row--background-gray">
                    <div className="ui-row__col ui-row__col--heading">
                        <div className="ui-avatar ">
                            <div className="ui-avatar__content ui-avatar__content--icon">
                              <Icon type="file" theme="twoTone" style={{fontSize:30}} />
                            </div>
                        </div>
                    </div>
                    <div className="ui-row__col ui-row__col--content">
                      <div className="ui-info-row__content">
                          <div className="ui-info-row__title">
                            <Button type="link">Boleto de pagamento</Button>
                          </div>
                      </div>
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
                  <Dragger {...props}>
                    <p className="ant-upload-drag-icon">
                      <Icon type="cloud" />
                    </p>
                    <p className="ant-upload-text">Click or drag <b>Boleto de Pagamento</b> file to this area to upload</p>
                  </Dragger>    

                </li>
              </ul>
            </div>
          </ul>
        </div>)
      }

      {  
        request.comprobante_url?
          (
        <div className="ui-list">
            <ul className="ui-list__content">
                <li className="ui-row ui-info-row ui-info-row--medium ui-info-row--background-gray">
                    <div className="ui-row__col ui-row__col--heading">
                        <div className="ui-avatar ">
                            <div className="ui-avatar__content ui-avatar__content--icon">
                              <Icon type="file" theme="twoTone" style={{fontSize:30}} />
                            </div>
                        </div>
                    </div>
                    <div className="ui-row__col ui-row__col--content">
                      <div className="ui-info-row__content">
                          <div className="ui-info-row__title">
                            <Button type="link">Comprobante</Button>
                          </div>
                      </div>
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
                  <Dragger {...props}>
                    <p className="ant-upload-drag-icon">
                      <Icon type="cloud" />
                    </p>
                    <p className="ant-upload-text">Click or drag <b>Comprobante</b> file to this area to upload</p>
                  </Dragger>    

                </li>
              </ul>
            </div>
          </ul>
      </div>)
    }

        <div className="ui-list hidden">
            <ul className="ui-list__content">
                <li className="ui-row ui-info-row ui-info-row--medium ui-info-row--background-gray">
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
            </ul>
        </div>

        <div className="ui-list hidden">
            <ul className="ui-list__content">
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
                            <div className="ui-action-row__title u-truncate">Materiales para la construcción</div>
                            <div className="ui-action-row__description">
                                <div className="ui-info-row__details">
                                    <ul>
                                        <li>x1 Unidad</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </li>
                <li className="ui-row ui-info-row ui-info-row--medium ui-info-row--background-gray">
                    <div className="ui-row__col ui-row__col--heading">
                        <div className="ui-avatar">
                            <div className="ui-avatar__content ui-avatar__content--border">
                              <img className="ui-avatar__content--img" src="https://mla-s1-p.mlstatic.com/897068-MLA31484381127_072019-O.jpg" alt="TS" />
                            </div>
                        </div>
                    </div>
                    <div className="ui-row__col ui-row__col--content">
                        <div className="ui-info-row__content">
                            <div className="ui-info-row__title">TOTALGNC S.R.L.</div>
                            <div className="ui-info-row__details">
                                <ul></ul>
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </div>
        
                

        
     </div>
    );
  }

}
//
export default (TransactionCard)
