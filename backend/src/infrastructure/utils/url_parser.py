"""URL parsing utilities."""

from urllib.parse import urlparse
from typing import Optional


def extract_store_from_url(url: Optional[str]) -> Optional[str]:
    """
    Extract store/domain name from URL.

    Examples:
        'https://www.amazon.com/product/123' -> 'amazon.com'
        'https://shop.nike.com/shoes' -> 'nike.com'
        'http://ozon.ru/item' -> 'ozon.ru'
        None -> None
        'invalid-url' -> None

    Args:
        url: The URL to extract the store name from

    Returns:
        The extracted store name (domain) or None if extraction fails
    """
    if not url:
        return None

    try:
        parsed = urlparse(url)
        domain = parsed.netloc or parsed.path.split('/')[0]

        if not domain:
            return None

        # Remove 'www.' prefix if present
        if domain.startswith('www.'):
            domain = domain[4:]

        # Remove port if present
        if ':' in domain:
            domain = domain.split(':')[0]

        return domain if domain else None
    except Exception:
        return None
