import * as routes_config from '@app/configs/routes'

const routes  = {
    personal: {
        items: [
            {
                // key: routes_config.pathNames.personalDashboard,
                key:  routes_config.pathNames.dashboard,
                title: 'menu.item.my_money',
                icon: 'wallet',
                items: [
                    {
                        key: routes_config.pathNames.commonExtrato,
                        path: routes_config.pathNames.commonExtrato,
                        title: 'menu.item.extrato',
                    },
                    {
                        key: routes_config.pathNames.commonDeposit,
                        path: routes_config.pathNames.commonDeposit,
                        title: 'menu.item.deposit',
                    },
                    {
                        key: routes_config.pathNames.commonWithdraw,
                        path: routes_config.pathNames.commonWithdraw,
                        title: 'menu.item.withdraw',
                    },
                    {
                        key: routes_config.pathNames.personalExchange,
                        path: routes_config.pathNames.personalExchange,
                        title: 'menu.item.exchange',
                    }
                ]
            },
            {
                key: 'personal_receive_money',
                title: 'menu.item.receive',
                icon: 'plus-square',
                items: [
                    {
                        key: routes_config.pathNames.commonRequestMoney,
                        path: routes_config.pathNames.commonRequestMoney,
                        title: 'menu.item.request_money',
                    }
                ]
            },
            {
                // key: routes_config.pathNames.personalSendMoney,
                key: 'personal_send_money',
                title: 'menu.item.pay',
                icon: 'minus-square',
                items: [
                    {
                        key: routes_config.pathNames.commonSend,
                        path: routes_config.pathNames.commonSend,
                        title: 'menu.item.send_money',
                    },
                    {
                        key: routes_config.pathNames.commonContractedServices,
                        path: routes_config.pathNames.commonContractedServices,
                        title: 'menu.item.contracted_services',
                    }
                ]
            }
            ,
            {
                key: routes_config.pathNames.commonConfiguration,
                title: 'menu.item.configuration',
                icon: 'setting',
                path: routes_config.pathNames.commonConfiguration,
            }
        ]
    },
    foundation: {
        items: [
            {
                // key: routes_config.pathNames.personalDashboard,
                key:  routes_config.pathNames.dashboard,
                title: 'menu.item.my_money',
                icon: 'wallet',
                items: [
                    {
                        key: routes_config.pathNames.commonExtrato,
                        path: routes_config.pathNames.commonExtrato,
                        title: 'menu.item.extrato',
                    },
                    {
                        key: routes_config.pathNames.commonDeposit,
                        path: routes_config.pathNames.commonDeposit,
                        title: 'menu.item.deposit',
                    },
                    {
                        key: routes_config.pathNames.commonWithdraw,
                        path: routes_config.pathNames.commonWithdraw,
                        title: 'menu.item.withdraw',
                    }
                ]
            },
            {
                key: 'personal_receive_money',
                title: 'menu.item.receive',
                icon: 'plus-square',
                items: [
                    {
                        key: routes_config.pathNames.commonRequestMoney,
                        path: routes_config.pathNames.commonRequestMoney,
                        title: 'menu.item.request_money',
                    }
                ]
            },
            {
                // key: routes_config.pathNames.personalSendMoney,
                key: 'personal_send_money',
                title: 'menu.item.pay',
                icon: 'minus-square',
                items: [
                    {
                        key: routes_config.pathNames.commonSend,
                        path: routes_config.pathNames.commonSend,
                        title: 'menu.item.send_money',
                    },
                    {
                        key: routes_config.pathNames.commonContractedServices,
                        path: routes_config.pathNames.commonContractedServices,
                        title: 'menu.item.contracted_services',
                    }
                ]
            }
            ,
            {
                key: routes_config.pathNames.commonConfiguration,
                title: 'menu.item.configuration',
                icon: 'setting',
                path: routes_config.pathNames.commonConfiguration,
            }
        ]
    },
    bankadmin: {
        items: [
            {
                key:          routes_config.pathNames.bankadminDashboard,
                title:        'menu.item.dashboard',
                path:         routes_config.pathNames.bankadminDashboard,
                icon:         'dashboard',
                permission:   'active'
            },
            {
                key:          routes_config.pathNames.bankadminTransactions,
                title:        'menu.item.transactions',
                icon:         'bank',
                permission:   'active',
                items: [
                    {
                        key: routes_config.pathNames.bankadminOperations,
                        path: routes_config.pathNames.bankadminOperations,
                        title: 'menu.item.operations',
                        
                    },
                    {
                        key: routes_config.pathNames.bankadminExternalTransfers,
                        path: routes_config.pathNames.bankadminExternalTransfers,
                        title: 'menu.item.external_transfers',
                    },
                    {
                        key: routes_config.pathNames.bankadminServices,
                        path: routes_config.pathNames.bankadminSoon,
                        title: 'menu.item.services_pap',
                    },
                    {
                        key: routes_config.pathNames.bankadminIugu,
                        path: routes_config.pathNames.bankadminIugu,
                        title: 'menu.item.iugu',
                    }

                ]
            },
            {
                key: routes_config.pathNames.bankadminAdministration,
                title: 'menu.item.administration',
                icon: 'table',
                items: [
                    {
                        key:          routes_config.pathNames.bankadminAccounts,
                        path:         routes_config.pathNames.bankadminAccounts,
                        title:        'menu.item.accounts',
                    },
                    {
                        key:          routes_config.pathNames.bankadminProfiles,
                        path:         routes_config.pathNames.bankadminProfiles,
                        title:        'menu.item.profiles',
                    },
                    {
                        key:          routes_config.pathNames.commonProviders,
                        path:         routes_config.pathNames.commonProviders,
                        title:        'menu.item.providers',
                        permission:   'active'
                    },
                    {
                        key:          routes_config.pathNames.bankadminPDA,
                        path:         routes_config.pathNames.bankadminPDA,
                        title:        'menu.item.pda',
                    },
                    {
                        key:          routes_config.pathNames.bankadminTeams,
                        path:         routes_config.pathNames.bankadminTeams,
                        title:        'menu.item.teams',
                    },
                ]
            },
            // {
            //     key:                  routes_config.pathNames.bankadminStaff,
            //     title:                'Teams',
            //     icon:                 'usergroup-add',
            //     permission:           'active',
            //     items: [
            //         {
            //             key:          routes_config.pathNames.bankadminTeams,
            //             path:         routes_config.pathNames.bankadminTeams,
            //             title:        'menu.item.teams',
            //         }

            //     ]
            // },
            {
                key:                  routes_config.pathNames.bankadminConfiguration,
                path:                 routes_config.pathNames.bankadminConfiguration,
                title:                'menu.item.configuration',
                icon:                 'setting',
                permission:           'active'
            }
        ]
    },
    business: {
        items: [
            {
                key:      'biz_wallet',
                title:    'menu.item.my_money',
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
                        title: 'menu.item.extrato',
                    },
                    {
                        key:         routes_config.pathNames.commonDeposit,
                        path:        routes_config.pathNames.commonDeposit,
                        title:       'menu.item.deposit',
                        permission:  'owner,active,viewer'
                    },
                    {
                        key:         routes_config.pathNames.commonWithdraw,
                        path:        routes_config.pathNames.commonWithdraw,
                        title:       'menu.item.withdraw',
                        permission:  'owner,active,viewer'
                    }
                ]
            },
            {
                key:      'biz_receive',
                title:    'menu.item.receive',
                icon:     'plus-square',
                items: [
                    {
                        key:         routes_config.pathNames.businessPDV,
                        path:        routes_config.pathNames.businessPDV,
                        title:       'menu.item.vendas_pdv',
                        permission:  'owner,active,pdv'
                    },
                    {
                        key:         routes_config.pathNames.commonServices,
                        path:        routes_config.pathNames.commonServices,
                        title:       'menu.item.offered_services',
                        permission:  'owner,active'
                    },
                    {
                        key: routes_config.pathNames.commonRequestMoney,
                        path: routes_config.pathNames.commonRequestMoney,
                        title: 'menu.item.request_money',
                    }
                ]
            },
            {
                key:         'biz_pay',
                title:       'menu.item.pay',
                icon:        'minus-square',
                permission:  'owner,active',
                items: [
                    {
                        key:         routes_config.pathNames.commonSend,
                        path:        routes_config.pathNames.commonSend,
                        title:       'menu.item.send_money',
                    },
                    {
                        key:         routes_config.pathNames.commonContractedServices,
                        path:        routes_config.pathNames.commonContractedServices,
                        title:       'menu.item.contracted_services',
                    },
                    {
                        key:         routes_config.pathNames.businessProvidersPayments,
                        path:        routes_config.pathNames.businessProvidersPayments,
                        title:       'menu.item.providers_payments',
                    }
                ]
            },
            {
                key:         'biz_staff',
                title:       'menu.item.staff',
                icon:        'team',
                permission:  'owner,active',
                items: [
                    {
                        key:         routes_config.pathNames.commonSalaries,
                        path:        routes_config.pathNames.commonSalaries,
                        title:       'menu.item.salaries',
                    },
                    {
                        key:         routes_config.pathNames.commonCrew,
                        path:        routes_config.pathNames.commonCrew,
                        title:       'menu.item.crew',
                    }

                ]
            },
            {
                key:         'biz_config',
                title:       'menu.item.settings',
                icon:        'setting',
                permission:  'owner,active',
                items:[
                    {
                        key: routes_config.pathNames.commonConfiguration,
                        path: routes_config.pathNames.commonConfiguration,
                        title: 'menu.item.configuration',
                    },
                    {
                        key: routes_config.pathNames.commonProviders,
                        path: routes_config.pathNames.commonProviders,
                        title: 'menu.item.providers',
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
