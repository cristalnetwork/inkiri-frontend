import * as utils from '@app/utils/utils';

export const pathNames = utils.arrToObj([
    'personalDashboard',
    'personalExchange',
    
    // 'personalConfiguration',

    'bankadminSoon',
    'bankadminDashboard',
    'bankadminTransactions',
    'bankadminOperations',
    'bankadminServices',
    'bankadminExternalTransfers',
    'bankadminExternalTransfers_ProcessExternal',
    'bankadminIugu',
    'bankadminIugu_Details',
    'bankadminConfiguration',
    'bankadminAdministration',
    'bankadminAccounts',
    'bankadminAccounts_Account',
    'bankadminAccounts_CreateAccount',
    'bankadminProfiles',
    'bankadminProfiles_Profile',
    
    'bankadminPDA',
    'bankadminPDA_ProcessRequest',
    'bankadminStaff',
    'bankadminTeams',
    
    'businessPDV',
    'businessPaymentsAndServices',
    'businessProvidersPayments',
    'businessProvidersPayments_Request',

    'commonExtrato',
    'commonRequestDetails',
    'commonTransactionDetails',
    'commonDeposit',
    'commonWithdraw',
    'commonSend',
    'commonConfiguration',
    'commonCrew',
    'commonSalaries',
    'commonServices',
    'commonServiceContracts',
    'commonServiceContractPayment',
    'commonServiceRequests',
    'commonContractedServices',
    'commonRequestMoney',
    'commonProviders',
    'commonProviders_CreateProvider',
    'commonProviders_ProviderProfile',
    'commonBulkPadCharge',

    'mobileExtrato',
    'mobilePDV',
    'mobileSend',
    'mobileRequestDetails',
    'dashboard'
])

const personal =[
    {
       key:        pathNames.personalExchange,
       fileName:   'exchange',
       area:       'personal',
       path:       'exchange',
       container:  'dashboard' 
    },
    
]

const bankadmin = [
     {
       key:        pathNames.bankadminDashboard,
       fileName:   'dashboard',
       area:       'bankadmin',
       path:       'dashboard',
       container:  'dashboard',
       role:       'bankadmin'
     },
     {
       key:       pathNames.bankadminOperations,
       fileName:  'operations',
       area:      'bankadmin',
       path:      'operations',
       container: 'dashboard',
       role:      'bankadmin'
    },
    {
       key:       pathNames.bankadminServices,
       fileName:  'servicesX',
       area:      'bankadmin',
       path:      'services',
       container: 'dashboard',
       role:      'bankadmin'
    },
    {
       key:       pathNames.bankadminExternalTransfers,
       fileName:  'external-transfers',
       area:      'bankadmin',
       path:      'external-transfers',
       container: 'dashboard',
       role:      'bankadmin'
    },
    {
       key:         pathNames.bankadminExternalTransfers_ProcessExternal,
       father_key : '*',
       fileName:    'process-request',
       area:        'bankadmin',
       // path:        'external-transfers-process-request',
       path:        'process-request',
       container:   'dashboard',
       role:        'bankadmin'
    },
    {
       key:         pathNames.bankadminIugu,
       fileName:    'iugu',
       area:        'bankadmin',
       path:        'iugu',
       container:   'dashboard',
       role:        'bankadmin'
    },
    {
       key:         pathNames.bankadminIugu_Details,
       father_key:  '*',
       fileName:    'iugu_details',
       area:        'bankadmin',
       path:        'iugu-invoice',
       container:   'dashboard',
       role:        'bankadmin'
    },
    {
       key:         pathNames.bankadminConfiguration,
       fileName:    'configuration',
       area:        'bankadmin',
       path:        'configuration',
       container:   'dashboard',
       role:        'bankadmin'
    },
    
    {
       key:        pathNames.bankadminAccounts,
       fileName:   'accounts',
       area:       'bankadmin',
       path:       'accounts',
       container:  'dashboard',
       role:       'bankadmin'
    },
    {
       key:         pathNames.bankadminAccounts_Account,
       father_key:  '*',
       fileName:    'account',
       area:        'bankadmin',
       path:        'account',
       container:   'dashboard',
       role:        'bankadmin'
    },
    {
       key:         pathNames.bankadminAccounts_CreateAccount,
       father_key : '*',
       fileName:    'create-account',
       area:        'bankadmin',
       path:        'create-account',
       container:   'dashboard',
       role:        'bankadmin'
    },
    {
       key:         pathNames.bankadminProfiles,
       fileName:    'profiles',
       area:        'bankadmin',
       path:        'profiles',
       container:   'dashboard',
       role:        'bankadmin'
    },
    {
       key:         pathNames.bankadminProfiles_Profile,
       father_key : '*',
       fileName:    'profile',
       area:        'bankadmin',
       path:        'profile',
       container:   'dashboard',
       role:        'bankadmin'
    },
    {
       key:         pathNames.bankadminPDA,
       fileName:    'pda',
       area:        'bankadmin',
       path:        'pda',
       container:   'dashboard',
       role:        'bankadmin'
    },
    {
       key:         pathNames.bankadminPDA_ProcessRequest,
       father_key : '*',
       fileName:    'process-request',
       area:        'bankadmin',
       path:        'pda-process-request',
       container:   'dashboard',
       role:        'bankadmin'
    },
    {
       key:       pathNames.bankadminTeams,
       fileName:  'teams',
       area:      'bankadmin',
       path:      'teams',
       container: 'dashboard',
       role:      'bankadmin' 
    }

 ];

