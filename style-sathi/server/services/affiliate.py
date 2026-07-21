from dotenv import load_dotenv
import os
import hashlib
import hmac
import base64
import urllib.parse
import time
import uuid
import requests
import json
import logging
from core.AppException import AppException

load_dotenv()

logger = logging.getLogger(__name__)

DARAZ_API_KEY = os.getenv("DARAZ_API_KEY")
FLIPKART_AFFILIATE_ID = os.getenv("FLIPKART_AFFILIATE_ID")
FLIPKART_API_KEY = os.getenv("FLIPKART_API_KEY")
AMAZON_ACCESS_KEY = os.getenv("AMAZON_ACCESS_KEY")
AMAZON_SECRET_KEY = os.getenv("AMAZON_SECRET_KEY")
AMAZON_ASSOCIATE_TAG = os.getenv("AMAZON_ASSOCIATE_TAG", "stylesathi-21")


def search_daraz(keywords: str, limit: int = 10) -> list[dict]:
    if not DARAZ_API_KEY:
        logger.warning("DARAZ_API_KEY not configured")
        return []

    try:
        response = requests.get(
            "https://api.daraz.com/rest/product/search",
            params={
                "q": keywords,
                "limit": min(limit, 20),
                "api_key": DARAZ_API_KEY,
            },
            timeout=15,
        )
        if not response.ok:
            logger.error(f"Daraz search failed: {response.status_code}")
            return []

        data = response.json()
        products = []
        for item in data.get("result", {}).get("products", []):
            products.append({
                "id": f"daraz_{item.get('itemId', uuid.uuid4().hex)}",
                "title": item.get("name", ""),
                "description": item.get("description", ""),
                "price": item.get("price"),
                "currency": "NPR",
                "image_url": item.get("image"),
                "product_url": item.get("productUrl", ""),
                "source": "daraz",
                "location": "NP",
                "metadata": {
                    "brand": item.get("brand"),
                    "category": item.get("category"),
                    "rating": item.get("rating"),
                },
            })
        return products
    except requests.RequestException as e:
        logger.error(f"Daraz API error: {str(e)}")
        return []


def search_flipkart(keywords: str, limit: int = 10) -> list[dict]:
    if not FLIPKART_AFFILIATE_ID or not FLIPKART_API_KEY:
        logger.warning("Flipkart affiliate keys not configured")
        return []

    try:
        url = "https://affiliate-api.flipkart.net/affiliate/search/json"
        query_string = urllib.parse.urlencode({"query": keywords, "resultCount": min(limit, 20)})
        signature = _generate_flipkart_signature(url, query_string)

        response = requests.get(
            f"{url}?{query_string}",
            headers={
                "Fk-Affiliate-Id": FLIPKART_AFFILIATE_ID,
                "Fk-Affiliate-Token": FLIPKART_API_KEY,
                "X-Checksum": signature,
            },
            timeout=15,
        )

        if not response.ok:
            logger.error(f"Flipkart search failed: {response.status_code}")
            return []

        data = response.json()
        products = []
        for item in data.get("productInfoList", []):
            base = item.get("productBaseInfo", {}).get("productAttributes", {})
            shipping = item.get("productShippingInfo", {}).get("shippingBaseInfo", {})
            product_id = base.get("productId", uuid.uuid4().hex)
            products.append({
                "id": f"flipkart_{product_id}",
                "title": base.get("title", ""),
                "description": base.get("productDescription", ""),
                "price": base.get("sellingPrice", {}).get("amount"),
                "currency": "INR",
                "image_url": base.get("imageUrls", {}).get("400x400"),
                "product_url": base.get("productUrl", ""),
                "source": "flipkart",
                "location": "IN",
                "metadata": {
                    "brand": base.get("brand"),
                    "category": base.get("category"),
                    "rating": base.get("averageRating"),
                    "inStock": shipping.get("availabilityStatus") == "Available",
                },
            })
        return products
    except requests.RequestException as e:
        logger.error(f"Flipkart API error: {str(e)}")
        return []


def _generate_flipkart_signature(url: str, query_string: str) -> str:
    message = f"{url}?{query_string}"
    signature = hmac.new(
        FLIPKART_API_KEY.encode(),
        message.encode(),
        hashlib.sha256,
    ).hexdigest()
    return signature


def search_amazon(keywords: str, location: str = "US", limit: int = 10) -> list[dict]:
    if not AMAZON_ACCESS_KEY or not AMAZON_SECRET_KEY:
        logger.warning("Amazon API keys not configured, using PAAPI v5")
        return _search_amazon_paapi(keywords, location, limit)

    return _search_amazon_paapi(keywords, location, limit)


