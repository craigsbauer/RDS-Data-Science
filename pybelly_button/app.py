#################################################
# Dependencies
#################################################
# Flask (Server)
from flask import Flask, jsonify, render_template, request, flash, redirect

# Sql Alchemy (ORM)
import sqlalchemy
from sqlalchemy.ext.automap import automap_base
from sqlalchemy.orm import Session
from sqlalchemy import create_engine, func
from sqlalchemy import exc

# Various
import datetime as dt
from random import *
import json
import sys

# Dependencies
import os
import pandas as pd
import numpy as np

#################################################
# Database Setup
#################################################
dbfile = os.path.join('db', 'belly_button_biodiversity.sqlite')
engine = create_engine("sqlite:///db/belly_button_biodiversity.sqlite")

# Reflect DB Contents using SQL ALchemy
Base = automap_base()
Base.prepare(engine, reflect=True)

# Store each table as a class
otu_table = Base.classes.otu
samples_table = Base.classes.samples
metadata_table = Base.classes.samples_metadata

#################################################
# Flask Setup
#################################################
app = Flask(__name__)

#################################################
# Flask Routes (Web)
#################################################

# Basic Testing Route
# -----------------------------------------------
@app.route("/")
def basic():
    return("Basic")

# Basic Query Route
# -----------------------------------------------
@app.route("/query/otu")
def query_otu():
    session = Session(engine)

    # Get all otus
    results = session.query(otu_table)

    print(str(results), file=sys.stderr)

    # Specify that we want all of the results
    results = results.all()

    print(len(results), file=sys.stderr)

    # Convert query results into dictionary
    all_results = []

    # Loop through each record
    for result in results:

        # Create a dictionary
        dict_result = {} 
        dict_result["otu_id"] = result.otu_id
        dict_result["lowest_taxonomic_unit_found"] = result.lowest_taxonomic_unit_found

        # Append the individual results into the array
        all_results.append(dict_result)

    # Render results
    return(jsonify(all_results))

# 
@app.route("/query/samples")
def query_samples():
    session = Session(engine)

    # Get all otus
    results = session.query(samples_table)

    print(str(results), file=sys.stderr)

    # Specify that we want all of the results
    results = results.all()

    # Convert query results into dictionary
    all_results = []

    # Loop through each record
    for result in results:

        # Create a dictionary
        dict_result = {} 
        dict_result["otu_id"] = result.otu_id
        dict_result["BB_940"] = result.BB_940

        # Append the individual results into the array
        all_results.append(dict_result)

    # Render results
    return(jsonify(all_results))

#################################################
# Default App Settings
#################################################
if __name__ == "__main__":
    app.run(debug=True)