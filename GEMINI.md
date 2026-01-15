# Persona

You are a senior Dataform data engineer. One of those rare 10x engineers that has incredible knowledge.

# Project Structure Rules

## General Structure

### Core Principle

- **All models (SQLX files) go in `definitions/`**
- **All configs and helpers go in `includes/`**

### Core vs Custom Folders

#### Core Folders (`definitions/core/`, `includes/core/`)

- Core folders contain the base package files
- **WARNING**: During package updates, the installer **deletes all core folders** and replaces them with the latest version
- **Never place custom models or modifications in core folders** - they will be lost on update

#### Custom Folders (`definitions/custom/`, `includes/custom/`)

- Custom folders are for user-specific customizations
- Files in custom folders are **preserved** during package updates
- **All custom models must be placed in `definitions/custom/`** or they will be deleted during updates
- Custom configs override core configs (merged)

## Directory Structure

definitions/
├── core/ # Base package models (deleted on update)
│   ├── modules/ # Module-specific models
│   │   ├── demo/ # Demo module models
│   │   │   └── [demo SQLX files]
│   │   └── ga4/ # GA4 module models
│   │       ├── 01_sources/ # Source declarations
│   │       ├── 02_intermediate/ # Intermediate tables
│   │       ├── 03_outputs/ # Output tables
│   │       ├── assertions/ # Data quality assertions
│   │       └── extra/ # Additional source files
│   └── utility/ # Utility models
└── custom/ # Custom models (preserved on update)
    └── [your custom models here]

includes/
├── core/ # Base package configs/helpers (deleted on update)
│   ├── helpers.js # Core helper functions
│   ├── documentation/ # Table documentation JSON files
│   │   ├── helpers.js # Documentation helpers
│   │   └── modules/ # Module-specific documentation
│   │       └── ga4/ # GA4 table documentation JSON files
│   └── modules/ # Module-specific configs and helpers
│       ├── demo/ # Demo module configs
│       └── ga4/ # GA4 module configs
│           ├── config.js # Module configuration
│           ├── helpers.js # Module helper functions
│           └── extra/ # Additional module configs
└── custom/ # Custom configs (preserved on update)
    ├── config.js # ⚠️ DEPRECATED: Outdated file kept for backward compatibility only. Do not use for new projects. Re-exports from modules/ga4/config.js
    └── modules/ # Custom module configs
        ├── demo/ # Custom demo module configs
        └── ga4/ # Custom GA4 module configs
            └── config.js # ✅ USE THIS: Main GA4 custom configuration file
            
### Important: Custom Configuration File Location

**⚠️ Deprecated File: `includes/custom/config.js`**

The file `includes/custom/config.js` is **outdated and should not be used** for new projects or modifications. It is kept only for backward compatibility and re-exports the configuration from the new location.

**✅ Use Instead: `includes/custom/modules/ga4/config.js`**

All custom GA4 configuration should be done in `includes/custom/modules/ga4/config.js`. This file follows the modular structure and is the correct location for all custom GA4 module settings.

The old `includes/custom/config.js` file automatically re-exports from the new location to maintain backward compatibility with existing code that may still reference it, but you should update any references to use the new path.

## workflow_settings.yaml

The `workflow_settings.yaml` file contains global configuration variables for the Dataform project.

### Structure

- **Global default variables** are defined at the root level (e.g., `defaultAssertionDataset`, `defaultLocation`, `defaultProject`)
- **Custom variables** are defined inside the `vars` section

### Adding Global Variables

If a variable needs to be accessible globally throughout the project (in SQLX files, JavaScript blocks, etc.), it should be added to the `vars` section:

```yaml
vars:
  GA4_DATASET: analytics_31337
  OUTPUTS_DATASET: superform_outputs_31337
  YOUR_CUSTOM_VAR: your_value
```

### Accessing Variables

Variables defined in `vars` can be accessed in SQLX files and JavaScript blocks using:

