  /*
  This file is part of "GMP Clearview" package.
  Copyright (C)  2025 Infotrust 
  Alina Zilbergerts, Trish Dothkar,
  -- */

declare({
    database: dataform.projectConfig.vars.INPUT_PROJECT,
    schema: dataform.projectConfig.vars.GA4_DATASET,
    name: 'events_*'

});

// //Declare tables that need to be exported in CLoud Storage
// ["base_ga4_events", "base_ga4_items", "ga4_sessions", "ga4_pageviews"]
//   .forEach(source => declare({
//       schema: "gmp_output",
//       name: source
//     })
//   );
