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
                        title: 'Extrato',
                    },
                    {
                        key: pathNames.personalDeposit,
                        path: pathNames.personalDeposit,
                        title: 'Deposit',
                    },
                    {
                        key: pathNames.personalWithdraw,
                        path: pathNames.personalWithdraw,
                        title: 'Withdraw',
                    },
                    {
                        key: pathNames.personalExchange,
                        path: pathNames.personalExchange,
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
                title: 'Account settings',
                icon: 'setting',
                path: pathNames.personalConfiguration,
                // items: [
                //     {
                //         key: pathNames.personalConfiguration,
                //         path: pathNames.personalUnderConstruction,
                //         title: 'Configuration'
                //     }
                // ]
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
                        path: pathNames.bankadminExternalTransfers,
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
    business: {
        items: [
            {
                key:  'biz_wallet',
                title: 'My money',
                icon: 'wallet',
                items: [
                    {
                        key: pathNames.businessExtracto,
                        path: pathNames.businessExtracto,
                        title: 'Transaction History',
                    },
                    {
                        key: pathNames.businessDeposit,
                        path: pathNames.businessUnderConstruction,
                        title: 'Deposit',
                    },
                    {
                        key: pathNames.businessWithdraw,
                        path: pathNames.businessUnderConstruction,
                        title: 'Withdraw',
                    }
                ]
            },
            {
                key:  'biz_receive',
                title: 'Receive',
                icon: 'plus-square',
                items: [
                    {
                        key: pathNames.businessPDV,
                        path: pathNames.businessUnderConstruction,
                        title: 'Vendas - PDV',
                    },
                    {
                        key: pathNames.businessPreAuthSales,
                        path: pathNames.businessUnderConstruction,
                        title: 'Taxa de serviços',
                    }
                ]
            },
            {
                key:  'biz_pay',
                title: 'Pay',
                icon: 'minus-square',
                items: [
                    {
                        key: pathNames.businessSendMoney,
                        path: pathNames.businessUnderConstruction,
                        title: 'Send money',
                    },
                    {
                        key: pathNames.businessPaymentsAndServices,
                        path: pathNames.businessUnderConstruction,
                        title: 'Services',
                    },
                    {
                        key: pathNames.businessProvidersPayments,
                        path: pathNames.businessProvidersPayments,
                        title: 'Providers Payments',
                    }
                ]
            },
            {
                key: 'biz_staff',
                title: 'Staff',
                icon: 'profile',
                items: [
                    {
                        key: pathNames.businessSalaries,
                        path: pathNames.businessUnderConstruction,
                        title: 'Salaries',
                    },
                    {
                        key: pathNames.businessCrew,
                        path: pathNames.businessUnderConstruction,
                        title: 'Crew',
                    }

                ]
            },
            {
                key: pathNames.businessConfiguration,
                path: pathNames.businessUnderConstruction,
                title: 'Configuration',
                icon: 'setting',
            }
        ]
    },
    guest: {}
}

export const getRoutesByRole = (role) => {
    // console.log(' **** routes::getRoutesByRole >> ', role)
    return role?routes[role]:[];
}

// export const getParentOfAreaNFilename = (area, filename) => {
//     return routes[area].items
// }

export const getRootKeys = (area) => {
    return routes[area].items.map( item => item.key );
}

export const breadcrumbForFile = (file) => {
    const menuItem = getItem(file);
    
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

export const breadcrumbForFatherOf = (path) => {
    // console.log(' breadcrumbForFatherOf >> #1  :: ', path)
    const childItem = getItem(path);
    // console.log(' breadcrumbForFatherOf >> #2  :: ', childItem)
    // const father    = findParent(childItem.path);
    // console.log(' breadcrumbForFatherOf >> #3', father)
    // const menuItem  = getItem(null, father.key);

    const menuItem  = getItem(null, childItem.father_key);

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

function findParent(child_path){
  let _parent = null;
  const keys = Object.keys(routes);
  for(var j=0; j < keys.length; j++)
  {
      const parents = routes[keys[j]].items;
      // console.log(parents)
      if(parents)
          for(var i=0; i < parents.length; i++){
            const mainobject = parents[i]; 
            // console.log(' > ', mainobject.title)
            if(mainobject.items)
                for(var k=0; k < mainobject.items.length; k++){
                  const item = mainobject.items[k];
                  // console.log(' > > > ', item.path , ' == ', child_path)
                  if(item.path === child_path){ 
                    _parent= mainobject;
                    // console.log(' > > > > > > FOUND!!')
                    break;
                  }
                }
            if(_parent)
                break;
          }
          if(_parent)
            break;
  }
  // console.log('FINISHED!')
  return _parent;
}
