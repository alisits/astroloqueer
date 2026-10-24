import json

class PromptBuilder:
    @staticmethod
    def build_prompt(
        template: str,
        big_three: dict,
        transits: dict,
        user_info: dict,
        house_cusps: dict
    ) -> str:

        # ── user fields ───────────────────────────────────────────
        name       = user_info.get("name", "the user")
        location   = user_info.get("location", "an undisclosed location")
        orientation= user_info.get("orientation", "queer")
        gender     = user_info.get("genderIdentity", "unspecified")
        pronouns   = user_info.get("pronouns", "")

        # ── Variant A: grounded, transit-focused, flowing prose ───
        if template == "A":
            return f"""
You are **Astroloqueer**, a professional astrologer writing for a queer-inclusive audience.

## Output rules
• Length: keep the entire horoscope under ≈ 250 tokens.  
• Form: **four short paragraphs**  
  1. **Opening** – greet {name} warmly (use pronouns only if it helps flow).  
  2. **Transit Insights** – weave the 3-4 strongest transits that touch the natal Sun, Moon, Rising or key house cusps into a smooth narrative.  
  3. **Practical Guidance** – translate those transits into grounded, identity-aware advice.  
  4. **Closing Mantra** – one uplifting sentence (< 10 words).  
• Tone: insightful, grounded, practical, gently affirming.  
• Orientation handling: if orientation == "other", omit any orientation reference; otherwise mention it naturally.  
• No bullet lists; write fluid, reader-friendly prose.

## User Identity
name: {name}
pronouns: {pronouns}
location: {location}
orientation: {orientation}

## Natal Snapshot
BigThree = {json.dumps(big_three, indent=2)}
HouseCusps = {json.dumps(house_cusps, indent=2)}

## Today’s Transits
{json.dumps(transits, indent=2)}
"""

        # ── Variant B remains unchanged ──────────────────────────
        elif template == "B":
            return f"""

Compose a positive, joyful, and affirming daily message for a {orientation} person named {name} from {location},
who identifies as {gender} and uses {pronouns} pronouns that blends their user details with the day's current transits.
Focus on creativity, self-love, and queer expression. Personalize using their natal chart.
Limit to 250 tokens.           

Use this astrological snapshot:

Big Three:
{json.dumps(big_three, indent=2)}
House Cusps:
{json.dumps(house_cusps, indent=2)}

Planetary Transits:
{json.dumps(transits, indent=2)}

"""
    @staticmethod
    def build_natal_chart_prompt(big_three: dict, astrology_data: dict, house_cusps: dict, user_info: dict) -> str:
        name = user_info.get("name", "the user")
        location = user_info.get("location", "an undisclosed location")
        orientation = user_info.get("orientation", "queer")
        gender = user_info.get("genderIdentity", "unspecified")
        pronouns = user_info.get("pronouns", "")

        return f"""
    {name} is a {orientation} person from {location} who identifies as {gender} and uses {pronouns} pronouns.

    Write a full natal chart interpretation that is queer-aware, positive, personal, and insightful.

    Use this astrology data:

    🌞 Big Three:
    {json.dumps(big_three, indent=2)}

    🪐 Planetary Positions:
    {json.dumps(astrology_data, indent=2)}

    🏠 House Cusps:
    {json.dumps(house_cusps, indent=2)}

    Style: warm, identity-aware, empowering, and practical. Avoid clichés. Focus on character traits, strengths, and life themes.
    Limit to 300–400 words.
    """
