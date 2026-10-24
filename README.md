# Astrological Calculations Documentation

## Overview
This repository contains a modular astrology engine built in Python that uses [Swiss Ephemeris](https://www.astro.com/swisseph/) for high-precision planetary calculations. It computes:

1. **Planetary Coordinates** (longitude, latitude, distance) for any date/time.  
2. **Zodiac Signs**, derived from each planet’s longitude along the ecliptic.  
3. **Placidus Houses**, assigning each planet to a house number (1–12) that corresponds to specific life areas.

By separating responsibilities into different services (e.g., `AstrologyService`, `PlanetPositionService`, `HouseAssignmentService`), the system remains flexible and maintainable.

---

## How It Works

1. **Date and Location**  
   - The engine takes an input time in UTC and a location (latitude, longitude).  
   - It uses these to compute a [Julian Day](https://en.wikipedia.org/wiki/Julian_day), a key step for astronomical calculations.

2. **Planetary Positions**  
   - **`PlanetPositionService`** queries the [Swiss Ephemeris](https://pypi.org/project/swisseph/) to get each planet’s coordinates.  
   - Each planet’s **longitude** (0°–360°), **latitude**, and **distance** (in AU) are stored in a `PlanetPosition` object.  
   - A dictionary of `{ Planet: PlanetPosition }` objects is generated for all planets (Sun, Moon, Mercury, etc.).

3. **Zodiac Signs**  
   - **`AstrologyService`** reads each planet’s longitude and determines its zodiac sign based on which 30° segment of the ecliptic the planet occupies.  
   - For example, a longitude of ~310° places the Sun in Aquarius.

4. **House Assignments (Placidus)**  
   - **`HouseAssignmentService`** calculates house cusps and angles (like the Ascendant) via `swe.houses`.  
   - It uses `swe.house_pos` along with the planet’s `[longitude, latitude, distance]` to determine which house (1–12) each planet occupies.  
   - Placidus is an “unequal” house system that divides the sky based on diurnal motion/time rather than fixed degrees.

5. **Final Output**  
   - A consolidated dictionary shows each planet’s **longitude**, **zodiac sign**, **house**, and more.  
   - Example:
     ```yaml
     {
       "Sun": {
         "longitude": 310.85,
         "zodiac_sign": "Aquarius",
         "house": 11
       },
       "Moon": {
         "longitude": 323.57,
         "zodiac_sign": "Aquarius",
         "house": 11
       },
       ...
     }
     ```

---

## Project Structure

```text
Backend/
  api/
    app.py               # Flask app (also runs on AWS Lambda via wsgi_handler.py)
    wsgi_handler.py      # Lambda entry point
    template.yaml        # AWS SAM template
    samconfig.toml       # SAM deploy settings
    models/, services/   # Astrology engine plus OpenAI and geolocation services
    tests/               # SAM sample tests
  tests/                 # Calculation tests
Frontend/                # React + Vite + Tailwind app
netlify.toml             # Frontend build configuration
```

## Configuration

Secrets are never stored in the repository.

- **Backend, local:** copy `Backend/api/.env.example` to `Backend/api/.env` and fill in
  `OPENAI_API_KEY` and `GOOGLE_MAPS_API_KEY`. The `.env` file is git-ignored.
- **Backend, deployed:** values come from AWS Secrets Manager through `template.yaml`
  (see `Backend/api/DEPLOYMENT.md`).
- **Frontend:** copy `Frontend/.env.example` to `Frontend/.env` to point the app at your API.
