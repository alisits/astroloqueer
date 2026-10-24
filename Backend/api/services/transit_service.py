import datetime
import logging
from services.planet_position_service import PlanetPositionService
from services.house_assignment_service import HouseAssignmentService
from services.astronomy_service import AstronomyService


logger = logging.getLogger(__name__)

class TransitService:
    def __init__(self, house_assignment_service: HouseAssignmentService):
        self.house_assignment_service = house_assignment_service

    def calculate_transits(self, birth_chart):
        """
        Compute today's planetary transits and assign them to natal houses.
        :param birth_chart: Dictionary containing user's natal chart.
        :return: Dictionary with transiting planets mapped to natal houses.
        """
        logger.info("🚀 Starting transit calculation...")

        # Step 1: Compute Julian Day for today
        today = datetime.datetime.utcnow()
        julian_day = AstronomyService.calculate_julian_day(today)
        logger.debug(f"📆 Julian Day for today: {julian_day}")

        # Step 2: Get transiting planetary positions (pass julian_day to avoid per-planet JD calculation)
        try:
            transiting_planets = PlanetPositionService.calculate_planet_positions(0, 0, today, julian_day=julian_day)
            logger.info(f"🌍 Transiting planets computed: {transiting_planets.keys()}")
        except Exception as e:
            logger.error(f"🔥 Error computing transiting planets: {e}")
            return {"error": f"Failed to calculate transiting planets: {e}"}

        # Step 3: Ensure `birth_chart` contains latitude & longitude
        if "latitude" not in birth_chart or "longitude" not in birth_chart:
            logger.error("❌ Birth chart is missing latitude or longitude!")
            return {"error": "Birth chart is missing latitude or longitude"}

        # Step 4: Retrieve natal house cusps
        try:
            natal_houses = self.house_assignment_service.calculate_house_cusps(
                julian_day=birth_chart["julian_day"],
                latitude=birth_chart["latitude"],
                longitude=birth_chart["longitude"]
            )
            logger.info(f"🏠 Natal house cusps computed: {natal_houses}")
        except Exception as e:
            logger.error(f"🔥 Error computing house cusps: {e}")
            return {"error": f"Failed to calculate house cusps: {e}"}

        # Step 5: Assign transiting planets to houses
        try:
            assigned_transits = self.house_assignment_service.assign_transits_to_houses(transiting_planets, natal_houses)
            logger.info(f"✅ Transits assigned to houses: {assigned_transits}")
        except Exception as e:
            logger.error(f"🔥 Error assigning transits to houses: {e}")
            return {"error": f"Failed to assign transits: {e}"}

        return {
            "date": today.strftime("%Y-%m-%d"),
            "transits": assigned_transits
        }
