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

/**
 * Generates SQL for a single parameter unnest based on its configuration. By default, it will unnest FROM event_params column, but you cold change it to user_properties or items.item_params.
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
    value = `COALESCE(
            SAFE_CAST((SELECT value.int_value FROM UNNEST(${column}) WHERE key = '${config.name}') AS NUMERIC),
            SAFE_CAST((SELECT value.double_value FROM UNNEST(${column}) WHERE key = '${config.name}') AS NUMERIC),
            SAFE_CAST((SELECT value.float_value  FROM UNNEST(${column}) WHERE key = '${config.name}') AS NUMERIC)
          ) `;
  } else if (config.type === "string") {
    value = `
          (SELECT COALESCE(value.string_value, CAST(value.int_value AS STRING), CAST(value.float_value AS STRING), CAST(value.double_value AS STRING) ) FROM UNNEST(${column}) WHERE key = '${config.name}') `;
  } else {
    value = `(SELECT value.${config.type}_value FROM UNNEST(${column}) WHERE key = '${config.name}') `;
  }
  value = config.cleaningMethod ? config.cleaningMethod(value) : value;
  return `${value} AS ${config.renameTo ? config.renameTo : config.name}`;
};

/**
 * Generates SQL for multiple parameters unnest based on their configuration.
 * @param {Array} configArray - Array of parameter configuration objects
 * @param {string} [column='event_params'] - Column name containing the parameters
 * @returns {string} SQL fragment for multiple parameters unnest
 */
