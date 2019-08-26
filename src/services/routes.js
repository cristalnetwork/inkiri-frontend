import { pathNames } from '../configs/routes'
const routes  = {
    personal: {
        items: [
            {
                key: pathNames.personalDashboard,
                title: 'My money',
                items: [
                    {
                        key: pathNames.personalAllInOne,
                        path: pathNames.personalAllInOne,
                        title: 'All In One',
                    },
                    {
                        key: pathNames.personalExtracto,
                        path: pathNames.personalExtracto,
                        title: 'Transaction History',
                    },
                    // {
                    //     key: pathNames.personalInformes,
                    //     path: pathNames.personalUnderConstruction,
                    //     title: 'Reports',
                    // },
                    {
                        key: pathNames.personalDeposit,
                        path: pathNames.personalDeposit,
                        title: 'Deposit',
                    },
                    {
                        key: pathNames.personalRetirar,
                        path: pathNames.personalUnderConstruction,
                        title: 'Withdraw',
                    },
                    {
                        key: pathNames.personalCambiar,
                        path: pathNames.personalUnderConstruction,
                        title: 'Exchange',
                    }
                ]
            },
            {
                key: pathNames.personalRequestMoney,
                title: 'Receive',
                items: [
                    {
                        key: pathNames.personalRequestMoney,
                        path: pathNames.personalUnderConstruction,
                        title: 'Request money',
                    }
                ]
            },
            {
                key: pathNames.personalSendMoney,
                title: 'Pay',
                items: [
                    {
                        key: pathNames.personalSendMoney,
                        path: pathNames.personalSendMoney,
                        title: 'Send money',
                    },
                    {
                        key: pathNames.personalPaymentsAndServices,
                        path: pathNames.personalUnderConstruction,
                        title: 'Payment and services',
                    }
                ]
            }
            ,
            {
                key: pathNames.personalConfiguration,
                title: 'Configuration',
                items: [
                    {
                        key: pathNames.personalConfiguration,
                        path: pathNames.personalUnderConstruction,
                        title: 'Configuration'
                    }
                ]
            }
        ]
    },
    admin: {},
    business: {},
    guest: {}
}

export const getRoutesByRole = (role) => {
    console.log(' **** routes::getRoutesByRole >> ', role)
    return routes[role];
}