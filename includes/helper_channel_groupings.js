/**
 * Returns the merged core and custom configuration objects.
 * @returns {Object} Merged configuration object
 */
const getConfig = () => {
    const {
        coreConfig
    } = require("./config");
    const {
        customConfig
    } = require("./config");
    return {
        ...coreConfig,
        ...customConfig
    };
};

/* Function #1
 * Determines the default channel grouping for a given session based on source, medium, and campaign
 * based on combining google_ads_campaign and manual_campaign from session_traffic_source_last_click field
 *
 * @param {string} source - The traffic source (e.g., 'google', 'facebook').
 * @param {string} medium - The traffic medium (e.g., 'cpc', 'organic').
 * @param {string} campaign - The campaign name.
 * @returns {string} The channel grouping (e.g., 'Direct', 'Paid Search', 'Organic Social').
 * 
 */
const getdefaultChannelGroupingSQL = (recordField) => {
  // recordField should be "session_traffic_source_last_click"

  const source = `
    case
      when ${recordField}.google_ads_campaign.campaign_name is not null
           and ${recordField}.google_ads_campaign.campaign_name != '(not set)'
        then 'google'
      else ${recordField}.manual_campaign.source
    end
  `;

  const medium = `
    case
      when ${recordField}.google_ads_campaign.campaign_name is not null
           and ${recordField}.google_ads_campaign.campaign_name != '(not set)'
        then 'cpc'
      else ${recordField}.manual_campaign.medium
    end
  `;

  const campaign = `
    coalesce(${recordField}.google_ads_campaign.campaign_name,
             ${recordField}.manual_campaign.campaign_name)
  `;

  return `
    case
      when lower(${source}) = '(direct)' and lower(${medium}) in ('(not set)', '(none)')
        then 'Direct'

      when regexp_contains(lower(${campaign}), r"cross-network")
        then 'Cross-network'

      when (regexp_contains(lower(${source}), r"(alibaba|amazon|google shopping|shopify|etsy|ebay|stripe|walmart)")
            or regexp_contains(lower(${campaign}), r"(shop|shopping)"))
           and regexp_contains(lower(${medium}), r"^(.*cp.*|ppc|retargeting|paid.*)$")
        then 'Paid Shopping'

      when regexp_contains(lower(${source}), r"(baidu|bing|duckduckgo|ecosia|google|yahoo|yandex)")
           and regexp_contains(lower(${medium}), r"^(.*cp.*|ppc|retargeting|paid.*)$")
        then 'Paid Search'

      when regexp_contains(lower(${source}), r"(badoo|facebook|fb|instagram|linkedin|pinterest|tiktok|twitter|whatsapp)")
           and regexp_contains(lower(${medium}), r"^(.*cp.*|ppc|retargeting|paid.*)$")
        then 'Paid Social'

      when regexp_contains(lower(${source}), r"(dailymotion|disneyplus|netflix|youtube|vimeo|twitch)")
           and regexp_contains(lower(${medium}), r"^(.*cp.*|ppc|retargeting|paid.*)$")
        then 'Paid Video'

      when regexp_contains(lower(${medium}), r"(display|banner|expandable|interstitial|cpm)")
        then 'Display'

      when regexp_contains(lower(${source}), r"(alibaba|amazon|google shopping|shopify|etsy|ebay|stripe|walmart)")
           or regexp_contains(lower(${campaign}), r"(shop|shopping)")
        then 'Organic Shopping'

      when regexp_contains(lower(${source}), r"(badoo|facebook|fb|instagram|linkedin|pinterest|tiktok|twitter|whatsapp)")
           or regexp_contains(lower(${medium}), r"(social|social-network|social-media|sm|social network|social media)")
        then 'Organic Social'

      when regexp_contains(lower(${source}), r"(dailymotion|disneyplus|netflix|youtube|vimeo|twitch)")
           or regexp_contains(lower(${medium}), r"(.*video.*)")
        then 'Organic Video'

      when regexp_contains(lower(${source}), r"(baidu|bing|duckduckgo|ecosia|google|yahoo|yandex)")
           or lower(${medium}) = 'organic'
        then 'Organic Search'

      when regexp_contains(lower(${source}), r"(email|e-mail|e_mail|e mail)")
           or regexp_contains(lower(${medium}), r"(email|e-mail|e_mail|e mail)")
        then 'Email'

      when lower(${medium}) = 'affiliate'
        then 'Affiliates'

      when lower(${medium}) in ('referral','app','link')
        then 'Referral'

      when lower(${medium}) = 'audio'
        then 'Audio'

      when lower(${medium}) = 'sms' or lower(${source}) = 'sms'
        then 'SMS'

      when regexp_contains(lower(${medium}), r"(push|mobile|notification)")
           or lower(${source}) = 'firebase'
        then 'Mobile Push Notifications'

      when regexp_contains(lower(${medium}), r"(offline|out( |-|_)of( |-|_)home)")
        then 'Offline'

      when lower(${medium}) = 'print'
        then 'Print'

      else 'Unassigned'
    end
  `;
};

