import _ from 'lodash'
import { pathNames, getItem } from '@app/configs/routes'

const routes  = {
    personal: {
        items: [
            {
                // key: pathNames.personalDashboard,
                key:  pathNames.dashboard,
                title: 'My money',
                icon: 'wallet',
                items: [
                    // {
                    //     key: pathNames.personalAllInOne,
                    //     path: pathNames.personalAllInOne,
                    //     title: 'All In One',
                    // },
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
                        key: pathNames.personalWithdraw,
                        path: pathNames.personalUnderConstruction,
                        title: 'Withdraw',
                    },
                    {
                        key: pathNames.personalExchange,
                        path: pathNames.personalUnderConstruction,
                        title: 'Exchange',
                    }
                ]
            },
            {
                key: pathNames.personalRequestMoney,
                title: 'Receive',
                icon: 'plus-square',
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
                icon: 'minus-square',
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
                        icon: 'shop',
                    }
                ]
            }
            ,
            {
                key: pathNames.personalConfiguration,
                title: 'Configuration',
                icon: 'setting',
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
                icon: 'dashboard'
            },
            {
                key: pathNames.bankadminTransactions,
                title: 'Transactions',
                icon: 'bank',
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
                        title: 'Pre-Auth Payments',
                    }

                ]
            },
            {
                key: pathNames.bankadminAdministration,
                title: 'Administration',
                icon: 'table',
                items: [
                    {
                        key: pathNames.bankadminAccounts,
                        path: pathNames.bankadminAccounts,
                        title: 'Accounts',
                    },
                    {
                        key: pathNames.bankadminProfiles,
                        path: pathNames.bankadminUnderConstruction,
                        title: 'Profiles',
                    },
                    {
                        key: pathNames.bankadminProviders,
                        path: pathNames.bankadminProviders,
                        title: 'Providers',
                    },
                    {
                        key: pathNames.bankadminPDA,
                        path: pathNames.bankadminPDA,
                        title: 'PDA',
                    }

                ]
            },
            {
                key: pathNames.bankadminStaff,
                title: 'Staff',
                icon: 'profile',
                items: [
                    {
                        key: pathNames.bankadminSalaries,
                        path: pathNames.bankadminUnderConstruction,
                        title: 'Salaries',
                    },
                    {
                        key: pathNames.bankadminCrew,
                        path: pathNames.bankadminUnderConstruction,
                        title: 'Crew',
                    }

                ]
            },
            {
                key: pathNames.bankadminConfiguration,
                path: pathNames.bankadminUnderConstruction,
                title: 'Configuration',
                icon: 'setting',
            }
        ]
    },
    business: {},
    guest: {}
}

export const getRoutesByRole = (role) => {
    // console.log(' **** routes::getRoutesByRole >> ', role)
    return role?routes[role]:[];
}


export const breadcrumbForFile = (file) => {
    const menuItem = getItem(file);
    
    // const parent = getParent(routes, pathNames.bankadminAccounts)
    // console.log(' >>>> getParent >>>> ', parent)

    return [
      {
        path: 'dashboard',
        breadcrumbName: 'Inkiri BANK',
      },
      {
        path: menuItem.fullpath,
        breadcrumbName: menuItem.title,
      }
    ];
}

// function getParent(root, struct) {
//     var parent = null;
//     var check = function (root, struct) {
//         _.each(root, function (value, key) {
//             if (value == struct) {
//                 parent = key;
//             } else if (root == struct) {
//                 parent = '_root';
//             } else if (typeof value === 'object') {
//                 check(value, struct);
//             }
//         });
//     }
//     check(root, struct);
//     return parent;
// }