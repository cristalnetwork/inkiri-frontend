import * as utils from '@app/utils/utils';

export const pathNames = utils.arrToObj([
    'personalDashboard',
    'personalUnderConstruction',
    'personalExtracto',
    'personalDeposit',
    'personalWithdraw',
    'personalExchange',
    'personalRequestMoney',
    'personalSendMoney',
    'personalPaymentsAndServices',
    'personalConfiguration',

    'bankadminDashboard',
    'bankadminUnderConstruction',
    'bankadminTransactions',
    'bankadminOperations',
    'bankadminExternalTransfers',
    'bankadminExternalTransfers_ProcessExternal',
    'bankadminConfiguration',
    'bankadminPAP',

    'bankadminAdministration',
    'bankadminAccounts',
    'bankadminAccounts_Account',
    'bankadminAccounts_CreateAccount',
    'bankadminProfiles',
    'bankadminProviders',
    'bankadminProviders_CreateProvider',
    'bankadminProviders_ProviderProfile',
    'bankadminPDA',
    'bankadminPDA_ProcessRequest',

    'bankadminStaff',
    'bankadminSalaries',
    'bankadminCrew',

    'businessExtracto',
    'businessDeposit',
    'businessWithdraw',
    'businessPDV',
    'businessPreAuthSales',
    'businessSendMoney',
    'businessPaymentsAndServices',
    'businessProvidersPayments',
    'businessProvidersPayments_Request',
    'businessProvidersPayments_Request_Details',
    'businessSalaries',
    'businessCrew',
    'businessConfiguration',

    'businessUnderConstruction',

    'dashboard'
])

const personal =[
    {
       key: pathNames.dashboard,
       fileName: 'under-construction',
       area: 'personal',
       path: 'dashboard',
       container: 'dashboard',
       role: 'personal'
    },
    {
       key: pathNames.personalSendMoney,
       fileName: 'sendMoney',
       area: 'personal',
       path: 'send-money',
       container: 'dashboard' 
    },
     {
       key: pathNames.personalDeposit,
       fileName: 'deposit',
       area: 'personal',
       path: 'deposit',
       container: 'dashboard' 
    },
    {
       key: pathNames.personalExtracto,
       fileName: 'extrato',
       area: 'personal',
       path: 'extrato',
       container: 'dashboard' 
    }
]

const bankadmin = [
    {
       // key: pathNames.bankadminDashboard,
       key: pathNames.dashboard,
       fileName: 'under-construction',
       area: 'bankadmin',
       path: 'dashboard',
       container: 'dashboard',
       role: 'bankadmin'
    },
    {
        key: pathNames.bankadminUnderConstruction,
        fileName: 'under-construction',
        area: 'bankadmin',
        path: 'proximamente',
        container: 'dashboard',
        role: 'bankadmin'
     },
     {
       key: pathNames.bankadminTransactions,
       fileName: 'under-construction',
       area: 'bankadmin',
       path: 'transactions',
       container: 'dashboard',
       role: 'bankadmin'
    },
    {
       key: pathNames.bankadminOperations,
       fileName: 'under-construction',
       area: 'bankadmin',
       path: 'operations',
       container: 'dashboard',
       role: 'bankadmin'
    },
    {
       key: pathNames.bankadminExternalTransfers,
       fileName: 'external-transfers',
       area: 'bankadmin',
       path: 'external-transfers',
       container: 'dashboard',
       role: 'bankadmin'
    },
    {
       key: pathNames.bankadminExternalTransfers_ProcessExternal,
       father_key : pathNames.bankadminExternalTransfers,
       fileName: 'processExternal',
       area: 'bankadmin',
       path: 'external-transfers-process-request',
       container: 'dashboard',
       role: 'bankadmin'
    },
    {
       key: pathNames.bankadminConfiguration,
       fileName: 'under-construction',
       area: 'bankadmin',
       path: 'configuration',
       container: 'dashboard',
       role: 'bankadmin'
    },
    
    {
       key: pathNames.bankadminAccounts,
       fileName: 'accounts',
       area: 'bankadmin',
       path: 'accounts',
       container: 'dashboard',
       role: 'bankadmin'
    },
    {
       key: pathNames.bankadminAccounts_Account,
       father_key: pathNames.bankadminAccounts,
       fileName: 'account',
       area: 'bankadmin',
       path: 'account',
       container: 'dashboard',
       role: 'bankadmin'
    },
    {
       key: pathNames.bankadminAccounts_CreateAccount,
       father_key: pathNames.bankadminAccounts,
       fileName: 'createAccount',
       area: 'bankadmin',
       path: 'create-account',
       container: 'dashboard',
       role: 'bankadmin'
    },
    {
       key: pathNames.bankadminProfiles,
       fileName: 'under-construction',
       area: 'bankadmin',
       path: 'profiles',
       container: 'dashboard',
       role: 'bankadmin'
    },
    {
       key: pathNames.bankadminProviders,
       fileName: 'providers',
       area: 'bankadmin',
       path: 'providers',
       container: 'dashboard',
       role: 'bankadmin'
    },
    {
       key: pathNames.bankadminProviders_CreateProvider,
       father_key : pathNames.bankadminProviders,
       fileName: 'createProvider',
       area: 'bankadmin',
       path: 'create-provider',
       container: 'dashboard',
       role: 'bankadmin'
    },
    {
       key: pathNames.bankadminProviders_ProviderProfile,
       father_key : pathNames.bankadminProviders,
       fileName: 'provider',
       area: 'bankadmin',
       path: 'provider-profile',
       container: 'dashboard',
       role: 'bankadmin'
    },
    {
       key: pathNames.bankadminPDA,
       fileName: 'pda',
       area: 'bankadmin',
       path: 'pda',
       container: 'dashboard',
       role: 'bankadmin'
    },
    // {
    //    key: pathNames.bankadminPDA_ProcessRequest,
    //    father_key : pathNames.bankadminPDA,
    //    fileName: 'processRequest',
    //    area: 'bankadmin',
    //    path: 'pda-process-request',
    //    container: 'dashboard',
    //    role: 'bankadmin'
    // },
    {
       key: pathNames.bankadminPDA_ProcessRequest,
       father_key : pathNames.bankadminPDA,
       fileName: 'processExternal',
       area: 'bankadmin',
       path: 'pda-process-request',
       container: 'dashboard',
       role: 'bankadmin'
    },

    {
       key: pathNames.bankadminSalaries,
       fileName: 'under-construction',
       area: 'bankadmin',
       path: 'salaries',
       container: 'dashboard',
       role: 'bankadmin'
    },
    {
       key: pathNames.bankadminCrew,
       fileName: 'under-construction',
       area: 'bankadmin',
       path: 'crew',
       container: 'dashboard',
       role: 'bankadmin'
    },
 ];

