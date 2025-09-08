@REM CLOUD FUNCTION
gcloud functions deploy ga4-remote-fn \
  --gen2 \
  --region=us \
  --runtime=python310 \
  --timeout=30
  --source=. \
  --entry-point=ga4_report \
  --trigger-http \
  --allow-unauthenticated
