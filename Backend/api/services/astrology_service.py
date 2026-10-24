from datetime import datetime, timezone
from services.astronomy_service import AstronomyService
from services.planet_position_service import PlanetPositionService
from models.planet_position import Planet
import logging

logger = logging.getLogger(__name__)

class AstrologyService:
    @staticmethod
    def get_astrological_positions(latitude: float, longitude: float, birth_datetime: datetime, astronomy_data: dict = None):
        """
        Returns planetary positions along with astronomical data (Julian Day, Sidereal Time, etc.).
        When astronomy_data is provided, it is used and not recomputed (single astronomy pipeline).
        """

        logger.info(f"📆 Final UTC Birth Time Used: {birth_datetime} by astroloy service")

        if astronomy_data is not None:
            julian_day = astronomy_data["julian_day"]
            sidereal_time = astronomy_data["sidereal_time"]
            local_sidereal_time = astronomy_data["local_sidereal_time"]
        else:
            # Backward compatibility: compute astronomy data when not provided
            astronomy_data = AstronomyService.calculate_astronomy_data(birth_datetime, latitude, longitude)
            julian_day = astronomy_data["julian_day"]
            sidereal_time = astronomy_data["sidereal_time"]
            local_sidereal_time = astronomy_data["local_sidereal_time"]

        # ✅ Compute Planet Positions (pass julian_day when available to avoid per-planet JD calculation)
        planet_positions = PlanetPositionService.calculate_planet_positions(
            latitude, longitude, birth_datetime, julian_day=julian_day
        )
        astrological_data = {}

        for planet, position_obj in planet_positions.items():
            coords = position_obj.get_coordinates()
            if not coords:
                continue

            lon, lat, dist = coords[:3]
            zodiac_sign = AstronomyService.get_zodiac_sign(lon)

            astrological_data[planet.value] = {
                "longitude": round(lon, 2),
                "latitude": round(lat, 2),
                "distance": round(dist, 2),
                "zodiac_sign": zodiac_sign,
            }

        # ✅ Include astronomical data separately
        astrological_data["julian_day"] = julian_day
        astrological_data["sidereal_time"] = sidereal_time
        astrological_data["local_sidereal_time"] = local_sidereal_time

        return astrological_data

