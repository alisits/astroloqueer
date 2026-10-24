import logging
from services.astronomy_service import AstronomyService
import swisseph as swe

logger = logging.getLogger(__name__)

class HouseAssignmentService:

    @staticmethod
    def calculate_house_cusps(julian_day: float, latitude: float, longitude: float):
        """Calculates house cusps using the Placidus system and corrects for local sidereal time."""

        logger.info(f"🏠 Calculating house cusps for Julian Day {julian_day} at Latitude {latitude}, Longitude {longitude}")

        # ✅ Compute house cusps using Swiss Ephemeris (once per request)
        cusps, ascmc = swe.houses(julian_day, latitude, longitude, b'P')

        ascendant_degree = cusps[0]  # House 1 cusp is the Ascendant
        ascendant_sign = AstronomyService.get_zodiac_sign(ascendant_degree)

        house_cusps = {
            "House 1": HouseAssignmentService.normalize_to_zodiac(cusps[0]),
            "House 2": HouseAssignmentService.normalize_to_zodiac(cusps[1]),
            "House 3": HouseAssignmentService.normalize_to_zodiac(cusps[2]),
            "House 4": HouseAssignmentService.normalize_to_zodiac(cusps[3]),
            "House 5": HouseAssignmentService.normalize_to_zodiac(cusps[4]),
            "House 6": HouseAssignmentService.normalize_to_zodiac(cusps[5]),
            "House 7": HouseAssignmentService.normalize_to_zodiac(cusps[6]),
            "House 8": HouseAssignmentService.normalize_to_zodiac(cusps[7]),
            "House 9": HouseAssignmentService.normalize_to_zodiac(cusps[8]),
            "House 10": HouseAssignmentService.normalize_to_zodiac(cusps[9]),
            "House 11": HouseAssignmentService.normalize_to_zodiac(cusps[10]),
            "House 12": HouseAssignmentService.normalize_to_zodiac(cusps[11]),
            "Ascendant": HouseAssignmentService.normalize_to_zodiac(ascmc[0]),
            "MC": HouseAssignmentService.normalize_to_zodiac(ascmc[1]),
            "ascendant_degree": round(ascendant_degree, 2),
            "ascendant_sign": ascendant_sign,
        }

        logger.info(f"✅ Computed House Cusps: {house_cusps}")
        return house_cusps

    @staticmethod
    def normalize_to_zodiac(longitude: float):
        """Converts absolute longitude (0°–360°) to zodiac-relative degrees (0°–30°)."""
        degree_in_sign = longitude % 30
        sign_name = AstronomyService.get_zodiac_sign(longitude)
        return f"{degree_in_sign:.2f}° {sign_name}"


    @staticmethod
    def assign_transits_to_houses(transit_data: dict, natal_houses: dict):
        """
        Assigns transiting planets to the correct natal houses based on their longitudes.
        Args:
            transit_data (dict): Dictionary containing planetary positions for today.
            natal_houses (dict): Dictionary of natal house cusps.
        Returns:
            dict: Transiting planets with assigned houses.
        """
        logger.info("🏠 Assigning transiting planets to natal houses...")

        try:
            # Parse house cusps: convert degree strings (like "3.33° Aquarius") to absolute longitude (float)
            # Only include entries that are degree strings (exclude ascendant_degree float, ascendant_sign, etc.)
            house_cusps = {
                house: HouseAssignmentService.convert_degree_string_to_float(natal_houses[house])
                for house, val in natal_houses.items()
                if isinstance(val, str) and "°" in val
            }
            house_cusps_sorted = sorted(house_cusps.items(), key=lambda x: x[1])
            logger.debug(f"✅ Raw House Cusps Before Sorting: {house_cusps}")
            logger.debug(f"✅ Sorted House Cusps: {house_cusps_sorted}")

            # Convert sorted house cusps back to a dictionary and lists for labels and degrees
            sorted_houses = {house: cusp for house, cusp in house_cusps_sorted}
            house_degrees = list(sorted_houses.values())
            house_labels = list(sorted_houses.keys())
            logger.debug(f"✅ Parsed Natal House Cusps: {house_degrees}")

            assigned_transits = {}

            # Process each transit entry
            for planet, data in transit_data.items():
                # If data is a PlanetPosition object, use its get_coordinates() method
                if hasattr(data, "get_coordinates"):
                    coords = data.get_coordinates()
                else:
                    coords = data  # Fallback in case it is already a dictionary or list

                if not coords:
                    continue

                # Extract the planetary longitude (list from PlanetPosition or dict with "longitude" key)
                if isinstance(coords, dict):
                    planet_longitude = coords.get("longitude")
                    zodiac_sign = coords.get("zodiac_sign") or (AstronomyService.get_zodiac_sign(planet_longitude) if planet_longitude is not None else "Unknown")
                else:
                    planet_longitude = coords[0]
                    zodiac_sign = AstronomyService.get_zodiac_sign(planet_longitude)
                if planet_longitude is None:
                    continue
                assigned_house = None

                # Find the correct house by comparing with the sorted house degrees
                for i in range(len(house_degrees) - 1):
                    if house_degrees[i] <= planet_longitude < house_degrees[i + 1]:
                        assigned_house = house_labels[i]
                        break
                else:
                    assigned_house = house_labels[-1]  # Fallback: assign to the last house

                # Output key: Planet enum .value or string key (e.g. "Sun")
                planet_key = planet.value if hasattr(planet, "value") else planet

                assigned_transits[planet_key] = {
                    "longitude": planet_longitude,
                    "zodiac_sign": zodiac_sign,
                    "house": assigned_house,
                }

            logger.info(f"✅ Transiting Planets Assigned to Houses: {assigned_transits}")
            return assigned_transits

        except Exception as e:
            logger.error(f"🔥 Error assigning transiting planets to houses: {str(e)}")
            return {"error": str(e)}

    @staticmethod
    def convert_degree_string_to_float(degree_str: str) -> float:
        """
        Converts a degree string (e.g., '3.33° Aquarius') into a float (absolute longitude).
        """
        try:
            parts = degree_str.split("°")
            degree = float(parts[0])
            sign = parts[1].strip()

            zodiac_offsets = {
                "Aries": 0, "Taurus": 30, "Gemini": 60, "Cancer": 90,
                "Leo": 120, "Virgo": 150, "Libra": 180, "Scorpio": 210,
                "Sagittarius": 240, "Capricorn": 270, "Aquarius": 300, "Pisces": 330
            }

            return degree + zodiac_offsets[sign]

        except Exception as e:
            logger.error(f"🔥 Error converting degree string: {degree_str} → {str(e)}")
            return -1  # Use a negative value to indicate an error
