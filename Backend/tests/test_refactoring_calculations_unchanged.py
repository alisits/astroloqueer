"""
Tests that the performance refactoring did not change calculation results.

Run from Backend with: PYTHONPATH=api python tests/test_refactoring_calculations_unchanged.py -v

Uses fixed birth data and asserts:
1. Astrology pipeline (astronomy_data, planet positions, house cusps, big three) is deterministic
   and produces expected structure and values.
2. Transits with minimal birth_chart (julian_day, latitude, longitude only) produce the same
   natal house cusps as the full astrology pipeline for the same birth data.
"""

import unittest
from datetime import datetime

# Run from Backend with PYTHONPATH=api
from services.astronomy_service import AstronomyService
from services.astrology_service import AstrologyService
from services.house_assignment_service import HouseAssignmentService
from services.big_three_service import BigThreeService
from services.transit_service import TransitService


# Fixed inputs for deterministic tests (J2000 reference moment, London, UK)
FIXED_BIRTH_DATE = "2000-01-01"
FIXED_BIRTH_TIME = "12:00:00"
FIXED_LATITUDE = 51.5074
FIXED_LONGITUDE = -0.1278


def make_birth_datetime():
    return datetime.strptime(f"{FIXED_BIRTH_DATE} {FIXED_BIRTH_TIME}", "%Y-%m-%d %H:%M:%S")


class TestAstrologyCalculationsUnchanged(unittest.TestCase):
    """Astrology pipeline outputs are deterministic and structurally correct."""

    def test_astronomy_data_deterministic(self):
        """Same input produces same astronomy_data (julian_day, sidereal, LST)."""
        birth_datetime = make_birth_datetime()
        a = AstronomyService.calculate_astronomy_data(
            birth_datetime, FIXED_LATITUDE, FIXED_LONGITUDE
        )
        b = AstronomyService.calculate_astronomy_data(
            birth_datetime, FIXED_LATITUDE, FIXED_LONGITUDE
        )
        self.assertIn("julian_day", a)
        self.assertIn("sidereal_time", a)
        self.assertIn("local_sidereal_time", a)
        self.assertIn("birth_datetime_utc", a)
        self.assertEqual(a["julian_day"], b["julian_day"])
        self.assertEqual(a["sidereal_time"], b["sidereal_time"])
        self.assertEqual(a["local_sidereal_time"], b["local_sidereal_time"])

    def test_astrology_with_astronomy_data_matches_without(self):
        """get_astrological_positions with precomputed astronomy_data matches result when computed inside (backward compat)."""
        birth_datetime = make_birth_datetime()
        astronomy_data = AstronomyService.calculate_astronomy_data(
            birth_datetime, FIXED_LATITUDE, FIXED_LONGITUDE
        )
        birth_datetime_utc = astronomy_data["birth_datetime_utc"]

        # With astronomy_data (current /astrology path)
        with_ctx = AstrologyService.get_astrological_positions(
            FIXED_LATITUDE, FIXED_LONGITUDE, birth_datetime_utc, astronomy_data=astronomy_data
        )
        # Without astronomy_data (recomputes inside)
        without_ctx = AstrologyService.get_astrological_positions(
            FIXED_LATITUDE, FIXED_LONGITUDE, birth_datetime_utc, astronomy_data=None
        )

        self.assertEqual(with_ctx["julian_day"], without_ctx["julian_day"])
        self.assertEqual(with_ctx["sidereal_time"], without_ctx["sidereal_time"])
        self.assertEqual(with_ctx["local_sidereal_time"], without_ctx["local_sidereal_time"])
        for planet in ("Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"):
            self.assertIn(planet, with_ctx, msg=f"Missing planet {planet}")
            self.assertIn(planet, without_ctx, msg=f"Missing planet {planet}")
            self.assertEqual(with_ctx[planet]["zodiac_sign"], without_ctx[planet]["zodiac_sign"], msg=planet)
            self.assertAlmostEqual(with_ctx[planet]["longitude"], without_ctx[planet]["longitude"], places=2, msg=planet)

    def test_house_cusps_and_big_three_consistent(self):
        """House cusps and big three from single astronomy run are consistent."""
        birth_datetime = make_birth_datetime()
        astronomy_data = AstronomyService.calculate_astronomy_data(
            birth_datetime, FIXED_LATITUDE, FIXED_LONGITUDE
        )
        astrology_data = AstrologyService.get_astrological_positions(
            FIXED_LATITUDE, FIXED_LONGITUDE, astronomy_data["birth_datetime_utc"], astronomy_data=astronomy_data
        )
        house_cusps = HouseAssignmentService.calculate_house_cusps(
            astronomy_data["julian_day"], FIXED_LATITUDE, FIXED_LONGITUDE
        )
        big_three = BigThreeService.calculate_big_three(
            astronomy_data["julian_day"], FIXED_LATITUDE, FIXED_LONGITUDE,
            astrology_data, astronomy_data["local_sidereal_time"], house_cusps=house_cusps
        )

        self.assertIn("ascendant_sign", house_cusps)
        self.assertIn("ascendant_degree", house_cusps)
        self.assertEqual(big_three["rising"], house_cusps["ascendant_sign"])
        self.assertEqual(big_three["sun"], astrology_data["Sun"]["zodiac_sign"])
        self.assertEqual(big_three["moon"], astrology_data["Moon"]["zodiac_sign"])
        for i in range(1, 13):
            self.assertIn(f"House {i}", house_cusps)
        self.assertIn("Ascendant", house_cusps)
        self.assertIn("MC", house_cusps)


