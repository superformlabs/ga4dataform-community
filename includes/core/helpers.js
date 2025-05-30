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

/**
 * Returns the merged core and custom configuration objects.
 * @returns {Object} Merged configuration object
 */
const getConfig = () => {
  const { coreConfig } = require("./default_config");
  const { customConfig } = require("../custom/config");
  return { ...coreConfig, ...customConfig };
};

/**
 * Generates SQL for the qualify statement in the transactions table
 * @param {boolean} tf - true or false, true: output, false: no output
 * @returns {string} SQL fragment for qualify statement to dedupe transactions
 */
const generateTransactionsDedupeSQL = (tf) => {
  if(tf) {
        return `qualify duplicate_count = 1`
  } else {
     return ``
  }
}

/**
 * Generates SQL for a single parameter unnest based on its configuration. By default, it will unnest from event_params column, but you cold change it to user_properties or items.item_params.
 * @param {Object} config - Parameter configuration object
 * @param {string} config.type - Data type ('decimal', 'string', 'integer, 'float, 'double')
 * @param {string} config.name - Parameter name
 * @param {string} [config.renameTo] - Optional new name for the parameter alias
 * @param {Function} [config.cleaningMethod] - Optional function to clean the value
 * @param {string} [column='event_params'] - Column name containing the parameters
 * @returns {string} SQL fragment for parameter unnest
 */
const generateParamSQL = (config, column = "event_params") => {
  let value = "";
  if (config.type === "decimal") {
    value = `coalesce(
            safe_cast((select value.int_value from unnest(${column}) where key = '${config.name}') as numeric),
            safe_cast((select value.double_value from unnest(${column}) where key = '${config.name}') as numeric),
            safe_cast((select value.float_value  from unnest(${column}) where key = '${config.name}') as numeric)
          ) `;
  } else if (config.type === "string") {
    value = `
          (select coalesce(value.string_value, cast(value.int_value as string), cast(value.float_value as string), cast(value.double_value as string) ) from unnest(${column}) where key = '${config.name}') `;
  } else {
    value = `(select value.${config.type}_value from unnest(${column}) where key = '${config.name}') `;
  }
  value = config.cleaningMethod ? config.cleaningMethod(value) : value;
  return `${value} as ${config.renameTo ? config.renameTo : config.name}`;
};

/**
 * Generates SQL for multiple parameters unnest based on their configuration.
 * @param {Array} config_array - Array of parameter configuration objects
 * @param {string} [column='event_params'] - Column name containing the parameters
 * @returns {string} SQL fragment for multiple parameters unnest
 */
const generateParamsSQL = (config_array, column = "event_params") => {
  return `
      ${config_array
        .map((config) => {
          return generateParamSQL(config, column);
        })
        .join(",\n")}
    `;
};

/**
 * Generates SQL for a single URL parameter extraction based on its configuration.
 * @param {string} columnName - Column name containing the URL parameters, usually 'event_params.page_location'
 * @param {Object} urlParam - URL parameter configuration object
 * @param {string} urlParam.name - Parameter name
 * @param {string} [urlParam.renameTo] - Optional alias for the parameter
 * @param {Function} [urlParam.cleaningMethod] - Optional function to clean the value
 * @param {boolean} [urlDecode=true] - Whether to URL decode the extracted value, default is true
 * @returns {string} SQL fragment for URL parameter extraction
 */
const generateURLParamSQL = (columnName, urlParam, urlDecode = true) => {
  let value = `regexp_extract(${columnName}, r"^[^#]+[?&]${urlParam.name}=([^&#]+)")`;
  value = urlParam.cleaningMethod ? urlParam.cleaningMethod(value) : value;
  value = urlDecode ? urlDecodeSQL(value) : value;
  return `${value} as ${urlParam.renameTo ? urlParam.renameTo : urlParam.name}`;
};

/**
 * Generates SQL for multiple URL parameters extraction based on their configuration.
 * @param {string} columnName - Column name containing the URL parameters, usually 'event_params.page_location'
 * @param {Array} urlParamsArray - Array of URL parameter configuration objects
 * @param {boolean} [urlDecode=true] - Whether to URL decode the extracted values, default is true
 * @returns {string} SQL fragment for multiple URL parameters extraction
 */
