import * as gqlService from '@app/services/inkiriApi/graphql'

export const translate = (request, intl) => {
  const requested_type          = intl.formatMessage({id:`requests.types.${request.requested_type}`})
  request.header                = intl.formatMessage({id:'requests.header'}, {requested_type:requested_type})
  request.sub_header            = intl.formatMessage({id:'requests.sub_header'}, {requested_type:requested_type})
  request.sub_header_ex         = intl.formatMessage({id:'requests.sub_header_ex'}, {requested_type:requested_type})
  request.sub_header_admin      = intl.formatMessage({id:'requests.sub_header_admin'}, {requested_type:requested_type, account_name:request.from})
  request.state_string          = intl.formatMessage({id:`requests.states.${request.state}`})
  request.simple_state_string   = intl.formatMessage({id:`requests.states.${request.simple_state}`})
  return request;
}

export async function requests () {  
  const _requests = await gqlService.requests(arguments[0]);
  return _requests.map(request => translate(request, arguments[1]))
}

export async function extrato () {  
  const _requests = await gqlService.extrato(arguments[0]);
  return _requests.map(request => translate(request, arguments[1]))
}

export async function request () {  
  const _request = await gqlService.request(arguments[0]);
  return translate(_request, arguments[1]);
}