const generateParamsSQL = (configArray, column = "event_params") => {
  return `
      ${configArray
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
  return `${value} AS ${urlParam.renameTo ? urlParam.renameTo : urlParam.name}`;
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
 * @param {string} sql - SQL fragment
 * @returns {string} SQL fragment for struct creation
 */
const generateStructSQL = (sql) => {
  return `
    STRUCT (${sql})
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
 * @param {string} column - Column name
 * @param {Array} list - JavaScript array of values
 * @returns {string} SQL fragment for WHERE clause creation
 */
const generateFilterTypeFromListSQL = (type = "exclude", column, list) => {
  if (list.length == 0) return `true`;
  const filterType = type === "exclude" ? "not in" : "in";
  return `COALESCE(${column},"") ${filterType}  ${generateListSQL(list)}`;
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
 * Generates SQL to safely cast a column to a specified type. This method is used AS cleaningMethod in generateParamSQL method.
 * @param {string} columnName - Column name to be cast
 * @param {string} [type='INT64'] - Optional type, default is INT64
 * @returns {string} SQL fragment for safe casting
 */
const safeCastSQL = (columnName, type = "INT64") =>
  `SAFE_CAST(${columnName} AS ${type})`;

/**
 * Generates SQL to clear URL parameters. This method is used AS cleaningMethod in generateParamSQL method.
 * @param {string} columnName - Column name containing the URL
 * @returns {string} SQL fragment for URL clearing
 */
const clearURLSQL = (columnName) =>
  `REGEXP_REPLACE(${columnName}, r'(?i)&amp(;|=)', '&')`;

/**
 * Generates SQL to convert a column to lowercase. This method is used AS cleaningMethod in generateParamSQL method.
 * @param {string} columnName - Column name to be converted
 * @returns {string} SQL fragment for lowercase conversion
 */
const lowerSQL = (columnName) => `lower(${columnName})`;

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
    (key) => key.includes("LABEL_GENERIC_") || key.includes("LABEL_EXECUTION_")
  );

  // Format each label AS "key:value" and join with commas
  return keys
    .map((key) => {
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
    (key) => key.includes("GENERIC") && !key.includes("STORAGE")
  );

  // Return an object WHERE each key is a cleaned label name and value is FROM vars
  return Object.fromEntries(
    keys.map((key) => {
      const labelName = key.replace("LABEL_GENERIC_", "").toLowerCase();
      return [labelName, vars[key]];
    })
  );
};

// Returns a comma-separated list of labels formatted AS SQL-compatible tuples
// Example output: ('department', 'analytics'), ('cost_center', 'growth')
// Intended for use in BigQuery SET QUERIES clause to label tables
const storageUpdateLabels = () => {
  const vars = dataform.projectConfig.vars;

  return (
    Object.keys(vars)
      // Filter for generic labels that are not related to storage-specific configs
      .filter((key) => key.includes("GENERIC") && !key.includes("STORAGE"))
      // Convert each key-value pair into a SQL tuple string
      .map((key) => {
        const labelName = key.replace("LABEL_GENERIC_", "").toLowerCase();
        return `('${labelName}', '${vars[key]}')`;
      })
      // Join all tuples with commas to produce a valid SQL list
      .join(", ")
  );
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
  return (
    tables
      .map((table) => {
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
      .join("\n\n")
  );
}

/**
 * Sanitizes a string to be a valid BigQuery column name.
 * - Replaces invalid characters with underscores.
 * - Ensures the name starts with a letter or underscore.
 * - Converts to lowercase.
 * @param {string} columnName - The string to sanitize.
 * @returns {string} A valid BigQuery column name.
 */
const sanitizeBigQueryColumnName = (columnName) => {
  if (!columnName) {
    return null;
  }
  // Replace any character that is not a letter, number, or underscore with an underscore.
  let sanitizedName = columnName.replace(/[^a-zA-Z0-9_]/g, "_");
  // If the first character is a digit, prepend an underscore.
  if (/^[0-9]/.test(sanitizedName)) {
    sanitizedName = "_" + sanitizedName;
  }
  return sanitizedName.toLowerCase();
};

/**
 * Generates a SQL WHERE clause with LIKE operators for filtering.
 *
 * @param {string} [type='include'] - 'include' for LIKE, 'exclude' for NOT LIKE.
 * @param {string} column - The column to apply the filter on.
 * @param {Array<string>} list - A list of string patterns to match against.
 * @param {string} [logic='and'] - The logical operator ('and' or 'or') to join conditions.
 * @returns {string} - A SQL string for the WHERE clause.
 */
const generateFilterLikeSQL = (
  type = "include",
  column,
  list,
  logic = "and"
) => {
  if (!list || list.length === 0) {
    return "true";
  }

  const likeOperator = type === "exclude" ? "NOT LIKE" : "LIKE";

  const conditions = list.map((item) => `${column} ${likeOperator} '${item}'`);

  return `(\n  ${conditions.join(`\n  ${logic} `)}\n)`;
};

/*
 * Retrieves configuration for a specific module by type (core or custom)
 * @param {string} moduleName - The name of the module to get configuration for
 * @param {string} [configType='custom'] - The configuration type ('core' or 'custom')
 * @returns {Object} Merged configuration object FROM YAML and JSON files
 * @description
 * Attempts to load both YAML and JSON configuration files for the specified module and type.
 * If either file fails to load, an empty object is used AS fallback.
 * The function merges YAML config (as JSON) with JSON config, with JSON taking precedence.
 *
 * @example
 * // Get custom configuration for 'user' module
 * const config = getConfigByType('user', 'custom');
 *
 * // Get core configuration for 'auth' module
 * const coreConfig = getConfigByType('auth', 'core');
 */
const getConfigByType = (moduleName, configType = "custom") => {
  let yamlConfig;
  let jsonConfig;
  let jsConfig;
  try {
    const {
      asJson,
    } = require(`includes/${configType}/modules/${moduleName}/config.yaml`);
    yamlConfig = asJson;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `includes/${configType}/modules/${moduleName}/config.yaml: ` + error
      );
    }
    yamlConfig = {};
  }
  try {
    const jsonConfigFile = require(`includes/${configType}/modules/${moduleName}/config.json`);
    jsonConfig = jsonConfigFile;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `includes/${configType}/modules/${moduleName}/config.json: ` + error
      );
    }
    jsonConfig = {};
  }
  try {
    const jsConfigFile = require(`includes/${configType}/modules/${moduleName}/config.js`);
    jsConfig = jsConfigFile.config ? jsConfigFile.config :jsConfigFile.customConfig;
  } catch (error) {
    if (error instanceof SyntaxError) {
      throw new Error(
        `includes/${configType}/modules/${moduleName}/config.js: ` + error
      );
    }
    jsConfig = {};
  }
  return { ...yamlConfig, ...jsonConfig, ...jsConfig };
};

