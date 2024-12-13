

declare({
    database: dataform.projectConfig.defaultProject,
    schema: dataform.projectConfig.vars.GA4_DATASET,
    name: 'events_*',
});

