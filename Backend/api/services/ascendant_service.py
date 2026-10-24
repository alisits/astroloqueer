import logging
import swisseph as swe
from services.astronomy_service import AstronomyService

logger = logging.getLogger(__name__)

class AscendantService:
    @staticmethod
    def calculate_ascendant(julian_day: float, latitude: float, longitude: float, local_sidereal_time: float):

        """
        Computes the Ascendant (Rising Sign) using Swiss Ephemeris house calculations,
        now adjusted for Local Sidereal Time (LST).

        Args:
            julian_day (float): Julian Day for the birth date.
            latitude (float): Observer's latitude.
            longitude (float): Observer's longitude.

        Returns:
            dict: The corrected Ascendant degree and zodiac sign.
        """
        logger.info("🌍 Calculating Ascendant...")

        try:
            # ✅ Compute Local Sidereal Time (LST)
            lst = AstronomyService.calculate_local_sidereal_time(julian_day, longitude)
            logger.info(f"🕰️ Local Sidereal Time Used for Houses: {lst:.4f}°")

            # ✅ Compute Houses Using LST
            cusps, ascmc = swe.houses(julian_day, latitude, longitude, b'P')

            # ✅ Extract Corrected Ascendant Degree (First House Cusp)
            ascendant_degree = cusps[0]  # House 1 cusp is the actual Ascendant

            logger.info(f"✅ Extracted Ascendant Degree: {ascendant_degree}°")

            # ✅ Convert Degree to Zodiac Format (single implementation)
            zodiac_sign = AstronomyService.get_zodiac_sign(ascendant_degree)
            logger.info(f"✅ Corrected Ascendant Degree: {ascendant_degree}° → {zodiac_sign}")

            return {
                "ascendant_degree": round(ascendant_degree, 2),
                "zodiac_sign": zodiac_sign
            }

        except Exception as e:
            logger.error(f"🔥 Error calculating Ascendant: {str(e)}")
            return {"error": str(e)}
