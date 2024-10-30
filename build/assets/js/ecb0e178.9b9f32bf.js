"use strict";(self.webpackChunkga_4_dataform=self.webpackChunkga_4_dataform||[]).push([[930],{9364:(e,s,t)=>{t.r(s),t.d(s,{assets:()=>d,contentTitle:()=>o,default:()=>h,frontMatter:()=>i,metadata:()=>a,toc:()=>c});var n=t(4848),r=t(8453);const i={title:"Project architecture",description:"How is GA4Dataform organised in Dataform and BigQuery",sidebar_position:7,slug:"/project-architecture"},o=void 0,a={id:"ga4dataform-doc/project-architecture",title:"Project architecture",description:"How is GA4Dataform organised in Dataform and BigQuery",source:"@site/docs/ga4dataform-doc/project-architecture.md",sourceDirName:"ga4dataform-doc",slug:"/project-architecture",permalink:"/ga4dataform/ga4dataform/project-architecture",draft:!1,unlisted:!1,editUrl:"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/ga4dataform-doc/project-architecture.md",tags:[],version:"current",sidebarPosition:7,frontMatter:{title:"Project architecture",description:"How is GA4Dataform organised in Dataform and BigQuery",sidebar_position:7,slug:"/project-architecture"},sidebar:"tutorialSidebar",previous:{title:"Permissions",permalink:"/ga4dataform/ga4dataform/pernissions"},next:{title:"Support & Contact",permalink:"/ga4dataform/ga4dataform/support-contact"}},d={},c=[{value:"Dataform Directories:",id:"dataform-directories",level:2},{value:"Model Description:",id:"model-description",level:2},{value:"Dataform Repository Structure:",id:"dataform-repository-structure",level:2},{value:"BigQuery Output",id:"bigquery-output",level:2}];function l(e){const s={code:"code",h2:"h2",p:"p",pre:"pre",strong:"strong",table:"table",tbody:"tbody",td:"td",th:"th",thead:"thead",tr:"tr",...(0,r.R)(),...e.components};return(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(s.h2,{id:"dataform-directories",children:"Dataform Directories:"}),"\n",(0,n.jsxs)(s.table,{children:[(0,n.jsx)(s.thead,{children:(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.th,{children:"Directory"}),(0,n.jsx)(s.th,{children:"Description"})]})}),(0,n.jsxs)(s.tbody,{children:[(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.strong,{children:"01_sources"})}),(0,n.jsx)(s.td,{children:"Contains declarations and staging models"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.strong,{children:"02_intermediate"})}),(0,n.jsx)(s.td,{children:"Contains intermediate models"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.strong,{children:"03_outputs"})}),(0,n.jsx)(s.td,{children:"Contains output models"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.strong,{children:"03_outputs/aggregated"})}),(0,n.jsx)(s.td,{children:"Contains different aggregated tables that can be directly connected to Looker Studio or other visualization tools"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.strong,{children:"03_outputs/base"})}),(0,n.jsx)(s.td,{children:"Contains output tables that should be used for aggregations"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.strong,{children:"assertions"})}),(0,n.jsx)(s.td,{children:"Contains all the assertions that check the data quality of our model"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.strong,{children:"extra"})}),(0,n.jsx)(s.td,{children:"Is it needed?"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.strong,{children:"unit_testing"})}),(0,n.jsx)(s.td,{children:"Contains models related to unit testing"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.strong,{children:"includes"})}),(0,n.jsx)(s.td,{children:"Contains all JS files with reusable variables and functions that help manage the repository"})]})]})]}),"\n",(0,n.jsx)(s.h2,{id:"model-description",children:"Model Description:"}),"\n",(0,n.jsxs)(s.table,{children:[(0,n.jsx)(s.thead,{children:(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.th,{children:"Model"}),(0,n.jsx)(s.th,{children:"Description"})]})}),(0,n.jsxs)(s.tbody,{children:[(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.strong,{children:"stg_ga4_events"})}),(0,n.jsx)(s.td,{children:"GA4 staging events table that incrementally queries the raw GA4 export and applies partitioning, clustering, cleaning, and several fixes"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.strong,{children:"stg_ga4_sessions"})}),(0,n.jsxs)(s.td,{children:["GA4 staging sessions table that incrementally queries ",(0,n.jsx)(s.code,{children:"stg_ga4_events"})," table and creates session-level dimensions and metrics"]})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.strong,{children:"int_ga4_events"})}),(0,n.jsx)(s.td,{children:"GA4 intermediate events table that widens the staging table with useful dimensions"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.strong,{children:"int_ga4_sessions"})}),(0,n.jsx)(s.td,{children:"GA4 intermediate sessions table that widens the staging table with useful dimensions"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.strong,{children:"ga4_events"})}),(0,n.jsx)(s.td,{children:"GA4 output events table that can be used for further transformations or aggregations"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.strong,{children:"ga4_sessions"})}),(0,n.jsx)(s.td,{children:"GA4 output sessions table that fixes sessions broken by midnight, adds last non-direct click attribution, and can be used for further transformations or aggregations"})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.strong,{children:"demo_daily_sessions_report"})}),(0,n.jsx)(s.td,{})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.strong,{children:"demo_diagnostics"})}),(0,n.jsx)(s.td,{})]}),(0,n.jsxs)(s.tr,{children:[(0,n.jsx)(s.td,{children:(0,n.jsx)(s.strong,{children:"unit_test"})}),(0,n.jsx)(s.td,{})]})]})]}),"\n",(0,n.jsx)(s.h2,{id:"dataform-repository-structure",children:"Dataform Repository Structure:"}),"\n",(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{children:"definitions\n\u251c\u2500\u2500 **01_sources**\n\u2502   \u251c\u2500\u2500 `declarations.js`\n\u2502   \u251c\u2500\u2500 `stg_ga4_events.sqlx`\n\u2502   \u251c\u2500\u2500 `stg_ga4_sessions.sqlx`\n\u251c\u2500\u2500 **02_intermediate**\n\u2502   \u251c\u2500\u2500 `int_ga4_events.sqlx`\n\u2502   \u251c\u2500\u2500 `int_ga4_sessions.sqlx`\n\u251c\u2500\u2500 **03_outputs**\n\u2502   \u251c\u2500\u2500 **aggregated**\n\u2502   \u2502   \u251c\u2500\u2500 `demo_daily_sessions_report.sqlx`\n\u2502   \u2502   \u251c\u2500\u2500 `demo_diagnostics.sqlx`\n\u2502   \u251c\u2500\u2500 **base**\n\u2502   \u2502   \u251c\u2500\u2500 `ga4_events.sqlx`\n\u2502   \u2502   \u251c\u2500\u2500 `ga4_sessions.sqlx`\n\u251c\u2500\u2500 **assertions**\n\u2502   \u251c\u2500\u2500 `assertion_logs.sqlx`\n\u2502   \u251c\u2500\u2500 `assertions_event_id_uniqueness.sqlx`\n\u2502   \u251c\u2500\u2500 `assertions_session_duration_validity.sqlx`\n\u2502   \u251c\u2500\u2500 `assertions_session_id_uniqueness.sqlx`\n\u2502   \u251c\u2500\u2500 `assertions_sessions_validity.sqlx`\n\u2502   \u251c\u2500\u2500 `assertions_tables_timeliness.sqlx`\n\u2502   \u251c\u2500\u2500 `assertions_transaction_id_completeness.sqlx`\n\u2502   \u251c\u2500\u2500 `assertions_user_pseudo_id_completeness.sqlx`\n\u251c\u2500\u2500 **extra**\n\u2502   \u251c\u2500\u2500 **ga4**\n\u2502   \u2502   \u251c\u2500\u2500 `source_categories.js`\n\u251c\u2500\u2500 **unit_testing**\n\u2502   \u251c\u2500\u2500 `unit_test.sqlx`\n\u251c\u2500\u2500 **includes**\n\u2502   \u251c\u2500\u2500 `core_params.js`\n\u2502   \u251c\u2500\u2500 `custom_config.js`\n\u2502   \u251c\u2500\u2500 `helpers.js`\n\u251c\u2500\u2500 `.gitignore`\n\u251c\u2500\u2500 `dataform.json`\n\u251c\u2500\u2500 `package-lock.json`\n\u251c\u2500\u2500 `package.json`\n"})}),"\n",(0,n.jsx)(s.h2,{id:"bigquery-output",children:"BigQuery Output"}),"\n",(0,n.jsx)(s.p,{children:"GA4Dataform generates tables in BigQuery. Everything will be under the dataform-package project with the following structure:"}),"\n",(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{children:"Dataform-package (project)\n\u251c\u2500\u2500 superform_outputs (dataset)\n\u2502   \u251c\u2500\u2500 demo_daily_sessions_report (tables)\n\u2502   \u251c\u2500\u2500 demo_diagnostics\n\u2502   \u251c\u2500\u2500 ga4_events\n\u2502   \u251c\u2500\u2500 ga4_sessions\n\u251c\u2500\u2500 superform_transformations\n\u2502   \u251c\u2500\u2500 int_ga4_events\n\u2502   \u251c\u2500\u2500 int_ga4_sessions\n\u2502   \u251c\u2500\u2500 source_categories\n\u2502   \u251c\u2500\u2500 stg_ga4_events\n\u2502   \u251c\u2500\u2500 stg_ga4_sessions\n\u251c\u2500\u2500 Superform_quality\n\u2502   \u251c\u2500\u2500 assertion_logs\n"})})]})}function h(e={}){const{wrapper:s}={...(0,r.R)(),...e.components};return s?(0,n.jsx)(s,{...e,children:(0,n.jsx)(l,{...e})}):l(e)}},8453:(e,s,t)=>{t.d(s,{R:()=>o,x:()=>a});var n=t(6540);const r={},i=n.createContext(r);function o(e){const s=n.useContext(i);return n.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function a(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:o(e.components),n.createElement(i.Provider,{value:s},e.children)}}}]);