```javascript
dataform.projectConfig.vars.VARIABLE_NAME;
```

Example:

```sqlx
config {
    type: "table",
    schema: dataform.projectConfig.vars.OUTPUTS_DATASET,
    // ...
}
```

## Best Practices

1. **Always place custom models in `definitions/custom/`** - never in core folders
2. **Use standard helpers when possible** - avoid creating duplicate functionality
3. **Follow the structure** - use proper folder organization (01_sources, 02_intermediate, 03_outputs)

# SQLX File Guidelines

## SQLX File Structure Guidelines

SQLX files consist of a config block and a body. All config properties, and the config block itself, are optional. Any plain SQL file is a valid SQLX file that Dataform runs as-is.

### Config Block

The config block is optional and allows you to:

#### Specify Query Metadata

Configure how Dataform materializes queries into BigQuery:

- **type**: Specify the output table type (`"table"`, `"view"`, `"incremental"`, `"declaration"`, `"operation"`)
- **schema**: Target dataset/schema name
- **name**: Output table or view name (if different from filename)
- **database**: Target project ID

### SQLX File Body

The body of a SQLX file contains:

#### Define Tables with Dependencies

Use SQL `SELECT` statements and the `ref()` function to reference tables defined in your Dataform project:

```sqlx
config { type: "table" }

SELECT
  order_date AS date,
  order_id AS order_id,
  order_status AS order_status,
  SUM(item_count) AS item_count,
  SUM(amount) AS revenue
FROM ${ref(dataform.projectConfig.defaultProject, dataform.projectConfig.vars.OUTPUTS_DATASET, "store_clean")}
GROUP BY 1, 2, 3
```

**Key Points:**

- Always use `ref()` function with full path: `${ref("project", "dataset", "table")}` for all table references
- Use `dataform.projectConfig.defaultProject` for the project parameter when referencing tables in the default project
- Use `dataform.projectConfig.vars.OUTPUTS_DATASET` for the dataset parameter when referencing tables in the outputs dataset
- Dataform uses `ref()` to build the dependency tree automatically
- After compilation, Dataform adds boilerplate statements like `CREATE`, `REPLACE`, or `INSERT`, don't add them yourself

#### JavaScript Blocks in SQLX Files

Use JavaScript blocks (`js {}`) to define reusable functions and variables for generating repetitive SQL code:

```sqlx
js {
  const columnName = "foo";
  const tableName = "users";
}

SELECT 1 AS ${columnName} FROM ${ref(dataform.projectConfig.defaultProject, dataform.projectConfig.vars.OUTPUTS_DATASET, tableName)}
```

**Guidelines:**

- JavaScript blocks are scoped to the SQLX file where they are defined
- For code reuse across the entire repository, use includes files instead
- Use inline JavaScript expressions `${...}` anywhere in the SQL body
- Prefer constants and simple expressions over complex logic
- Always check first do you already have existing helpers methods before creating new
- To get global configuration from `workflow_settings.yaml` variables use dataform.projectConfig like dataform.projectConfig.defaultProject or dataform.projectConfig.vars.OUTPUTS_DATASET

#### Pre-Operations and Post-Operations Blocks

Configure SQL statements to run before or after creating a table or view:

```sqlx
config {
  type: "table"
}

SELECT * FROM ${ref(dataform.projectConfig.defaultProject, dataform.projectConfig.vars.OUTPUTS_DATASET, "source_name")}

pre_operations {
  CREATE TEMP FUNCTION AddFourAndDivide(x INT64, y INT64)
    RETURNS FLOAT64
    AS ((x + 4) / y);
}

post_operations {
  GRANT `roles/bigquery.dataViewer` ON TABLE ${self()} TO "group:someusers@dataform.co";
}
```

**Use Cases:**

- **pre_operations**: Create temporary functions, set variables, or perform cleanup before table creation
- **post_operations**: Grant permissions, insert audit logs, or perform additional operations after table creation
- Use `${self()}` to reference the current table being created

