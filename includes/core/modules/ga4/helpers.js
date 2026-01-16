/*
	This file is part of "GA4 Dataform Package".
	Copyright (C) 2023-2026 Superform Labs <support@superformlabs.eu>
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

const { helpers: coreHelpers } = require("includes/core/helpers");

/**
 * Generates SQL for the qualify statement in the transactions table
 * @param {boolean} tf - true or false, true: output, false: no output
 * @returns {string} SQL fragment for qualify statement to dedupe transactions
 */
const generateTransactionsDedupeSQL = (tf) => {
  if (tf) {
    return `qualify duplicate_count = 1`;
  } else {
    return ``;
  }
};

/**
 * Generates SQL to return the first or last value of an array aggregation. Special case for traffic_source structs. Used in sensitization.
 * @param {string} fixedTrafficSourceTable - Table name containing the traffic source data
 * @param {string} [columnName] - Optional column name for alias
 * @param {boolean} [orderTypeAsc=true] - Optional order type, default is ascending
 * @param {string} [orderBy='time.event_timestamp_utc'] - Optional order by clause
 * @returns {string} SQL fragment for array aggregation
 */
const generateTrafficSourceSQL = (
  fixedTrafficSourceTable,
  columnName = null,
  orderTypeAsc = true,
  orderBy = "time.event_timestamp_utc"
) => {
  const alias =
    columnName === null ? "" : `as ${columnName || "traffic_source"} `;
  const orderDirection = orderTypeAsc ? "asc" : "desc";

  return `
        array_agg(
            if(
                coalesce(
                    ${fixedTrafficSourceTable}.campaign_id,
                    ${fixedTrafficSourceTable}.campaign,
                    ${fixedTrafficSourceTable}.source,
                    ${fixedTrafficSourceTable}.medium,
                    ${fixedTrafficSourceTable}.term,
                    ${fixedTrafficSourceTable}.content
                ) is null,
                null,
                ${fixedTrafficSourceTable}
            )
            ignore nulls
            order by ${orderBy} ${orderDirection}
            limit 1
        )[safe_offset(0)] ${alias}`;
};

/**
 * Generates SQL to return the first or last value of an array aggregation. Special case for click_ids structs. Used in sensitization.
 * @param {string} clickIdStruct - Table name containing the click_ids data
 * @param {Array} clickIdsArray - Array of click_id configuration objects
 * @param {string} [columnName] - Optional column name for alias
 * @param {boolean} [orderTypeAsc=true] - Optional order type, default is ascending
 * @param {string} [orderBy='time.event_timestamp_utc'] - Optional order by clause
 * @returns {string} SQL fragment for array aggregation
 */
const generateClickIdTrafficSourceSQL = (
  clickIdStruct,
  clickIdsArray,
  columnName = null,
  orderTypeAsc = true,
  orderBy = "time.event_timestamp_utc"
) => {
  const alias = columnName === null ? "" : `as ${columnName || "click_id"} `;
  const orderDirection = orderTypeAsc ? "asc" : "desc";

  const coalesceItems = clickIdsArray
    .map((item) => `${clickIdStruct}.${item.name}`)
    .join(",\n");

  return `
        array_agg(
            if(
                coalesce(
                    ${coalesceItems}
                ) is null,
                null,
                ${clickIdStruct}
            )
            ignore nulls
            order by ${orderBy} ${orderDirection}
            limit 1
        )[safe_offset(0)] ${alias}`;
};

/**
 * Generates SQL for a CASE statement to determine the channel grouping based on provided parameters. This logic represents the default channel grouping logic in GA4.
 * @param {Object} config - Custom configuration object
 * @param {string} source - Source column name
 * @param {string} medium - Medium column name
 * @param {string} campaign - Campaign column name
 * @param {string} category - Category column name
 * @param {string} term - Term column name
 * @param {string} content - Content column name
 * @param {string} campaignId - Campaign ID column name
 * @returns {string} SQL fragment for CASE statement creation
 */
