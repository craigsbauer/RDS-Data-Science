# import necessary libraries
from flask import Flask, render_template

# create instance of Flask app
app = Flask(__name__)


# create route that renders index.html template
@app.route("/")
def echo():
    return render_template("index.html", text="Belly Button Biodiversity Dashboard")


if __name__ == "__main__":
    app.run(debug=True)

# Alchemy Dependencies
# ----------------------------------
from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
Base = declarative_base()

from sqlalchemy import Column, Integer, String, Float

# Create Database Connection
# ----------------------------------
engine = create_engine("sqlite:templates/belly_button_biodiversity.sqlite")

conn = engine.connect() 

@app.route("/names")
def echo():
    return render_template("index.html", text="")
   