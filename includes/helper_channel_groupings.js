/**
 * Returns the merged core and custom configuration objects.
 * @returns {Object} Merged configuration object
 */
const getConfig = () => {
  const { coreConfig } = require("./config");
  const { customConfig } = require("./config");
  return { ...coreConfig, ...customConfig };
};

/* Function #1
 This function processes GA4 events data to create session-level channel groupings
 * based on combining google_ads_campaign and manual_campaign from session_traffic_source_last_click field
 */
function sessionDefaultChannelGrouping_withLastClickfield(startDate, endDate) {
  return `
    WITH main AS (
      SELECT
        user_pseudo_id,
        CONCAT(user_pseudo_id, (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id')) AS session_id,
        STRUCT(
          CASE 
            WHEN ARRAY_AGG(session_traffic_source_last_click.google_ads_campaign.campaign_name IGNORE NULLS ORDER BY event_timestamp)[SAFE_OFFSET(0)] IS NOT NULL 
              AND ARRAY_AGG(session_traffic_source_last_click.google_ads_campaign.campaign_name IGNORE NULLS ORDER BY event_timestamp)[SAFE_OFFSET(0)] != '(not set)' 
            THEN 'google' 
            ELSE 
              ARRAY_AGG(session_traffic_source_last_click.manual_campaign.source IGNORE NULLS ORDER BY event_timestamp)[SAFE_OFFSET(0)] 
          END AS source,
          CASE 
            WHEN ARRAY_AGG(session_traffic_source_last_click.google_ads_campaign.campaign_name IGNORE NULLS ORDER BY event_timestamp)[SAFE_OFFSET(0)] IS NOT NULL 
              AND ARRAY_AGG(session_traffic_source_last_click.google_ads_campaign.campaign_name IGNORE NULLS ORDER BY event_timestamp)[SAFE_OFFSET(0)] != '(not set)' 
            THEN 'cpc' 
            ELSE 
              ARRAY_AGG(session_traffic_source_last_click.manual_campaign.medium IGNORE NULLS ORDER BY event_timestamp)[SAFE_OFFSET(0)] 
          END AS medium,
          COALESCE(
            ARRAY_AGG(session_traffic_source_last_click.google_ads_campaign.campaign_name IGNORE NULLS ORDER BY event_timestamp)[SAFE_OFFSET(0)],
            ARRAY_AGG(session_traffic_source_last_click.manual_campaign.campaign_name IGNORE NULLS ORDER BY event_timestamp)[SAFE_OFFSET(0)]
          ) AS campaign_name,
          ARRAY_AGG(session_traffic_source_last_click.google_ads_campaign.customer_id IGNORE NULLS ORDER BY event_timestamp)[SAFE_OFFSET(0)] AS google_ads_customer_id,
          ARRAY_AGG(session_traffic_source_last_click.google_ads_campaign.account_name IGNORE NULLS ORDER BY event_timestamp)[SAFE_OFFSET(0)] AS google_ads_account_name,
          ARRAY_AGG(session_traffic_source_last_click.google_ads_campaign.campaign_id IGNORE NULLS ORDER BY event_timestamp)[SAFE_OFFSET(0)] AS google_ads_campaign_id,
          ARRAY_AGG(session_traffic_source_last_click.google_ads_campaign.ad_group_id IGNORE NULLS ORDER BY event_timestamp)[SAFE_OFFSET(0)] AS google_ads_ad_group_id,
          ARRAY_AGG(session_traffic_source_last_click.google_ads_campaign.ad_group_name IGNORE NULLS ORDER BY event_timestamp)[SAFE_OFFSET(0)] AS google_ads_ad_group_name
        ) AS session_last_click
      from ${ref ('events' || dataform.projectConfig.vars.TABLE_SUFFIX || "_*")}
      WHERE
        (_table_suffix >= '${startDate}' AND _table_suffix <= '${endDate}')
      GROUP BY
        1, 2
    ),
    lowerValues AS (
      SELECT 
        user_pseudo_id,
        session_id,
        LOWER(session_last_click.source) AS source,
        LOWER(session_last_click.medium) AS medium,
        LOWER(session_last_click.campaign_name) AS campaign_name
      FROM main
    ),
    applychannelGrouping AS (
      SELECT 
        user_pseudo_id,
        session_id,
        CASE
          WHEN source = '(direct)' AND (medium IN ('(not set)', '(none)')) THEN 'Direct'
          WHEN REGEXP_CONTAINS(campaign_name, 'cross-network') THEN 'Cross-network'
          WHEN (REGEXP_CONTAINS(source, 'alibaba|amazon|google shopping|shopify|etsy|ebay|stripe|walmart')
              OR REGEXP_CONTAINS(campaign_name, r'^(.*(([^a-df-z]|^)shop|shopping).*)'))
              AND REGEXP_CONTAINS(medium, r'^(.*cp.*|ppc|retargeting|paid.*)') THEN 'Paid Shopping'
          WHEN REGEXP_CONTAINS(source, 'baidu|bing|duckduckgo|ecosia|google|yahoo|yandex')
              AND REGEXP_CONTAINS(medium, r'^(.*cp.*|ppc|retargeting|paid.*)') THEN 'Paid Search'
          WHEN REGEXP_CONTAINS(source, 'badoo|facebook|fb|instagram|linkedin|pinterest|tiktok|twitter|whatsapp')
              AND REGEXP_CONTAINS(medium, r'^(.*cp.*|ppc|retargeting|paid.*)') THEN 'Paid Social'
          WHEN REGEXP_CONTAINS(source, 'dailymotion|disneyplus|netflix|youtube|vimeo|twitch|vimeo|youtube')
              AND REGEXP_CONTAINS(medium, r'^(.*cp.*|ppc|retargeting|paid.*)') THEN 'Paid Video'
          WHEN medium IN ('display', 'banner', 'expandable', 'interstitial', 'cpm', 'Display') THEN 'Display'
          WHEN REGEXP_CONTAINS(source, 'alibaba|amazon|google shopping|shopify|etsy|ebay|stripe|walmart')
              OR REGEXP_CONTAINS(campaign_name, r'^(.*(([^a-df-z]|^)shop|shopping).*)') THEN 'Organic Shopping'
          WHEN REGEXP_CONTAINS(source, 'badoo|facebook|fb|instagram|linkedin|pinterest|tiktok|twitter|whatsapp')
              OR medium IN ('social', 'social-network', 'social-media', 'sm', 'social network', 'social media') THEN 'Organic Social'
          WHEN REGEXP_CONTAINS(source, 'dailymotion|disneyplus|netflix|youtube|vimeo|twitch|vimeo|youtube')
              OR REGEXP_CONTAINS(medium, r'^(.*video.*)') THEN 'Organic Video'
          WHEN REGEXP_CONTAINS(source, 'baidu|bing|duckduckgo|ecosia|google|yahoo|yandex')
              OR medium = 'organic' THEN 'Organic Search'
          WHEN REGEXP_CONTAINS(source, 'email|e-mail|e_mail|e mail')
              OR REGEXP_CONTAINS(medium, 'email|e-mail|e_mail|e mail') THEN 'Email'
          WHEN medium = 'affiliate' THEN 'Affiliates'
          WHEN medium IN ('referral', 'app', 'link') THEN 'Referral'
          WHEN medium = 'audio' THEN 'Audio'
          WHEN medium = 'sms' OR source = 'sms' THEN 'SMS'
          WHEN medium LIKE '%push'
              OR REGEXP_CONTAINS(medium, 'mobile|notification')
              OR source IN ('firebase') THEN 'Mobile Push Notifications'
          WHEN REGEXP_CONTAINS(medium, r'^(offline|out( |-|_)of( |-|_)home)$') THEN 'Offline'
          WHEN medium = 'Print' THEN 'Print'
          ELSE 'Unassigned' 
        END AS session_default_channel_grouping
      FROM lowerValues   
    )`
}

