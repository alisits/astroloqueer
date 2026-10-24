from datetime import datetime
from timezonefinder import TimezoneFinder
import pytz
import logging
import swisseph as swe

# Configure logging
logger = logging.getLogger(__name__)

class AstronomyService:
    @staticmethod
    def convert_to_utc(birth_datetime: datetime, latitude: float, longitude: float) -> datetime:
        """
        Converts a local birth datetime to UTC using the real timezone based on latitude and longitude.
        Ensures time zone is only set if missing.
        """
        tf = TimezoneFinder()

        # ✅ Get time zone from coordinates
        timezone_str = tf.timezone_at(lng=longitude, lat=latitude)
        if not timezone_str:
            logger.warning("⚠️ Could not determine time zone, assuming UTC")
            timezone_str = "UTC"

        local_tz = pytz.timezone(timezone_str)

        # ✅ Only localize if naive (does not already have tzinfo)
        if birth_datetime.tzinfo is None:
            birth_datetime = local_tz.localize(birth_datetime)  # Apply time zone
        else:
            logger.warning("⚠️ Birth time already has timezone, skipping localization.")

        # ✅ Convert to UTC
        birth_datetime = birth_datetime.astimezone(pytz.utc)

        logger.info(f"📆 Final UTC Birth Time calculated by astronomy service: {birth_datetime} (Time Zone: {timezone_str})")
        return birth_datetime

    @staticmethod
    def calculate_julian_day(utc_datetime: datetime) -> float:
        """
        Converts a given UTC datetime to Julian Day.
        :param utc_datetime: The datetime in UTC.
        :return: Julian Day (float)
        """
        jd = swe.julday(
            utc_datetime.year,
            utc_datetime.month,
            utc_datetime.day,
            utc_datetime.hour + utc_datetime.minute / 60 + utc_datetime.second / 3600,
            swe.GREG_CAL,
        )
        logger.info(f"📆 Julian Day: {jd}")
        return jd

    @staticmethod
    def calculate_astronomy_data(birth_datetime: datetime, latitude: float, longitude: float) -> dict:
        """
        Computes Julian Day, Sidereal Time, and Local Sidereal Time (LST) in a single function.
        Ensures all dependent services use the same values.

        :param birth_datetime: The birth datetime (in local time).
        :param latitude: Observer's latitude.
        :param longitude: Observer's longitude.
        :return: Dictionary with Julian Day, Sidereal Time, and Local Sidereal Time.
        """
        logger.info(f"🌌 Computing Astronomy Data for {birth_datetime} at Longitude {longitude}...")

        # ✅ Convert birth time to UTC
        birth_datetime = AstronomyService.convert_to_utc(birth_datetime, latitude, longitude)

        # ✅ Compute Julian Day
        julian_day = AstronomyService.calculate_julian_day(birth_datetime)
        
        # ✅ Compute Greenwich Sidereal Time (GST)
        gst = swe.sidtime(julian_day) * 15  # Convert from hours to degrees
        logger.info(f"🕰️ Greenwich Sidereal Time (GST): {gst:.4f}°")

        # ✅ Compute Local Sidereal Time (LST)
        lst = (gst + longitude) % 360  # Adjust for observer's longitude
        logger.info(f"🌍 Local Sidereal Time (LST): {lst:.4f}°")

        return {
            "birth_datetime_utc": birth_datetime,
            "julian_day": julian_day,
            "sidereal_time": gst,
            "local_sidereal_time": lst
        }

    @staticmethod
    def calculate_local_sidereal_time(julian_day: float, longitude: float) -> float:
        """
        Calculates Local Sidereal Time (LST) at a given longitude.
        :param julian_day: Julian Day.
        :param longitude: Observer's longitude.
        :return: Local Sidereal Time in degrees (0° to 360°)
        """
        gst = swe.sidtime(julian_day) * 15  # Convert from hours to degrees
        lst = (gst + longitude) % 360  # Adjust for observer's longitude
        
        return lst

    @staticmethod
    def get_zodiac_sign(longitude: float) -> str:
        """
        Converts ecliptic longitude to zodiac sign.
        :param longitude: Ecliptic longitude in degrees.
        :return: Zodiac sign (str)
        """
        zodiac_signs = [
            "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
            "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
        ]
        index = int(longitude // 30) % 12
        return zodiac_signs[index]

    @staticmethod
    def convert_degree_string_to_float(degree_str: str) -> float:
        """
        Converts a string like '3.33° Aquarius' to a numerical degree value.
        The zodiac sign is ignored, and only the degree value is extracted.
        
        :param degree_str: String containing the degree and zodiac sign.
        :return: Degree as a float.
        """
        try:
            return float(degree_str.split("°")[0].strip())
        except (ValueError, IndexError):
            logger.error(f"🔥 Error converting degree string: {degree_str}")
            return 0.0  # Fallback to 0° if parsing fails
