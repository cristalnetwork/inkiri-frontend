import React, {useState, Component} from 'react'
import { Button, Select, Input, InputNumber } from 'antd';

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux';

import * as loginRedux from '@app/redux/models/login'

import * as globalCfg from '@app/configs/global';

import { InboundMessageType, createDfuseClient } from '@dfuse/client';
import { Route, Redirect, withRouter } from "react-router-dom";
import * as api from '@app/services/inkiriApi';

import './extrato.css'; 



import { Api, JsonRpc, RpcError } from 'eosjs';
import { JsSignatureProvider } from 'eosjs/dist/eosjs-jssig';

const { Option } = Select;


class AllInOne extends Component {
  constructor(props) {
    super(props);
    this.state = {
      connected:           false,
      errorMessages:       [],
      transfers:           [],
      balance:             {},

      sender_account:      'ikmasterooo1',
      destination_account: 'ikadminoooo1',
      destination_amount:   2,
      sign_account         : 'ikmasterooo1',
      sign_pub             : 'EOS6gWUtcGdykP26Y2JBH7ZQm2RRsNCP8cB5PwSbqiPPR6C5T7rjA',
      sign_priv            : '5J2bKBbHH6xB2U255CWbXJ6uAuibg5KCh1omKdhpKoCfrTxWkUN',
      sign_to_sign         : '5Jx62Vzr7cptghWHsVeY8uNaUWRsEixSnqayCMVcqepRHFZuZQa',
      sign_signature       : 'nada',
      sign_soy_yo          : ''
      
    };

    this.onAmountChange           = this.onAmountChange.bind(this);
    this.onAccountChange          = this.onAccountChange.bind(this);
    this.onSenderChange           = this.onSenderChange.bind(this);
    this.readConfig               = this.readConfig.bind(this);
    this.getSenderPriv            = this.getSenderPriv.bind(this);
    this.getSenderAccountBalance  = this.getSenderAccountBalance.bind(this);
    this.prettyJson               = this.prettyJson.bind(this);
    this.testEOSHelper            = this.testEOSHelper.bind(this);
    this.listBankAccounts         = this.listBankAccounts.bind(this);

    this.testSearchBankAccount    = this.testSearchBankAccount.bind(this);
    this.testListTxs              = this.testListTxs.bind(this);
    this.addPersonalBankAccount   = this.addPersonalBankAccount.bind(this);
    this.routerTest               = this.routerTest.bind(this);

    this.stream = undefined
    // this.client = undefined
    // this.client = createDfuseClient({
    //   apiKey:globalCfg.dfuse.api_key,
    //   network:globalCfg.dfuse.network,
    //   streamClientOptions: {
    //     socketOptions: {
    //       onClose: this.onClose,
    //       onError: this.onError,
    //     }
    //   }
    // })

  }

  componentWillUnmount() {
    // if (this.stream !== undefined) {
    //   this.stream.close()
    // }
  }

  onAmountChange(value) {
    // this.setState(  {destination_amount: event.target.value});
    console.log(' -- onAmountChange')
    console.log(JSON.stringify(value))
    this.setState({destination_amount: value});
  }

  onAccountChange(value){
    console.log(' -- onAccountChange')
    console.log(JSON.stringify(value))
    // this.setState({destination_account: event.target.value});
    this.setState({destination_account: value});
  }

  onSenderChange(value){
    this.setState({sender_account: value});
  }

  getSenderAccountBalance(){
    
    api.dfuse.getAccountBalance(this.state.sender_account).then(data => {
      console.log(JSON.stringify(data));
      let text_ = 'Balance account:' + this.state.sender_account + ' amount:' + data.data.balance
      this.setState((prevState) => ({
        transfers: [ ...prevState.transfers.slice(-100), text_ ],
      }))
    })

  }

  getFormattedAmount()
  {
    return Number(this.state.destination_amount).toFixed(4) + ' INK';
  }
  
  getSenderPriv(){
    // return this.state.privs[this.state.sender_account];
    return api.dummyPrivateKeys[this.state.sender_account]
  }

  readConfig() {
    const endpoint = "https://jungle.eos.dfuse.io"
    const guaranteed = "in-block" // Or "irreversible", "handoff:1", "handoffs:2", "handoffs:3"
    const transferTo = this.state.destination_account;
    const transferQuantity = this.getFormattedAmount();
    const dfuseApiToken = globalCfg.dfuse.api_key
    const privateKey = this.getSenderPriv();

    const transferFrom = this.state.sender_account;
    
    return {
      endpoint,
      guaranteed,
      dfuseApiToken: dfuseApiToken,
      privateKey: privateKey,
      transferFrom: transferFrom,
      transferTo,
      transferQuantity
    }
  }

