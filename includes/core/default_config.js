/*
	This file is part of "GA4 Dataform Package".
	Copyright (C) 2023-2024 Superform Labs <support@ga4dataform.com>
	Artem Korneev, Jules Stuifbergen,
	Johan van de Werken, Krisztián Korpa,
	Simon Breton

	This program is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, version 3 of the License.

	This program is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License in the LICENSE.txt file for more details.

	You should have received a copy of the GNU General Public License
	along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/



const { safeCastSQL, lowerSQL } = require("./helpers");



const URL_PARAMS_ARRAY = [
    // url parameters to extract to own column

    { name: "utm_marketing_tactic",cleaningMethod: lowerSQL},
    { name: "utm_source_platform",cleaningMethod: lowerSQL },
    { name: "utm_term",cleaningMethod: lowerSQL },
    { name: "utm_content",cleaningMethod: lowerSQL },
    { name: "utm_source",cleaningMethod: lowerSQL },
    { name: "utm_medium",cleaningMethod: lowerSQL },
    { name: "utm_campaign",cleaningMethod: lowerSQL },
    { name: "utm_id",cleaningMethod: lowerSQL },
    { name: "utm_creative_format",cleaningMethod: lowerSQL },

    // gtm and ga
    { name: "gtm_debug" },
    { name: "_gl" },
];

/*
    The following table lists most of the event parameters from automatically
    collected events, enhanced measurement events, and recommended events.
    Enhanced measurement events are collected automatically when enhanced
    measurement is enabled. The table includes a description of each event
    parameter and the dimension or metric you can use to see the event parameter
    in reports and explorations, if a dimension or metric is available.

    https://support.google.com/analytics/table/13594742?hl=en&ref_topic=13367566
*/


