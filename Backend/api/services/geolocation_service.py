import logging
import requests
from services.config_service import ConfigService

logger = logging.getLogger(__name__)


class GeolocationService:
    """Convert a free-form location string to (lat, lon) using Google Maps."""

    def __init__(self) -> None:
        self.api_key = ConfigService.get_config("GOOGLE_MAPS_API_KEY")
        if not self.api_key:
            logger.error("Google Maps API key is missing")
            raise ValueError("Google Maps API key is missing (set GOOGLE_MAPS_API_KEY).")

    def geocode_location(self, address: str) -> tuple[float, float]:
        url = (
            "https://maps.googleapis.com/maps/api/geocode/json"
            f"?address={requests.utils.quote(address)}&key={self.api_key}"
        )

        try:
            response = requests.get(url, timeout=5)
            response.raise_for_status()
            data = response.json()

            if data.get("status") == "OK" and data.get("results"):
                loc = data["results"][0]["geometry"]["location"]
                logger.debug("Geocoded '%s' → (%s, %s)", address, loc["lat"], loc["lng"])
                return loc["lat"], loc["lng"]

            # Non-OK status from Google
            msg = f"Geocoding failed: {data.get('status', 'Unknown Error')}"
            logger.warning(msg)
            raise ValueError(msg)

        except requests.exceptions.RequestException as exc:
            logger.error("Error calling Google Maps API: %s", exc, exc_info=True)
            raise RuntimeError(f"Error connecting to Google Maps API: {exc}") from exc