/**
 * Retrieves complete module configuration by merging core and custom configurations
 * @param {string} moduleName - The name of the module to get configuration for
 * @returns {Object} Merged configuration object combining core and custom configs
 * @description
 * Loads both core and custom configurations for the specified module and merges them.
 * Custom configuration takes precedence over core configuration in case of conflicts.
 *
 * @example
 * // Get complete configuration for 'profitReport' module
 * const fullConfig = getModuleConfig('profitReport');
 */
const getModuleConfig = (moduleName) => {
  const coreConfig = getConfigByType(moduleName, "core");
  const customConfig = getConfigByType(moduleName);
  const config = { ...coreConfig, ...customConfig };
  // throw Error(`${moduleName} config: ${JSON.stringify(coreConfig)}`);
  if ("ENABLED" in config) {
    config.enabled = config.ENABLED;
  }
  if ("VERSION" in config) {
    config.version = config.VERSION;
  }
  if (!("enabled" in config)) {
    throw new Error(`Module ${moduleName} config is missing enabled property`);
  }
  if (!("version" in config)) {
    throw new Error(`Module ${moduleName} config is missing version property`);
  }

  // Check for dependencies
  if ("dependencies" in config && config.dependencies.length > 0) {
    for (const dependency of config.dependencies) {
      try {
        const dependencyConfig = getModuleConfig(dependency);
        if (!dependencyConfig.enabled) {
          throw new Error(
            `Module ${moduleName}: Required dependency ${dependency} but it is disabled`
          );
        }
      } catch (error) {
        throw new Error(
          `Module ${moduleName}: Required dependency ${dependency} but cannot be found: ${error}`
        );
      }
    }
  }
  return config;
};

/**
 * @deprecated Use getModuleConfig("ga4") instead. This function is only kept for backward compatibility.
 * @returns {Object} Module configuration object
 */
const getConfig = () => {
  return getModuleConfig("ga4");
};

/**
 * Checks if a module is enabled based on its configuration
 * @param {string} moduleName - The name of the module to check
 * @returns {Object} Object containing the disabled status of the module. To use in the config section of the action.
 * @description
 * Retrieves the complete module configuration and checks if the module is enabled.
 * Returns an object with a 'disabled' property that is the inverse of the 'enabled' config.
 * If no 'enabled' property exists in the config, the module is considered disabled.
 *
 * @example
 * // Set disabled property in action config to true if module is disabled
 *  config {
 *   type: "table",
 *     ...require("includes/core/helpers.js").helpers.isModuleEnabled('profitReport')
 *   }
 *
 * @returns {Object} Object with disabled property
 * @returns {boolean} returns.disabled - True if module is disabled, false if enabled
 */
const isModuleEnabled = (moduleName) => {
  const config = getModuleConfig(moduleName);
  let enabled = false;

  if ("enabled" in config) {
    enabled = config.enabled;
  }
  return { disabled: !enabled };
};

const helpers = {
  generateFilterLikeSQL,
  checkColumnNames,
  generateParamsSQL,
  generateURLParamsSQL,
  generateStructSQL,
  generateListSQL,
  generateFilterTypeFromListSQL,
  generateArrayAggSQL,
  getSqlUnionAllFromRowsSQL,
  isModuleEnabled,
  urlDecodeSQL,
  safeCastSQL,
  clearURLSQL,
  lowerSQL,
  getConfig,
  getModuleConfig,
  storageLabels,
  executionLabels,
  storageUpdateLabels,
  generateAlterTableStatements,
  sanitizeBigQueryColumnName,
};

module.exports = {
  helpers,
};