const business = [
    {
       key:         pathNames.businessPDV,
       fileName:    'pdv',
       area:        'business',
       path:        'pdv',
       container:   'dashboard',
       role:        'business'
    },
    {
       key:         pathNames.businessProvidersPayments,
       fileName:    'providers-payments',
       area:        'business',
       path:        'providers-payments',
       container:   'dashboard',
       role:        'business'
    },
    {
       key:         pathNames.businessProvidersPayments_Request,
       father_key:  pathNames.businessProvidersPayments,
       fileName:    'providers-payments-request',
       area:        'business',
       path:        'providers-payments-request',
       container:   'dashboard',
       role:        'business'
    },
    
    
  ];

const common = [
  {
     key:       pathNames.commonRequestDetails,
     fileName:  'request-details',
     area:      'common',
     path:      'request-details',
     container: 'dashboard',
     role:      '*', 
  },
  {
     key:       pathNames.commonTransactionDetails,
     fileName:  'transaction-details',
     area:      'common',
     path:      'transaction-details',
     container: 'dashboard',
     role:      '*', 
  },
  {
     key:       pathNames.commonDeposit,
     fileName:  'deposit',
     area:      'common',
     path:      'deposit',
     container: 'dashboard',
     role:      '*', 
  },
  {
     key:       pathNames.commonWithdraw,
     fileName:  'withdraw',
     area:      'common',
     path:      'withdraw',
     container: 'dashboard',
     role:      '*', 
  },
  {
     key:       pathNames.commonSend,
     fileName:  'send', // fileName: 'sendMoney',
     area:      'common',
     path:      'send',
     container: 'dashboard' ,
     role:      '*' 
  },
  {
     key:       pathNames.commonRequestMoney,
     fileName:  'request-money',
     area:      'common',
     path:      'request-money',
     container: 'dashboard' ,
     role:      '*' 
  },
  {
     key:       pathNames.commonConfiguration,
     fileName:  'configuration',
     area:      'common',
     path:      'configuration',
     container: 'dashboard',
     role:      '*' 
  },
  {
     key:       pathNames.commonCrew,
     fileName:  'crew',
     area:      'common',
     path:      'crew',
     container: 'dashboard',
     role:      '*' 
  },
  {
     key:       pathNames.commonSalaries,
     fileName:  'salaries',
     area:      'common',
     path:      'salaries',
     container: 'dashboard',
     role:      '*' 
  },
  {
     key:        pathNames.commonServices,
     fileName:  'services',
     area:      'common',
     path:      'services',
     container: 'dashboard',
     role:       '*'
   },
   {
     key:            pathNames.commonServiceContracts,
     father_key :    '*',
     fileName:       'service-contracts',
     area:           'common',
     path:           'service-contracts',
     container:      'dashboard',
     role:           '*'
   },
   {
     key:            pathNames.commonServiceContractPayment,
     father_key :    '*',
     fileName:       'service-contract-payments',
     area:           'common',
     path:           'service-contract-payments',
     container:      'dashboard',
     role:           '*'
   },
   {
     key:            pathNames.commonServiceRequests,
     father_key :    '*',
     fileName:       'service-requests',
     area:           'common',
     path:           'service-requests',
     container:      'dashboard',
     role:           '*'
   },
   {
     key:            pathNames.commonContractedServices,
     fileName:       'contracted-services',
     area:           'common',
     path:           'contracted-services',
     container:      'dashboard',
     role:           '*'
   },
   {
       key:          pathNames.commonProviders,
       fileName:     'providers',
       area:         'common',
       path:         'providers',
       container:    'dashboard',
       role:         '*'
    },
    {
       key:          pathNames.commonProviders_CreateProvider,
       father_key :  '*',
       fileName:     'create-provider',
       area:         'common',
       path:         'create-provider',
       container:    'dashboard',
       role:         '*'
    },
    {
       key:          pathNames.commonProviders_ProviderProfile,
       father_key :  '*',
       fileName:     'provider-profile',
       area:         'common',
       path:         'provider-profile',
       container:    'dashboard',
       role:         '*'
    },
  {
       key:          pathNames.commonExtrato,
       fileName:     'extrato',
       area:         'common',
       path:         'extrato',
       container:    'dashboard',
       role:         '*'
    },
    {
       key:          pathNames.commonBulkPadCharge,
       fileName:     'bulk-pad-charge',
       area:         'common',
       path:         'bulk-pad-charge',
       container:    'dashboard',
       role:         '*'
    },
];