## SQLX Best Practices

1. **Always use `ref()`**: Never hardcode schema or table names. Always use `${ref("project", "dataset", "table")}` for all table references. When referencing tables in the default project, use `dataform.projectConfig.defaultProject` for the project parameter. When referencing tables in the outputs dataset, use `dataform.projectConfig.vars.OUTPUTS_DATASET` for the dataset parameter.
2. **Keep JavaScript simple**: Use JavaScript blocks for simple variable definitions and loops. Complex logic belongs in includes files.
3. **Minimize operations blocks**: Only use pre/post_operations when necessary. Prefer including logic in the main query when possible.

## SQLX Query Style

- Use SQL for BigQuery dialect (Standard SQL), not legacy SQL or other database dialects.
- Always use CTEs for readability.
- Name CTEs using `snake_case`.
- For intermediate CTEs add `_tbl` at the end
- Never use CREATE TABLE statement, create new action and let Dataform to generate CREATE TABLE based on config block
- Avoid deeply nested SQL; break logic into intermediate CTE layers.
- Use `safe` operations in BigQuery when possible (e.g., `SAFE_CAST`).

## SQLX Naming Conventions

### Table Naming

- Use `snake_case` for all table names
- **Core output tables**: Prefix with `ga4_` (e.g., `ga4_events`, `ga4_sessions`, `ga4_transactions`)
- **Intermediate tables**: Prefix with `int_` (e.g., `int_ga4_sessions`, `int_ga4_transactions`)
- **Dimension tables**: Prefix with `dim_` (e.g., `dim_gads_accounts`, `dim_gads_campaigns`)
- **Report tables**: Prefix with `report_` (e.g., `report_items_funnel`, `report_cvr_per_event`)

### Column Naming

- Use `snake_case` for all column names
- **Boolean columns**: Prefix with `is_` (e.g., `is_final`, `is_active_user`, `is_engaged_session`)
- **Timestamp columns**: Suffix with `_timestamp_utc` for UTC timestamps (e.g., `event_timestamp_utc`, `session_start_timestamp_utc`), `_timestamp` for other timestamps, or `_timestamp_local` for local timezone
- **Date columns**: Suffix with `_date` (e.g., `event_date`, `session_date`, `transaction_date`)
- **ID columns**: Suffix with `_id` (e.g., `user_id`, `session_id`, `transaction_id`, `property_id`)
- **Count/total columns**: Suffix with `_count` for counts, `_total` for totals, `_quantity` for quantities
- **Revenue columns**: Include `_revenue` (e.g., `item_revenue`, `purchase_revenue`, `item_revenue_in_usd`)
- **Struct columns**: Use descriptive names (e.g., `time`, `device`, `geo`, `session_source`, `ecommerce`)
- **Metadata columns**: Prefix with `_` for system columns (e.g., `_run_timestamp`, `_table_suffix`)

# Dataform JavaScript Guidelines

## JavaScript usage inside Dataform

Use JavaScript blocks (`js {}`) to define reusable functions and variables for generating repetitive SQL code:

```sqlx
js {
  const columnName = "foo";
  const tableName = "users";
}

SELECT 1 AS ${columnName} FROM ${ref(dataform.projectConfig.defaultProject, dataform.projectConfig.vars.OUTPUTS_DATASET, tableName)}
```

**Guidelines:**

- JavaScript blocks are scoped to the SQLX file where they are defined
- For code reuse across the entire repository, use includes files instead
- Use inline JavaScript expressions `${...}` anywhere in the SQL body
- Prefer constants and simple expressions over complex logic
- Always check first do you already have existing helpers methods before creating new
- To get global configuration from `workflow_settings.yaml` variables use dataform.projectConfig like dataform.projectConfig.defaultProject or dataform.projectConfig.vars.OUTPUTS_DATASET

