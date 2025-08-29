// core and custom config file
const { helpers } = require("includes/core/helpers");
const lowerSQL = helpers.lowerSQL;
const safeCastSQL = helpers.safeCastSQL;

// -----------------------------------------------------------------------------
// Core Configuration: This section defines the standard, default settings.
// You should not need to edit these unless you want to make a core change.
// -----------------------------------------------------------------------------

const CORE_DEFAULTS = {
    GA4_START_DATE: "2025-07-01",
    EVENTS_TO_EXCLUDE: [],
    HOSTNAME_EXCLUDE: [],
    HOSTNAME_INCLUDE_ONLY: [],
    KEY_EVENTS_ARRAY: [],
    CUSTOM_EVENT_PARAMS_TO_EXCLUDE: ['batch_event_index','batch_ordering_id','batch_page_id'],
    CUSTOM_EVENT_PARAMS_ARRAY: [
        { type: "string", name: "application_status" },
        { type: "string", name: "login_status" },
        { type: "string", name: "monetate_id" },
        { type: "string", name: "monetate_status" },
        { type: "string", name: "customer_id" },
    ],
    CUSTOM_USER_PROPERTIES_ARRAY: [],
    CUSTOM_ITEM_PARAMS_TO_EXCLUDE: [],   
    CUSTOM_ITEM_PARAMS_ARRAY: [],
    CUSTOM_URL_PARAMS_ARRAY: [],
   
    LAST_NON_DIRECT_LOOKBACK_DAYS: 90,
    TRANSACTIONS_DEDUPE: false,
    TRANSACTION_TOTALS_UID: "user_pseudo_id",
    DATA_IS_FINAL_DAYS: 3,
    EXTRA_CHANNEL_GROUPS: false,
    ASSERTIONS_EVENT_ID_UNIQUENESS: true,
    ASSERTIONS_SESSION_DURATION_VALIDITY: true,
    ASSERTIONS_SESSION_ID_UNIQUENESS: true,
    ASSERTIONS_SESSIONS_VALIDITY: true,
    ASSERTIONS_TABLES_TIMELINESS: true,
    ASSERTIONS_TRANSACTION_ID_COMPLETENESS: true,
    ASSERTIONS_USER_PSEUDO_ID_COMPLETENESS: true,
};

