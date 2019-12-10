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
                    //     key: routes_config.pathNames.personalExtracto,
                    //     path: routes_config.pathNames.personalExtracto,
                    //     title: 'Extrato',
                    // },
                    {
                        key: routes_config.pathNames.commonExtrato,
                        path: routes_config.pathNames.commonExtrato,
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
            // {
            //     key: 'personal_receive_money',
            //     title: 'Receive',
            //     icon: 'plus-square',
            //     items: [
            //         {
            //             key: routes_config.pathNames.commonRequestMoney,
            //             path: routes_config.pathNames.commonRequestMoney,
            //             title: 'Request money',
            //         }
            //     ]
            // },
            {
                // key: routes_config.pathNames.personalSendMoney,
                key: 'personal_send_money',
                title: 'Pay',
                icon: 'minus-square',
                items: [
                    {
                        key: routes_config.pathNames.commonSend,
                        path: routes_config.pathNames.commonSend,
                        title: 'Send money',
                    },
                    {
                        key: routes_config.pathNames.commonContractedServices,
                        path: routes_config.pathNames.commonContractedServices,
                        title: 'Serviços Contratados',
                    }
                ]
            }
            ,
            {
                key: routes_config.pathNames.commonConfiguration,
                title: 'Configuration',
                icon: 'setting',
                path: routes_config.pathNames.commonConfiguration,
            }
        ]
    },
    bankadmin: {
        items: [
            {
                key:          routes_config.pathNames.bankadminDashboard,
                title:        'Dashboard',
                path:         routes_config.pathNames.bankadminDashboard,
                icon:         'dashboard',
                permission:   'active'
            },
            {
                key:          routes_config.pathNames.bankadminTransactions,
                title:        'Transactions',
                icon:         'bank',
                permission:   'active',
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
                    // {
                    //     key: routes_config.pathNames.commonServices,
                    //     path: routes_config.pathNames.commonServices,
                    //     title: 'Services - PAP',
                    // },
                    {
                        key: routes_config.pathNames.bankadminIugu,
                        path: routes_config.pathNames.bankadminIugu,
                        title: 'IUGU',
                    }

                ]
            },
            {
                key: routes_config.pathNames.bankadminAdministration,
                title: 'Administration',
                icon: 'table',
                items: [
                    {
                        key:          routes_config.pathNames.bankadminAccounts,
                        path:         routes_config.pathNames.bankadminAccounts,
                        title:        'Accounts',
                    },
                    {
                        key:          routes_config.pathNames.bankadminProfiles,
                        path:         routes_config.pathNames.bankadminProfiles,
                        title:        'Profiles',
                    },
                    {
                        key:          routes_config.pathNames.commonProviders,
                        path:         routes_config.pathNames.commonProviders,
                        title:        'Providers',
                        permission:   'active'
                    },
                    {
                        key:          routes_config.pathNames.bankadminPDA,
                        path:         routes_config.pathNames.bankadminPDA,
                        title:        'PDA',
                    },
                    // {
                    //     key:          routes_config.pathNames.commonServices,
                    //     path:         routes_config.pathNames.commonServices,
                    //     title:        'Serviços oferecidos',
                    //     permission:   'active'
                    // },
                    // {
                    //     key:          routes_config.pathNames.commonContractedServices,
                    //     path:         routes_config.pathNames.commonContractedServices,
                    //     title:        'Serviços Contratados',
                    //     permission:   'active'
                    // },

                ]
            },
            {
                key:                  routes_config.pathNames.bankadminStaff,
                title:                'Staff',
                icon:                 'profile',
                permission:           'active',
                items: [
                    {
                        key:          routes_config.pathNames.commonSalaries,
                        path:         routes_config.pathNames.commonSalaries,
                        title:        'Salaries',
                    },
                    {
                        key:          routes_config.pathNames.commonCrew,
                        path:         routes_config.pathNames.commonCrew,
                        title:        'Crew',
                    }

                ]
            },
            {
                key:                  routes_config.pathNames.bankadminConfiguration,
                path:                 routes_config.pathNames.bankadminConfiguration,
                title:                'Configuration',
                icon:                 'setting',
                permission:           'active'
            }
        ]
    },
    business: {
        items: [
            {
                key:      'biz_wallet',
                title:    'My money',
                icon:     'wallet',
                items: [
                    // {
                    //     key:         routes_config.pathNames.businessExtracto,
                    //     path:        routes_config.pathNames.businessExtracto,
                    //     title:       'Extrato',
                    // },
                    {
                        key: routes_config.pathNames.commonExtrato,
                        path: routes_config.pathNames.commonExtrato,
                        title: 'Extrato',
                    },
                    {
                        key:         routes_config.pathNames.commonDeposit,
                        path:        routes_config.pathNames.commonDeposit,
                        title:       'Deposit',
                        permission:  'owner,active,viewer'
                    },
                    {
                        key:         routes_config.pathNames.commonWithdraw,
                        path:        routes_config.pathNames.commonWithdraw,
                        title:       'Withdraw',
                        permission:  'owner,active,viewer'
                    }
                ]
            },
            {
                key:      'biz_receive',
                title:    'Receive',
                icon:     'plus-square',
                items: [
                    {
                        key:         routes_config.pathNames.businessPDV,
                        path:        routes_config.pathNames.businessPDV,
                        title:       'Vendas - PDV',
                    },
                    {
                        key:         routes_config.pathNames.commonServices,
                        path:        routes_config.pathNames.commonServices,
                        title:       'Serviços oferecidos',
                        permission:  'owner,active'
                    }
                ]
            },
            {
                key:         'biz_pay',
                title:       'Pay',
                icon:        'minus-square',
                permission:  'owner,active',
                items: [
                    {
                        key:         routes_config.pathNames.commonSend,
                        path:        routes_config.pathNames.commonSend,
                        title:       'Send money',
                    },
                    {
                        key:         routes_config.pathNames.commonContractedServices,
                        path:        routes_config.pathNames.commonContractedServices,
                        title:       'Serviços Contratados',
                    },
                    {
                        key:         routes_config.pathNames.businessProvidersPayments,
                        path:        routes_config.pathNames.businessProvidersPayments,
                        title:       'Providers Payments',
                    }
                ]
            },
            {
                key:         'biz_staff',
                title:       'Staff',
                icon:        'profile',
                permission:  'owner,active',
                items: [
                    {
                        key:         routes_config.pathNames.commonSalaries,
                        path:        routes_config.pathNames.commonSalaries,
                        title:       'Salaries',
                    },
                    {
                        key:         routes_config.pathNames.commonCrew,
                        path:        routes_config.pathNames.commonCrew,
                        title:       'Crew',
                    }

                ]
            },
            {
                key:         'biz_config',
                title:       'Settings',
                icon:        'setting',
                permission:  'owner,active',
                items:[
                    {
                        key: routes_config.pathNames.commonConfiguration,
                        path: routes_config.pathNames.commonConfiguration,
                        title: 'Configuration',
                    },
                    {
                        key: routes_config.pathNames.commonProviders,
                        path: routes_config.pathNames.commonProviders,
                        title: 'Providers',
                    }
                ]
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
