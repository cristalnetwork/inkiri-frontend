import _ from 'lodash'
import * as routes_config from '@app/configs/routes'

const routes  = {
    personal: {
        items: [
            {
                // key: routes_config.pathNames.personalDashboard,
                key:  routes_config.pathNames.dashboard,
                title: 'My money',
                icon: 'wallet',
                items: [
                    // {
                    //     key: routes_config.pathNames.personalAllInOne,
                    //     path: routes_config.pathNames.personalAllInOne,
                    //     title: 'All In One',
                    // },
                    {
                        key: routes_config.pathNames.personalExtracto,
                        path: routes_config.pathNames.personalExtracto,
                        title: 'Extrato',
                    },
                    {
                        key: routes_config.pathNames.commonDeposit,
                        path: routes_config.pathNames.commonDeposit,
                        title: 'Deposit',
                    },
                    {
                        key: routes_config.pathNames.commonWithdraw,
                        path: routes_config.pathNames.commonWithdraw,
                        title: 'Withdraw',
                    },
                    {
                        key: routes_config.pathNames.personalExchange,
                        path: routes_config.pathNames.personalExchange,
                        title: 'Exchange',
                    }
                ]
            },
            {
                key: routes_config.pathNames.personalRequestMoney,
                title: 'Receive',
                icon: 'plus-square',
                items: [
                    {
                        key: routes_config.pathNames.personalRequestMoney,
                        path: routes_config.pathNames.personalUnderConstruction,
                        title: 'Request money',
                    }
                ]
            },
            {
                key: routes_config.pathNames.personalSendMoney,
                title: 'Pay',
                icon: 'minus-square',
                items: [
                    {
                        key: routes_config.pathNames.commonSend,
                        path: routes_config.pathNames.commonSend,
                        title: 'Send money',
                    },
                    {
                        key: routes_config.pathNames.personalPaymentsAndServices,
                        path: routes_config.pathNames.personalUnderConstruction,
                        title: 'Payments and services',
                        icon: 'shop',
                    }
                ]
            }
            ,
            {
                key: routes_config.pathNames.personalConfiguration,
                title: 'Account settings',
                icon: 'setting',
                path: routes_config.pathNames.personalConfiguration,
                // items: [
                //     {
                //         key: routes_config.pathNames.personalConfiguration,
                //         path: routes_config.pathNames.personalUnderConstruction,
                //         title: 'Configuration'
                //     }
                // ]
            }
        ]
    },
    bankadmin: {
        items: [
            {
                // key:  routes_config.pathNames.bankadminDashboard,
                key:  routes_config.pathNames.dashboard,
                title: 'Dashboard',
                path: routes_config.pathNames.bankadminUnderConstruction,
                icon: 'dashboard'
            },
            {
                key: routes_config.pathNames.bankadminTransactions,
                title: 'Transactions',
                icon: 'bank',
                items: [
                    {
                        key: routes_config.pathNames.bankadminOperations,
                        path: routes_config.pathNames.bankadminOperations,
                        title: 'Operations',
                        
                    },
                    {
                        key: routes_config.pathNames.bankadminExternalTransfers,
                        path: routes_config.pathNames.bankadminExternalTransfers,
                        title: 'External Transfers',

                    },
                    {
                        key: routes_config.pathNames.bankadminPAP,
                        path: routes_config.pathNames.bankadminUnderConstruction,
                        title: 'Pre-Auth Payments',
                    }

                ]
            },
            {
                key: routes_config.pathNames.bankadminAdministration,
                title: 'Administration',
                icon: 'table',
                items: [
                    {
                        key: routes_config.pathNames.bankadminAccounts,
                        path: routes_config.pathNames.bankadminAccounts,
                        title: 'Accounts',
                    },
                    {
                        key: routes_config.pathNames.bankadminProfiles,
                        path: routes_config.pathNames.bankadminUnderConstruction,
                        title: 'Profiles',
                    },
                    {
                        key: routes_config.pathNames.bankadminProviders,
                        path: routes_config.pathNames.bankadminProviders,
                        title: 'Providers',
                    },
                    {
                        key: routes_config.pathNames.bankadminPDA,
                        path: routes_config.pathNames.bankadminPDA,
                        title: 'PDA',
                    }

                ]
            },
            {
                key: routes_config.pathNames.bankadminStaff,
                title: 'Staff',
                icon: 'profile',
                items: [
                    {
                        key: routes_config.pathNames.bankadminSalaries,
                        path: routes_config.pathNames.bankadminUnderConstruction,
                        title: 'Salaries',
                    },
                    {
                        key: routes_config.pathNames.bankadminCrew,
                        path: routes_config.pathNames.bankadminUnderConstruction,
                        title: 'Crew',
                    }

                ]
            },
            {
                key: routes_config.pathNames.bankadminConfiguration,
                path: routes_config.pathNames.bankadminUnderConstruction,
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
                        key: routes_config.pathNames.businessExtracto,
                        path: routes_config.pathNames.businessExtracto,
                        title: 'Extrato',
                    },
                    {
                        key: routes_config.pathNames.commonDeposit,
                        path: routes_config.pathNames.commonDeposit,
                        title: 'Deposit',
                    },
                    {
                        key: routes_config.pathNames.commonWithdraw,
                        path: routes_config.pathNames.commonWithdraw,
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
                        key: routes_config.pathNames.businessPDV,
                        path: routes_config.pathNames.businessUnderConstruction,
                        title: 'Vendas - PDV',
                    },
                    {
                        key: routes_config.pathNames.businessPreAuthSales,
                        path: routes_config.pathNames.businessUnderConstruction,
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
                        key: routes_config.pathNames.commonSend,
                        path: routes_config.pathNames.commonSend,
                        title: 'Send money',
                    },
                    {
                        key: routes_config.pathNames.businessPaymentsAndServices,
                        path: routes_config.pathNames.businessUnderConstruction,
                        title: 'Services',
                    },
                    {
                        key: routes_config.pathNames.businessProvidersPayments,
                        path: routes_config.pathNames.businessProvidersPayments,
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
                        key: routes_config.pathNames.businessSalaries,
                        path: routes_config.pathNames.businessUnderConstruction,
                        title: 'Salaries',
                    },
                    {
                        key: routes_config.pathNames.businessCrew,
                        path: routes_config.pathNames.businessUnderConstruction,
                        title: 'Crew',
                    }

                ]
            },
            {
                key: routes_config.pathNames.businessConfiguration,
                path: routes_config.pathNames.businessUnderConstruction,
                title: 'Configuration',
                icon: 'setting',
            }
        ]
    }
}

