{
  "name": "LocationShare",
  "type": "object",
  "properties": {
    "user_name": {
      "type": "string",
      "description": "Name of person sharing location"
    },
    "latitude": {
      "type": "number",
      "description": "Latitude coordinate"
    },
    "longitude": {
      "type": "number",
      "description": "Longitude coordinate"
    },
    "is_active": {
      "type": "boolean",
      "default": true,
      "description": "Whether location sharing is currently active"
    },
    "last_updated": {
      "type": "string",
      "format": "date-time",
      "description": "Last location update time"
    }
  },
  "required": [
    "user_name",
    "latitude",
    "longitude"
  ]
}