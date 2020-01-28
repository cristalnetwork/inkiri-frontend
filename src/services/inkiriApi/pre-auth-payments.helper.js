import moment from 'moment';
import * as globalCfg from '@app/configs/global';

const REQUIRED_PERIOD_DURATION   = 30 ; // 30*24*60*60;    // 30 days in second

export const getChargeInfo = (pap) =>{
  const MONTH_FORMAT     = 'YYYY/MM';
  const price_amount     = globalCfg.currency.toNumber(pap.price) 
  const _next            = moment(pap.begins_at).add((pap.last_charged+1)*REQUIRED_PERIOD_DURATION, 'days');
  const last             = moment(pap.begins_at).add((pap.last_charged-1), 'months').format(MONTH_FORMAT)
  const now              = moment();
  const days_to_charge   = _next.diff(now, 'days'); 
  const _canChargeNext   = canChargeNext(pap);
  
  const ret = {
    last_charged:       pap.last_charged>0?(last):'-'
    , total_charged:    globalCfg.currency.toCurrencyString( pap.last_charged * price_amount)
    , total_amount:     globalCfg.currency.toCurrencyString( pap.periods * price_amount)
    , next:             (_canChargeNext)?_next:null
    , days_to_charge:   days_to_charge 
  }
  // console.log(pap, ret)
  return ret;
}

export const getServicePeriods = (dict) =>{
  return getServicePeriodsEx(dict.begins_at, dict.expires_at);
}

export const getServicePeriodsEx = (begins_at, expires_at) =>{
  let my_begins_at  = getMoment(begins_at).startOf('month');
  let my_expires_at = getMoment(expires_at).startOf('month');

  // console.log('============= begins_at: ', begins_at)
  // console.log('============= expires_at: ', expires_at)
  // console.log('============= my_begins_at: ', my_begins_at)
  // console.log('============= my_expires_at: ', my_expires_at)
  // console.log('============= MONTHS-diff: ', my_expires_at.diff(my_begins_at, 'months'))
  return my_expires_at.diff(my_begins_at, 'months')+1;

}

export const getServiceBegin = (begins_at) =>{
  let my_begins_at = getMoment(begins_at);
  return my_begins_at.startOf('month');
}

export const getServiceBeginTimestamp = (begins_at) =>{
  return getServiceBegin(begins_at).unix();
}

export const getMoment = (value) => {
  if(value instanceof moment)
    return value;
  let moment_value = value;
  // if(typeof value === 'number')
  if(!isNaN(value))
  {
    // console.log(typeof value);
    let my_value = value;
    if(value.toString().length=='1570910442875'.length)
      my_value = value/1000;
    // console.log(' ojota!:', value, my_value)
    moment_value = moment.unix(my_value)
  }
  else
    if(typeof value === 'string')
      moment_value = moment(value);
  return moment_value;
}

const canChargeNext = (pap) =>{
  return pap.last_charged<pap.periods;
}