const CORE_PARAMS_ARRAY = [
    // never remove, do not rename - this can break the core model

    {
        type: "string",
        name: "ignore_referrer"
    },
    {
        type: "int",
        name: "ga_session_id"
    },
    {
        type: "int",
        name: "ga_session_number"
    },
    {
        type: "int",
        name: "batch_page_id"
    },
    {
        type: "int",
        name: "batch_ordering_id"
    },

    {
        type: "int",
        name: "synthetic_bundle"
    },
    {
        type: "int",
        name: "engagement_time_msec"
    },
    {
        type: "int",
        name: "engaged_session_event"
    },
    {
        type: "int",
        name: "entrances"
    },
    {
        type: "string",
        name: "session_engaged",
        cleaningMethod: safeCastSQL
    },

    // page specific
    {
        type: "string",
        name: "content_group"
    },
    {
        type: "string",
        name: "content_id"
    },
    {
        type: "string",
        name: "content_type"
    },
    {
        type: "string",
        name: "page_location",
    },
    {
        type: "string",
        name: "page_referrer",
    },
    {
        type: "string",
        name: "page_title"
    },

    // campaign
    {
        type: "string",
        name: "content",
    },
    {
        type: "string",
        name: "medium",
    },
    {
        type: "string",
        name: "campaign",
    },
    {
        type: "string",
        name: "source",
    },
    {
        type: "string",
        name: "term",
    },
    {
        type: "string",
        name: "gclid",
    },
    {
        type: "string",
        name: "dclid",
    },
    {
        type: "string",
        name: "srsltid",
    },
    {
        type: "string",
        name: "aclid",
    },
    {
        type: "string",
        name: "cp1",
    },
    {
        type: "string",
        name: "anid",
    },
    {
        type: "string",
        name: "click_timestamp",
    },
    {
        type: "string",
        name: "campaign_info_source",
    },

    // ecommerce
    {
        type: "string",
        name: "coupon"
    },
    {
        type: "string",
        name: "currency"
    },
    {
        type: "decimal",
        name: "shipping"
    },
    {
        type: "string",
        name: "shipping_tier"
    },
    {
        type: "string",
        name: "payment_type"
    },
    {
        type: "decimal",
        name: "tax"
    },
    {
        type: "string",
        name: "transaction_id"
    },
    {
        type: "decimal",
        name: "value"
    },
        {
        type: "string",
        name: "item_list_id"
    },
    
    // item_list_view
    {
        type: "string",
        name: "item_list_name"
    },

    // promotion
    {
        type: "string",
        name: "creative_name"
    },
    {
        type: "string",
        name: "creative_slot"
    },
    {
        type: "string",
        name: "promotion_id"
    },
    {
        type: "string",
        name: "promotion_name"
    },
    {
        type: "string",
        name: "item_name"
    },

    // click
    {
        type: "string",
        name: "link_classes"
    },
    {
        type: "string",
        name: "link_domain"
    },
    {
        type: "string",
        name: "link_id"
    },
    {
        type: "string",
        name: "link_text"
    },
    {
        type: "string",
        name: "link_url"
    },
    {
        type: "string",
        name: "outbound"
    },

    // publisher
    {
        type: "string",
        name: "ad_unit_code"
    },
    {
        type: "string",
        name: "ad_event_id"
    },
    {
        type: "string",
        name: "exposure_time"
    },
    {
        type: "string",
        name: "reward_type"
    },
    {
        type: "decimal",
        name: "reward_value"
    },

    // Video
    {
        type: "decimal",
        name: "video_current_time"
    },
    {
        type: "decimal",
        name: "video_duration"
    },
    {
        type: "int",
        name: "video_percent"
    },
    {
        type: "string",
        name: "video_provider"
    },
    {
        type: "string",
        name: "video_title"
    },
    {
        type: "string",
        name: "video_url"
    },

    // login, signup, share
    {
        type: "string",
        name: "method"
    }, 


    // app, games
    {
        type: "string",
        name: "app_version"
    },
    {
        type: "string",
        name: "cancellation_reason"
    },
    {
        type: "string",
        name: "fatal"
    },
    {
        type: "int",
        name: "timestamp"
    },
    {
        type: "string",
        name: "firebase_error"
    },
    {
        type: "string",
        name: "firebase_error_value"
    },
    {
        type: "string",
        name: "firebase_screen"
    },
    {
        type: "string",
        name: "firebase_screen_class"
    },
    {
        type: "string",
        name: "firebase_screen_id"
    },
    {
        type: "string",
        name: "firebase_previous_screen"
    },
    {
        type: "string",
        name: "firebase_previous_class"
    },
    {
        type: "string",
        name: "firebase_previous_id"
    },
    {
        type: "string",
        name: "free_trial"
    },
    {
        type: "int",
        name: "message_device_time"
    },
    {
        type: "string",
        name: "message_id"
    },
    {
        type: "string",
        name: "message_name"
    },
    {
        type: "int",
        name: "message_time"
    },
    {
        type: "string",
        name: "message_type"
    },
    {
        type: "string",
        name: "topic"
    },
    {
        type: "string",
        name: "label"
    },
    {
        type: "string",
        name: "previous_app_version"
    },
    {
        type: "int",
        name: "previous_first_open_count"
    },
    {
        type: "string",
        name: "previous_os_version"
    },
    {
        type: "string",
        name: "subscription"
    },
    {
        type: "int",
        name: "updated_with_analytics"
    },
    {
        type: "string",
        name: "achievement_id"
    },
    {
        type: "string",
        name: "character"
    },
    {
        type: "string",
        name: "level"
    },
    {
        type: "string",
        name: "level_name"
    },
    {
        type: "decimal",
        name: "score"
    },
    {
        type: "string",
        name: "virtual_currency_name"
    },
    {
        type: "string",
        name: "success"
    },
    {
        type: "string",
        name: "visible"
    },
    {
        type: "string",
        name: "screen_resolution"
    },
    {
        type: "string",
        name: "system_app"
    },
    {
        type: "string",
        name: "system_app_update"
    },
    {
        type: "string",
        name: "product_id"
    },
    {
        type: "decimal",
        name: "price"
    },
    {
        type: "decimal",
        name: "quantity"
    },
    {
        type: "string",
        name: "renewal_count"
    },
    {
        type: "string",
        name: "previous_gmp_app_id"
    },
    {
        type: "string",
        name: "deferred_analytics_collection"
    },
    {
        type: "string",
        name: "reset_analytics_cause"
    },
    {
        type: "decimal",
        name: "introductory_price"
    },

    // download
    {
        type: "string",
        name: "file_extension"
    },
    {
        type: "string",
        name: "file_name"
    },

    // forms
    {
        type: "string",
        name: "form_destination"
    },
    {
        type: "string",
        name: "form_id"
    },
    {
        type: "string",
        name: "form_name"
    },
    {
        type: "string",
        name: "form_submit_text"
    },

    {
        type: "string",
        name: "group_id"
    },
    {
        type: "string",
        name: "language"
    },

    // scroll
    {
        type: "int",
        name: "percent_scrolled"
    },

    // search
    {
        type: "string",
        name: "search_term"
    },

    // leads
    {
        type: "string",
        name: "unconvert_lead_reason"
    },
    {
        type: "string",
        name: "disqualified_lead_reason"
    },
    {
        type: "string",
        name: "lead_source"
    },
    {
        type: "string",
        name: "lead_status"
    }

];

// config starts here


// Default Channel Grouping mimics GA4
// We create extra channels, enable those?
const EXTRA_CHANNEL_GROUPS = false;

// this date will be the first shard that is processed
const GA4_START_DATE = "2020-01-01";

// how many days should pass in order to deem an event 'final'
// we recommend using 3 as Measurement Protocol hits can arrive 72 hours into the past
const DATA_IS_FINAL_DAYS = 3;

// adjust your lookback window
const LAST_NON_DIRECT_LOOKBACK_DAYS = 90;

