import logging
from models.planet_position import PlanetPosition, Planet
from services.astronomy_service import AstronomyService

logger = logging.getLogger(__name__)

class PlanetPositionService:

    @staticmethod
    def get_planet_position(planet: Planet, latitude: float, longitude: float, datetime_utc, julian_day=None):
        """
        Calculates and returns the position of a single planet.
        """
        logger.debug(f"Calculating position for {planet.value}.")
        if julian_day is None:
            julian_day = AstronomyService.calculate_julian_day(datetime_utc)
        planet_position = PlanetPosition(planet, latitude, longitude, datetime_utc=datetime_utc, julian_day=julian_day)
        logger.debug(f"Julian Day: {julian_day}")
        logger.debug(f"Planet ID: {PlanetPosition.PLANET_MAP.get(planet)}")
        logger.debug(f"Calculated longitude: {planet_position.get_position()}°")

        return planet_position

    @staticmethod
    def calculate_planet_positions(latitude: float, longitude: float, datetime_utc, julian_day=None):
        """
        Calculates and returns positions for all planets, keyed by the Planet enum.
        When julian_day is provided, it is used for all planets (computed once).
        """
        logger.info("Calculating positions for all planets.")
        if julian_day is None:
            julian_day = AstronomyService.calculate_julian_day(datetime_utc)
        planet_positions = {}

        for planet in Planet:
            planet_position = PlanetPosition(planet, latitude, longitude, datetime_utc=datetime_utc, julian_day=julian_day)
            planet_positions[planet] = planet_position
            logger.debug(f"{planet.value} -> longitude: {planet_position.get_position()}°")

        return planet_positions
