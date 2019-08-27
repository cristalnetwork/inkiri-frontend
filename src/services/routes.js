import { pathNames } from '../configs/routes'
const routes  = {
    personal: {
        items: [
            {
                // key: pathNames.personalDashboard,
                key:  pathNames.dashboard,
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
    bankadmin: {
        items: [
            {
                // key:  pathNames.bankadminDashboard,
                key:  pathNames.dashboard,
                title: 'Dashboard',
                path: pathNames.bankadminUnderConstruction,
                
            },
            {
                key: pathNames.bankadminTransactions,
                title: 'Transactions',
                items: [
                    {
                        key: pathNames.bankadminOperations,
                        path: pathNames.bankadminUnderConstruction,
                        title: 'Operations',
                    },
                    {
                        key: pathNames.bankadminExternalTransfers,
                        path: pathNames.bankadminUnderConstruction,
                        title: 'External Transfers',
                    },
                    {
                        key: pathNames.bankadminPAP,
                        path: pathNames.bankadminUnderConstruction,
                        title: 'Pre-Authorized Payment',
                    }

                ]
            },
            {
                key: pathNames.bankadminAdministration,
                title: 'Administration',
                items: [
                    {
                        key: pathNames.bankadminAccounts,
                        path: pathNames.bankadminUnderConstruction,
                        title: 'Accounts',
                    },
                    {
                        key: pathNames.bankadminProfiles,
                        path: pathNames.bankadminUnderConstruction,
                        title: 'Profiles',
                    },
                    {
                        key: pathNames.bankadminProviders,
                        path: pathNames.bankadminUnderConstruction,
                        title: 'Providers',
                    },
                    {
                        key: pathNames.bankadminPDA,
                        path: pathNames.bankadminUnderConstruction,
                        title: 'PDA',
                    }

                ]
            },
            {
                        key: pathNames.bankadminConfiguration,
                        path: pathNames.bankadminUnderConstruction,
                        title: 'Configuration'
                
            }
        ]
    },
    business: {},
    guest: {}
}

export const getRoutesByRole = (role) => {
    // console.log(' **** routes::getRoutesByRole >> ', role)
    return routes[role];
}