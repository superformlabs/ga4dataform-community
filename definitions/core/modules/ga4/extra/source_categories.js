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

const { helpers } = require("includes/core/helpers");

const rows = require("includes/core/modules/ga4/extra/source_categories.json");
const selectStatements = helpers.getSqlUnionAllFromRowsSQL(rows);

publish("source_categories", {
  type: "table",
  tags: [dataform.projectConfig.vars.GA4_DATASET],
  schema: dataform.projectConfig.vars.TRANSFORMATIONS_DATASET,
}).query(() => selectStatements);
