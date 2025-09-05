
#### REFERENCE 
https://cloud.google.com/bigquery/docs/create-cloud-resource-connection#terraform


# This queries the provider for project information.
data "google_project" "default" {}

# This creates a cloud resource connection in the US region named ga4-remote-connection.
# Note: The cloud resource nested object has only one output field - serviceAccountId.
resource "google_bigquery_connection" "default" {
  connection_id = "ga4-remote-connection"
  project       =  dataform.projectConfig.vars.OUTPUT_PROJECT
  location      =  dataform.projectConfig.defaultLocation
  cloud_resource {}
}


## This grants IAM role access to the service account of the connection created in the previous step.
resource "google_project_iam_member" "connectionPermissionGrant" {
  project = data.google_project.default.project_id
  role    = "roles/storage.objectViewer"
  member  = "serviceAccount:${google_bigquery_connection.default.cloud_resource[0].service_account_id}"
}