/* Function #2
 * This function processes GA4 events data to create session-level channel groupings
 * based on traffic source attribution with a 30-day lookback window for non-direct traffic.
//  */
// function sessionDefaultChannelGrouping_withCollectedTrafficSource(startDate, endDate) {
//     return `
//     WITH events AS (
//       SELECT
//         CAST(event_date AS DATE FORMAT 'YYYYMMDD') AS date,
//         CONCAT(user_pseudo_id, (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id')) AS session_id,
//         user_pseudo_id,
//         (SELECT value.int_value FROM UNNEST(event_params) WHERE key = 'ga_session_id') AS session_start,
//         collected_traffic_source,
//         event_timestamp
//         from ${ref ('events_*')}
//       WHERE
//         (_table_suffix >= '${startDate}' AND _table_suffix <= '${endDate}')')
//     ),
//     first_last_collected_traffic_source AS (
//       SELECT
//         MIN(date) AS date,
//         session_id,
//         user_pseudo_id,
//         session_start,
//         -- the traffic source of the first event in the session with session_start and first_visit excluded
//         ARRAY_AGG(
//           IF(
//             collected_traffic_source IS NOT NULL,
//             (
//               SELECT AS STRUCT
//                 collected_traffic_source.* EXCEPT(manual_source, manual_medium),
//                 IF(collected_traffic_source.gclid IS NOT NULL, 'google', collected_traffic_source.manual_source) AS manual_source,
//                 IF(collected_traffic_source.gclid IS NOT NULL, 'cpc', collected_traffic_source.manual_medium) AS manual_medium
//             ),
//             NULL
//           )
//           ORDER BY event_timestamp ASC
//           LIMIT 1
//         )[SAFE_OFFSET(0)] AS session_first_traffic_source,
//         -- the last not null traffic source of the session
//         ARRAY_AGG(
//           IF(
//             collected_traffic_source IS NOT NULL,
//             (
//               SELECT AS STRUCT
//                 collected_traffic_source.* EXCEPT(manual_source, manual_medium),
//                 IF(collected_traffic_source.gclid IS NOT NULL, 'google', collected_traffic_source.manual_source) AS manual_source,
//                 IF(collected_traffic_source.gclid IS NOT NULL, 'cpc', collected_traffic_source.manual_medium) AS manual_medium
//             ),
//             NULL
//           ) IGNORE NULLS
//           ORDER BY event_timestamp DESC
//           LIMIT 1
//         )[SAFE_OFFSET(0)] AS session_last_traffic_source
//       FROM
//         events
//       WHERE
//         session_id IS NOT NULL
//       GROUP BY
//         session_id,
//         user_pseudo_id,
//         session_start
//     ),
//     flat_table AS (
//       SELECT
//         date,
//         session_id,
//         user_pseudo_id,
//         session_start,
//         session_first_traffic_source,
//         IFNULL(
//           session_first_traffic_source,
//           LAST_VALUE(session_last_traffic_source IGNORE NULLS) OVER(
//             PARTITION BY user_pseudo_id
//             ORDER BY session_start 
//             RANGE BETWEEN 2592000 PRECEDING AND 1 PRECEDING
//             -- 30 day lookback
//           )
//         ) AS session_traffic_source_last_non_direct
//       FROM
//         first_last_collected_traffic_source
//     ),
//     final AS (
//       SELECT
//         user_pseudo_id,
//         session_id,
//         IFNULL(session_traffic_source_last_non_direct.manual_source, '(direct)') AS source,
//         IFNULL(session_traffic_source_last_non_direct.manual_medium, '(none)') AS medium,
//         session_traffic_source_last_non_direct.manual_campaign_name AS campaign
//       FROM
//         flat_table
//       GROUP BY
//         1, 2, 3, 4, 5
//     ),
//     applychannelGrouping AS (
//       SELECT
//         user_pseudo_id,
//         session_id,
//         CONCAT(source, "/", medium) AS sourcemedium,
//         CASE
//           WHEN source = '(direct)' AND (medium IN ('(not set)', '(none)')) THEN 'Direct'
//           WHEN REGEXP_CONTAINS(campaign, 'cross-network') THEN 'Cross-network'
//           WHEN (REGEXP_CONTAINS(source, 'alibaba|amazon|google shopping|shopify|etsy|ebay|stripe|walmart')
//               OR REGEXP_CONTAINS(campaign, r'^(.*(([^a-df-z]|^)shop|shopping).*)$'))
//               AND REGEXP_CONTAINS(medium, r'^(.*cp.*|ppc|retargeting|paid.*)$') THEN 'Paid Shopping'
//           WHEN REGEXP_CONTAINS(source, 'baidu|bing|duckduckgo|ecosia|google|yahoo|yandex')
//               AND REGEXP_CONTAINS(medium, r'^(.*cp.*|ppc|retargeting|paid.*)$') THEN 'Paid Search'
//           WHEN REGEXP_CONTAINS(source, 'badoo|facebook|fb|instagram|linkedin|pinterest|tiktok|twitter|whatsapp')
//               AND REGEXP_CONTAINS(medium, r'^(.*cp.*|ppc|retargeting|paid.*)$') THEN 'Paid Social'
//           WHEN REGEXP_CONTAINS(source, 'dailymotion|disneyplus|netflix|youtube|vimeo|twitch|vimeo|youtube')
//               AND REGEXP_CONTAINS(medium, r'^(.*cp.*|ppc|retargeting|paid.*)$') THEN 'Paid Video'
//           WHEN medium IN ('display', 'banner', 'expandable', 'interstitial', 'cpm', 'Display') THEN 'Display'
//           WHEN REGEXP_CONTAINS(source, 'alibaba|amazon|google shopping|shopify|etsy|ebay|stripe|walmart')
//               OR REGEXP_CONTAINS(campaign, r'^(.*(([^a-df-z]|^)shop|shopping).*)$') THEN 'Organic Shopping'
//           WHEN REGEXP_CONTAINS(source, 'badoo|facebook|fb|instagram|linkedin|pinterest|tiktok|twitter|whatsapp')
//               OR medium IN ('social', 'social-network', 'social-media', 'sm', 'social network', 'social media') THEN 'Organic Social'
//           WHEN REGEXP_CONTAINS(source, 'dailymotion|disneyplus|netflix|youtube|vimeo|twitch|vimeo|youtube')
//               OR REGEXP_CONTAINS(medium, r'^(.*video.*)$') THEN 'Organic Video'
//           WHEN REGEXP_CONTAINS(source, 'baidu|bing|duckduckgo|ecosia|google|yahoo|yandex')
//               OR medium = 'organic' THEN 'Organic Search'
//           WHEN REGEXP_CONTAINS(source, 'email|e-mail|e_mail|e mail')
//               OR REGEXP_CONTAINS(medium, 'email|e-mail|e_mail|e mail') THEN 'Email'
//           WHEN medium = 'affiliate' THEN 'Affiliates'
//           WHEN medium IN ('referral', 'app', 'link') THEN 'Referral'
//           WHEN medium = 'audio' THEN 'Audio'
//           WHEN medium = 'sms' OR source = 'sms' THEN 'SMS'
//           WHEN medium LIKE '%push'
//               OR REGEXP_CONTAINS(medium, 'mobile|notification')
//               OR source IN ('firebase') THEN 'Mobile Push Notifications'
//           WHEN REGEXP_CONTAINS(medium, r'^(offline|out( |-|_)of( |-|_)home)$') THEN 'Offline'
//           WHEN medium = 'Print' THEN 'Print'
//           ELSE 'Unassigned' 
//         END AS session_default_channel_grouping
//       FROM final
//     )
//     SELECT * 
//     FROM applychannelGrouping
//   `
// }

module.exports = {
    getdefaultChannelGroupingSQL
   // sessionDefaultChannelGrouping_withCollectedTrafficSource
};
