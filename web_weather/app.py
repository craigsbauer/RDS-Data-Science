# Dependencies
from flask import Flask, jsonify, request

# Flask Setup
app = Flask(__name__)

# Basic Test Route
@app.route("/")
def get_test():
    return jsonify({"It is": "working"})

#  Post Route
@app.route("/form", methods=["POST"])
def posting():

    # Create a dictionary item
    todo = {"todo": request.form["todo"],
    "priority": request.form["priority"]}

    # Return JSON
    return jsonify(todo)

# Run the Server
if __name__ == '__main__':
    app.run(debug=False)