const generateURLParamsSQL = (columnName, urlParamsArray, urlDecode = true) => {
  // generate the SQL:
  return `
        ${urlParamsArray
          .map((urlParam) =>
            generateURLParamSQL(columnName, urlParam, urlDecode)
          )
          .join(",\n")}
      `;
};

/**
 * Generates SQL for a struct creation based on provided SQL.
 * @param {string} SQL - SQL fragment
 * @returns {string} SQL fragment for struct creation
 */
const generateStructSQL = (SQL) => {
  return `
    STRUCT (${SQL})
  `;
};

/**
 * Generates SQL for a list creation based on provided list.
 * @param {Array} list - JavaScript array of values
 * @returns {string} SQL fragment for list creation
 */
const generateListSQL = (list) => {
  return `('${list.join("','")}')`;
};

/**
 * Generates SQL for a WHERE clause based on provided list.
 * @param {string} type - Filter type ('exclude' or 'include')
 * @param {string} columm - Column name
 * @param {Array} list - JavaScript array of values
 * @returns {string} SQL fragment for WHERE clause creation
 */
const generateFilterTypeFromListSQL = (type = "exclude", columm, list) => {
  if (list.length == 0) return `true`;
  const filterType = type === "exclude" ? "not in" : "in";
  return `coalesce(${columm},"") ${filterType}  ${generateListSQL(list)}`;
};

/**
 * Generates SQL to return the first or last value of an array aggregation. Used in sensitization.
 * @param {string} paramName - Parameter name
 * @param {string} [columnName] - Optional column name for alias
 * @param {boolean} [orderTypeAsc=true] - Optional order type, default is ascending
 * @param {string} [orderBy='time.event_timestamp_utc'] - Optional order by clause
 * @returns {string} SQL fragment for array aggregation
 */
