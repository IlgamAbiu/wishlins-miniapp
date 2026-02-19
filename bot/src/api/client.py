"""
Backend API client for bot-to-backend communication.
Handles all HTTP requests to the backend service.
"""

import logging
from dataclasses import dataclass
from datetime import date
from typing import Optional

import aiohttp

from src.config import get_settings

logger = logging.getLogger(__name__)


@dataclass
class UserData:
    """User data from backend API."""

    id: str
    telegram_id: int
    username: Optional[str]
    first_name: str
    last_name: Optional[str]
    avatar_url: Optional[str]


@dataclass
class RegisterResult:
    """Result of user registration."""

    user: UserData
    is_new_user: bool


class BackendAPIError(Exception):
    """Exception for backend API errors."""

    def __init__(self, message: str, status_code: Optional[int] = None):
        super().__init__(message)
        self.status_code = status_code


class BackendAPIClient:
    """Async HTTP client for backend API communication."""

    def __init__(self):
        self._settings = get_settings()
        self._base_url = self._settings.backend_api_url.rstrip("/")
        self._timeout = aiohttp.ClientTimeout(
            total=self._settings.backend_api_timeout
        )
        self._session: Optional[aiohttp.ClientSession] = None

    async def _get_session(self) -> aiohttp.ClientSession:
        """Get or create aiohttp session."""
        if self._session is None or self._session.closed:
            self._session = aiohttp.ClientSession(
                timeout=self._timeout,
                headers={"Content-Type": "application/json"},
            )
        return self._session

    async def close(self) -> None:
        """Close the HTTP session."""
        if self._session and not self._session.closed:
            await self._session.close()

    async def register_user(
        self,
        telegram_id: int,
        username: Optional[str],
        first_name: str,
        last_name: Optional[str],
        avatar_url: Optional[str] = None,
    ) -> RegisterResult:
        """
        Register or update user in the backend.

        Args:
            telegram_id: Telegram user ID
            username: Telegram username
            first_name: User's first name
            last_name: User's last name
            avatar_url: User's avatar URL

        Returns:
            RegisterResult with user data and is_new_user flag
        """
        session = await self._get_session()
        url = f"{self._base_url}/api/v1/users/register"

        payload = {
            "telegram_id": telegram_id,
            "username": username,
            "first_name": first_name,
            "last_name": last_name,
            "avatar_url": avatar_url,
        }

        try:
            async with session.post(url, json=payload) as response:
                if response.status != 200:
                    text = await response.text()
                    logger.error(
                        f"Backend API error: {response.status} - {text}"
                    )
                    raise BackendAPIError(
                        f"Registration failed: {text}",
                        status_code=response.status,
                    )

                data = await response.json()

                user_data = data["user"]
                return RegisterResult(
                    user=UserData(
                        id=user_data["id"],
                        telegram_id=user_data["telegram_id"],
                        username=user_data.get("username"),
                        first_name=user_data["first_name"],
                        last_name=user_data.get("last_name"),
                        avatar_url=user_data.get("avatar_url"),
                    ),
                    is_new_user=data["is_new_user"],
                )

        except aiohttp.ClientError as e:
            logger.error(f"Backend API connection error: {e}")
            raise BackendAPIError(f"Connection error: {e}")

    async def update_user_profile(
        self,
        telegram_id: int,
        birth_date: date,
    ) -> None:
        """
        Update user profile with birth_date.

        Args:
            telegram_id: Telegram user ID
            birth_date: User's date of birth
        """
        session = await self._get_session()
        url = f"{self._base_url}/api/v1/users/telegram/{telegram_id}/profile"

        payload = {"birth_date": birth_date.isoformat()}

        try:
            async with session.patch(url, json=payload) as response:
                if response.status != 200:
                    text = await response.text()
                    logger.error(
                        f"Backend API error updating profile: {response.status} - {text}"
                    )
                    raise BackendAPIError(
                        f"Profile update failed: {text}",
                        status_code=response.status,
                    )
        except aiohttp.ClientError as e:
            logger.error(f"Backend API connection error: {e}")
            raise BackendAPIError(f"Connection error: {e}")

    async def health_check(self) -> bool:
        """Check if backend is healthy."""
        session = await self._get_session()
        url = f"{self._base_url}/health"

        try:
            async with session.get(url) as response:
                return response.status == 200
        except aiohttp.ClientError:
            return False
