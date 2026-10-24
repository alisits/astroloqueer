from flask import Flask, request, jsonify, make_response, g
from flask_cors import CORS
import traceback
from datetime import datetime, timezone
import logging, os
from pythonjsonlogger import jsonlogger
import time, uuid
from functools import wraps
from dotenv import load_dotenv

# Import Services
from services.geolocation_service import GeolocationService
from services.astrology_service import AstrologyService
from services.openai_service import OpenAIService
from services.big_three_service import BigThreeService
from services.astronomy_service import AstronomyService
from services.house_assignment_service import HouseAssignmentService
from services.ascendant_service import AscendantService
from services.transit_service import TransitService

load_dotenv()

# Initialize Flask App
app = Flask(__name__)

# Enable CORS (kept + slightly hardened)
CORS(
    app,
    resources={r"/*": {"origins": [
        "https://astroloqueer.com",
        "https://www.astroloqueer.com",
        "http://localhost:8080",
        "https://stage--astroloqueer.netlify.app"
    ]}},
    supports_credentials=True,
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "Accept"],
)

# Add caching decorator
def cache_response(timeout=300):
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            # Simple in-memory cache (consider Redis for production)
            cache_key = f"{request.path}:{request.get_data(as_text=True)}"
            if hasattr(app, "cache") and cache_key in app.cache:
                return app.cache[cache_key]

            result = f(*args, **kwargs)
            if not hasattr(app, "cache"):
                app.cache = {}
            app.cache[cache_key] = result
            return result
        return decorated_function
    return decorator

# Configure logging
def _configure_logging():
    logger = logging.getLogger()
    logger.setLevel(os.getenv("LOG_LEVEL", "INFO").upper())

    if not logger.handlers:
        handler = logging.StreamHandler()
        formatter = jsonlogger.JsonFormatter(
            "%(asctime)s %(levelname)s %(name)s %(message)s %(request_id)s",
            datefmt="%Y-%m-%dT%H:%M:%S%z",
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)

_configure_logging()
log = logging.getLogger(__name__)

# Initialize Services
geolocation_service = GeolocationService()
openai_service = OpenAIService()
astrology_service = AstrologyService()
house_assignment_service = HouseAssignmentService()
transit_service = TransitService(house_assignment_service)

# --------------------
# ✅ Global request middleware (request-id + timing + PRE-FLIGHT)
# --------------------
@app.before_request
def _start_timer_and_handle_preflight():
    # Always set request id (even for OPTIONS)
    g.request_id = request.headers.get("X-Amzn-Trace-Id", str(uuid.uuid4()))
    g.start_ts = time.time()

    # ✅ This prevents 500 preflight across ALL endpoints (including /geocode)
    if request.method == "OPTIONS":
        # Let Flask-CORS attach headers in after_request
        return make_response("", 204)

@app.after_request
def _log_request(resp):
    # Guard in case something returns before g is set (shouldn't now, but safe)
    start_ts = getattr(g, "start_ts", None)
    duration_ms = int((time.time() - start_ts) * 1000) if start_ts else 0

    request_id = getattr(g, "request_id", None)
    log.info(
        "HTTP",
        extra={
            "method": request.method,
            "path": request.path,
            "status": resp.status_code,
            "duration_ms": duration_ms,
            "request_id": request_id,
        },
    )
    if request_id:
        resp.headers["X-Request-Id"] = request_id
    return resp

# --------------------
# Add caching headers to responses
# --------------------
@app.after_request
def add_cache_headers(response):
    # Optional: don't mess with caching for preflight
    if request.method == "OPTIONS":
        return response

    if request.path.startswith("/astronomy") or request.path.startswith("/geocode"):
        response.headers["Cache-Control"] = "public, max-age=3600"  # Cache for 1 hour
    elif request.path.startswith("/astrology") or request.path.startswith("/transits"):
        response.headers["Cache-Control"] = "public, max-age=1800"  # Cache for 30 minutes
    return response

# -------------------- Health --------------------
@app.route("/health")
def health():
    return {"status": "ok"}, 200

