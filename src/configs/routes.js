import * as utils from '@app/utils/utils';

export const pathNames = utils.arrToObj([
    'personalAllInOne',
    'personalDashboard',
    'personalUnderConstruction',
    'personalExtracto',
    'personalDeposit',
    'personalRetirar',
    'personalCambiar',
    'personalRequestMoney',
    'personalSendMoney',
    'personalPaymentsAndServices',
    'personalConfiguration',

    'bankadminDashboard',
    'bankadminUnderConstruction',
    'bankadminTransactions',
    'bankadminOperations',
    'bankadminExternalTransfers',
    'bankadminConfiguration',
    'bankadminPAP',

    'bankadminAdministration',
    'bankadminAccounts',
    'bankadminProfiles',
    'bankadminProviders',
    'bankadminPDA',

    'bankadminStaff',
    'bankadminSalaries',
    'bankadminCrew',

    'dashboard'
])

const personal =[
    {
       // key: pathNames.personalDashboard,
       key: pathNames.dashboard,
       fileName: 'allInOne',
       area: 'personal',
       path: 'dashboard',
       container: 'dashboard',
       role: 'personal'
    },
    {
        key: pathNames.personalUnderConstruction,
        fileName: 'under-construction',
        area: 'personal',
        path: 'proximamente',
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
    },
     {
       key: pathNames.personalAllInOne,
       fileName: 'allInOne',
       area: 'personal',
       path: 'all-in-one',
       container: 'dashboard' 
    },
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
       fileName: 'under-construction',
       area: 'bankadmin',
       path: 'external-transfers',
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
       fileName: 'under-construction',
       area: 'bankadmin',
       path: 'accounts',
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
       fileName: 'under-construction',
       area: 'bankadmin',
       path: 'providers',
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

const business = [];

const merged  = [
    ...personal,
    ...bankadmin,
    ...business
  ]

export const getPath = (key) => {
    const path = (merged.find(routeItem => routeItem.key === key ) || {path: ''}).path
    const area = (merged.find(routeItem => routeItem.key === key ) || {area: ''}).area
    return `/${area}/${path}` 
}

export const getItem = (path) => {
    const item  = merged.find(routeItem => routeItem.path === path )
    const title = item.path.split('-').map(obj => utils.capitalize(obj)).join(' ') 
    return {...item, fullpath:`/${item.area}/${item.path}`, title:title}
} 

export default merged