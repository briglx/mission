#!/usr/bin/python
"""Main flask application."""
import os
import argparse
import json
import pprint
from datetime import date, datetime, timezone
from flask import Flask, render_template, Response, request, send_from_directory
import psycopg2

app = Flask(__name__)

map_api_key = os.environ.get("MAP_API_KEY") or "MISISNG"
db_conn = os.environ.get("DB_CONN_STRING") or "MISSING"

class LoggingMiddleware(object):
    def __init__(self, app):
        self._app = app

    def __call__(self, environ, resp):
        errorlog = environ['wsgi.errors']
        pprint.pprint(('REQUEST', environ), stream=errorlog)

        def log_response(status, headers, *args):
            pprint.pprint(('RESPONSE', status, headers), stream=errorlog)
            return resp(status, headers, *args)

        return self._app(environ, log_response)

def json_serial(obj):
    """JSON serializer for objects not serializable by default json code"""

    if isinstance(obj, (datetime, date)):
        d_truncated = obj.replace(microsecond=0)
        return d_truncated.replace(tzinfo=timezone.utc).timestamp()
    raise TypeError("Type %s not serializable" % type(obj))


@app.route("/api/predictions", methods=['POST'])
def save_prediction():

    conn = None
    new_pid = None
    mod_date = None

    req_data = request.get_json()
    print(req_data)
    # json_str = json.dumps(results, indent=2, sort_keys=True, default=json_serial)

    try:
        conn = psycopg2.connect(db_conn)
        # create a cursor
        cur = conn.cursor()

        sql_string = "INSERT INTO predictions (pid, name, location, latitude, longitude, type) VALUES (DEFAULT, %s, %s, %s, %s, %s) RETURNING pid, modtime;"
        cur.execute(sql_string, (req_data['name'], req_data['location'], str(req_data['latitude']), str(req_data['longitude']), req_data['type']))
        new_rec = cur.fetchone()
        new_pid = new_rec[0]
        mod_date = new_rec[1]
        
        conn.commit()
        cur.close()

    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()
            print("Database connection closed.")

    req_data["pid"] = new_pid
    req_data["mod_date"] = mod_date
    json_str = json.dumps(req_data, indent=2, sort_keys=True, default=json_serial)

    return Response(json_str, mimetype="application/json")


@app.route("/api/predictions", methods=['GET'])
def get_predictions():
    """Return the list of predications as a json object"""
    results = []
    conn = None

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
    config = {"map_api_key": map_api_key, "version": "1.5"}
    return render_template("pages/home.html", config=config)

@app.route('/favicon.ico')
def favicon():
    return send_from_directory(os.path.join(app.root_path, 'static', 'ico'),
                               'favicon.ico', mimetype='text/x-icon')

@app.route('/apple-touch-icon.png')
def apple_touch_icon():
    return send_from_directory(os.path.join(app.root_path, 'static', 'ico'),
                               'apple-touch-icon.png', mimetype='image/png')

@app.route('/site.webmanifest')
def webmanifest():
    return send_from_directory(os.path.join(app.root_path),
                               'site.webmanifest', mimetype='text/json')

@app.route('/browserconfig.xml')
def browserconfig():
    return send_from_directory(os.path.join(app.root_path),
                               'browserconfig.xml', mimetype='text/xml')

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
    
    app.wsgi_app = LoggingMiddleware(app.wsgi_app)

    app.run()
