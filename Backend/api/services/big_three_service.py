import logging
from services.ascendant_service import AscendantService
from services.astronomy_service import AstronomyService

logger = logging.getLogger(__name__)

class BigThreeService:
    @staticmethod
    def calculate_big_three(julian_day: float, latitude: float, longitude: float, astrology_data: dict, local_sidereal_time: float, house_cusps: dict = None):
        """
        Extracts Sun, Moon, and Rising signs from computed astrology data.
        When house_cusps is provided (with ascendant_sign), Ascendant is not recomputed (houses computed once).
        """

        logger.info("🔍 Extracting Big Three...")

        try:
            sun_sign = astrology_data.get("Sun", {}).get("zodiac_sign", "Unknown")
            moon_sign = astrology_data.get("Moon", {}).get("zodiac_sign", "Unknown")

            if house_cusps is not None and "ascendant_sign" in house_cusps:
                rising_sign = house_cusps["ascendant_sign"]
            else:
                ascendant_data = AscendantService.calculate_ascendant(julian_day, latitude, longitude, local_sidereal_time)
                rising_sign = ascendant_data.get("zodiac_sign", "Unknown")

            big_three = {
                "sun": sun_sign,
                "moon": moon_sign,
                "rising": rising_sign
            }

            logger.info(f"✅ Big Three Computed: {big_three}")
            return big_three

        except Exception as e:
            logger.error(f"🔥 Error extracting Big Three: {str(e)}")
            return {"error": str(e)}