def _search_amazon_paapi(keywords: str, location: str, limit: int) -> list[dict]:
    if not AMAZON_ACCESS_KEY or not AMAZON_SECRET_KEY:
        return []

    marketplace_map = {
        "NP": "www.amazon.com",
        "IN": "www.amazon.in",
        "US": "www.amazon.com",
        "UK": "www.amazon.co.uk",
        "AE": "www.amazon.ae",
    }
    host = marketplace_map.get(location, "www.amazon.com")
    region_map = {
        "www.amazon.com": "us-east-1",
        "www.amazon.in": "eu-west-1",
        "www.amazon.co.uk": "eu-west-1",
        "www.amazon.ae": "eu-west-1",
    }
    region = region_map.get(host, "us-east-1")

    try:
        payload = {
            "Keywords": keywords,
            "Resources": [
                "Images.Primary.Medium",
                "ItemInfo.Title",
                "ItemInfo.Features",
                "Offers.Listings.Price",
                "BrowseNodeInfo.BrowseNode",
            ],
            "ItemCount": min(limit, 10),
            "PartnerTag": AMAZON_ASSOCIATE_TAG,
            "PartnerType": "Associates",
            "Marketplace": f"www.amazon.{'com' if location == 'US' else 'in' if location == 'IN' else 'com'}",
        }

        from amazon.paapi import AmazonAPI
        amazon = AmazonAPI(
            AMAZON_ACCESS_KEY,
            AMAZON_SECRET_KEY,
            AMAZON_ASSOCIATE_TAG,
            country=location.lower(),
        )

        results = amazon.search_items(keywords=keywords, item_count=limit)
        products = []
        for item in results:
            products.append({
                "id": f"amazon_{item.asin}",
                "title": item.title or "",
                "description": " ".join(item.features or []) if item.features else "",
                "price": float(item.price.amount) if item.price and item.price.amount else None,
                "currency": item.price.currency if item.price else "USD",
                "image_url": item.images.primary.medium.url if item.images and item.images.primary else None,
                "product_url": item.url or "",
                "source": "amazon",
                "location": location,
                "metadata": {
                    "asin": item.asin,
                    "brand": item.brand,
                    "rating": item.rating,
                },
            })
        return products
    except ImportError:
        logger.warning("amazon-paapi not installed, trying direct PAAPI v5 call")
        return _search_amazon_paapi_direct(keywords, host, region, limit)
    except Exception as e:
        logger.error(f"Amazon PAAPI error: {str(e)}")
        return []


def _search_amazon_paapi_direct(keywords: str, host: str, region: str, limit: int) -> list[dict]:
    try:
        import requests
        import hashlib
        import hmac
        import datetime

        amz_date = datetime.datetime.utcnow().strftime("%Y%m%dT%H%M%SZ")
        datestamp = amz_date[:8]

        payload = {
            "PartnerTag": AMAZON_ASSOCIATE_TAG,
            "PartnerType": "Associates",
            "Keywords": keywords,
            "Resources": [
                "Images.Primary.Medium",
                "ItemInfo.Title",
                "Offers.Listings.Price",
            ],
            "ItemCount": min(limit, 10),
        }

        body = json.dumps(payload)

        canonical_uri = "/paapi5/searchitems"
        canonical_querystring = ""
        signed_headers = "content-type;host;x-amz-date"
        payload_hash = hashlib.sha256(body.encode()).hexdigest()

        canonical_request = (
            f"POST\n{canonical_uri}\n{canonical_querystring}\n"
            f"content-type:application/json;charset=UTF-8\n"
            f"host:{host}\n"
            f"x-amz-date:{amz_date}\n"
            f"\n{signed_headers}\n{payload_hash}"
        )

        algorithm = "AWS4-HMAC-SHA256"
        credential_scope = f"{datestamp}/{region}/ProductAdvertisingAPI/aws4_request"
        string_to_sign = (
            f"{algorithm}\n{amz_date}\n{credential_scope}\n"
            f"{hashlib.sha256(canonical_request.encode()).hexdigest()}"
        )

        def sign(key, msg):
            return hmac.new(key, msg.encode(), hashlib.sha256).digest()

        k_date = sign(f"AWS4{AMAZON_SECRET_KEY}".encode(), datestamp)
        k_region = sign(k_date, region)
        k_service = sign(k_region, "ProductAdvertisingAPI")
        k_signing = sign(k_service, "aws4_request")
        signature = hmac.new(k_signing, string_to_sign.encode(), hashlib.sha256).hexdigest()

        authorization = (
            f"{algorithm} Credential={AMAZON_ACCESS_KEY}/{credential_scope}, "
            f"SignedHeaders={signed_headers}, Signature={signature}"
        )

        response = requests.post(
            f"https://{host}{canonical_uri}",
            data=body,
            headers={
                "Content-Type": "application/json;charset=UTF-8",
                "Host": host,
                "X-Amz-Date": amz_date,
                "Authorization": authorization,
            },
            timeout=15,
        )

        if not response.ok:
            logger.error(f"Amazon PAAPI direct call failed: {response.status_code}")
            return []

        data = response.json()
        products = []
        for item in data.get("ItemsResult", {}).get("Items", []):
            info = item.get("ItemInfo", {})
            title = info.get("Title", {}).get("DisplayValue", "") if info.get("Title") else ""
            offers = item.get("Offers", {})
            listings = offers.get("Listings", [{}]) if offers.get("Listings") else [{}]
            price_info = listings[0].get("Price", {}) if listings else {}
            images = item.get("Images", {})
            primary = images.get("Primary", {})
            medium = primary.get("Medium", {}) if primary else {}

            products.append({
                "id": f"amazon_{item.get('ASIN', '')}",
                "title": title,
                "description": "",
                "price": price_info.get("Amount"),
                "currency": price_info.get("Currency", "USD"),
                "image_url": medium.get("URL") if medium else None,
                "product_url": item.get("DetailPageURL", ""),
                "source": "amazon",
                "location": region,
                "metadata": {"asin": item.get("ASIN", "")},
            })
        return products
    except Exception as e:
        logger.error(f"Amazon PAAPI direct error: {str(e)}")
        return []


def search_affiliate_all(keywords: str, location: str = "NP", limit: int = 10) -> list[dict]:
    products = []

    if location in ("NP", "IN"):
        daraz_results = search_daraz(keywords, limit)
        products.extend(daraz_results)

    if location == "IN":
        flipkart_results = search_flipkart(keywords, limit)
        products.extend(flipkart_results)

    amazon_results = search_amazon(keywords, location, limit)
    products.extend(amazon_results)

    return products