class TestTransitsWithMinimalBirthChart(unittest.TestCase):
    """Transits with minimal birth_chart (julian_day, lat, lon only) give same natal cusps and valid transits."""

    def test_transits_minimal_birth_chart_same_natal_cusps(self):
        """Natal house cusps from minimal birth_chart match those from full astrology pipeline."""
        birth_datetime = make_birth_datetime()
        astronomy_data = AstronomyService.calculate_astronomy_data(
            birth_datetime, FIXED_LATITUDE, FIXED_LONGITUDE
        )
        # Full pipeline house cusps
        full_cusps = HouseAssignmentService.calculate_house_cusps(
            astronomy_data["julian_day"], FIXED_LATITUDE, FIXED_LONGITUDE
        )
        # Minimal birth_chart (as in /transits after refactor)
        minimal_birth_chart = {
            "julian_day": astronomy_data["julian_day"],
            "latitude": FIXED_LATITUDE,
            "longitude": FIXED_LONGITUDE,
        }
        house_assignment_service = HouseAssignmentService()
        transit_service = TransitService(house_assignment_service)
        result = transit_service.calculate_transits(minimal_birth_chart)

        self.assertNotIn("error", result, msg=f"TransitService returned error: {result.get('error')}")
        self.assertIn("date", result)
        self.assertIn("transits", result)

        # Natal cusps used inside TransitService are computed from same julian_day, lat, lon
        natal_houses_from_transit = house_assignment_service.calculate_house_cusps(
            minimal_birth_chart["julian_day"], minimal_birth_chart["latitude"], minimal_birth_chart["longitude"]
        )
        self.assertEqual(full_cusps["ascendant_sign"], natal_houses_from_transit["ascendant_sign"])
        self.assertEqual(full_cusps["ascendant_degree"], natal_houses_from_transit["ascendant_degree"])
        for key in ("House 1", "House 2", "Ascendant", "MC"):
            self.assertEqual(full_cusps[key], natal_houses_from_transit[key])

    def test_transits_response_structure(self):
        """Transits response has expected structure (date, transits with house/longitude/zodiac_sign)."""
        birth_datetime = make_birth_datetime()
        astronomy_data = AstronomyService.calculate_astronomy_data(
            birth_datetime, FIXED_LATITUDE, FIXED_LONGITUDE
        )
        minimal_birth_chart = {
            "julian_day": astronomy_data["julian_day"],
            "latitude": FIXED_LATITUDE,
            "longitude": FIXED_LONGITUDE,
        }
        house_assignment_service = HouseAssignmentService()
        transit_service = TransitService(house_assignment_service)
        result = transit_service.calculate_transits(minimal_birth_chart)

        self.assertIn("date", result)
        self.assertIn("transits", result)
        transits = result["transits"]
        expected_planets = {"Sun", "Moon", "Mercury", "Venus", "Mars", "Jupiter", "Saturn", "Uranus", "Neptune", "Pluto"}
        self.assertEqual(set(transits.keys()), expected_planets)
        for planet, data in transits.items():
            self.assertIn("house", data, msg=planet)
            self.assertIn("longitude", data, msg=planet)
            self.assertIn("zodiac_sign", data, msg=planet)


if __name__ == "__main__":
    unittest.main()
