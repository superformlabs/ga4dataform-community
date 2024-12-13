/*
    This file is part of "GA4 Dataform Package".
    Copyright (C) 2023-2024 Superform Labs <support@ga4dataform.com>
    Artem Korneev, Jules Stuifbergen,
    Johan van de Werken, Krisztián Korpa,
    Simon Breton

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, version 3 of the License.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License in the LICENSE.txt file for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const rows = [{
    "event_name": "session_start",
    "table_suffix": "20240403",
    "event_date": "2024-04-03",
    "user_pseudo_id": null,
    "user_id": null,
    "privacy_info": {
      "analytics_storage": "No",
      "ads_storage": "No",
      "uses_transient_token": "No"
    },
    "ecommerce": {
      "total_item_quantity":null,
      "purchase_revenue_in_usd":null,
      "purchase_revenue":null,
      "refund_value_in_usd":null,
      "refund_value":null,
      "shipping_value_in_usd":null,
      "shipping_value":null,
      "tax_value_in_usd":null,
      "tax_value":null,
      "unique_items":null,
      "transaction_id":"(not set)"
    },
    "user_ltv": {
      "revenue": null,
      "currency": null
    },
    "device": {
      "category": "mobile",
      "mobile_brand_name": "Apple",
      "mobile_model_name": "iPhone",
      "mobile_marketing_name": null,
      "mobile_os_hardware_model": null,
      "operating_system": "iOS",
      "operating_system_version": "iOS 16.0",
      "vendor_id": null,
      "advertising_id": null,
      "language": "fr-fr",
      "is_limited_ad_tracking": "No",
      "time_zone_offset_seconds": null,
      "web_info": {
        "browser": "Safari",
        "browser_version": "16.0",
        "hostname": "www.domain.fr"
      }
    },
    "app_info": {
      "id": null,
      "version": null,
      "install_store": null,
      "firebase_app_id": null,
      "install_source": null
    },
    "geo": {
      "continent": "Europe",
      "country": "France",
      "region": "Nouvelle-Aquitaine",
      "city": "Mauleon-Licharre",
      "sub_continent": "Western Europe",
      "metro": "(not set)"
    },
    "first_user_traffic_source": {
      "campaign_name": null,
      "source": null,
      "medium": null
    },
    "stream_id": "XXXXXXX",
    "platform": "WEB",
    "property_id": "analytics_XXXXX",
    "items": [],
    "event_params_custom": {
      "some_custom_event_id": null
    },
    "event_params": {
      "ignore_referrer": null,
      "ga_session_id": null,
      "ga_session_number": "1",
      "batch_page_id": "1712140187336",
      "batch_ordering_id": "2",
      "synthetic_bundle": null,
      "engagement_time_msec": null,
      "engaged_session_event": "1",
      "entrances": null,
      "session_engaged": "1",
      "content_group": "Product overview",
      "content_id": null,
      "content_type": null,
      "page_location": "https://www.domain.fr/grohe/?gclid\u003dxxxxxxxxxxxxxxxx",
      "page_referrer": "https://www.google.com/",
      "page_title": "Title | domain.fr",
      "content": "null",
      "medium": "organic",
      "campaign": "(organic)",
      "source": "google",
      "term": "(not provided)",
      "gclid": "xxxxxxxxxxxxxxxx",
      "dclid": "null",
      "srsltid": "null",
      "coupon": null,
      "currency": null,
      "shipping": null,
      "shipping_tier": null,
      "payment_type": null,
      "tax": null,
      "transaction_id": null,
      "value": null,
      "item_list_id": null,
      "item_list_name": null,
      "creative_name": null,
      "creative_slot": null,
      "promotion_id": null,
      "promotion_name": null,
      "item_name": null,
      "link_classes": null,
      "link_domain": null,
      "link_id": null,
      "link_url": null,
      "outbound": null,
      "ad_unit_code": null,
      "reward_type": null,
      "reward_value": null,
      "video_current_time": null,
      "video_duration": null,
      "video_percent": null,
      "video_provider": null,
      "video_title": null,
      "video_url": null,
      "method": null,
      "app_version": null,
      "cancellation_reason": null,
      "fatal": null,
      "timestamp": null,
      "firebase_error": null,
      "firebase_error_value": null,
      "firebase_screen": null,
      "firebase_screen_class": null,
      "firebase_screen_id": null,
      "free_trial": null,
      "message_device_time": null,
      "message_id": null,
      "message_name": null,
      "message_time": null,
      "message_type": null,
      "previous_app_version": null,
      "previous_first_open_count": null,
      "previous_os_version": null,
      "subscription": null,
      "update_with_analytics": null,
      "achievement_id": null,
      "character": null,
      "level": null,
      "level_name": null,
      "score": null,
      "virtual_currency_name": null,
      "success": null,
      "visible": null,
      "screen_resolution": null,
      "system_app": null,
      "system_app_update": null,
      "file_extension": null,
      "file_name": null,
      "form_destination": null,
      "form_id": null,
      "form_name": null,
      "form_submit_text": null,
      "group_id": null,
      "language": null,
      "percent_scrolled": null,
      "search_term": null,
      "page_location_cleaned": "https://www.domain.fr/grohe/?gclid\u003dxxxxxxxxxxxxxxxx",
      "page_referrer_cleaned": "https://www.google.com/"
    },
    "url_params": {
      "utm_marketing_tactic": null,
      "utm_source_platform": null,
      "utm_term": "null",
      "utm_content": "null",
      "utm_source": "null",
      "utm_medium": "null",
      "utm_campaign": "null",
      "utm_id": "null",
      "utm_creative_format": null,
      "gclid": "xxxxxxxxxxxxxxxx",
      "wbraid": "null",
      "gbraid": "null",
      "msclkid": "null",
      "fbclid": "null",
      "dclid": "null",
      "srsltid": "null",
      "q": null,
      "s": null,
      "search": null,
      "query": null,
      "keyword": null,
      "gtm_debug": null,
      "_gl": null
    },
    "event_id": "2802130077931833447",
    "collected_traffic_source": {
      "manual_campaign_id": "null",
      "manual_campaign_name": "(organic)",
      "manual_source": "google",
      "manual_medium": "organic",
      "manual_term": "(not provided)",
      "manual_content": "null"
    },
    "click_ids": {
      "gclid": "xxxxxxxxxxxxxxxx",
      "wbraid": "null",
      "gbraid": "null",
      "msclkid": "null",
      "fbclid": "null",
      "dclid": "null",
      "srsltid": "null"
    },
    "time": {
      "event_date_YYYYMMDD": "20240403",
      "event_timestamp_micros": "1712140189161612",
      "event_timestamp_utc": "2024-04-03 10:29:49.161612 UTC",
      "user_first_touch_timestamp": "1712140189161612",
      "user_first_touch_timestamp_utc": "2024-04-03 10:29:49.161612 UTC",
      "timestamp_local": {"value":"2024-04-03T12:29:49.161612"},
      "date_local": {"value":"2024-04-03"}
    },
    "is_measurement_protocol_hit": "false",
    "session_id": null,
    "page": {
      "location": "https://www.domain.fr/grohe/?gclid\u003dxxxxxxxxxxxxxxxx",
      "hostname": "www.domain.fr",
      "path": "/grohe/"
    },
    "has_source": "true",
    "hit_number": null,
    "page_number": null
  }]
module.exports = { rows };