  listBankAccounts = async () => {
    api.dfuse.listBankAccounts().then(res => {console.log(' -- listBankAccounts --'); console.log('---- RES:', JSON.stringify(res))} );
  }

  routerTest = async () => {
    this.props.history.push({
      pathname: `/${this.props.actualRole}/send-money`
      , search: '?query=abc'
      // , state: { detail: 'this is a detail' }
    })
  }

  addPersonalBankAccount = async () => {
    const privateKey = this.getSenderPriv();
    const receiver   = this.state.destination_account;
    const sender     = this.state.sender_account;
    
    // async (auth_account, auth_priv, account_name)
    api.addPersonalBankAccount(sender, privateKey, receiver)
    .then(res => {console.log(' -- addPersonalBankAccount --'); console.log('---- RES:', JSON.stringify(res))} )
    .catch(ex => {
            console.log(' -- addPersonalBankAccount --');
            console.log('---- ERROR:', JSON.stringify(ex));
    });
  }

  testSearchBankAccount = async () => {
    
    // api.dfuse.searchBankAccount('ikadminoooo1')
    // .then(res => 
    //     {
    //         console.log(' -- dfuse::searchBankAccount --');
    //         console.log('---- RES:', JSON.stringify(res));
    //     } 
    // )
    // .catch(ex => {
    //         console.log(' -- dfuse::searchBankAccount --');
    //         console.log('---- ERROR:', JSON.stringify(ex));
    //     } 
    // )
    
    // return;
  }

  testListTxs = async () => {
    api.dfuse.listTransactions('ikadminoooo1')
    .then(res => 
        {
            console.log(' -- dfuse::listTransactions --');
            console.log('---- RES:', JSON.stringify(res));
        } 
    )
    .catch(ex => {
            console.log(' -- dfuse::listTransactions --');
            console.log('---- ERROR:', JSON.stringify(ex));
        } 
    )
    
    return;
  }

  getRequests = async() => {

    const bank_requests = await api.bank.listMyRequests(undefined, 0, 10);
    console.log(JSON.stringify(bank_requests));
    return;

  //   const client = createDfuseClient({ apiKey:globalCfg.dfuse.api_key,
  //     network:globalCfg.dfuse.network, })

  //   try {
  //     //data.auth.accounts.permission.actor:ACCOUNT_NAME
  //     const response = await client.stateTablesForScopes(
  //       globalCfg.bank.contract,
  //       [globalCfg.bank.issuer],
  //       "delband"
  //     )

  //     //  const response = await client.stateTable("eosio.token", "EOS", "stat")
  //     console.log("State tables for scopes response", prettifyJson(response))
  //   } catch (error) {
  //     console.log("An error occurred", error)
  //   }

  // client.release()


  //   db.table: supports two values:
  //   [table_name]/[scope]
  //   [table_name]

  }

  

  testLogin = async() => {  
    let account = '';
    // account = 'inkiritoken1';
    // account = 'inkirimaster';
    // account = 'ikadminoooo1';
    account = 'ikmasterooo1';
    api.login(account, api.dummyPrivateKeys[account])
    .then((res) => {
      console.log('---- api.login >>> RES:', JSON.stringify(res))
    }, (err) => {
      console.log('---- api.login >>> ERROR:', err)
    } );
    
   
  }

  // NOT LINKED
  authDfuse = async() => {
    api.dfuse.auth().then(res => {console.log(' -- dfuse::auth --'); console.log('---- RES:', JSON.stringify(res))} );
  }

  signString = async() => {
    console.log(' ABOUT TO SIGN => ', 
      ' | state.sign_priv => ', this.state.sign_priv, 
      ' | state.sign_to_sign =>', this.state.sign_to_sign, 
      ' | this.state.sign_pub => ', this.state.sign_pub);
    api.eosHelper.signString(this.state.sign_priv, this.state.sign_to_sign)
    .then((res) => {
      console.log('---- RES:', JSON.stringify(res));
      this.setState({sign_signature: JSON.stringify(res)});
      api.eosHelper.verify(res.data.signed_data, this.state.sign_to_sign, this.state.sign_pub).then( res2 => {
        console.log('---- RES:', JSON.stringify(res2));
        this.setState({sign_soy_yo: JSON.stringify(res2)});
      })
    } , (error) => {
      console.log('---- RES:', error, JSON.stringify(error));
    });
  }

