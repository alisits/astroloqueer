"""from services.planet_position_service import PlanetPositionService
from models.planet_position import Planet
from datetime import datetime

def main():
    latitude = 51.5074  # Example latitude
    longitude = -0.1278  # Example longitude
    utc_datetime = datetime(2025, 1, 30, 12, 0, 0)  # Example UTC datetime

    planet = Planet.SUN
    planet_position = PlanetPositionService.get_planet_position(planet, latitude, longitude, utc_datetime)
    
    print(f"The {planet.value} is at {planet_position.get_position()} degrees.")

if __name__ == "__main__":
    main()"""
from services.geolocation_service import GeolocationService

def main():
    # Create an instance of GeolocationService (loads API key from the GOOGLE_MAPS_API_KEY environment variable)
    geolocation_service = GeolocationService()

    # Test with Berlin as the input address
    address = "Berlin, Germany"
    try:
        latitude, longitude = geolocation_service.geocode_location(address)
        print(f"Geolocation Test for '{address}':")
        print(f"Latitude: {latitude}")
        print(f"Longitude: {longitude}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    main()