export const getRoutesByRole = (role) => {
    // console.log(' **** routes::getRoutesByRole >> ', role)
    return role?routes[role]:[];
}

// export const getParentOfAreaNFilename = (area, filename) => {
//     return routes[area].items
// }

export const getRootKeys = (area) => {
    // console.log(' -- getRootKeys = (area):', area)
    if(!area)
        return [];
    return routes[area].items.map( item => item.key );
}

export const breadcrumbForPaths = (fullpaths, include_root) => {
    
    const my_fullpaths = Array.isArray(fullpaths)?fullpaths:[fullpaths];
    // console.log(' >> breadcrumbForPaths : ', JSON.stringify(my_fullpaths));
    const breadcrumbs = my_fullpaths.filter(fullpath=> fullpath ).map(
        (fullpath)=> {
            if(!fullpath)
              return false
            const path_parts = fullpath.split('/'); 
            const area = path_parts[1];
            const path = path_parts[2];
            // console.log(' >> breadcrumbForPaths >> >> :', area, path)
            const menuItem = routes_config.getItemByFullpath(area, path, null)

            return {
                // path: menuItem.fullpath,
                path: fullpath,
                breadcrumbName: menuItem.title,
              }
        });
    
    if(include_root===false)
        return breadcrumbs;
    return [
      {
        path: '/',
        breadcrumbName: 'Inkiri BANK',
      },
      ...breadcrumbs
    ];
}

export const breadcrumbForFile = (file) => {
    const menuItem = routes_config.getItem(file);
    
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

// export const breadcrumbForFatherOf = (path) => {
//     const childItem = routes_config.getItem(path);
    
//     const menuItem  = routes_config.getItem(null, childItem.father_key);

//     return [
//       {
//         path: 'dashboard',
//         breadcrumbName: 'Inkiri BANK',
//       },
//       {
//         path: menuItem.fullpath,
//         breadcrumbName: menuItem.title,
//       }
//     ];
// }

// const findParent = (child_path) => {
//   let _parent = null;
//   const keys = Object.keys(routes);
//   for(var j=0; j < keys.length; j++)
//   {
//       const parents = routes[keys[j]].items;
//       // console.log(parents)
//       if(parents)
//           for(var i=0; i < parents.length; i++){
//             const mainobject = parents[i]; 
//             // console.log(' > ', mainobject.title)
//             if(mainobject.items)
//                 for(var k=0; k < mainobject.items.length; k++){
//                   const item = mainobject.items[k];
//                   // console.log(' > > > ', item.path , ' == ', child_path)
//                   if(item.path === child_path){ 
//                     _parent= mainobject;
//                     // console.log(' > > > > > > FOUND!!')
//                     break;
//                   }
//                 }
//             if(_parent)
//                 break;
//           }
//           if(_parent)
//             break;
//   }
//   // console.log('FINISHED!')
//   return _parent;
// }