// quality checks can be toggled off by changing to false
const ASSERTIONS_EVENT_ID_UNIQUENESS = true;
const ASSERTIONS_SESSION_DURATION_VALIDITY = true;
const ASSERTIONS_SESSION_ID_UNIQUENESS = true;
const ASSERTIONS_SESSIONS_VALIDITY = true; 
const ASSERTIONS_TABLES_TIMELINESS = true; 
const ASSERTIONS_TRANSACTION_ID_COMPLETENESS = true;
const ASSERTIONS_USER_PSEUDO_ID_COMPLETENESS = true;


// deduplicate transactions?
const TRANSACTIONS_DEDUPE = false;

// what column to use for tranasction running totals to use?
// valid values: user_pseudo_id | user_id | <some valid column name>
const TRANSACTION_TOTALS_UID = "user_pseudo_id";


// ga4 event param config

// type: string, int, decimal
// name: "param_name"
// renameTo: "name_of_output_column" (optional)

// decimal will cast/coalesce into numeric via - INT, FLOAT, DOUBLE
// string will cast/coalesce into string via STRING, INT, FLOAT DOUBLE


const CUSTOM_EVENT_PARAMS_ARRAY = [
  // example set: this will populate 5 fields in the `event_params_custom` column in the `ga4_events` table
  // known limitation: the output column names must be valid. use letters and underscores to be safe 
];


const CUSTOM_USER_PROPERTIES_ARRAY = [
];


const CUSTOM_ITEM_PARAMS_ARRAY = [

];

const CUSTOM_URL_PARAMS_ARRAY = [

];



const CLICK_IDS_ARRAY = [
  // how to classify click ids (from collected_traffic_source) when there is no source/medium/campaign found?
  // (defaults should be fine)

  // name: from collected_traffic_source
  // medium and campaign: fill in with this value when needed (meaning: when found to be organic/referral)
  // note: we never overwrite MEDIUM, CAMPAIGN if explitly set. We only overwrite when campaign is "(organic)", "(referral)" or NULL
  {name:'gclid', source:"google", medium:"cpc", campaign: "(not set)", sources:["url","collected_traffic_source"] },
  {name:'dclid', source:"google", medium:"cpc", campaign: "(not set)", sources:["url","collected_traffic_source"] },
  {name:'srsltid', source:"google", medium:"organic", campaign: "Shopping Free Listings", sources:["url","collected_traffic_source"] },
  {name:'gbraid', source:"google",  medium:"cpc", campaign: "(not set)", sources:["url"]},
  {name:'wbraid', source:"google",  medium:"cpc", campaign: "(not set)", sources:["url"] },
  {name:'msclkid', source:"bing", medium:"cpc", campaign: "(not set)", sources:["url"] }
];




// if you have events you don't want to process, include them here
const EVENTS_TO_EXCLUDE = [];
const HOSTNAME_EXCLUDE = []; // a list of hostnames to exclude (leave all others in)
const HOSTNAME_INCLUDE_ONLY = []; // a list of hostnames to include (discard all others)



// do not change anything below this line

const SOCIAL_PLATFORMS_REGEX = ['pinterest',
                                'facebook',
                                'instagram',
                                'reddit',
                                'tiktok',
                                'linkedin',
                                'snapchat',
                                'messenger',
                                'twitter'].join('|');

const TABLES_OUTPUT = [
                        "ga4_events",
                        "int_ga4_sessions",
                        "int_ga4_transactions",
                        "ga4_sessions",
                        "ga4_transactions"
];

const coreConfig = {
    CORE_PARAMS_ARRAY,
    URL_PARAMS_ARRAY,
    CUSTOM_EVENT_PARAMS_ARRAY,
    GA4_START_DATE,
    DATA_IS_FINAL_DAYS,
    EXTRA_CHANNEL_GROUPS,
    LAST_NON_DIRECT_LOOKBACK_DAYS,
    CLICK_IDS_ARRAY,
    ASSERTIONS_EVENT_ID_UNIQUENESS,
    ASSERTIONS_SESSION_DURATION_VALIDITY,
    ASSERTIONS_SESSION_ID_UNIQUENESS,
    ASSERTIONS_SESSIONS_VALIDITY,
    ASSERTIONS_TABLES_TIMELINESS,
    ASSERTIONS_TRANSACTION_ID_COMPLETENESS,
    ASSERTIONS_USER_PSEUDO_ID_COMPLETENESS,
    EVENTS_TO_EXCLUDE,
    HOSTNAME_EXCLUDE,
    HOSTNAME_INCLUDE_ONLY,
    SOCIAL_PLATFORMS_REGEX,
    CUSTOM_USER_PROPERTIES_ARRAY,
    CUSTOM_ITEM_PARAMS_ARRAY,
    CUSTOM_URL_PARAMS_ARRAY,
    TRANSACTIONS_DEDUPE,
    TRANSACTION_TOTALS_UID,
    TABLES_OUTPUT
}

module.exports = {
    coreConfig
};