  testEOSHelper = async () => {
    let myPriv     = '5J2bKBbHH6xB2U255CWbXJ6uAuibg5KCh1omKdhpKoCfrTxWkUN';
    let myPub      = 'EOS6gWUtcGdykP26Y2JBH7ZQm2RRsNCP8cB5PwSbqiPPR6C5T7rjA';
    let stringData = 'holamundo';

    api.eosHelper.generateRandomKeys().then(res => {console.log(' -- generateRandomKeys --'); console.log('---- RES:', JSON.stringify(res))} );
    api.eosHelper.seedPrivate('privateSeed').then(res => {console.log(' -- seedPrivate --'); console.log('---- RES:', JSON.stringify(res))} );
    api.eosHelper.isValidPrivate(myPriv).then(res => {console.log(' -- isValidPrivate --'); console.log('---- RES:', JSON.stringify(res))} );
    api.eosHelper.isValidPublic(myPub).then(res => {console.log(' -- isValidPublic --'); console.log('---- RES:', JSON.stringify(res))} );
    api.eosHelper.signString(myPriv, stringData).then(res => 
      {
          console.log(' -- signString --'); 
          console.log('---- RES:', JSON.stringify(res));
          
          api.eosHelper.recover(res.data.signed_data, stringData, false).then( res2 => {
            console.log(' -- recover --'); 
            console.log('---- RES:', JSON.stringify(res2))}
          )
          
          api.eosHelper.verify(res.data.signed_data, stringData, myPub).then( res2 => {
            console.log(' -- verify --'); 
            console.log('---- RES:', JSON.stringify(res2))}
          )

    } );
    
    api.eosHelper.sha256(stringData).then(res => {
      console.log(' -- sha256 --'); 
      console.log(JSON.stringify(res));
      api.eosHelper.signHash(myPriv, res.data.hashed_data).then(res2 => {
          console.log(' -- signHash --'); 
          console.log('---- RES:', JSON.stringify(res2))
        }
      );

    } );
    

  }

  send = async () => {
    
    if(!this.state.connected)
      this.launch();

    const privateKey = this.getSenderPriv();
    const receiver   = this.state.destination_account;
    const sender     = this.state.sender_account;
    const amount     = this.state.destination_amount;

    api.sendMoney(sender, privateKey, receiver, amount)
    .then(data => {
      console.log(' AllInOne::send (then#1) >>  ', JSON.stringify(data));
    })
    .catch(ex=>{
      console.log(' AllInOne::send (error#1) >>  ', JSON.stringify(ex));
    })
  }

  // sendOLD = async () => {
    
  //   if(!this.state.connected)
  //     this.launch();

  //   const config = this.readConfig()

  //   const signatureProvider = new JsSignatureProvider([config.privateKey])
  //   const rpc = new JsonRpc(config.endpoint)
  //   const api = new Api({
  //     rpc,
  //     signatureProvider
  //   })

  //   const transferAction = {
  //     account: "ikmasterooo1",
  //     name: "transfer",
  //     authorization: [
  //       {
  //         actor: config.transferFrom,
  //         permission: "active"
  //       }
  //     ],
  //     data: {
  //       from: config.transferFrom,
  //       to: config.transferTo,
  //       quantity: config.transferQuantity,
  //       memo: 'snd|key'
  //     }
  //   }

  //   console.log(" allInOne::send >> Transfer action <<", this.prettyJson(transferAction))

  //   const startTime = new Date()
  //   const result = await api.transact(
  //     { actions: [transferAction] },
  //     {
  //       blocksBehind: 3,
  //       expireSeconds: 30
  //     }
  //   )

  //   console.log(' allInOne::send >> result <<', this.prettyJson(result));

  // }
  
  prettyJson(input: any): string {
    return JSON.stringify(input, null, 2)
  }


  issue = async () => {
    
    if(!this.state.connected)
      this.launch();

    const privateKey = this.getSenderPriv();
    // const receiver   = this.state.destination_account + 'xx';
    const receiver   = this.state.destination_account;
    const sender     = this.state.sender_account;
    const amount     = this.state.destination_amount;

    api.issueMoney(sender, privateKey, receiver, amount)
    .then(data => {
      console.log(' AllInOne::issue (then#1) >>  ', JSON.stringify(data));
    })
    .catch(ex=>{
      console.log(' AllInOne::issue (error#1) >>  ', JSON.stringify(ex));
    })
  }

