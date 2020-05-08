#!/usr/bin/python
"""Main flask application."""
import os
from flask import Flask, render_template, request

app = Flask(__name__)


@app.route("/")
def home():

    map_api_key = os.environ.get("MAP_API_KEY")
    config = {"map_api_key": map_api_key}
    return render_template("pages/home.html", config=config)


# Default port:
if __name__ == "__main__":
    app.run()