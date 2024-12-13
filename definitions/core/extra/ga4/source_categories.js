/*
    This file is part of "GA4 Dataform Package".
    Copyright (C) 2023-2024 Superform Labs <support@ga4dataform.com>
    Artem Korneev, Jules Stuifbergen,
    Johan van de Werken, Krisztián Korpa,
    Simon Breton

    Do not redistribute this version! The open source version will become
    available at github.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. 

*/
const { helpers } = require("includes/core/helpers");

const rows = require("includes/core/extra/source_categories.json");
const selectStatements = helpers.getSqlUnionAllFromRowsSQL(rows);

publish("source_categories", {
  type: "table",
  tags: [dataform.projectConfig.vars.GA4_DATASET],
  schema: dataform.projectConfig.vars.TRANSFORMATIONS_DATASET,
}).query((ctx) => selectStatements);