const getDefaultChannelGroupingSQL = (
  config,
  source,
  medium,
  campaign,
  category,
  term,
  content,
  campaignId
) => {
  return `
    case 
      when 
        (
          coalesce(${source}, ${medium}, ${campaign}, ${term}, ${content}, ${campaignId}) is null
        ) or (
          ${source} = 'direct'
          and (${medium} = '(none)' or ${medium} = '(not set)')
        ) 
        then 'Direct'
      when 
        (
          regexp_contains(${source}, r"^(${config.SOCIAL_PLATFORMS_REGEX})$")
          or ${category} = 'SOURCE_CATEGORY_SOCIAL'
        )
        and regexp_contains(${medium}, r"^(.*cp.*|ppc|retargeting|paid.*)$")
        then 'Paid Social'
      when 
        regexp_contains(${source}, r"^(${config.SOCIAL_PLATFORMS_REGEX})$")
        or ${medium} in ("social", "social-network", "social-media", "sm", "social network", "social media")
        or ${category} = 'SOURCE_CATEGORY_SOCIAL'
        then 'Organic Social'
      when 
        regexp_contains(${medium}, r"email|e-mail|e_mail|e mail|newsletter")
        or regexp_contains(${source}, r"email|e-mail|e_mail|e mail|newsletter")
        then 'Email'
      when 
        regexp_contains(${medium}, r"affiliate|affiliates")
        then 'Affiliates'
      when 
        ${category} = 'SOURCE_CATEGORY_SHOPPING'
        and regexp_contains(${medium}, r"^(.*cp.*|ppc|paid.*)$")
        then 'Paid Shopping'
      when 
        ${category} = 'SOURCE_CATEGORY_SHOPPING'
        or ${campaign} = 'Shopping Free Listings'
        or ${medium} = 'shopping_free'
        then 'Organic Shopping'
      when 
        (${category} = 'SOURCE_CATEGORY_VIDEO' and regexp_contains(${medium}, r"^(.*cp.*|ppc|paid.*)$"))
        or ${source} = 'dv360_video'
        then 'Paid Video'
      when 
        regexp_contains(${medium}, r"^(display|cpm|banner)$")
        or ${source} = 'dv360_display'
        then 'Display'
      when 
        ${category} = 'SOURCE_CATEGORY_SEARCH'
        and regexp_contains(${medium}, r"^(.*cp.*|ppc|retargeting|paid.*)$")
        then 'Paid Search'
      when 
        regexp_contains(${medium}, r"^(cpv|cpa|cpp|cpc|content-text)$")
        then 'Other Advertising'
      when 
        ${medium} = 'organic' or ${category} = 'SOURCE_CATEGORY_SEARCH'
        then 'Organic Search'
      when 
        ${category} = 'SOURCE_CATEGORY_VIDEO'
        or regexp_contains(${medium}, r"^(.*video.*)$")
        then 'Organic Video'
      when ${config.EXTRA_CHANNEL_GROUPS} and
        ${medium} = 'referral' and ${category} = 'SOURCE_CATEGORY_AI'
        then 'Organic AI'
      when 
        ${medium} in ("referral", "app", "link") -- VALIDATED?
        then 'Referral'
      when 
        ${medium} = 'audio'
        then 'Audio'
      when 
        ${medium} = 'sms'
        or ${source} = 'sms'
        then 'SMS'
      when 
        regexp_contains(${medium}, r"(mobile|notification|push$)")
        or ${source} = 'firebase'
        then 'Mobile Push Notifications'
      else '(Other)' 
    end
  `;
};

/**
 * Generates SQL to concatenate click_ids column names.
 * @param {Array} clickIds - Array of click_id configuration objects
 * @param {string} prefix - Prefix for the click_id column names
 * @returns {string} SQL fragment for click_id column names concatenation
 */
const getClickIdsDimensionsSQL = (clickIds, prefix) => {
  return clickIds.map((id) => `${prefix}.${id.name}`).join(",\n");
};

/**
 * Generates SQL to coalesce click_ids from different sources to return the first non-null value.
 * @param {Object} clickId - Click_id configuration object
 * @param {string} clickId.name - Name of the click_id
 * @returns {string} SQL fragment for click_id coalescing
 */
const generateClickIdCoalesceSQL = (clickId) => {
  if (clickId.sources.includes("collected_traffic_source")) {
    return `coalesce(collected_traffic_source.${clickId.name}, event_params.${clickId.name},click_ids.${clickId.name}) as ${clickId.name}`;
  }
  return `click_ids.${clickId.name} as ${clickId.name}`;
};

/**
 * Generates SQL to create a CASE statement for click_ids based on configuration CLICK_IDS_ARRAY. it return one of source/medium/campaign if click_id is not null.
 * @param {string} parameterName - Name of the parameter to be used in the CASE statement
 * @param {Array<{name: string, source: string, medium: string, campaign: string, sources: string[]}>>} clickIdsArray - Array of click_id configuration objects. Containd click_id name, and values that should be set if click_id is not null.
 * @returns {string} SQL fragment for click_id CASE statement creation
 */
const generateClickIdCasesSQL = (parameterName, clickIdsArray) => {
  return clickIdsArray
    .map(
      (id) =>
        `when click_ids.${id.name} is not null then '${id[parameterName]}'`
    )
    .join("\n");
};

const ga4Helpers = {
  generateTrafficSourceSQL,
  generateClickIdTrafficSourceSQL,
  getDefaultChannelGroupingSQL,
  getClickIdsDimensionsSQL,
  generateClickIdCoalesceSQL,
  generateClickIdCasesSQL,
  generateTransactionsDedupeSQL,
};

const helpers = { ...coreHelpers, ...ga4Helpers };

module.exports = {
  helpers,
};
