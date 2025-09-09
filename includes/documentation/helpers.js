const ga4Events = require("includes/core/documentation/ga4_events.json");
const ga4Sessions = require("includes/core/documentation/ga4_sessions.json");
const ga4Transactions = require("includes/core/documentation/ga4_transactions.json");

const { helpers } = require("includes/core/helpers");
const config = helpers.getConfig();

config.CUSTOM_EVENT_PARAMS_ARRAY.forEach((param) => {
  if (param.description) {
    const paramName = param.renameTo ? param.renameTo : param.name;
    if (!ga4Events.event_params_custom) {
      ga4Events.event_params_custom = {};
      ga4Events.event_params_custom.description = "Custom event parameters";
      ga4Events.event_params_custom.columns = {};
    }
    if (!ga4Events.event_params_custom.columns) {
      ga4Events.event_params_custom.columns = {};
    }
    ga4Events.event_params_custom.columns[paramName] = param.description;
  }
});

config.CUSTOM_USER_PROPERTIES_ARRAY.forEach((param) => {
  if (param.description) {
    const paramName = param.renameTo ? param.renameTo : param.name;
    if (!ga4Events.user_properties) {
      ga4Events.user_properties = {};
      ga4Events.user_properties.description = "Custom user properties";
    }
    if (!ga4Events.user_properties.columns) {
      ga4Events.user_properties.columns = {};
    }
    ga4Events.user_properties.columns[paramName] = param.description;
  }
});

config.CUSTOM_URL_PARAMS_ARRAY.forEach((param) => {
  if (param.description) {
    const paramName = param.renameTo ? param.renameTo : param.name;
    if (!ga4Events.url_params_custom) {
      ga4Events.url_params_custom = {};
      ga4Events.url_params_custom.description = "Custom URL parameters";
      ga4Events.url_params_custom.columns = {};
    }
    ga4Events.url_params_custom.columns[paramName] = param.description;
  }
});

config.CUSTOM_ITEM_PARAMS_ARRAY.forEach((param) => {
  if (param.description) {
    const paramName = param.renameTo ? param.renameTo : param.name;
    if (!ga4Events.items.columns.item_params_custom) {
      ga4Events.items.columns.item_params_custom = {};
      ga4Events.items.columns.item_params_custom.description =
        "Custom item parameters";
    }
    if (!ga4Events.items.columns.item_params_custom.columns) {
      ga4Events.items.columns.item_params_custom.columns = {};
    }
    ga4Events.items.columns.item_params_custom.columns[paramName] =
      param.description;
  }
});

module.exports = {
  ga4Events,
  ga4Sessions,
  ga4Transactions
};