/* Function #2
 * This function processes GA4 events data to create session-level channel groupings
 * based on traffic source attribution with a 30-day lookback window for non-direct traffic.
 */
function sessionDefaultChannelGrouping_withCollectedTrafficSource(startDate, endDate) {
  return `
    WITH events AS (
      SELECT
        CAST(event_date AS DATE FORMAT 'YYYYMMDD') AS date,
        CONCAT(user_pseudo_id, (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id')) AS session_id,
        user_pseudo_id,
        (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_start,
        collected_traffic_source,
        event_timestamp
      FROM
        \`\${dataform.projectConfig.defaultDatabase}.\${dataform.projectConfig.defaultSchema}.events_*\`
      WHERE
        (_table_suffix BETWEEN '${startDate}' AND '${endDate}')
    ),
    first_last_collected_traffic_source AS (
      SELECT
        MIN(date) AS date,
        session_id,
        user_pseudo_id,
        session_start,
        -- the traffic source of the first event in the session with session_start and first_visit excluded
        ARRAY_AGG(
          IF(
            collected_traffic_source IS NOT NULL,
            (
              SELECT AS STRUCT
                collected_traffic_source.* EXCEPT(manual_source, manual_medium),
                IF(collected_traffic_source.gclid IS NOT NULL, 'google', collected_traffic_source.manual_source) AS manual_source,
                IF(collected_traffic_source.gclid IS NOT NULL, 'cpc', collected_traffic_source.manual_medium) AS manual_medium
            ),
            NULL
          )
          ORDER BY event_timestamp ASC
          LIMIT 1
        )[SAFE_OFFSET(0)] AS session_first_traffic_source,
        -- the last not null traffic source of the session
        ARRAY_AGG(
          IF(
            collected_traffic_source IS NOT NULL,
            (
              SELECT AS STRUCT
                collected_traffic_source.* EXCEPT(manual_source, manual_medium),
                IF(collected_traffic_source.gclid IS NOT NULL, 'google', collected_traffic_source.manual_source) AS manual_source,
                IF(collected_traffic_source.gclid IS NOT NULL, 'cpc', collected_traffic_source.manual_medium) AS manual_medium
            ),
            NULL
          ) IGNORE NULLS
          ORDER BY event_timestamp DESC
          LIMIT 1
        )[SAFE_OFFSET(0)] AS session_last_traffic_source
      FROM
        events
      WHERE
        session_id IS NOT NULL
      GROUP BY
        session_id,
        user_pseudo_id,
        session_start
    ),
    flat_table AS (
      SELECT
        date,
        session_id,
        user_pseudo_id,
        session_start,
        session_first_traffic_source,
        IFNULL(
          session_first_traffic_source,
          LAST_VALUE(session_last_traffic_source IGNORE NULLS) OVER(
            PARTITION BY user_pseudo_id
            ORDER BY session_start 
            RANGE BETWEEN 2592000 PRECEDING AND 1 PRECEDING
            -- 30 day lookback
          )
        ) AS session_traffic_source_last_non_direct
      FROM
        first_last_collected_traffic_source
    ),
    final AS (
      SELECT
        user_pseudo_id,
        session_id,
        IFNULL(session_traffic_source_last_non_direct.manual_source, '(direct)') AS source,
        IFNULL(session_traffic_source_last_non_direct.manual_medium, '(none)') AS medium,
        session_traffic_source_last_non_direct.manual_campaign_name AS campaign
      FROM
        flat_table
      GROUP BY
        1, 2, 3, 4, 5
    ),
    applychannelGrouping AS (
      SELECT
        user_pseudo_id,
        session_id,
        CONCAT(source, "/", medium) AS sourcemedium,
        CASE
          WHEN source = '(direct)' AND (medium IN ('(not set)', '(none)')) THEN 'Direct'
          WHEN REGEXP_CONTAINS(campaign, 'cross-network') THEN 'Cross-network'
          WHEN (REGEXP_CONTAINS(source, 'alibaba|amazon|google shopping|shopify|etsy|ebay|stripe|walmart')
              OR REGEXP_CONTAINS(campaign, r'^(.*(([^a-df-z]|^)shop|shopping).*)$'))
              AND REGEXP_CONTAINS(medium, r'^(.*cp.*|ppc|retargeting|paid.*)$') THEN 'Paid Shopping'
          WHEN REGEXP_CONTAINS(source, 'baidu|bing|duckduckgo|ecosia|google|yahoo|yandex')
              AND REGEXP_CONTAINS(medium, r'^(.*cp.*|ppc|retargeting|paid.*)$') THEN 'Paid Search'
          WHEN REGEXP_CONTAINS(source, 'badoo|facebook|fb|instagram|linkedin|pinterest|tiktok|twitter|whatsapp')
              AND REGEXP_CONTAINS(medium, r'^(.*cp.*|ppc|retargeting|paid.*)$') THEN 'Paid Social'
          WHEN REGEXP_CONTAINS(source, 'dailymotion|disneyplus|netflix|youtube|vimeo|twitch|vimeo|youtube')
              AND REGEXP_CONTAINS(medium, r'^(.*cp.*|ppc|retargeting|paid.*)$') THEN 'Paid Video'
          WHEN medium IN ('display', 'banner', 'expandable', 'interstitial', 'cpm', 'Display') THEN 'Display'
          WHEN REGEXP_CONTAINS(source, 'alibaba|amazon|google shopping|shopify|etsy|ebay|stripe|walmart')
              OR REGEXP_CONTAINS(campaign, r'^(.*(([^a-df-z]|^)shop|shopping).*)$') THEN 'Organic Shopping'
          WHEN REGEXP_CONTAINS(source, 'badoo|facebook|fb|instagram|linkedin|pinterest|tiktok|twitter|whatsapp')
              OR medium IN ('social', 'social-network', 'social-media', 'sm', 'social network', 'social media') THEN 'Organic Social'
          WHEN REGEXP_CONTAINS(source, 'dailymotion|disneyplus|netflix|youtube|vimeo|twitch|vimeo|youtube')
              OR REGEXP_CONTAINS(medium, r'^(.*video.*)$') THEN 'Organic Video'
          WHEN REGEXP_CONTAINS(source, 'baidu|bing|duckduckgo|ecosia|google|yahoo|yandex')
              OR medium = 'organic' THEN 'Organic Search'
          WHEN REGEXP_CONTAINS(source, 'email|e-mail|e_mail|e mail')
              OR REGEXP_CONTAINS(medium, 'email|e-mail|e_mail|e mail') THEN 'Email'
          WHEN medium = 'affiliate' THEN 'Affiliates'
          WHEN medium IN ('referral', 'app', 'link') THEN 'Referral'
          WHEN medium = 'audio' THEN 'Audio'
          WHEN medium = 'sms' OR source = 'sms' THEN 'SMS'
          WHEN medium LIKE '%push'
              OR REGEXP_CONTAINS(medium, 'mobile|notification')
              OR source IN ('firebase') THEN 'Mobile Push Notifications'
          WHEN REGEXP_CONTAINS(medium, r'^(offline|out( |-|_)of( |-|_)home)$') THEN 'Offline'
          WHEN medium = 'Print' THEN 'Print'
          ELSE 'Unassigned' 
        END AS session_default_channel_grouping
      FROM final
    )
    SELECT * 
    FROM applychannelGrouping
  `
}

module.exports = {
  sessionDefaultChannelGrouping_withLastClickfield,
  sessionDefaultChannelGrouping_withCollectedTrafficSource
};