  // issueOLD = async () => {
    
  //   if(!this.state.connected)
  //     this.launch();

  //   const config = this.readConfig()

  //   const signatureProvider = new JsSignatureProvider([config.privateKey])
  //   const rpc = new JsonRpc(config.endpoint)
  //   const api = new Api({
  //     rpc,
  //     signatureProvider
  //   })

  //   const issueAction = {
  //     account: "ikmasterooo1",
  //     name: "issue",
  //     authorization: [
  //       {
  //         actor: config.transferFrom,
  //         permission: "active"
  //       }
  //     ],
  //     data: {
  //       to: config.transferTo,
  //       quantity: config.transferQuantity,
  //       memo: 'iss|key'
  //     }
  //   }

  //   console.log("Issue action", this.prettyJson(issueAction))

  //   const startTime = new Date()
  //   const result = await api.transact(
  //     { actions: [issueAction] },
  //     {
  //       blocksBehind: 3,
  //       expireSeconds: 30
  //     }
  //   )
  // }

  launch = async () => {
    
    return;  

    console.log(' LAUNCH clicked')
    if (!globalCfg.dfuse.api_key) {
      const messages = [
        "To correctly run this sample, you need to defined an environment variable",
        "named 'REACT_APP_DFUSE_API_KEY' with the value being your dfuse API token.",
        "",
        "To make it into effect, define the variable before starting the development",
        "scripts, something like:",
        "",
        "REACT_APP_DFUSE_API_KEY=web_....",
        "",
        "You can obtain a free API key by visiting https://dfuse.io"
      ]

      console.log(' LAUNCH no key')
      this.setState({ connected: false, errorMessages: messages, transfers: [] })
      return
    }

    if (this.state.connected) {
      const messages = [
        "Already connected!!!!"
      ]

      this.setState({errorMessages: messages, transfers: [] })
      return;
    }

    this.setState({ errorMessages: [], transfers: [] })

    try { 
      this.stream = await this.client.streamActionTraces({
        account: "ikmasterooo1|ikadminoooo1", action_name: "transfer|issue"
      }, this.onMessage)

      console.log(' LAUNCH connected')
      this.setState({ connected: true })
    } catch (error) {
      console.log(' LAUNCH error')
      console.log(JSON.stringify(error))
      this.setState({ errorMessages: ["Unable to connect to socket.", JSON.stringify(error)] })
    }
  }

  onMessage = async (message) => {
    console.log(' ON  MESSAGE ', JSON.stringify(message))
    if (message.type !== InboundMessageType.ACTION_TRACE) {
      return
    }

    const { from, to, quantity, memo } = message.data.trace.act.data
    const transfer = `Transfer [${from} -> ${to}, ${quantity}] (${memo})`

    this.setState((prevState) => ({
      transfers: [ ...prevState.transfers.slice(-100), transfer ],
    }))
  }

  stop = async () => {
    if (this.stream === undefined) {
      return
    }

    try {
      await this.stream.close()
      this.stream = undefined
    } catch (error) {
      this.setState({ errorMessages: ["Unable to disconnect socket correctly.", JSON.stringify(error)]})
    }
  }

  onClose = () => {
    this.setState({ connected: false })
  }

  onError = (error) => {
    this.setState({ errorMessages: ["An error occurred with the socket.", JSON.stringify(error)]})
  }

  renderTransfer = (transfer, index) => {
    return <code key={index} className="App-transfer">{transfer}</code>
  }

  renderTransfers() {
    return (
      <div className="App-infinite-container">
        { this.state.transfers.length <= 0
            ? this.renderTransfer("Nothing yet, start by hitting Launch!")
            : this.state.transfers.reverse().map(this.renderTransfer)
        }
      </div>
    )
  }

  renderError = (error, index) => {
    if (error === "") {
      return <br key={index} className="App-error"/>
    }

    return <code key={index} className="App-error">{error}</code>
  }