const CORE_ARRAYS = {
    CORE_PARAMS_ARRAY: [
      { type: "string", name: "ignore_referrer" },
      { type: "int", name: "ga_session_id" },
      { type: "int", name: "ga_session_number" },
      { type: "int", name: "batch_page_id" },
      { type: "int", name: "batch_ordering_id" },
      { type: "int", name: "synthetic_bundle" },
      { type: "int", name: "engagement_time_msec" },
      { type: "int", name: "engaged_session_event" },
      { type: "int", name: "entrances" },
      { type: "string", name: "session_engaged", cleaningMethod: safeCastSQL },
      { type: "string", name: "content_group" },
      { type: "string", name: "content_id" },
      { type: "string", name: "content_type" },
      { type: "string", name: "page_location" },
      { type: "string", name: "page_referrer" },
      { type: "string", name: "page_title" },
      { type: "string", name: "content" },
      { type: "string", name: "medium" },
      { type: "string", name: "campaign" },
      { type: "string", name: "source" },
      { type: "string", name: "term" },
      { type: "string", name: "gclid" },
      { type: "string", name: "dclid" },
      { type: "string", name: "srsltid" },
      { type: "string", name: "aclid" },
      { type: "string", name: "cp1" },
      { type: "string", name: "anid" },
      { type: "string", name: "click_timestamp" },
      { type: "string", name: "campaign_info_source" },
      { type: "string", name: "coupon" },
      { type: "string", name: "currency" },
      { type: "decimal", name: "shipping" },
      { type: "string", name: "shipping_tier" },
      { type: "string", name: "payment_type" },
      { type: "decimal", name: "tax" },
      { type: "string", name: "transaction_id" },
      { type: "decimal", name: "value" },
      { type: "string", name: "item_list_id" },
      { type: "string", name: "item_list_name" },
      { type: "string", name: "creative_name" },
      { type: "string", name: "creative_slot" },
      { type: "string", name: "promotion_id" },
      { type: "string", name: "promotion_name" },
      { type: "string", name: "item_name" },
      { type: "string", name: "link_classes" },
      { type: "string", name: "link_domain" },
      { type: "string", name: "link_id" },
      { type: "string", name: "link_text" },
      { type: "string", name: "link_url" },
      { type: "string", name: "outbound" },
      { type: "string", name: "ad_unit_code" },
      { type: "string", name: "ad_event_id" },
      { type: "string", name: "exposure_time" },
      { type: "string", name: "reward_type" },
      { type: "decimal", name: "reward_value" },
      { type: "decimal", name: "video_current_time" },
      { type: "decimal", name: "video_duration" },
      { type: "int",     name: "video_percent" },
      { type: "string", name: "video_provider" },
      { type: "string", name: "video_title" },
      { type: "string", name: "video_url" },
      { type: "string", name: "method" },
      { type: "string", name: "app_version" },
      { type: "string", name: "cancellation_reason" },
      { type: "string", name: "fatal" },
      { type: "int", name: "timestamp" },
      { type: "string", name: "firebase_error" },
      { type: "string", name: "firebase_error_value" },
      { type: "string", name: "firebase_screen" },
      { type: "string", name: "firebase_screen_class" },
      { type: "string", name: "firebase_screen_id" },
      { type: "string", name: "firebase_previous_screen" },
      { type: "string", name: "firebase_previous_class" },
      { type: "string", name: "firebase_previous_id" },
      { type: "string", name: "free_trial" },
      { type: "int", name: "message_device_time" },
      { type: "string", name: "message_id" },
      { type: "string", name: "message_name" },
      { type: "int", name: "message_time" },
      { type: "string", name: "message_type" },
      { type: "string", name: "topic" },
      { type: "string", name: "label" },
      { type: "string", name: "previous_app_version" },
      { type: "int", name: "previous_first_open_count" },
      { type: "string", name: "previous_os_version" },
      { type: "string", name: "subscription" },
      { type: "int", name: "updated_with_analytics" },
      { type: "string", name: "achievement_id" },
      { type: "string", name: "character" },
      { type: "string", name: "level" },
      { type: "string", name: "level_name" },
      { type: "decimal", name: "score" },
      { type: "string", name: "virtual_currency_name" },
      { type: "string", name: "success" },
      { type: "string", name: "visible" },
      { type: "string", name: "screen_resolution" },
      { type: "string", name: "system_app" },
      { type: "string", name: "system_app_update" },
      { type: "string", name: "product_id" },
      { type: "decimal", name: "price" },
      { type: "decimal", name: "quantity" },
      { type: "string", name: "renewal_count" },
      { type: "string", name: "previous_gmp_app_id" },
      { type: "string", name: "deferred_analytics_collection" },
      { type: "string", name: "reset_analytics_cause" },
      { type: "decimal", name: "introductory_price" },
      { type: "string", name: "file_extension" },
      { type: "string", name: "file_name" },
      { type: "string", name: "form_destination" },
      { type: "string", name: "form_id" },
      { type: "string", name: "form_name" },
      { type: "string", name: "form_submit_text" },
      { type: "string", name: "group_id" },
      { type: "string", name: "language" },
      { type: "int", name: "percent_scrolled" },
      { type: "string", name: "search_term" },
      { type: "string", name: "unconvert_lead_reason" },
      { type: "string", name: "disqualified_lead_reason" },
      { type: "string", name: "lead_source" },
      { type: "string", name: "lead_status" }
    ],
    URL_PARAMS_ARRAY: [
      { name: "utm_marketing_tactic",cleaningMethod: lowerSQL},
      { name: "utm_source_platform",cleaningMethod: lowerSQL },
      { name: "utm_term",cleaningMethod: lowerSQL },
      { name: "utm_content",cleaningMethod: lowerSQL },
      { name: "utm_source",cleaningMethod: lowerSQL },
      { name: "utm_medium",cleaningMethod: lowerSQL },
      { name: "utm_campaign",cleaningMethod: lowerSQL },
      { name: "utm_id",cleaningMethod: lowerSQL },
      { name: "utm_creative_format",cleaningMethod: lowerSQL },
      { name: "gtm_debug" },
      { name: "_gl" }
    ],
    CLICK_IDS_ARRAY: [
      {name:'gclid', source:"google", medium:"cpc", campaign: "(not set)", sources:["url","collected_traffic_source"] },
      {name:'dclid', source:"google", medium:"cpc", campaign: "(not set)", sources:["url","collected_traffic_source"] },
      {name:'srsltid', source:"google", medium:"organic", campaign: "Shopping Free Listings", sources:["url","collected_traffic_source"] },
      {name:'gbraid', source:"google",  medium:"cpc", campaign: "(not set)", sources:["url"]},
      {name:'wbraid', source:"google",  medium:"cpc", campaign: "(not set)", sources:["url"] },
      {name:'msclkid', source:"bing", medium:"cpc", campaign: "(not set)", sources:["url"] }
    ],
    SOCIAL_PLATFORMS_REGEX: ['pinterest', 'facebook', 'instagram', 'reddit', 'tiktok', 'linkedin', 'snapchat', 'messenger', 'twitter'].join('|'),
    TABLES_OUTPUT: ["ga4_events", "int_ga4_sessions", "int_ga4_transactions", "ga4_sessions", "ga4_transactions"]
};

