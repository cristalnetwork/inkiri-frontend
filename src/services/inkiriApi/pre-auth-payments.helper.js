import moment from 'moment';

export const getServicePeriods = (dict) =>{
  return getServicePeriodsEx(dict.begins_at, dict.expires_at);
}

export const getServicePeriodsEx = (begins_at, expires_at) =>{
  let my_begins_at  = getMoment(begins_at);
  let my_expires_at = getMoment(expires_at);
  return my_expires_at.diff(my_begins_at, 'months')+1;
}

export const getServiceBeginTimestamp = (begins_at) =>{
  let my_begins_at = getMoment(begins_at);
  return my_begins_at.startOf('month').unix();
}

const getMoment = (value) => {
  let moment_value = value;
  if(typeof value === 'number' || typeof value === 'string')
    moment_value = moment(value);
  return moment_value;
}