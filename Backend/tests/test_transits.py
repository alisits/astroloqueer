import unittest
from datetime import datetime, timezone
from services.house_assignment_service import HouseAssignmentService

class TestTransitHouseAssignments(unittest.TestCase):
    
    def setUp(self):
        """Setup sample transiting planets and natal house cusps for testing."""
        self.transiting_planets = {
            "Sun": {"longitude": 357.14, "zodiac_sign": "Pisces"},
            "Moon": {"longitude": 212.21, "zodiac_sign": "Scorpio"},
            "Mercury": {"longitude": 9.25, "zodiac_sign": "Aries"},
            "Venus": {"longitude": 6.04, "zodiac_sign": "Aries"}
        }

        self.natal_houses = {
            "House 1": "3.33° Aquarius",
            "House 2": "17.71° Pisces",
            "House 3": "25.57° Aries",
            "House 4": "23.55° Taurus",
            "House 5": "16.17° Gemini",
            "House 6": "7.80° Cancer",
            "House 7": "3.33° Leo",
            "House 8": "17.71° Virgo",
            "House 9": "25.57° Libra",
            "House 10": "23.55° Scorpio",
            "House 11": "16.17° Sagittarius",
            "House 12": "7.80° Capricorn"
        }

    def test_assign_transits_to_houses(self):
        """Test if transiting planets are correctly assigned to houses."""
        result = HouseAssignmentService.assign_transits_to_houses(self.transiting_planets, self.natal_houses)

        expected_results = {
            "Sun": {"longitude": 357.14, "zodiac_sign": "Pisces", "house": "House 1"},
            "Moon": {"longitude": 212.21, "zodiac_sign": "Scorpio", "house": "House 10"},
            "Mercury": {"longitude": 9.25, "zodiac_sign": "Aries", "house": "House 3"},
            "Venus": {"longitude": 6.04, "zodiac_sign": "Aries", "house": "House 3"}
        }

        self.assertEqual(result, expected_results, "Transiting planets should be assigned correctly to houses.")
        print("🔍 Expected Results:", expected_results)
        print("🔍 Actual Results:", result)

if __name__ == "__main__":
    unittest.main()