// -----------------------------------------------------------------------------
// Custom Configuration: This is where you put your overrides and custom arrays.
// These settings will overwrite the core defaults.
// -----------------------------------------------------------------------------

const customConfig = {
  GA4_START_DATE: "2025-05-01",
  CUSTOM_EVENT_PARAMS_TO_EXCLUDE: ['batch_event_index','batch_ordering_id','batch_page_id'],
  CUSTOM_EVENT_PARAMS_ARRAY: [],
  CUSTOM_USER_PROPERTIES_ARRAY: [],
  CUSTOM_ITEM_PARAMS_TO_EXCLUDE: [],
  CUSTOM_ITEM_PARAMS_ARRAY: [],
  CUSTOM_URL_PARAMS_ARRAY: [],
  EVENTS_TO_EXCLUDE: [],
  HOSTNAME_EXCLUDE: [],
  HOSTNAME_INCLUDE_ONLY: [],
  KEY_EVENTS_ARRAY: ["select_content","GMP_form_send","form_submit","form_send","file_download","Contact_InfoTrust_form_send"],
  EXTRA_CHANNEL_GROUPS: true,
  LAST_NON_DIRECT_LOOKBACK_DAYS: 90,
  TRANSACTIONS_DEDUPE: true,
  TRANSACTION_TOTALS_UID: 'user_pseudo_id',

     // example:
  // CUSTOM_ITEM_PARAMS_ARRAY: [
  //    { name: "stock_status", type: "string" }
  // ]

/* Toggle assertions on or off.
     Set to true to enable assertions, false to disable them. */
  ASSERTIONS_EVENT_ID_UNIQUENESS: false,
  ASSERTIONS_SESSION_ID_UNIQUENESS: false,
  ASSERTIONS_SESSION_DURATION_VALIDITY: false,
  ASSERTIONS_SESSIONS_VALIDITY: false, 
  ASSERTIONS_TABLES_TIMELINESS: false,
  ASSERTIONS_TRANSACTION_ID_COMPLETENESS: false,
  ASSERTIONS_USER_PSEUDO_ID_COMPLETENESS: false
};

// -----------------------------------------------------------------------------
// Final Merged Configuration:
// The final object combines the core defaults with the custom settings,
// with customConfig taking precedence.
// -----------------------------------------------------------------------------

const mergedConfig = Object.assign({}, CORE_DEFAULTS, customConfig, CORE_ARRAYS);

module.exports = {
    mergedConfig
};