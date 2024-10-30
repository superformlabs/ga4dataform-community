"use strict";(self.webpackChunkga_4_dataform=self.webpackChunkga_4_dataform||[]).push([[102],{215:(e,s,t)=>{t.r(s),t.d(s,{assets:()=>c,contentTitle:()=>i,default:()=>h,frontMatter:()=>o,metadata:()=>a,toc:()=>d});var n=t(4848),r=t(8453);const o={title:"Custom Configuration",description:"Providing instructions on how to customize GA4Dataform.",sidebar_position:5,slug:"/custom-configuration"},i=void 0,a={id:"ga4dataform-doc/custom-configuration",title:"Custom Configuration",description:"Providing instructions on how to customize GA4Dataform.",source:"@site/docs/ga4dataform-doc/custom-configuration.md",sourceDirName:"ga4dataform-doc",slug:"/custom-configuration",permalink:"/ga4dataform/ga4dataform/custom-configuration",draft:!1,unlisted:!1,editUrl:"https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/docs/ga4dataform-doc/custom-configuration.md",tags:[],version:"current",sidebarPosition:5,frontMatter:{title:"Custom Configuration",description:"Providing instructions on how to customize GA4Dataform.",sidebar_position:5,slug:"/custom-configuration"},sidebar:"tutorialSidebar",previous:{title:"Product Features",permalink:"/ga4dataform/ga4dataform/product-features"},next:{title:"Assertions",permalink:"/ga4dataform/ga4dataform/assertions"}},c={},d=[];function l(e){const s={br:"br",code:"code",p:"p",pre:"pre",...(0,r.R)(),...e.components},{Details:t}=s;return t||function(e,s){throw new Error("Expected "+(s?"component":"object")+" `"+e+"` to be defined: you likely forgot to import, pass, or provide it.")}("Details",!0),(0,n.jsxs)(n.Fragment,{children:[(0,n.jsx)(s.p,{children:'GA4 Dataform Model Custom Configuration ("config.js")'}),"\n",(0,n.jsx)(s.p,{children:'Here\'s a detailed explanation of the "config.js" file in the custom folder. This file allows users to customize various aspects of the GA4 Dataform model, focusing on parameters like event filtering, custom dimensions, and data validation checks.'}),"\n",(0,n.jsx)(s.p,{children:'"config.js" - Custom Configuration File'}),"\n",(0,n.jsx)(s.p,{children:"Purpose:\nThis configuration file provides a way for users to customize the behavior of the GA4 Dataform model. Below are the sections and parameters that can be modified:"}),"\n",(0,n.jsxs)(t,{children:[(0,n.jsx)("summary",{children:"GA4 Start Date"}),(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{children:'GA4_START_DATE: "2020-01-01"\n'})}),(0,n.jsxs)(s.p,{children:[(0,n.jsx)("strong",{children:"Description"}),": Defines the starting date for the GA4 data that the model should process.",(0,n.jsx)(s.br,{}),"\n",(0,n.jsx)("strong",{children:"Customization"}),": Change this date to reflect the earliest data you want to include in your reports. For example, if you started collecting GA4 data on a different date, modify this to match that date."]})]}),"\n",(0,n.jsxs)(t,{children:[(0,n.jsx)("summary",{children:"Custom Event Parameters"}),(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{children:"CUSTOM_EVENT_PARAMS_ARRAY: []\n"})}),(0,n.jsxs)(s.p,{children:[(0,n.jsx)("strong",{children:"Description"}),": This allows you to specify custom event parameters that are not part of the standard GA4 data. The custom parameters will be added to the ",(0,n.jsx)(s.code,{children:"event_params_custom"})," column.",(0,n.jsx)(s.br,{}),"\n",(0,n.jsx)("strong",{children:"Customization"}),": Add parameters using the format ",(0,n.jsx)(s.code,{children:'"{ name: "paramname", type: "TYPE", renameTo: "outputcolumnname" }"'}),".",(0,n.jsx)(s.br,{}),"\n",(0,n.jsx)("strong",{children:"Example:"})]}),(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{children:"CUSTOM_EVENT_PARAMS_ARRAY: [\n  { name: 'custom_param', type: 'string', renameTo: 'custom_output' }\n]\n"})})]}),"\n",(0,n.jsxs)(t,{children:[(0,n.jsx)("summary",{children:"Custom Item Parameters"}),(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{children:"CUSTOM_ITEM_PARAMS_ARRAY: []\n"})}),(0,n.jsxs)(s.p,{children:[(0,n.jsx)("strong",{children:"Description"}),": Similar to event parameters, but for item custom dimensions and metrics. These will be stored in the ",(0,n.jsx)(s.code,{children:"items.item_params_custom.*"})," column.",(0,n.jsx)(s.br,{}),"\n",(0,n.jsx)("strong",{children:"Customization"}),": Add custom item parameters in the same format.",(0,n.jsx)(s.br,{}),"\n",(0,n.jsx)("strong",{children:"Example:"})]}),(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{children:'CUSTOM_ITEM_PARAMS_ARRAY: [\n  { name: "stock_status", type: "string" }\n]\n'})})]}),"\n",(0,n.jsxs)(t,{children:[(0,n.jsx)("summary",{children:"Custom URL Parameters"}),(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{children:"CUSTOM_URL_PARAMS_ARRAY: []\n"})}),(0,n.jsxs)(s.p,{children:[(0,n.jsx)("strong",{children:"Description"}),": Allows you to extract custom URL parameters into their own columns.",(0,n.jsx)(s.br,{}),"\n",(0,n.jsx)("strong",{children:"Customization"}),": Define custom URL parameters you want to extract in the format ",(0,n.jsx)(s.code,{children:'"{ name: "param_name", cleaningMethod: "method" }"'}),". Note that only strings are supported.",(0,n.jsx)(s.br,{}),"\n",(0,n.jsx)("strong",{children:"Example:"})]}),(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{children:'CUSTOM_URL_PARAMS_ARRAY: [\n  { name: "q", cleaningMethod: lowerSQL }\n]\n'})})]}),"\n",(0,n.jsxs)(t,{children:[(0,n.jsx)("summary",{children:"Event and Hostname Filters"}),(0,n.jsx)("strong",{children:"Events to Exclude"}),(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{children:"EVENTS_TO_EXCLUDE: []\n"})}),(0,n.jsxs)(s.p,{children:[(0,n.jsx)("strong",{children:"Description"}),": List the event names that should be excluded from the events table.",(0,n.jsx)(s.br,{}),"\n",(0,n.jsx)("strong",{children:"Customization"}),": Add event names you don\u2019t want to process.",(0,n.jsx)(s.br,{}),"\n",(0,n.jsx)("strong",{children:"Example:"})]}),(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{children:'"EVENTS_TO_EXCLUDE: ["user_engagement", "scroll"]"\n'})}),(0,n.jsx)("strong",{children:"Hostname Exclude/Include"}),(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{children:"HOSTNAME_EXCLUDE: []\nHOSTNAME_INCLUDE_ONLY: []\n"})}),(0,n.jsxs)(s.p,{children:[(0,n.jsx)("strong",{children:"Description"}),": Exclude or include specific hostnames from the data.",(0,n.jsx)(s.br,{}),"\n",(0,n.jsx)("strong",{children:"Customization"}),": Add hostnames to either list based on whether you want to include or exclude them from the data."]})]}),"\n",(0,n.jsxs)(t,{children:[(0,n.jsx)("summary",{children:"Attribution Window"}),(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{children:"LAST_NON_DIRECT_LOOKBACK_DAYS: 90\n"})}),(0,n.jsxs)(s.p,{children:[(0,n.jsx)("strong",{children:"Description"}),": Defines the number of days to look back when assigning a source for a user who lands on your site without a direct source.",(0,n.jsx)(s.br,{}),"\n",(0,n.jsx)("strong",{children:"Customization"}),": Change the number of days to fit your attribution model."]})]}),"\n",(0,n.jsxs)(t,{children:[(0,n.jsx)("summary",{children:"Data Quality Assertions"}),(0,n.jsx)("p",{children:"These assertions check the data for consistency and quality. Users can enable or disable specific checks."}),(0,n.jsx)("strong",{children:"Event ID Uniqueness"}),(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{children:"ASSERTIONS_EVENT_ID_UNIQUENESS: true\n"})}),(0,n.jsx)(s.p,{children:"Ensures that each event has a unique event ID."}),(0,n.jsx)("strong",{children:"Session ID Uniqueness"}),(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{children:"ASSERTIONS_SESSION_ID_UNIQUENESS: true\n"})}),(0,n.jsx)(s.p,{children:"Ensures that each session has a unique session ID."}),(0,n.jsx)("strong",{children:"Session Duration Validity"}),(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{children:"ASSERTIONS_SESSION_DURATION_VALIDITY: true\n"})}),(0,n.jsx)(s.p,{children:"Ensures that session durations are valid and within reasonable limits."}),(0,n.jsx)("strong",{children:"Session Validity"}),(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{children:"ASSERTIONS_SESSIONS_VALIDITY: true\n"})}),(0,n.jsx)(s.p,{children:"Validates that session data is correct."}),(0,n.jsx)("strong",{children:"Tables Timeliness"}),(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{children:"ASSERTIONS_TABLES_TIMELINESS: true\n"})}),(0,n.jsx)(s.p,{children:"Checks if the GA4 tables are up to date."}),(0,n.jsx)("strong",{children:"Transaction ID Completeness"}),(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{children:"ASSERTIONS_TRANSACTION_ID_COMPLETENESS: false\n"})}),(0,n.jsx)(s.p,{children:"Checks if transaction IDs are present for purchase events."}),(0,n.jsx)("strong",{children:"User Pseudo ID Completeness"}),(0,n.jsx)(s.pre,{children:(0,n.jsx)(s.code,{children:"ASSERTIONS_USER_PSEUDO_ID_COMPLETENESS: false\n"})}),(0,n.jsx)(s.p,{children:'Ensures that the "user_pseudo_id" is present for all hits.'})]})]})}function h(e={}){const{wrapper:s}={...(0,r.R)(),...e.components};return s?(0,n.jsx)(s,{...e,children:(0,n.jsx)(l,{...e})}):l(e)}},8453:(e,s,t)=>{t.d(s,{R:()=>i,x:()=>a});var n=t(6540);const r={},o=n.createContext(r);function i(e){const s=n.useContext(o);return n.useMemo((function(){return"function"==typeof e?e(s):{...s,...e}}),[s,e])}function a(e){let s;return s=e.disableParentContext?"function"==typeof e.components?e.components(r):e.components||r:i(e.components),n.createElement(o.Provider,{value:s},e.children)}}}]);