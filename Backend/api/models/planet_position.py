import swisseph as swe
from enum import Enum
from services.astronomy_service import AstronomyService

class Planet(Enum):
    SUN = "Sun"
    MOON = "Moon"
    MERCURY = "Mercury"
    VENUS = "Venus"
    MARS = "Mars"
    JUPITER = "Jupiter"
    SATURN = "Saturn"
    URANUS = "Uranus"
    NEPTUNE = "Neptune"
    PLUTO = "Pluto"

class PlanetPosition:
    PLANET_MAP = {
        Planet.SUN: swe.SUN,
        Planet.MOON: swe.MOON,
        Planet.MERCURY: swe.MERCURY,
        Planet.VENUS: swe.VENUS,
        Planet.MARS: swe.MARS,
        Planet.JUPITER: swe.JUPITER,
        Planet.SATURN: swe.SATURN,
        Planet.URANUS: swe.URANUS,
        Planet.NEPTUNE: swe.NEPTUNE,
        Planet.PLUTO: swe.PLUTO,
    }

    def __init__(self, planet: Planet, latitude: float, longitude: float, datetime_utc=None, *, julian_day=None):
        self.planet = planet
        self.latitude = latitude
        self.longitude = longitude
        self.datetime_utc = datetime_utc
        if julian_day is not None:
            self.julian_day = julian_day
        elif datetime_utc is not None:
            self.julian_day = AstronomyService.calculate_julian_day(datetime_utc)
        else:
            raise ValueError("Either julian_day or datetime_utc must be provided")
        self.coordinates = self._calculate_coordinates()

    def _calculate_coordinates(self):
        """Use swe.calc_ut to retrieve [longitude, latitude, distance, ...]."""
        planet_id = self.PLANET_MAP.get(self.planet)
        if planet_id is not None:
            result = swe.calc_ut(self.julian_day, planet_id)
            if result:
                return result[0]  # [lon, lat, dist, speed_lon, speed_lat, speed_dist]
        return None

    def get_position(self):
        """Return only the longitude for backward compatibility."""
        if self.coordinates:
            return self.coordinates[0]
        return None

    def get_coordinates(self):
        """Return the full coordinate array [longitude, latitude, distance, ...]."""
        return self.coordinates