const generateArrayAggSQL = (
  paramName,
  columnName = false,
  orderTypeAsc = true,
  orderBy = "time.event_timestamp_utc"
) => {
  const alias =
    columnName === null ? "" : `AS ${columnName ? columnName : paramName} `;
  return `ARRAY_AGG(${paramName} IGNORE NULLS ORDER BY ${orderBy} ${
    orderTypeAsc ? "ASC" : "DESC"
  } LIMIT 1)[SAFE_OFFSET(0)] ${alias}`;
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
 * Generates SQL to generate SELECT statements for a single object.
 * @param {Object} config - Data object
 * @returns {string} SQL fragment for SELECT statement creation
 */
const getSqlSelectFromRowSQL = (config) => {
  return Object.entries(config)
    .map(([key, value]) => {
      if (typeof value === "number") {
        return `${value} AS ${key}`;
      } else if (key === "date") {
        return `DATE '${value}' AS ${key}`;
      } else if (key === "event_timestamp" && !/^\d+$/.test(value)) {
        return `TIMESTAMP '${value}' AS ${key}`;
      } else if (key === "session_start" && !/^\d+$/.test(value)) {
        return `TIMESTAMP '${value}' AS ${key}`;
      } else if (key === "session_end" && !/^\d+$/.test(value)) {
        return `TIMESTAMP '${value}' AS ${key}`;
      } else if (typeof value === "string") {
        if (key === "int_value") return `${parseInt(value)} AS ${key}`;
        if (key.indexOf("timestamp") > -1)
          return `${parseInt(value)} AS ${key}`;
        if (key === "float_value" || key === "double_value")
          return `${parseFloat(value)} AS ${key}`;
        return `'${value}' AS ${key}`;
      } else if (value === null) {
        return `${value} AS ${key}`;
      } else if (value instanceof Array) {
        return `[${getSqlSelectFromRowSQL(value)}] AS ${key}`;
      } else {
        if (isStringInteger(key))
          return `STRUCT(${getSqlSelectFromRowSQL(value)})`;
        else return `STRUCT(${getSqlSelectFromRowSQL(value)}) AS ${key}`;
      }
    })
    .join(", ");
};

/**
 * Generates SQL to generate SELECT statements for list of objects and concatenate them with UNION ALL. Needed to create list of source_categories based on JSON config.
 * @param {Array} rows - Array of data objects
 * @returns {string} SQL fragment for UNION ALL concatenation
 */
const getSqlUnionAllFromRowsSQL = (rows) => {
  try {
    const selectStatements = rows
      .map((data) => "SELECT " + getSqlSelectFromRowSQL(data))
      .join("\nUNION ALL\n ");
    return selectStatements;
  } catch (err) {
    console.error("Error reading or parsing rows", err);
  }
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
 * @param {string} campaign_id - Campaign ID column name
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
  campaign_id
) => {
  return `
    case 
      when 
        (
          coalesce(${source}, ${medium}, ${campaign}, ${term}, ${content}, ${campaign_id}) is null
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
 * Generates SQL to URL decode a column. Used to clean up URL parameters, like utm_source e.
 * @param {string} urlColumnName - Column name containing the URL
 * @returns {string} SQL fragment for URL decoding
 */
const urlDecodeSQL = (urlColumnName) => {
  return `
  (
  SELECT SAFE_CONVERT_BYTES_TO_STRING(
    ARRAY_TO_STRING(ARRAY_AGG(
        IF(STARTS_WITH(y, '%'), FROM_HEX(SUBSTR(y, 2)), CAST(y AS BYTES)) ORDER BY i
      ), b''))
  FROM UNNEST(REGEXP_EXTRACT_ALL(${urlColumnName}, r"%[0-9a-fA-F]{2}|[^%]+")) AS y WITH OFFSET AS i
  )`;
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
 * Generates SQL to safely cast a column to a specified type. This method is used as cleaningMethod in generateParamSQL method.
 * @param {string} columnName - Column name to be cast
 * @param {string} [type='INT64'] - Optional type, default is INT64
 * @returns {string} SQL fragment for safe casting
 */
const safeCastSQL = (columnName, type = "INT64") =>
  `safe_cast(${columnName} as ${type})`;

/**
 * Generates SQL to clear URL parameters. This method is used as cleaningMethod in generateParamSQL method.
 * @param {string} columnName - Column name containing the URL
 * @returns {string} SQL fragment for URL clearing
 */
const clearURLSQL = (columnName) =>
  `REGEXP_REPLACE(${columnName}, r'(?i)&amp(;|=)', '&')`;

/**
 * Generates SQL to convert a column to lowercase. This method is used as cleaningMethod in generateParamSQL method.
 * @param {string} columnName - Column name to be converted
 * @returns {string} SQL fragment for lowercase conversion
 */
const lowerSQL = (columnName) => `lower(${columnName})`;

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

// Generic helper functions

/**
 * Checks if a string can be safely converted to an integer. Helper function for getSqlSelectFromRowSQL
 * @param {string} str - String to be checked
 * @returns {boolean} True if the string can be safely converted to an integer, false otherwise
 */
const isStringInteger = (str) => {
  const num = Number(str);
  return Number.isInteger(num);
};

/**
 * Checks for duplicate column names and invalid column names in the configuration. To make a sanity check before using the config in models.
 * @param {Object} config - Configuration object
 * @returns {boolean} True if the configuration is valid, false otherwise
 */
const checkColumnNames = (config) => {
  // column checker helper function
  const sanityCheck = (configArray, description) => {
    if (configArray === undefined) {
      return true; //silently ignore
    }
    if (typeof configArray[Symbol.iterator] !== "function") {
      return true; //silently ignore
    }

    const cols = new Set();
    for (const obj of configArray) {
      const col = obj.renameTo || obj.name;
      if (cols.has(col)) {
        throw new Error(
          "Duplicate column: `" + col + "` found in " + description ||
            "config" + " - please rename"
        );
      }
      // Check for malformed outputName
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col) || col.includes(" ")) {
        throw new Error(
          "Invalid column name: `" + col + "` found in " + description ||
            "config" + " - please rename"
        );
      }
      cols.add(col);
    }
    return true; // No duplicates found
  };

  sanityCheck(config.CUSTOM_EVENT_PARAMS_ARRAY, "custom event params");
  sanityCheck(config.CUSTOM_USER_PROPERTIES_ARRAY, "user properties");
  sanityCheck(config.CUSTOM_ITEM_PARAMS_ARRAY, "custom item parameters");
  sanityCheck(config.CUSTOM_URL_PARAMS_ARRAY, "custom url parameters");

  return true;
};



// Returns a comma-separated string of execution labels in the format "key:value"
// Used for dynamically tagging BigQuery jobs with labels
const executionLabels = () => {
  const vars = dataform.projectConfig.vars;

  // Filter keys that are either generic or execution-specific labels
  const keys = Object.keys(vars).filter(
    key => key.includes("LABEL_GENERIC_") || key.includes("LABEL_EXECUTION_")
  );

  // Format each label as "key:value" and join with commas
  return keys
    .map(key => {
      const labelName = key
        .replace("LABEL_GENERIC_", "")
        .replace("LABEL_EXECUTION_", "")
        .toLowerCase();
      return `${labelName}:${vars[key]}`;
    })
    .join(", ");
};

// Returns an object of key-value pairs for storage labels
// Used to apply table-level labeling
const storageLabels = () => {
  const vars = dataform.projectConfig.vars;

  // Select only generic labels that are not storage-specific
  const keys = Object.keys(vars).filter(
    key => key.includes("GENERIC") && !key.includes("STORAGE")
  );

  // Return an object where each key is a cleaned label name and value is from vars
  return Object.fromEntries(
    keys.map(key => {
      const labelName = key.replace("LABEL_GENERIC_", "").toLowerCase();
      return [labelName, vars[key]];
    })
  );
};


// Returns a comma-separated list of labels formatted as SQL-compatible tuples
// Example output: ('department', 'analytics'), ('cost_center', 'growth')
// Intended for use in BigQuery SET QUERIES clause to label tables
const storageUpdateLabels = () => {
  const vars = dataform.projectConfig.vars;

  return Object.keys(vars)
    // Filter for generic labels that are not related to storage-specific configs
    .filter(
      key => key.includes("GENERIC") && !key.includes("STORAGE")
    )
    // Convert each key-value pair into a SQL tuple string
    .map(key => {
      const labelName = key.replace("LABEL_GENERIC_", "").toLowerCase();
      return `('${labelName}', '${vars[key]}')`;
    })
    // Join all tuples with commas to produce a valid SQL list
    .join(", ");
};


/**
 * Generates a series of ALTER TABLE statements to apply storage labels
 * to a list of BigQuery tables, based on naming conventions.
 *
 * @param {string[]} tables - Array of table names (without dataset prefix).
 * @returns {string} - A string containing ALTER TABLE SQL statements.
 */
function generateAlterTableStatements(tables) {
  // Access project-level variables defined in dataform.json or dataform project config
  const vars = dataform.projectConfig.vars;

  // Generate the label string, e.g., ('department', 'analytics'), ('env', 'prod')
  const labelString = storageUpdateLabels();

  // Loop through each table to create an ALTER TABLE statement
  return tables
    .map(table => {
      let dataset;

      // Decide which dataset the table belongs to based on its name prefix
      // Tables starting with 'int_' are in the TRANSFORMATIONS_DATASET
      // Others are in the OUTPUTS_DATASET
      if (table.startsWith("int_")) {
        dataset = vars.TRANSFORMATIONS_DATASET;
      } else {
        dataset = vars.OUTPUTS_DATASET;
      }

      // Construct and return the SQL string for setting table labels
      return `ALTER TABLE \`${dataset}.${table}\`\nSET OPTIONS (\n  labels = [${labelString}]);`;
    })

    // Join all statements with line breaks to form the full script
    .join("\n\n");
}



const helpers = {
  checkColumnNames,
  generateParamsSQL,
  generateURLParamsSQL,
  generateStructSQL,
  generateListSQL,
  generateFilterTypeFromListSQL,
  generateArrayAggSQL,
  generateTrafficSourceSQL,
  generateClickIdTrafficSourceSQL,
  getSqlUnionAllFromRowsSQL,
  getDefaultChannelGroupingSQL,
  urlDecodeSQL,
  safeCastSQL,
  clearURLSQL,
  lowerSQL,
  getClickIdsDimensionsSQL,
  getConfig,
  generateClickIdCoalesceSQL,
  generateClickIdCasesSQL,
  generateTransactionsDedupeSQL,
  storageLabels,
  executionLabels,
  storageUpdateLabels,
  generateAlterTableStatements
};

module.exports = {
  helpers
};
