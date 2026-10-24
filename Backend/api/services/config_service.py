# services/config_service.py
import os
import pathlib

from dotenv import load_dotenv

# Local development: values come from Backend/api/.env (git-ignored, see .env.example).
# Deployed: values come from real environment variables, which template.yaml
# resolves from AWS Secrets Manager.
load_dotenv(dotenv_path=pathlib.Path(__file__).resolve().parent.parent / ".env")


class ConfigService:
    @classmethod
    def get_config(cls, name: str):
        return os.environ.get(name)