const mobile = [{
       key:          pathNames.mobileExtrato,
       fileName:     'extrato',
       area:         'mobile',
       path:         'extrato',
       container:    'dashboard',
       role:         '*'
    },
    {
       key:          pathNames.mobilePDV,
       fileName:     'pdv',
       area:         'mobile',
       path:         'pdv',
       container:    'dashboard',
       role:         'business'
    },
    {
       key:          pathNames.mobileSend,
       fileName:     'send',
       area:         'mobile',
       path:         'send',
       container:    'dashboard',
       role:         '*'
    },
    {
     key:            pathNames.mobileRequestDetails,
     fileName:       'request-details',
     area:           'mobile',
     path:           'request-details',
     container:      'dashboard',
     role:           '*', 
  },
    
];

const merged  = [
    ...personal,
    ...bankadmin,
    ...business,
    ...common,
    ...mobile
  ]

export const getPath = (key) => {
    const path = (merged.find(routeItem => routeItem.key === key ) || {path: ''}).path
    const area = (merged.find(routeItem => routeItem.key === key ) || {area: ''}).area
    return `/${area}/${path}` 
}

const getItemTitle = (item) => {
  return item.path.split('-').map(obj => utils.capitalize(obj)).join(' ') ;
}

export const getItem = (path, key) => {
    let item  = null;
    if(path)
      item = merged.find(routeItem => routeItem.path === path )
    else
      item = merged.find(routeItem => routeItem.key === key )
    const title = getItemTitle(item);
    return {...item, fullpath:`/${item.area}/${item.path}`, title:title}
}

export const getItemByAreaNFilename = (area, filename, itemPath) => {
    const item  = merged.find(routeItem => routeItem.area===area && routeItem.fileName===filename && (!itemPath || routeItem.path==itemPath))
    const title = getItemTitle(item);
    return {...item, fullpath:`/${item.area}/${item.path}`, title:title}
}

export const getItemByFullpath = (area, itemPath, filename) => {
    const item  = merged.find(routeItem => (!area || routeItem.area===area)  
        && routeItem.path==itemPath 
        && (!filename || routeItem.fileName===filename))
    // console.log(' >> getItemByFullpath:: area:',area, ' |itemPath:', itemPath, ' |filename:',filename)
    // console.log(' >>>> item: ', JSON.stringify(item));
    const title = getItemTitle(item);
    return {...item, fullpath:`/${item.area}/${item.path}`, title:title}
} 

export default merged