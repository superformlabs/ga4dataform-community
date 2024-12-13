const { helpers } = require("includes/core/helpers");

const rows = require("includes/core/extra/source_categories.json");
const selectStatements = helpers.getSqlUnionAllFromRowsSQL(rows);

publish("source_categories", {
  type: "table",
  tags: [dataform.projectConfig.vars.GA4_DATASET],
  schema: dataform.projectConfig.vars.TRANSFORMATIONS_DATASET,
}).query((ctx) => selectStatements);