# -------------------- 🌌 Astronomy Calculations Endpoint --------------------
@app.route("/astronomy", methods=["POST"])
def astronomy():
    """Calculates Julian Day, Sidereal Time, and Local Sidereal Time."""
    data = request.json

    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    date_time_str = data.get("datetime")
    latitude = data.get("latitude")
    longitude = data.get("longitude")

    if not date_time_str or latitude is None or longitude is None:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        utc_datetime = datetime.strptime(date_time_str, "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
        astronomy_data = AstronomyService.calculate_astronomy_data(utc_datetime, latitude, longitude)
        return jsonify(astronomy_data)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# -------------------- 📍 Geolocation Endpoint --------------------
@app.route("/geocode", methods=["POST"])
def geocode():
    """Converts a user-provided location into latitude and longitude."""
    data = request.json
    if not data or "address" not in data:
        return jsonify({"error": "Missing address"}), 400

    try:
        latitude, longitude = geolocation_service.geocode_location(data["address"])
        return jsonify({"latitude": latitude, "longitude": longitude})
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# -------------------- 🔮 Astrology Calculation Endpoint --------------------
@app.route("/astrology", methods=["POST"])
def astrology():
    """Calculates planetary positions, extracts Big 3, and computes houses."""
    data = request.json

    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    birth_date = data.get("birthDate")
    birth_time = data.get("birthTime", "12:00")  # Default time if not provided
    latitude = data.get("latitude")
    longitude = data.get("longitude")

    if not birth_date or latitude is None or longitude is None:
        print("🚨 Missing required fields!")
        return jsonify({"error": "Missing required fields"}), 400

    try:
        # Ensure birth_time has seconds
        if len(birth_time) == 5:  # "HH:MM"
            birth_time += ":00"

        # Convert birth date & time to datetime object (local time)
        birth_datetime = datetime.strptime(f"{birth_date} {birth_time}", "%Y-%m-%d %H:%M:%S")

        # Compute astronomy data once
        astronomy_data = AstronomyService.calculate_astronomy_data(birth_datetime, latitude, longitude)

        # Compute astrological data (planet positions)
        astrology_data = AstrologyService.get_astrological_positions(
            latitude, longitude, astronomy_data["birth_datetime_utc"], astronomy_data=astronomy_data
        )

        # Compute House Cusps using Placidus
        house_cusps = HouseAssignmentService.calculate_house_cusps(
            astronomy_data["julian_day"], latitude, longitude
        )

        # Compute Big 3 (Sun, Moon, Rising)
        big_three = BigThreeService.calculate_big_three(
            astronomy_data["julian_day"],
            latitude,
            longitude,
            astrology_data,
            astronomy_data["local_sidereal_time"],
            house_cusps=house_cusps,
        )

        return jsonify({
            "astrologyData": astrology_data,
            "bigThree": big_three,
            "houseCusps": house_cusps
        })

    except Exception as e:
        print("🔥 Astrology Service Error:", str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# -------------------- ✨ Horoscope Generation Endpoint --------------------
@app.route("/horoscope", methods=["POST"])
def horoscope():
    data = request.json
    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    astrologyPayload = data.get("astrologyPayload", {})
    user_info = data.get("userInfo", {})

    big_three = astrologyPayload.get("bigThree")
    transits = astrologyPayload.get("transits")
    house_cusps = astrologyPayload.get("house_cusps")

    if not big_three or not transits or not user_info:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        horoscope_result = openai_service.generate_horoscope(big_three, transits, user_info, house_cusps)
        return jsonify(horoscope_result)
    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# ----------------------- Transits Endpoint -----------------------
@app.route("/transits", methods=["POST"])
def transits():
    """
    API endpoint to calculate planetary transits for a given birth chart.
    Expects a JSON payload with the user's birth details.
    """
    try:
        data = request.get_json()

        # Validate required fields
        if not data or not all(k in data for k in ["birthDate", "birthTime", "latitude", "longitude"]):
            return jsonify({"error": "Missing required birth details"}), 400

        birth_time = data.get("birthTime", "12:00")
        if len(birth_time) == 5:  # "HH:MM"
            birth_time += ":00"

        birth_datetime_str = f"{data['birthDate']} {birth_time}"
        birth_datetime = datetime.strptime(birth_datetime_str, "%Y-%m-%d %H:%M:%S")

        astronomy_data = AstronomyService.calculate_astronomy_data(
            birth_datetime, data["latitude"], data["longitude"]
        )

        birth_chart = {
            "julian_day": astronomy_data["julian_day"],
            "latitude": data["latitude"],
            "longitude": data["longitude"],
        }

        transit_data = transit_service.calculate_transits(birth_chart)

        return jsonify(transit_data)

    except Exception as e:
        print("🔥 ERROR in /transits endpoint:", str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# -------------------- Natal chart endpoint --------------------
@app.route("/natal-chart", methods=["POST"])
def natal_chart():
    """Generates a natal chart interpretation using OpenAI."""
    data = request.json

    if not data:
        return jsonify({"error": "Invalid JSON"}), 400

    astrology_payload = data.get("astrologyPayload", {})
    user_info = data.get("userInfo", {})

    big_three = astrology_payload.get("bigThree")
    astrology_data = astrology_payload.get("astrologyData")
    house_cusps = astrology_payload.get("houseCusps")

    if not big_three or not astrology_data or not house_cusps or not user_info:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        result = openai_service.generate_natalchart(big_three, astrology_data, house_cusps, user_info)
        return jsonify({"reading": result})
    except Exception as e:
        print("🔥 Natal Chart Error:", str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

# -------------------- 🚀 Run Flask App --------------------
if __name__ == "__main__":
    app.run(debug=True)