#!/usr/bin/python
"""Main flask application."""
import os
import argparse
import json
from datetime import date, datetime, timezone
from flask import Flask, render_template, Response
import psycopg2

app = Flask(__name__)

map_api_key = os.environ.get("MAP_API_KEY") or "MISISNG"
db_conn = os.environ.get("DB_CONN_STRING") or "MISSING"

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, (datetime, date)):
        d_truncated = obj.replace(microsecond=0)
        return d_truncated.replace(tzinfo=timezone.utc).timestamp()
    raise TypeError("Type %s not serializable" % type(obj))


@app.route("/api/predictions")
def get_predictions():
    """Return the list of predications as a json object"""
    results = []

    columns = ("pid", "name", "location", "latitude", "longitude", "type", "modtime")

    try:
        conn = psycopg2.connect(db_conn)
        # create a cursor
        cur = conn.cursor()
        cur.execute(
            "SELECT pid, name, location, latitude, longitude, type, modtime FROM predictions"
        )

        for row in cur.fetchall():
            results.append(dict(zip(columns, row)))

        cur.close()

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()
            print("Database connection closed.")

    json_str = json.dumps(results, indent=2, sort_keys=True, default=json_serial)

    return Response(json_str, mimetype="application/json")


@app.route("/")
def home():
    """Home route for main page."""
    config = {"map_api_key": map_api_key}
    return render_template("pages/home.html", config=config)


# Default port:
if __name__ == "__main__":
    # parser = argparse.ArgumentParser(
    #     description="Predict mission call location.", add_help=True,
    # )
    # parser.add_argument("--map_key", "-k", help="map api key")
    # parser.add_argument("--connection_string", "-s", help="db connection string")
    # args = parser.parse_args()

    # map_api_key = args.map_key or os.environ.get("MAP_API_KEY")
    # db_conn = args.connection_string or os.environ.get("DB_CONN_STRING")
    

    app.run()