  renderErrors() {
    if (this.state.errorMessages.length <= 0) {
      return null
    }

    return (
      <div className="App-container">
        {this.state.errorMessages.map(this.renderError)}
      </div>
    )
  }
  //
  render() {
    return (

      <div className="XX-App">
        <div className="XX-header">
          <h2>Operations</h2>
          {this.renderErrors()}
          <div className="App-main">
            
            <div style={{ display: 'block' }}>
              <h3>Sender/Issuer</h3>
              <Select 
                defaultValue="ikmasterooo1" 
                style={{ width: 'auto' }} 
                onChange={ this.onSenderChange} >
                
                <Option value="ikmasterooo1">ikmasterooo1</Option>
                <Option value="ikadminoooo1">ikadminoooo1</Option>
                <Option value="marcostest13">marcostest13</Option>
                <Option value="inkpersonal1">inkpersonal1</Option>
              </Select>
            </div>

            <div style={{ display: 'block' }}>
              <h3>Receipt</h3>
              <Select 
                defaultValue="ikadminoooo1" 
                style={{ width: 'auto' }} 
                onChange={ this.onAccountChange} >
                
                <Option value="ikmasterooo1">ikmasterooo1</Option>
                <Option value="ikadminoooo1">ikadminoooo1</Option>
                <Option value="marcostest13">marcostest13</Option>
                <Option value="inkpersonal1">inkpersonal1</Option>
              </Select>
            </div>

            <div style={{ display: 'block' }}>
              <h3>Amount</h3>
              <InputNumber
                defaultValue={2}
                formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                parser={value => value.replace(/\$\s?|(,*)/g, '')}
                onChange={ this.onAmountChange }
              />
            </div>

            <button className="App-button" onClick={()=>this.routerTest()}>RouterTest: Send Money</button>
            <button className="App-button" onClick={()=>this.addPersonalBankAccount()}>Add Receiver as Inkiri Bank Account</button>
            <button className="App-button" onClick={()=>this.testSearchBankAccount()}>Search BankAccount</button>
            <button className="App-button" onClick={()=>this.testListTxs()}>List TXs</button>
            <button className="App-button" onClick={()=>this.listBankAccounts()}>List Bank Accounts</button>
            <button className="App-button" onClick={()=>this.testEOSHelper()}>Test EOS</button>
            <button className="App-button" onClick={()=>this.send()}>Send</button>
            <button className="App-button" onClick={()=>this.issue()}>Issue</button>
            <button className="App-button" onClick={()=>this.getSenderAccountBalance()}>Get Sender Balance</button>

          </div>
        </div>

        <div className="XX-header">
          <h2>Tools</h2>
          <div className="App-main">
            <Input
                addonBefore="account"
                placeholder={this.state.sign_account}
                onChange={ (value) => this.setState({sign_account:value}) }
              />
              <Input
                addonBefore="priv"
                placeholder={this.state.sign_priv}
                onChange={ (value) => this.setState({sign_priv:value}) }
              />
              <Input
                addonBefore="pub"
                placeholder={this.state.sign_pub}
                onChange={ (value) => this.setState({sign_pub:value}) }
              />
              <Input
                addonBefore="to_sign"
                placeholder={this.state.sign_to_sign}
                onChange={ (value) => this.setState({sign_to_sign:value}) }
              />
              <Input
                addonBefore="signature"
                placeholder={this.state.sign_signature}
                value={ this.state.sign_signature }
              />
              <Input
                addonBefore="sign result"
                placeholder={this.state.sign_soy_yo}
                value={ this.state.sign_soy_yo }
              />
          </div>
          <div className="App-buttons">
            <button className="App-button" onClick={()=>this.signString()}>signString</button>
            <button className="App-button" onClick={()=>this.testLogin()}>testLogin</button>
            <button className="App-button" onClick={()=>this.getRequests()}>getRequests</button>
            
          </div>
        </div>

        <div className="XX-header">
          <h2>Transactions History</h2>
          <div className="App-buttons">
            <button className="App-button" onClick={()=>this.launch()}>Listen</button>
            <button className="App-button" onClick={()=>this.stop()}>Stop</button>
          </div>
          <div className="App-main">
            <p className="App-status">
              {`Connected: ${this.state.connected ? "Connected (Showing last 100 transfers)" : "Disconnected"}`}
            </p>
            {this.renderTransfers()}
          </div>
        </div>
      </div>
    );
  }
}


export default withRouter(connect(
    (state)=> ({
        // isLoading: 		      userRedux.isLoading(state),
        actualRole:         loginRedux.actualRole(state)
    }),
    (dispatch)=>({
        // tryUserState: bindActionCreators(userRedux.tryUserState , dispatch)
    })
)(AllInOne))