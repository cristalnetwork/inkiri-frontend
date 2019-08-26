const arrToObj  = (a = []) => a.reduce((prev,act) => { prev[act] = act; return prev; } , {});

export const pathNames = arrToObj([
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

    'personalConfiguration'
])

const personal =[
    {
       key: pathNames.personalDashboard,
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
       fileName: 'home',
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

const admin = [];

const business = [];

const merged  = [
    ...personal,
    ...admin,
    ...business
  ]

export const getPath = (key) => {
    const path = (merged.find(routeItem => routeItem.key === key ) || {path: ''}).path
    const area = (merged.find(routeItem => routeItem.key === key ) || {area: ''}).area
    return `/${area}/${path}` 
} 

export default merged