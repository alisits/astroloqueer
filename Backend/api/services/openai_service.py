import logging
from openai import OpenAI
from services.config_service import ConfigService
from services.prompt_builder_service import PromptBuilder

logger = logging.getLogger(__name__)


class OpenAIService:
    def __init__(self):
        self.api_key = ConfigService.get_config("OPENAI_API_KEY")
        self.model = ConfigService.get_config("OPENAI_MODEL") or "gpt-5.1-chat-latest"
        self.client = OpenAI(api_key=self.api_key)

    # ----------------------------
    # 🔮 Default Horoscope
    # ----------------------------
    def generate_horoscope(self, big_three, transits, user_info, house_cusps):
        logger.info(f"🔮 Generating horoscope with model: {self.model}")

        prompt = PromptBuilder.build_prompt(
            "B", big_three, transits, user_info, house_cusps
        )

        try:
            response = self.client.responses.create(
                model=self.model,
                input=[
                    {
                        "role": "system",
                        "content": (
                            "You are a compassionate astrologer who writes empowering, "
                            "inclusive horoscopes centered on the experiences and identities "
                            "of queer, trans, and gender-diverse people."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                max_output_tokens=500,
            )

            horoscope = response.output_text
            logger.info("✅ Horoscope generated successfully.")
            return {"horoscope": horoscope}

        except Exception as e:
            logger.error(f"🔥 OpenAI Error: {e}", exc_info=True)
            return {"error": "Failed to generate horoscope"}

    # ----------------------------
    # 🌌 Natal Chart
    # ----------------------------
    def generate_natalchart(self, big_three, astrology_data, house_cusps, user_info):
        logger.info("🌌 Generating natal chart interpretation with GPT-5.1...")

        prompt = PromptBuilder.build_natal_chart_prompt(
            big_three, astrology_data, house_cusps, user_info
        )

        try:
            response = self.client.responses.create(
                model="gpt-5.1-chat-latest",
                input=[
                    {
                        "role": "system",
                        "content": (
                            "You are an expert astrologer who writes queer-inclusive "
                            "natal chart interpretations that are warm, affirming, "
                            "and personal."
                        ),
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                max_output_tokens=750,
            )

            return response.output_text.strip()

        except Exception as e:
            logger.error(f"🔥 OpenAI Error (natal chart): {e}", exc_info=True)
            return None