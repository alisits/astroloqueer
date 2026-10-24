from datetime import datetime, timezone
import swisseph as swe
from Backend.services.astronomy_service import AstronomyService

# 📍 Example birth data: J2000 reference moment in London (already in UTC)
birth_datetime = datetime(2000, 1, 1, 12, 0, tzinfo=timezone.utc)
longitude = -0.1278  # Example longitude (London)
latitude = 51.5074  # Example latitude (London)

# ✅ Compute Julian Day
jd = AstronomyService.calculate_julian_day(birth_datetime)
print(f"📆 Julian Day: {jd:.6f}")

# ✅ Compute Greenwich Sidereal Time (GST) in degrees
gst = swe.sidtime(jd) * 15  # Convert hours to degrees
print(f"🕰️ Greenwich Sidereal Time (GST): {gst:.4f}°")

# ✅ Compute Local Sidereal Time (LST) manually
lst_manual = (gst + longitude) % 360
print(f"🌍 Local Sidereal Time (LST, Manual): {lst_manual:.4f}°")

# ✅ Compute Houses Using Standard Method (Swiss Ephemeris' Internal LST)
cusps_standard, ascmc_standard = swe.houses(jd, latitude, longitude, b'P')
print(f"🏠 Standard Swiss Ephemeris Ascendant: {cusps_standard[0]:.4f}°")

# ✅ Adjust Julian Day to Match Local Sidereal Time (Alternative Method)
hours_offset = (lst_manual - gst) / 15  # Convert degrees back to hours
jd_adjusted = jd + (hours_offset / 24)  # Adjust Julian Day by the time offset
print(f"📆 Adjusted Julian Day for LST: {jd_adjusted:.6f}")

# ✅ Compute Houses Using Adjusted Julian Day
cusps_adjusted, ascmc_adjusted = swe.houses(jd_adjusted, latitude, longitude, b'P')
print(f"🏠 Adjusted Swiss Ephemeris Ascendant: {cusps_adjusted[0]:.4f}°")