const business = [
    {
        key: pathNames.businessUnderConstruction,
        fileName: 'under-construction',
        area: 'business',
        path: 'proximamente',
        container: 'dashboard',
        role: 'business'
    },
    {
       key: pathNames.businessExtracto,
       fileName: 'extrato',
       area: 'business',
       path: 'extrato',
       container: 'dashboard',
       role: 'business'
    },

    {
       key: pathNames.businessDeposit,
       fileName: 'under-construction',
       area: 'business',
       path: 'deposit',
       container: 'dashboard',
       role: 'business'
    },
    {
       key: pathNames.businessWithdraw,
       fileName: 'under-construction',
       area: 'business',
       path: 'withdraw',
       container: 'dashboard',
       role: 'business'
    },
    {
       key: pathNames.businessPDV,
       fileName: 'under-construction',
       area: 'business',
       path: 'pdv',
       container: 'dashboard',
       role: 'business'
    },
    {
       key: pathNames.businessPreAuthSales,
       fileName: 'under-construction',
       area: 'business',
       path: 'pre-auth-sales',
       container: 'dashboard',
       role: 'business'
    },
    {
       key: pathNames.businessSendMoney,
       fileName: 'under-construction',
       area: 'business',
       path: 'send-money',
       container: 'dashboard',
       role: 'business'
    },
    {
       key: pathNames.businessPaymentsAndServices,
       fileName: 'under-construction',
       area: 'business',
       path: 'payments-services',
       container: 'dashboard',
       role: 'business'
    },
    {
       key:       pathNames.businessProvidersPayments,
       fileName:  'providers',
       area:      'business',
       path:      'providers-payments',
       container: 'dashboard',
       role:      'business'
    },
    {
       key:       pathNames.businessProvidersPayments_Request,
       father_key: pathNames.businessProvidersPayments,
       fileName:  'requestPayment',
       area:      'business',
       path:      'providers-payments-request',
       container: 'dashboard',
       role:      'business'
    },
    {
       key:       pathNames.businessProvidersPayments_Request_Details,
       father_key: pathNames.businessProvidersPayments,
       fileName:  'externalDetails',
       area:      'business',
       path:      'provider-payment-request-details',
       container: 'dashboard',
       role:      'business'
    },
    // {
    //    key:       pathNames.businessProvidersPayments_Request_Details,
    //    father_key: pathNames.businessProvidersPayments,
    //    fileName:  'processExternal',
    //    area:      'bankadmin',
    //    path:      'provider-payment-request-details',
    //    container: 'dashboard',
    //    role:      'business'
    // },
    {
       key: pathNames.businessSalaries,
       fileName: 'under-construction',
       area: 'business',
       path: 'salaries',
       container: 'dashboard',
       role: 'business'
    },
    {
       key: pathNames.businessCrew,
       fileName: 'under-construction',
       area: 'business',
       path: 'crew',
       container: 'dashboard',
       role: 'business'
    },
    {
       key: pathNames.businessConfiguration,
       fileName: 'under-construction',
       area: 'business',
       path: 'configuration',
       container: 'dashboard',
       role: 'business'
    },
    
  ];

const common = [];


const merged  = [
    ...personal,
    ...bankadmin,
    ...business,
    ...common
  ]

export const getPath = (key) => {
    const path = (merged.find(routeItem => routeItem.key === key ) || {path: ''}).path
    const area = (merged.find(routeItem => routeItem.key === key ) || {area: ''}).area
    return `/${area}/${path}` 
}

export const getItem = (path, key) => {
    let item  = null;
    if(path)
      item = merged.find(routeItem => routeItem.path === path )
    else
      item = merged.find(routeItem => routeItem.key === key )
    const title = item.path.split('-').map(obj => utils.capitalize(obj)).join(' ') 
    return {...item, fullpath:`/${item.area}/${item.path}`, title:title}
}


export const getItemByAreaNFilename = (area, filename, itemPath) => {
    const item  = merged.find(routeItem => routeItem.area===area && routeItem.fileName===filename && routeItem.path==itemPath)
    return {...item}
} 

export default merged