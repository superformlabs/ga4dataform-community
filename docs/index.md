# GA4Dataform

## Introduction

### Overview
GA4Dataform is your one-click solution to harness the full power of GA4 data in BigQuery, without the hassle. Transform your raw GA4 event data into actionable insights with industry-leading, enterprise-level efficiency and precision. Designed for digital analysts, technical marketers, data teams, and developers.

### Versions
#### Open-source version
The open-source version of GA4Dataform will be available as a public repository on Github. This version contains the Dataform models without the ‘one-click’ installer app. The open-source version contains the same .sqlx and .js files as the ‘Core’ variant of GA4Dataform.

#### Installer version
The installer version of GA4Dataform is a ‘one-click’ app that handles the complete installation of the package. This version is available in the Superform Labs store.

#### Premium
Coming soon

### About Us
GA4Dataform is a product by Superform Labs OÜ. Our company is settled in Estonia (EU), but we work remotely from different countries across the world. Together we have decades of experience in web and marketing analytics.

- **Jules Stuifbergen** | Data Analyst | [LinkedIn](https://www.linkedin.com/in/stuifbergen/)
- **Krisztián Korpa** | Analytics Engineer | [LinkedIn](https://www.linkedin.com/in/krisztian-korpa/)
- **Artem Korneev** | Analytics Developer | [LinkedIn](https://www.linkedin.com/in/artem-korneev/)
- **Simon Breton** | Analytics Engineer | [LinkedIn](https://www.linkedin.com/in/simonbreton/)
- **Johan van de Werken** | Data Analyst | [LinkedIn](https://www.linkedin.com/in/johanvdwerken/)

### License
GNU General Public License. This file is part of "GA4 Dataform Package". Copyright (C) 2023-2024 Superform Labs <hello@ga4dataform.com> Artem Korneev, Jules Stuifbergen, Johan van de Werken, Krisztián Korpa, Simon Breton. "GA4 Dataform Package" is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details. You should have received a copy of the GNU General Public License along with this program. If not, see <http://www.gnu.org/licenses/>.

## Getting Started

### Requirements
To use GA4Dataform you need:
- A Google Cloud project with billing enabled
- An active GA4 property with BigQuery export configured. If the export is configured correctly you’ll see a data set analytics_<property_id> in BigQuery.
- A license key. You’ll receive the license key in the receipt email after ordering the product in the [Superform Labs store](https://store.ga4dataform.com/). The license key is linked to the email address used in the store. License keys are valid for a limited time (dependent on the product plan) and can be used as often as you want, unless there is a reason to disable your license key.

> [!WARNING]  
> Using ga4dataform will generate BigQuery costs, so please keep an eye on your Billing. We're not responsible for any charges that may come up.

### Installation Guide
- **New installation**: Instructions are provided when running the installer.
- **Update**: You can run the installer again to update the app. Update is "non-destructive". A new workspace will be create. Each update will be retro-compatible with previous version of the model. full-refresh of your model is not necessary. 

### Using GA4Dataform after installation
- **Releases and Scheduling**: The installer will automatically create a Release and a Workflow configuration using the dataform API. The release will be triggered at 9AM UTC+00:00 and the workflow will be triggered at 10AM UTC+00:00. These values can be modified directly from the dataform UI without impacting the functionality of the project. 
- **Git Connection**: GA4Dataform is not (yet) linked to any git repository. If any changes and customisation are made to the project, changes should be committed to the default Dataform repository.
- **Custom Folders**:
- **Installed version**: The version of the package installed is available in the package.json file. 

## Product Features

### Core Features
#### Basic features | No support & updates
##### Incremental loading
The incrementality works by processing only new GA4 event data without reprocessing the entire dataset. Here's a summary of how this is implemented:

1. **Checkpoint Management:**
- A `date_checkpoint` variable is declared and set to the day after the most recent `event_date` found in the existing table (`stg_ga4_events`).
- This ensures that only data newer than the most recent processed date is considered for the next load.

set date_checkpoint = (
  select max(event_date) + 1 
  from `cst-gcp-projects.superform_transformations.stg_ga4_events` 
  where is_final = true
);

2. **Deletion of Updated Data:**
- Any existing records from the target table (`stg_ga4_events`) where `event_date` is equal to or greater than the `date_checkpoint` are deleted. This ensures that if GA4 has re-processed any past data, it gets removed and replaced by fresh data.

delete from `cst-gcp-projects.superform_transformations.stg_ga4_events`
where event_date >= date_checkpoint;

3. **Filtering New Data:**
- The pipeline processes only the new GA4 events by using `_table_suffix` to fetch data from BigQuery tables (`events_*`) where the `event_date` (derived from `_table_suffix`) is greater than or equal to the `date_checkpoint`.
- This prevents reprocessing old event data.

and parse_date('%Y%m%d', regexp_extract(_table_suffix, '[0-9]+')) >= date_checkpoint;

4. **Filtering out Intraday Events:**
- Intraday data, which might still be incomplete or subject to change, is excluded from the query using this condition:

and contains_substr(_table_suffix, 'intraday') is false;

5. **Finalization Logic:**
- The field `is_final` is computed in the process to determine whether the data is final (older than 3 days). This is used to manage the checkpoint logic, ensuring incremental processing only on data that is finalized.

date_diff(current_date(), cast(event_date as date format 'YYYYMMDD'), day) > 3 as is_final;

##### Partitioning & Clustering
Partitioning:
- Partitioning divides a table into smaller, more manageable segments based on a column (e.g., date, timestamp, or integer range).
- Types:
  - Time-based partitioning (e.g., by day): Each partition holds data for a specific period (e.g., day).
  - Ingestion-time partitioning: Automatically partitions data based on when it was ingested into BigQuery.
- Benefits: Queries that target specific partitions scan less data, reducing cost and improving performance.

Clustering:
- Clustering organizes data in a table based on the values of one or more columns (cluster keys).
- BigQuery sorts data within each table by the cluster columns.
- Benefits: Optimizes queries that filter or aggregate on clustered columns by scanning less data and improving query performance.

##### Fix session breakage on midnight
##### Default channel grouping
##### Timestamps in local time zone
##### Last non-direct click attribution model (session-based)
###### GA4 Sessions - Processing Steps

GA4 session table could provide following information: Source / Medium / Campaign at least for three standart attributions: Last click Last non direct click (with particular lookback window - 90 days by default) First click For each attribution Default Channel Groups - by the same rules as in Google Analytics 4 Landing page, landing page referrer and exit page, it could also be a struct with prepared host name, page path and query parameters Sessions properties like: is_direct_session, is_engaged_session, is_debug_session, is_cross_domain Unique session_id Session duration, engagement time Information about geo / device / app_info User information: user_id, last_user_id, user_pseudo_id

These columns are often needed to build reporting and simplify data pipelines based on session data.

What is common session processing pipeline: Extract all needed columns from raw GA4 data - to flat event tables Clean and prepare events Group events into sessions using unique session_id Fix google’s default source / medium rules, add channel grouping Add last non direct attribution

Sources to calculate source / medium collected_traffic_source column Source and medium from event_params Utm parameters from page_location click_ids from event_params or page_location, for example: gbraid, wbraid, gclid, dclid, srsltid and so on

After all sources combined together we need to apply additional logic to build a fixed source / medium on top of them. For example: if we have gclid, gbraid, wbraid source / medium should be google / cpc. Or if the referrer is %android-app://com.google% when google / organic and so on. Special rules for click ids, for social platforms, for aps.

For channel grouping Google provides a list of sources with more than 1100 rules to define groups for known domains.

And on top of these steps we could calculate last non direct attribution and compare with GA UI and numbers in session_traffic_source_last_click. For some cases source / medium fixes could provide 15-20% less direct traffic - it means improving paid campaigns attribution.

And also there are a lot of special cases and small challenges, for example: Schema are changing so be careful when you are processing historical data Transaction value could be int or double or float you need to coalesce all possible numbers Collected_traffic_source could be null for events, even if it exists for the first session’s hit Don’t forget to exclude synthetic_bundle events For event_id use batch_page_id, batch_ordering_id, batch_event_index if they exists Be very careful with fbclid parameter Have a fun processing item_params (arrays plus nested plus arrays are better together) Decide what to do with events with the same event_id Count page_number for hits during the session

##### Easy fix for Paid Search misattribution when gclid,gbraid or wbraid are available
##### Event ID
Creating unique event ID based on event_name, event_timestamp_micros, user_pseudo_id, ga_session_id, batch_page_id, batch_ordering_id, batch_event_index, engagement_time_msec.

##### Default Filtering
Session with null session_id and user_pseudo_id null are filtered from final input (in the stg_ga4_sessions model)
Duplicated hit are removed 

##### Event filters, custom parameters, custom channels etc… (see Custom Configuration section)

### Peripheral features
#### Time struct 
Struct containing event_date_YYYYMMDD, event_timestamp_micros, event_timestamp_utc, user_first_touch_timestamp, user_first_touch_timestamp_utc
#### synthetic_bundle
Synthetic event are filtered out in the stg_ga4_events.sqlx model
#### Engaged session
#### Is direct session
#### Debug session
#### Param gtm_debug
#### With cross domain
Url_params._gl
#### has_source


### Custom Configuration

Here's a detailed explanation of the `config.js` file in the custom folder. This file allows users to customize various aspects of the GA4 Dataform model, focusing on parameters like event filtering, custom dimensions, and data validation checks.

---

## `config.js` - Custom Configuration File

### Purpose:
This configuration file provides a way for users to customize the behavior of the GA4 Dataform model. Below are the sections and parameters that can be modified:

---

### 1. GA4 Start Date (`GA4_START_DATE`)
```javascript
GA4_START_DATE: "2020-01-01"
```
**Description**: Defines the starting date for the GA4 data that the model should process.  
**Customization**: Change this date to reflect the earliest data you want to include in your reports. For example, if you started collecting GA4 data on a different date, modify this to match that date.

---

### 2. Custom Event Parameters (`CUSTOM_EVENT_PARAMS_ARRAY`)
```javascript
CUSTOM_EVENT_PARAMS_ARRAY: []
```
**Description**: This allows you to specify custom event parameters that are not part of the standard GA4 data. The custom parameters will be added to the `event_params_custom` column.  
**Customization**: Add parameters using the format `{ name: "paramname", type: "TYPE", renameTo: "outputcolumnname" }`.  
Example:
```javascript
CUSTOM_EVENT_PARAMS_ARRAY: [
  { name: "custom_param", type: "string", renameTo: "custom_output" }
]
```

---

### 3. Custom Item Parameters (`CUSTOM_ITEM_PARAMS_ARRAY`)
```javascript
CUSTOM_ITEM_PARAMS_ARRAY: []
```
**Description**: Similar to event parameters, but for **item custom dimensions and metrics**. These will be stored in the `items.item_params_custom.*` column.  
**Customization**: Add custom item parameters in the same format.  
Example:
```javascript
CUSTOM_ITEM_PARAMS_ARRAY: [
  { name: "stock_status", type: "string" }
]
```

---

### 4. Custom URL Parameters (`CUSTOM_URL_PARAMS_ARRAY`)
```javascript
CUSTOM_URL_PARAMS_ARRAY: []
```
**Description**: Allows you to extract custom URL parameters into their own columns.  
**Customization**: Define custom URL parameters you want to extract in the format `{ name: "param_name", cleaningMethod: "method" }`. Note that only strings are supported.  
Example:
```javascript
CUSTOM_URL_PARAMS_ARRAY: [
  { name: "q", cleaningMethod: lowerSQL }
]
```

---

### 5. Event and Hostname Filters
- **Events to Exclude (`EVENTS_TO_EXCLUDE`)**
```javascript
EVENTS_TO_EXCLUDE: []
```
**Description**: List the event names that should be excluded from the events table.  
**Customization**: Add event names you don’t want to process.  
Example: `EVENTS_TO_EXCLUDE: ["user_engagement", "scroll"]`

- **Hostname Exclude/Include (`HOSTNAME_EXCLUDE`, `HOSTNAME_INCLUDE_ONLY`)**
```javascript
HOSTNAME_EXCLUDE: []
HOSTNAME_INCLUDE_ONLY: []
```
**Description**: Exclude or include specific hostnames from the data.  
**Customization**: Add hostnames to either list based on whether you want to include or exclude them from the data.

---

### 6. Attribution Window (`LAST_NON_DIRECT_LOOKBACK_DAYS`)
```javascript
LAST_NON_DIRECT_LOOKBACK_DAYS: 90
```
**Description**: Defines the number of days to look back when assigning a source for a user who lands on your site without a direct source.  
**Customization**: Change the number of days to fit your attribution model.

---

### 7. Data Quality Assertions
These assertions check the data for consistency and quality. Users can enable or disable specific checks.

- **Event ID Uniqueness (`ASSERTIONS_EVENT_ID_UNIQUENESS`)**
```javascript
ASSERTIONS_EVENT_ID_UNIQUENESS: true
```
**Description**: Ensures that each event has a unique event ID.
  
- **Session ID Uniqueness (`ASSERTIONS_SESSION_ID_UNIQUENESS`)**
```javascript
ASSERTIONS_SESSION_ID_UNIQUENESS: true
```
**Description**: Ensures that each session has a unique session ID.
  
- **Session Duration Validity (`ASSERTIONS_SESSION_DURATION_VALIDITY`)**
```javascript
ASSERTIONS_SESSION_DURATION_VALIDITY: true
```
**Description**: Ensures that session durations are valid and within reasonable limits.

- **Session Validity (`ASSERTIONS_SESSIONS_VALIDITY`)**
```javascript
ASSERTIONS_SESSIONS_VALIDITY: true
```
**Description**: Validates that session data is correct.

- **Tables Timeliness (`ASSERTIONS_TABLES_TIMELINESS`)**
```javascript
ASSERTIONS_TABLES_TIMELINESS: true
```
**Description**: Checks if the GA4 tables are up to date.

- **Transaction ID Completeness (`ASSERTIONS_TRANSACTION_ID_COMPLETENESS`)**
```javascript
ASSERTIONS_TRANSACTION_ID_COMPLETENESS: false
```
**Description**: Checks if transaction IDs are present for purchase events.

- **User Pseudo ID Completeness (`ASSERTIONS_USER_PSEUDO_ID_COMPLETENESS`)**
```javascript
ASSERTIONS_USER_PSEUDO_ID_COMPLETENESS: false
```
**Description**: Ensures that the `user_pseudo_id` is present for all hits.

---

### How to Customize:

1. **Dates**: Adjust the `GA4_START_DATE` to match the date when you want the data processing to begin.
2. **Custom Parameters**: Add any custom event, item, or URL parameters that are specific to your business in the appropriate arrays.
3. **Filters**: Exclude certain events or hostnames from your dataset if they are not relevant to your analysis.
4. **Attribution**: Modify the lookback window for non-direct sessions if needed.
5. **Assertions**: Toggle data quality checks based on your requirements for accuracy and completeness.

---

This configuration file provides a high level of flexibility, allowing users to tailor the GA4 Dataform model to their specific data needs.


3. RESERVED_COLUMN_NAMES_ARRAY
This array contains a list of internal column names used by the package. These columns represent data that is automatically captured by GA4, such as event_id, event_name, user_id, and session_id. These are names the system should avoid overriding because they are critical for tracking.

4. URL_PARAMS_ARRAY
This array defines URL parameters commonly used in marketing campaigns (like utm_source and utm_medium). These parameters are extracted from URLs and processed using cleaning methods, such as lowerSQL, to ensure consistent formatting.

5. CORE_PARAMS_ARRAY
This is a crucial array that defines the core event parameters GA4 captures. These parameters cannot be removed or renamed and include elements such as:

ga_session_id: A unique ID for a session.
engagement_time_msec: The engagement time in milliseconds.
page_title: The title of the web page viewed.
These parameters cover a wide range of data categories, including page-specific data, campaign data (like utm parameters), ecommerce data (like transaction_id), and video-related events.

6. GA4_START_DATE
This defines the first date for processing GA4 events. Only events from this date onward will be processed.

DATA_IS_FINAL_DAYS
This sets a threshold of 3 days to determine when data is considered final. For instance, GA4 may receive backdated Measurement Protocol hits, so the system waits 3 days before considering the data complete.

LAST_NON_DIRECT_LOOKBACK_DAYS
This specifies how many days the system should look back to attribute non-direct traffic sources, useful in multi-touch attribution analysis.

ASSERTIONS_*

These assertions ensure data quality by verifying certain conditions.

8. 
const CUSTOM_EVENT_PARAMS_ARRAY = [];
const CUSTOM_USER_PROPERTIES_ARRAY = [];
const CUSTOM_ITEM_PARAMS_ARRAY = [];
These arrays allow the user to specify custom event parameters, user properties, and item parameters, but they're currently empty. If filled, they would add additional fields to the event data model.

9. Click ID Arrays
CLICK_IDS_ARRAY: Defines how to classify click IDs (like gclid, dclid, etc.) when source/medium/campaign is not explicitly set.
KNOWN_CLICK_IDS_ARRAY: Defines a list of known click IDs that should overwrite medium and campaign fields, particularly when no valid source is found.
For example:

javascript
Copy code
{name: 'gclid', medium: "cpc", campaign: "(not set)"}
This means that if the click ID gclid is found, the medium should be set to "cpc", and the campaign to "(not set)".

10. Exclusion Lists (EVENTS_TO_EXCLUDE, HOSTNAME_EXCLUDE, HOSTNAME_INCLUDE_ONLY)
const EVENTS_TO_EXCLUDE = [];
const HOSTNAME_EXCLUDE = [];
const HOSTNAME_INCLUDE_ONLY = [];
These arrays allow users to exclude specific events, hostnames, or only include certain hostnames in the data processing. They are currently empty but can be populated with event or hostname values as needed.

11. Social Platforms Regex (SOCIAL_PLATFORMS_REGEX)
javascript
Copy code
const SOCIAL_PLATFORMS_REGEX = ['pinterest', 'facebook', ...];
This regex list is used to match social platforms (e.g., pinterest, facebook, twitter) in URL parameters to classify traffic correctly.

12. Core Configuration Object (coreConfig)
const coreConfig = {
    CORE_PARAMS_ARRAY,
    RESERVED_COLUMN_NAMES_ARRAY,
    URL_PARAMS_ARRAY,
    KNOWN_CLICK_IDS_ARRAY,
    ...
};
This object bundles all the configuration elements into a single object that is exported at the end of the file. It contains all the settings, parameters, and rules defined above and is meant to be imported and used in the main Dataform package processing logic.




#### Custom Google Analytics 4 parameters (CUSTOM_PARAMS_ARRAY)
#### Adding description here
#### Event filters
#### CLICK_IDS_ARRAY
#### URL_PARAMS_ARRAY
#### LAST_NON_DIRECT_LOOKBACK_DAYS
#### EVENTS_TO_EXLUDE

### Data Quality
Filtering
Null user_pseudo_id and session_id in stg_ga4_sessions.sqlx model
Transformation
Change '(not set)' translation id to null 
Deduping duplicates event_id in int_ga4_events.sqlx (deduped CTE)
Meta Info
Checking for measurement_protocol_hit 

### Assertions
#### Assertions logic overview 
Each assertion execution is logged in a dedicated BigQuery table easily accessible (`assertion_logs`). Failed or passed assertions result are log. Assertions log table contains:
- Execution date of assertions
- Name of the assertion
- Model on which the assertion has been run
- A sample of flawed values if any anomalies has been detected (i.e list of duplicated event id)
- The status of the assertion, failed or passed. 
- A detailed error message. 

Assertions can be independently deactivated in the custom_config.js configuration file. 

All Assertions are tagged with the string “assertions”

We have 5 main categories of assertions:

**Uniqueness**: Checking if the column we are testing contains duplicates values 

**Validity**: Checking if the column or table we are testing is “valid” from a business point of view. I.e session duration should never be negative. 

**Timeliness**: Checking if tables we are testing are “on time”. I.e we expect that the max(date) of the event table to be the same as the max(date) of the session table.

**Freshness**: We expect tables to be up to date. Freshness is an expectation that needs to be set by the user depending on their own context. 

**Completeness**: Check if the column we are testing is complete and that we are not missing any values. 


This folder contains assertion files:


| Assertion                                  | Description                                                                                                             |
|--------------------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| **assertion_logs**                         | Building an incremental table to log results of all the assertions.                                                     |
| **assertions_event_id_uniqueness**         | Check if the event ID is unique. Returns sample of duplicate event IDs if the assertion fails.                          |
| **assertions_session_duration_validity**   | Check if session duration is not negative.                                                                              |
| **assertions_session_id_uniqueness**       | Check if session ID is unique. Returns sample of session IDs if the assertion fails.                                     |
| **assertions_sessions_validity**           | Check the validation of sessions using multiple criteria: `landing_page_location`, `user_pseudo_id`, `session_id`, `session_date`, `device.category`, and `session_start_timestamp_utc` should not be null. |
| **assertions_tables_timeliness**           | Check if session and events tables across different layers (staging, intermediate, etc.) are always synchronized.       |
| **assertions_transaction_id_completeness** | Check for null or “not set” transaction IDs.                                                                             |
| **assertions_user_pseudo_id_completeness** | Check for null `user_pseudo_id`.                                                                                         |

Includes
This folder contains .js files with functions that are used in the .sqlx files.

| JavaScript File            | Description                                                                                          |
|----------------------------|------------------------------------------------------------------------------------------------------|
| **core_params.js**         | Contains all GA4 event parameters and their data type                                                |
| **custom_config.js**       | Contains static variables that can be reused throughout the whole repository (e.g., `GA4_START_DATE` or lookback window) |
| **helpers.js**             | Contains utility JavaScript functions that help generate SQL strings that would otherwise be tedious to read or write |


Package files
This folder contains files that are needed for the Dataform package to work properly.

| File                   | Description                                                                                      |
|------------------------|--------------------------------------------------------------------------------------------------|
| **dataform.json**      | Contains configuration settings for the Dataform project, including dependencies and environment setup |
| **package.json**       | Specifies the project's dependencies and scripts, and includes metadata such as the project name and version |
| **package-lock.json**  | Automatically generated file that locks the exact versions of the dependencies for reproducibility |
| **.gitignore**         | Specifies files and directories that should be ignored by Git, preventing them from being tracked in version control |

### Permissions
Detailed list of all the permissions requiered to run the installer:

| **Permissions**                               | **Why do we need it?**                                 | **What roles have this permission?**                                                     |
|------------------------------------------------|--------------------------------------------------------|------------------------------------------------------------------------------------------|
| `bigquery.datasets.get`                        | List out the available GA4 datasets                     | BigQuery Data Viewer, BigQuery User, BigQuery Admin                                       |
| `dataform.releaseConfigs.create`               | Create release configurations for Dataform workflows    | Dataform Admin                                                                           |
| `dataform.releaseConfigs.list`                 | List release configurations                             | Dataform Admin, Dataform Editor, Dataform Viewer                                          |
| `dataform.repositories.create`                 | Create Dataform repositories                            | Dataform Admin, Dataform Editor, Code Creator, Code Editor, Code Owner                    |
| `dataform.repositories.fetchHistory`           | Fetch the commit history of a repository                | Dataform Admin, Dataform Editor, Dataform Viewer, Code Creator, Code Editor, Code Owner, Code Viewer |
| `dataform.repositories.get`                    | Get details of a specific repository                    | Dataform Admin, Dataform Editor, Dataform Viewer, Code Creator, Code Editor, Code Owner, Code Viewer |
| `dataform.repositories.list`                   | List all repositories                                   | Dataform Admin, Dataform Editor, Dataform Viewer, Code Creator, Code Editor, Code Owner, Code Viewer |
| `dataform.repositories.update`                 | Update repository settings                              | Dataform Admin, Code Owner                                                                |
| `dataform.workflowConfigs.create`              | Create workflow configurations                          | Dataform Admin                                                                           |
| `dataform.workflowConfigs.list`                | List workflow configurations                            | Dataform Admin, Dataform Editor, Dataform Viewer                                          |
| `dataform.workspaces.commit`                   | Commit changes to a workspace                           | Dataform Admin, Code Editor, Code Owner, Dataform Editor                                  |
| `dataform.workspaces.create`                   | Create new workspaces                                   | Dataform Admin, Code Editor, Code Owner, Dataform Editor                                  |
| `dataform.workspaces.fetchFileGitStatuses`     | Get Git status of files in a workspace                  | Dataform Admin, Dataform Editor, Dataform Viewer, Code Creator, Code Editor, Code Owner, Code Viewer |
| `dataform.workspaces.get`                      | Get details of a specific workspace                     | Dataform Admin, Dataform Editor, Dataform Viewer, Code Creator, Code Editor, Code Owner, Code Viewer |
| `dataform.workspaces.installNpmPackages`       | Install NPM packages in a workspace                     | Dataform Admin, Code Editor, Code Owner, Dataform Editor                                  |
| `dataform.workspaces.list`                     | List all workspaces                                     | Dataform Admin, Dataform Editor, Dataform Viewer, Code Creator, Code Editor, Code Owner, Code Viewer |
| `dataform.workspaces.makeDirectory`            | Create directories in a workspace                       | Dataform Admin, Code Editor, Code Owner, Dataform Editor                                  |
| `dataform.workspaces.pull`                     | Pull changes from a repository to a workspace           | Dataform Admin, Code Editor, Code Owner, Dataform Editor                                  |
| `dataform.workspaces.push`                     | Push changes from a workspace to a repository           | Dataform Admin, Code Editor, Code Owner, Dataform Editor                                  |
| `dataform.workspaces.queryDirectoryContents`   | List contents of a directory in a workspace             | Dataform Admin, Dataform Editor, Dataform Viewer, Code Creator, Code Editor, Code Owner, Code Viewer |
| `dataform.workspaces.readFile`                 | Read files in a workspace                               | Dataform Admin, Dataform Editor, Dataform Viewer, Code Creator, Code Editor, Code Owner, Code Viewer |
| `dataform.workspaces.writeFile`                | Write files in a workspace                              | Dataform Admin, Code Editor, Code Owner, Dataform Editor                                  |
| `iam.serviceAccounts.setIamPolicy`             | Set IAM policies for service accounts                   | Service Account Admin, Project IAM Admin                                                  |
| `resourcemanager.projects.get`                 | Get project details                                     | Viewer, Editor, Owner                                                                     |
| `resourcemanager.projects.getIamPolicy`        | Get IAM policies for projects                           | Security Reviewer, Project IAM Admin                                                     |
| `resourcemanager.projects.setIamPolicy`        | Set IAM policies for projects                           | Project IAM Admin, Owner                                                                  |
| `serviceusage.services.enable`                 | Enable GCP services                                     | Service Usage Admin, Owner                                                                |
| `serviceusage.services.list`                   | List available GCP services                             | Service Usage Consumer, Service Usage Admin                                               |

### Directories description:
| Directory                    | Description                                                                                       |
|------------------------------|---------------------------------------------------------------------------------------------------|
| **01_sources**               | Contains declarations and staging models                                                          |
| **02_intermediate**          | Contains intermediate models                                                                      |
| **03_outputs**               | Contains output models                                                                            |
| **03_outputs/aggregated**    | Contains different aggregated tables that can be directly connected to Looker Studio or other visualization tools |
| **03_outputs/base**          | Contains output tables that should be used for aggregations                                       |
| **assertions**               | Contains all the assertions that check the data quality of our model                               |
| **extra**                    | Is it needed?                                                                                     |
| **unit_testing**             | Contains models related to unit testing                                                           |
| **includes**                 | Contains all JS files with reusable variables and functions that help manage the repository        |

### Dataform Repository Structure:
```
definitions
├── **01_sources**
│   ├── `declarations.js`
│   ├── `stg_ga4_events.sqlx`
│   ├── `stg_ga4_sessions.sqlx`
├── **02_intermediate**
│   ├── `int_ga4_events.sqlx`
│   ├── `int_ga4_sessions.sqlx`
├── **03_outputs**
│   ├── **aggregated**
│   │   ├── `demo_daily_sessions_report.sqlx`
│   │   ├── `demo_diagnostics.sqlx`
│   ├── **base**
│   │   ├── `ga4_events.sqlx`
│   │   ├── `ga4_sessions.sqlx`
├── **assertions**
│   ├── `assertion_logs.sqlx`
│   ├── `assertions_event_id_uniqueness.sqlx`
│   ├── `assertions_session_duration_validity.sqlx`
│   ├── `assertions_session_id_uniqueness.sqlx`
│   ├── `assertions_sessions_validity.sqlx`
│   ├── `assertions_tables_timeliness.sqlx`
│   ├── `assertions_transaction_id_completeness.sqlx`
│   ├── `assertions_user_pseudo_id_completeness.sqlx`
├── **extra**
│   ├── **ga4**
│   │   ├── `source_categories.js`
├── **unit_testing**
│   ├── `unit_test.sqlx`
├── **includes**
│   ├── `core_params.js`
│   ├── `custom_config.js`
│   ├── `helpers.js`
├── `.gitignore`
├── `dataform.json`
├── `package-lock.json`
├── `package.json`
```

### Model:
| Model                        | Description                                                                                                             |
|------------------------------|-------------------------------------------------------------------------------------------------------------------------|
| **stg_ga4_events**           | GA4 staging events table that incrementally queries the raw GA4 export and applies partitioning, clustering, cleaning, and several fixes |
| **stg_ga4_sessions**         | GA4 staging sessions table that incrementally queries `stg_ga4_events` table and creates session-level dimensions and metrics |
| **int_ga4_events**           | GA4 intermediate events table that widens the staging table with useful dimensions                                        |
| **int_ga4_sessions**         | GA4 intermediate sessions table that widens the staging table with useful dimensions                                      |
| **ga4_events**               | GA4 output events table that can be used for further transformations or aggregations                                      |
| **ga4_sessions**             | GA4 output sessions table that fixes sessions broken by midnight, adds last non-direct click attribution, and can be used for further transformations or aggregations |
| **demo_daily_sessions_report** |                                                                                                                         |
| **demo_diagnostics**         |                                                                                                                         |
| **unit_test**                |  


Looker Studio report templates
Website diagnostics
1 Looker Studio template (daily sessions)
Troubleshooting

# Anticipated Costs for Using Dataform on GA4 BigQuery Export

When using Dataform modeling on GA4 BigQuery export, users should consider the following cost factors:

1. **BigQuery Storage Costs**: 
   - **GA4 Exported Data Size**: The amount of data exported from GA4 into BigQuery can vary greatly depending on the volume of events tracked, the frequency of tracking, and the granularity of the data collected.
   - **Storage Pricing**: BigQuery charges based on the amount of data stored. Users can expect to incur costs for the data that is loaded into and stored in BigQuery, and this will grow as more data accumulates over time.

2. **BigQuery Query Costs**:
   - **Data Processing**: Query costs are based on the amount of data processed by the query. Complex queries, especially those involving large datasets, multiple joins, or advanced calculations (like CTEs), will increase costs.
   - **Scheduled Queries**: If users are running automated or scheduled queries to keep their datasets up-to-date, they should anticipate regular query costs.

3. **Dataform Query Execution Costs**:
   - Dataform works by orchestrating queries in BigQuery. While Dataform itself doesn't charge for execution, any underlying BigQuery queries triggered by Dataform models will incur costs, just like running those queries directly.

4. **Data Retention Policies**:
   - **Table Partitioning**: Users can lower costs by partitioning tables (e.g., by date) and applying expiration dates to remove old or unneeded data.
   - **Cost Optimization**: GA4 often provides event-level data, which can result in a large number of rows. Optimizing queries and aggregating data at appropriate levels (like sessions or users) can help reduce the data processed and, consequently, the costs.

5. **Free Tier & Discounts**:
   - BigQuery offers a free tier (usually 10 GB of storage and 1 TB of query processing per month) that small users might stay under. It's important for users to monitor their usage if they want to avoid unexpected costs.

By planning how often they query the data, managing the storage footprint, and optimizing the queries, users can control and reduce their costs effectively.


BigQuery Project
GA4Dataform generates tables in BigQuery. Everything will be under the dataform-package project with the following structure: 

```
Dataform-package (project)
├── superform_outputs (dataset)
│   ├── demo_daily_sessions_report (tables)
│   ├── demo_diagnostics
│   ├── ga4_events
│   ├── ga4_sessions
├── superform_transformations
│   ├── int_ga4_events
│   ├── int_ga4_sessions
│   ├── source_categories
│   ├── stg_ga4_events
│   ├── stg_ga4_sessions
├── Superform_quality
│   ├── assertion_logs
```


#### Releases and Scheduling


#### Project Location
Location of the dataform project is set during the installation. It is based on the Location of the GA4 dataset


Support & contact
support@ga4dataform.com

Support
Users of the open-source and the Core variant of GA4Dataform are not eligible for support.
Contact
If you have any other questions, feel free to contact us at: hello@ga4dataform.com.
