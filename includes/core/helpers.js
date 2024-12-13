
// function to generate the SQL

const { coreConfig } = require("./default_config");
const { customConfig } = require("../custom/config");


const generateTransactionsDedupeSQL = (tf) => {
  if(tf) {
        return `qualify duplicate_count = 1`
  } else {
     return ``
  }
}

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

const generateParamsSQL = (config_array, column = "event_params") => {
  return `
      ${config_array
        .map((config) => {
          return generateParamSQL(config, column);
        })
        .join(",\n")}
    `;
};

const generateURLParamSQL = (columnName, urlParam, urlDecode = true) => {
  let value = `regexp_extract(${columnName}, r"^[^#]+[?&]${urlParam.name}=([^&#]+)")`;
  value = urlParam.cleaningMethod ? urlParam.cleaningMethod(value) : value;
  value = urlDecode ? urlDecodeSQL(value) : value;
  return `${value} as ${urlParam.renameTo ? urlParam.renameTo : urlParam.name}`;
};

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

const generateStructSQL = (SQL) => {
  return `
    STRUCT (${SQL})
  `;
};

const generateListSQL = (list) => {
  return `('${list.join("','")}')`;
};

const generateFilterTypeFromListSQL = (type = "exclude", columm, list) => {
  if (list.length == 0) return `true`;
  const filterType = type === "exclude" ? "not in" : "in";
  return `${columm} ${filterType}  ${generateListSQL(list)}`;
};

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

const getDefaultChannelGroupingSQL = (
  custom_config,
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
          regexp_contains(${source}, r"^(${custom_config.SOCIAL_PLATFORMS_REGEX})$")
          or ${category} = 'SOURCE_CATEGORY_SOCIAL'
        )
        and regexp_contains(${medium}, r"^(.*cp.*|ppc|retargeting|paid.*)$")
        then 'Paid Social'
      when 
        regexp_contains(${source}, r"^(${custom_config.SOCIAL_PLATFORMS_REGEX})$")
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

const getClickIdsDimensionsSQL = (clickIds, prefix) => {
  return clickIds.map((id) => `${prefix}.${id.name}`).join(",\n");
};

const safeCastSQL = (columnName, type = "INT64") =>
  `safe_cast(${columnName} as ${type})`;

const clearURLSQL = (columnName) =>
  `REGEXP_REPLACE(${columnName}, r'(?i)&amp(;|=)', '&')`;

const lowerSQL = (columnName) => `lower(${columnName})`;

const generateClickIdCoalesceSQL = (clickId) => {
  if (clickId.sources.includes("collected_traffic_source")) {
    return `coalesce(collected_traffic_source.${clickId.name}, event_params.${clickId.name},click_ids.${clickId.name}) as ${clickId.name}`;
  }
  return `click_ids.${clickId.name} as ${clickId.name}`;
};

const generateClickIdCasesSQL = (parameterName, clickIdsArray) => {
  return clickIdsArray
    .map(
      (id) =>
        `when click_ids.${id.name} is not null then '${id[parameterName]}'`
    )
    .join("\n");
};

// Generic helper functions

const isStringInteger = (str) => {
  const num = Number(str);
  return Number.isInteger(num);
};

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

const getConfig = () => {
  return { ...coreConfig, ...customConfig };
};

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
  generateTransactionsDedupeSQL
};

module.exports = {
  helpers,
};