## Helper Library Module Exports

**Guidelines for helper library files (includes/\*.js):**

- **Module Exports**: Only export public API functions in `module.exports`. Do NOT export internal helper functions, constants, or utility functions that are only used within the same file.

- **Using Helpers in SQLX Files**: Always use `require()` inside `js {}` blocks to import helper functions

## Configuration Files

**Guidelines for configuration files (includes/_/modules/_/config.json or config.yaml):**

- **File Format Selection**:

  - **YAML (`.yaml`)**: Preferred for flat or simple structures where comments are beneficial for documentation
    - Use when you need inline comments to explain configuration options
    - Good for configurations with many boolean flags or simple key-value pairs
    - Example: Module enable/disable flags, simple lists, date ranges
  - **JSON (`.json`)**: Use for complex nested structures or when the structure itself is self-documenting
    - Use when you have deeply nested objects or arrays of objects
    - Good for configurations with complex object hierarchies
    - Example: Multi-level drilldowns, complex parameter arrays

- **Naming Consistency**: Always follow existing naming conventions from other config files in the repository. Do NOT create new names for the same concept.

  - ✅ **Correct**: Use existing field names like `enabled`, `version`, `exclude_params`, `include_events`
  - ❌ **Incorrect**: Creating new names like `active`, `enabled_flag`, `excluded_params`, `included_events` when similar fields already exist

- **Field Naming Conventions in Config Files**:

  - **Simple properties and arrays**: Use `snake_case`
    - Examples: `enabled`, `version`, `start_date`, `max_lookback_days`, `exclude_params`, `include_events`, `conversion_action_names`, `sample_value_count_daily`
  - **Object properties**: Use `snake_case`
    - Examples: `drilldowns`, `item_drilldowns`, `item_params_custom`, `session_dimensions`
  - **Boolean flags**: Use `snake_case`
    - Examples: `enabled`, `exclude_params`, `include_events`
  - **Date fields**: Use `snake_case` with descriptive suffix
    - Examples: `start_date`, `max_lookback_days`
  - **Array fields**: Use `snake_case` plural form
    - Examples: `exclude_params`, `include_events`, `conversion_action_names`

- **Loading Configuration Files in JavaScript**:

  ```javascript
  // Loading YAML config file (returns object with .asJson property)
  const yamlConfig =
    require("includes/custom/modules/module_name/config.yaml").asJson;

  // Loading JSON config file (returns object directly)
  const jsonConfig = require("includes/custom/modules/module_name/config.json");
  ```

## Naming Conventions

### Function Names

- **Functions that return SQL query parts or fragments**: Must end with "SQL" suffix
  - Examples: `generateParamSQL()`, `generateParamsSQL()`, `generateURLParamSQL()`, `urlDecodeSQL()`, `safeCastSQL()`, `getDefaultChannelGroupingSQL()`, `generateEventCountsSQL()`, `anomalySeriesBaseQuerySQL()`
  - This applies to any function that returns a string containing SQL code, SQL fragments, or SQL expressions
- **Functions that do NOT return SQL**: Use camelCase without "SQL" suffix
  - Examples: `getConfig()`, `getConfigByType()`, `getModuleConfig()`, `checkColumnNames()`, `sanitizeBigQueryColumnName()`, `isModuleEnabled()`, `formatSQLValue()`, `buildParamFilterCondition()`
  - This includes utility functions, configuration getters, validators, and data transformation functions

### Variable Names

- **Constants in config JavaScript files**: Use UPPER_SNAKE_CASE
  - Examples: `VALID_AGGREGATIONS`, `VALID_MODES`, `DEFAULT_PLACEHOLDER`, `GA4_START_DATE`, `EXTRA_CHANNEL_GROUPS`
  - Applies to module-level constants, configuration constants, and immutable values
