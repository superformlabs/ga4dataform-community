  /*
  This file is part of "GMP Clearview" package.
  Copyright (C)  2025 Infotrust 
  Alina Zilbergerts, Trish Dothkar,
  -- */

// declare({
//     database: dataform.projectConfig.vars.INPUT_PROJECT,
//     schema: dataform.projectConfig.vars.GA4_DATASET,
//     name: 'events_2025*',
// });
declare({
    database: dataform.projectConfig.vars.INPUT_PROJECT,
    schema: dataform.projectConfig.vars.GA4_DATASET,
    name: 'events' || dataform.projectConfig.vars.TABLE_SUFFIX || "_*",

});
// declare({
//     database: dataform.projectConfig.defaultProject,
//     schema: dataform.projectConfig.vars.GA4_DATASET,
//     tags: ["prod"],
//     name: 'events_fresh_*'
// });
// ["ga4_sessions", "ga4_pages", "ga4_products", "ga4_events"]
//   .forEach(source => declare({
//       schema: "gmp_output",
//       name: source
//     })
//   );
