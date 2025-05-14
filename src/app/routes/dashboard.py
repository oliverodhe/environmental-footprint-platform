from flask import Blueprint, render_template

dashboard_bp = Blueprint("dashboard", __name__)

@dashboard_bp.route("/", methods=["GET", "POST"])
def dashboard():
    return render_template("index.html", title="Dashboard")
    