- **Regular Variables**: Use camelCase
  - Examples: `columnListString`, `aggregationExpression`, `config`, `paramName`, `fieldName`, `eventFilterCondition`
  - Applies to function parameters, local variables, and object properties

## General JavaScript Recommendations

### Coding Guidelines

Follow these guidelines to ensure your code is clean, maintainable, and adheres to best practices. Remember, less code is better. Lines of code = Debt.

### Key Mindsets

**1** **Simplicity**: Write simple and straightforward code.
**2** **Readability**: Ensure your code is easy to read and understand.
**3** **Performance**: Keep performance in mind but do not over-optimize at the cost of readability.
**4** **Maintainability**: Write code that is easy to maintain and update.
**5** **Testability**: Ensure your code is easy to test.
**6** **Reusability**: Write reusable components and functions.

### General Code Guidelines

**1** **Utilize Early Returns**: Use early returns to avoid nested conditions and improve readability.
**2** **Conditional Classes**: Prefer conditional classes over ternary operators for class attributes.
**3** **Descriptive Names**: Use descriptive names for variables and functions. Prefix event handler functions with "handle" (e.g., handleClick, handleKeyDown).
**4** **Constants Over Functions**: Use constants instead of functions where possible. Define types if applicable.
**5** **Correct and DRY Code**: Focus on writing correct, best practice, DRY (Don't Repeat Yourself) code.
**6** **Functional and Immutable Style**: Prefer a functional, immutable style unless it becomes much more verbose.
**7** **Minimal Code Changes**: Only modify sections of the code related to the task at hand. Avoid modifying unrelated pieces of code. Accomplish goals with minimal code changes.

## Comments and Documentation

- **Function Comments**: Add a comment at the start of each function describing what it does.
- **JSDoc Comments**: Use JSDoc comments for JavaScript and modern ES6 syntax.

## Function Ordering

- Order functions with those that are composing other functions appearing earlier in the file. For example, if you have a menu with multiple buttons, define the menu function above the buttons.

## Handling Bugs

- **TODO Comments**: If you encounter a bug in existing code, or the instructions lead to suboptimal or buggy code, add comments starting with "TODO:" outlining the problems.

## Important: Minimal Code Changes

**Only modify sections of the code related to the task at hand.**
**Avoid modifying unrelated pieces of code.**
**Avoid changing existing comments.**
**Avoid any kind of cleanup unless specifically instructed to.**
**Accomplish the goal with the minimum amount of code changes.**
**Code change = potential for bugs and technical debt.**

# Reporting Tables (Actions) Rules

## Location Requirement

**All reporting tables MUST be placed in `definitions/custom/`**

Reporting tables are user-specific customizations and should never be placed in `definitions/core/` as they will be deleted during package updates.

**It's better to keep report SQLX files in separate folders**, especially if they have intermediate steps. In that case, also use subfolders for intermediate and output actions following the standard structure:

- ✅ **RECOMMENDED**: `definitions/custom/report_name/02_intermediate/` for intermediate tables
- ✅ **RECOMMENDED**: `definitions/custom/report_name/03_outputs/` for final report tables
- ❌ **NOT RECOMMENDED**: Placing all report files directly in `definitions/custom/` without subfolders

This organization makes it easier to manage complex reports with multiple steps and keeps the custom directory structure clean and maintainable.

## Data Source Requirement

**Reporting tables MUST be built on top of OUTPUT tables, NOT intermediate tables.**

- ✅ **CORRECT**: Reference tables from `definitions/core/03_outputs/` or `definitions/core/modules/*/03_outputs/`
- ❌ **INCORRECT**: Reference tables from `definitions/core/02_intermediate/` or `definitions/core/modules/*/02_intermediate/`

Intermediate tables are internal implementation details and may change without notice. Output tables are the stable, documented API for building reports.

## Output Dataset Requirement

**Reporting tables should NOT use `OUTPUTS_DATASET`. Use dedicated reporting datasets instead.**

### Recommended Approaches

1. **Single Reporting Dataset (Recommended for most cases)**

   - Define `REPORTING_DATASET` in `workflow_settings.yaml` under the `vars` section
   - Use this dataset for all reporting tables
   - ✅ **CORRECT**: `schema: dataform.projectConfig.vars.REPORTING_DATASET`

2. **Report-Specific Dataset**

   - Define a dataset variable specific to your report (e.g., `MY_REPORT_DATASET`)
   - Use when you need to isolate a specific report or group of related reports
   - ✅ **CORRECT**: `schema: dataform.projectConfig.vars.MY_REPORT_DATASET`

3. **Intermediate Tables and Views**
   - If your report requires intermediate tables or views, keep them in a separate dataset
   - Define a dedicated dataset variable (e.g., `MY_REPORT_INTERMEDIATE_DATASET`)
   - This keeps reporting logic separate from final report tables
   - ✅ **CORRECT**: Intermediate tables in `MY_REPORT_INTERMEDIATE_DATASET`, final reports in `MY_REPORT_DATASET`

### Configuration Example

Add to `workflow_settings.yaml`:

```yaml
vars:
  REPORTING_DATASET: superform_reporting_premium
  # Or for report-specific datasets:
  MY_REPORT_DATASET: my_custom_report
  MY_REPORT_INTERMEDIATE_DATASET: my_custom_report_intermediate
```

- ❌ **INCORRECT**: `schema: dataform.projectConfig.vars.OUTPUTS_DATASET` (reserved for core output tables)

## Schema Documentation

To get information about output table schemas, use the column documentation files from `includes/core/documentation/`.

### How to Use Documentation

1. Locate the documentation file for your output table (see list below)
2. Read the JSON file to understand available columns, their types, and descriptions
3. Use this information when writing your reporting table queries

## Available Output Tables and Documentation

### Core Output Tables

These are the main GA4 output tables available in all installations:

1. **`ga4_events`**

   - Documentation: `includes/core/documentation/ga4_events.json`
   - Source: `definitions/core/03_outputs/ga4_events.sqlx`
   - Description: Event-level data from GA4

2. **`ga4_sessions`**

   - Documentation: `includes/core/documentation/ga4_sessions.json`
   - Source: `definitions/core/03_outputs/ga4_sessions.sqlx`
   - Description: Session-level aggregated data

3. **`ga4_transactions`**
   - Documentation: `includes/core/documentation/ga4_transactions.json`
   - Source: `definitions/core/03_outputs/ga4_transactions.sqlx`
   - Description: Transaction-level ecommerce data


## Schema Documentation For New Reporting Tables

**It is recommended to create documentation for all reporting tables.**

### Documentation Location

Documentation files for reporting tables should be placed in:

- `includes/custom/documentation/reporting_name/reporting_table_name.json`

Where `reporting_table_name` matches the name of your reporting table.

### Documentation Format

The documentation file should be a JSON object describing the columns in your reporting table. Follow the same structure as core table documentation files (see `includes/core/documentation/` for examples).

## Example Reporting Table

Here's an example of a correctly structured reporting table:

```sqlx
config {
    type: "table",
    schema: dataform.projectConfig.vars.REPORTING_DATASET,
    description: "My custom reporting table",
    columns: require("includes/custom/documentation/reporting_name/reporting_table_name.json"),
    bigquery: {
        partitionBy: "event_date",
        labels: require("includes/core/helpers.js").helpers.storageLabels()
    }
}

js {
    const { helpers } = require("includes/core/helpers");
}

pre_operations {
    set @@query_label = "${helpers.executionLabels()}";
}

select
    event_date,
    event_name,
    count(*) as event_count
from ${ref("ga4_events")}
group by event_date, event_name
```

## Best Practices

1. **Always use `${ref("table_name")}`** to reference output tables - this ensures proper dependency tracking
2. **Check module enablement** - If using module output tables, verify the module is enabled before referencing
3. **Read documentation first** - Always consult the JSON documentation files to understand available columns and their meanings
4. **Use appropriate partitioning** - Follow the partitioning strategy of the source output table when possible
5. **Add proper labels** - Use `helpers.storageLabels()` for consistent labeling
6. **Document your reporting tables** - Create JSON documentation files in `includes/custom/documentation/` and link them in the config block

# GA4Dataform Configuration assistance

If user ask you to help configurate GA4Dataform  - your goal is to help users customize `includes/custom/modules/ga4/config.js` file based on user input.

## Process Overview

1.  **Identify Intent:** Determine which variable in `customConfig` needs modification.
2.  **Ask Clarifying Questions:** Ensure you have the exact parameter names, types, and logic required.
3.  **Generate Code:** update `includes/custom/modules/ga4/config.js` based on previous steps
4.  **Action Item:** Instruct the user to **Commit** changes and **Run** the pipeline (with full refresh if schema changes).

---

## Step 1: Clarifying Questions

Ask these questions based on the user's request to ensure valid JavaScript configuration.

### custom parameters (Event, User, Item)
*Target: `CUSTOM_EVENT_PARAMS_ARRAY`, `CUSTOM_USER_PROPERTIES_ARRAY`, `CUSTOM_ITEM_PARAMS_ARRAY`*
* "What is the exact parameter key as it appears in the raw GA4 export (e.g., `value`, `page_type`)?"
* "What is the data type? (`string`, `int`, or `decimal`)?"
* "Do you want to rename this column in the output table?"

### URL Parameters
*Target: `CUSTOM_URL_PARAMS_ARRAY`*
* "What is the query parameter key in the URL (e.g., `q`, `search_term`)?"
* *(Note: URL params are always treated as strings).*

---

## Step 2: Configuration Generation

Generate valid JavaScript. Always verify comma placement and structure.

### Template: General Parameters
```javascript
// includes/custom/modules/ga4/config.js

// Event Parameter Example
CUSTOM_EVENT_PARAMS_ARRAY: [
    { name: "page_type", type: "string", description: "Content classification" },
    { name: "value", type: "decimal", renameTo: "lead_value" }
],
// User Property Example
CUSTOM_USER_PROPERTIES_ARRAY: [
    { name: "customer_tier", type: "string", description: "customer classification" }
],
```

### Template: URL Parameter Example (No type needed)
```javascript
CUSTOM_URL_PARAMS_ARRAY: [
    { name: "gclid", cleaningMethod: lowerSQL },
    { name: "search_query", renameTo: "internal_search" }
],
```

### Template: Filtering and Basics
```javascript
// Basic Settings
GA4_START_DATE: "2023-01-01",
EVENTS_TO_EXCLUDE: ["scroll", "user_engagement"],
HOSTNAME_INCLUDE_ONLY: ["www.example.com"],
```

## Step 3: Closing Instructions

Always end configuration assistance with:

> "Validate all my changes in `includes/custom/modules/ga4/config.js`. If everything is correct please:
> 1. Click **Commit** changes.
> 2. If you added new columns, run a **Full Refresh** on the affected tables.
>
> Please ask your questions of any changes I made in the configuration file. Thanks for using GA4Dataform! Let us know if you need help with the query."

# Documentation References

(Useful for humans, optional for the model)

- Dataform: configuration block and table definition  
  https://docs.cloud.google.com/dataform/docs/create-tables

- Dataform: Using JavaScript inside SQLX and separate files  
  https://docs.cloud.google.com/dataform/docs/javascript-in-dataform

- Dataform core reference: default JavaScript methods available inside sqlx files, not available in external javascript files, but could be passed as a function parameter  
  https://docs.cloud.google.com/dataform/docs/reference/dataform-core-reference

- Dataform configs definition for all type of actions:
  https://dataform-co.github.io/dataform/docs/reference/configs.html
