from flask import Flask, jsonify, render_template, request

# Flask setup
app = Flask(__name__)

# BONUS: Create a list of users.
users = []

# Test GET route
@app.route("/", methods=["GET"])
def get_test():
    if request.method == "GET":
        return jsonify({"It is": "working!!!"})

# POST Route
@app.route("/post", methods=["POST"])
def posting():

    # Create dictionary from form
    user = {"Name": request.form["name"],
            "Email": request.form["email"],
            "Job": request.form["job"],
            "Age": request.form["age"],
            "City": request.form["city"],
            "Password": request.form["password"]}

    # BONUS: append to users list
    users.append(user)

    # Return a JSON
    return jsonify(users)

if __name__ == '__main__':
    app.run(debug=False)