from flask import Flask, request, jsonify
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import RunReportRequest, DateRange, Metric, Dimension, FilterExpression, Filter, MetricAggregation
from google.oauth2 import service_account
import os, argparse, json

app = Flask(__name__)

# Load credentials (assuming they're stored as env variable or secret)
KEY_PATH =  "sallybeauty-us-ga4.json"                # IntuiSurg: "intuitive-web-ga4-bigquery.json"
PROPERTY_ID = "320983557"                              # IntuiSurg:  "273569072"
AUTH_FILE_PATH = "sallybeauty-us-ga4.json"

credentials = service_account.Credentials.from_service_account_file(KEY_PATH)
client = BetaAnalyticsDataClient(credentials=credentials)
os.environ["GOOGLE_APPLICATION_CREDENTIALS"]=AUTH_FILE_PATH

@app.route("/ga4", methods=["POST"])
def ga4_report(request=request):
    try:
        # req_data = request.get_json()
        # req_data = request.json

        req_data = json.loads(request.data.decode('utf-8').replace("'", '"'))
        req_data = req_data.get("calls")[0][0]   # need to figure out ore gracegul way to reqtieve request data

        print('request:', req_data)

        property_id = req_data.get("property_id", PROPERTY_ID)
        date_range = req_data.get("dateRange", {"start_date": "2025-07-01", "end_date": "2025-07-01"})
        metrics = req_data.get("metrics", ["sessions", "engagedSessions", "totalUsers", "activeUsers"])
        dimensions = req_data.get("dimensions", ["date"])
        eventFilter = req_data.get("eventFilter", None)
        aggregations = req_data.get("metricAggregations", True)


        # date_range = {"start_date": "2025-07-01", "end_date": "2025-07-02"}
        # metrics = ["sessions", "engagedSessions", "totalUsers", "activeUsers"]
        # dimensions =  ["date"]

        report = client.run_report(
            RunReportRequest(
                property=f"properties/{property_id}",
                date_ranges=[DateRange(**date_range)],
                metrics=[Metric(name=m) for m in metrics],
                metric_aggregations=[MetricAggregation.TOTAL],
                dimensions=[Dimension(name=d) for d in dimensions],
                dimension_filter=None if eventFilter is None  else FilterExpression(
                    filter=Filter(
                        field_name="eventName",
                        in_list_filter=Filter.InListFilter(
                            values=eventFilter
                        )
                    )
                ),
            )
        )

        returned_rows =  report.totals if aggregations == "True" else report.rows  # this is to get totaled up numbers for date range
        rows = [
        # rows = { "replies":
            {
                dim.name: row.dimension_values[i].value
                for i, dim in enumerate(report.dimension_headers)
            } | {
                met.name: row.metric_values[i].value
                for i, met in enumerate(report.metric_headers)
            }
            # for row in report.rows    # this is to get data for individual dates in the date range
            for row in returned_rows
        # }
        ]
        #
        print("attempting to jsonify...")
        print({"replies": [rows]})
        # return jsonify({"replies": rows})
        return json.dumps({"replies": rows})

    except Exception as e:
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":

    app.run(debug=False, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))

    # request =json.loads( '{"dateRange": {"start_date": "2025-07-01", "end_date": "2025-07-02"}, "metrics": ["sessions", "engagedSessions", "totalUsers", "activeUsers"], "dimensions": ["date"]}')
    # ga4_report(request)
