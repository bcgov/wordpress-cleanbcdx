# Unity Uploads

`Hooks/MediaLibrary.php` adds Media Library support for Unity feed uploads and exposes them through public REST endpoints.

## Supported files

- `.json`
- `.csv`

The plugin normalizes generic server MIME detection so JSON and CSV uploads can be used reliably from the WordPress Media Library.

## How editors use it

1. Upload a compatible JSON or CSV file in the Media Library.
2. Open the attachment details.
3. In the `Unity feed data` section, select one feed radio option or `None`.
4. Save the attachment.

If multiple files are marked active for the same feed, the newest active attachment is served.

## Feed options

### Retroactive

- Attachment option: `Retroactive feed`
- Endpoint:
    - `custom/v1/unity-retroactive-feed`
    - `custom/v1/unity-retroactive-feed.json`
- File type: JSON only
- Response behaviour: served verbatim

### OEM

- Attachment option: `OEM feed`
- Endpoint:
    - `custom/v1/unity-oem-feed`
    - `custom/v1/unity-oem-feed.json`
- File type: JSON or CSV
- Response behaviour:
    - JSON uploads are normalized to a make/model-only array
    - CSV uploads can contain full vehicle detail, but the public response only returns:
        - `make`
        - `models[].model_name`
    - Output is de-duplicated and sorted ascending by make and model

Example response:

```json
[
    {
        "make": "BYD",
        "models": [
            {
                "model_name": "6F"
            },
            {
                "model_name": "8TT"
            }
        ]
    }
]
```

### Eligible Commercial Vehicles

- Attachment option: `Eligible Commercial Vehicles`
- Endpoint:
    - `custom/v1/unity-eligible-vehicles-feed`
    - `custom/v1/unity-eligible-vehicles-feed.json`
- File type: JSON or CSV
- Response behaviour:
    - JSON uploads are served verbatim
    - CSV uploads are transformed into the nested vehicle structure used by the Vue app
    - Output is sorted ascending at every level:
        - make
        - model
        - configuration
        - year
        - vehicle class
        - vehicle type
        - fuel type
        - battery arrays
    - CSV-backed responses include `decision_date`

### Intake Class Status

- Attachment option: `Intake Class Status`
- Endpoint:
    - `custom/v1/unity-intake-class-status-feed`
    - `custom/v1/unity-intake-class-status-feed.json`
- File type: JSON or CSV
- Response behaviour:
    - Public output only includes rows where `intake` is `open`
    - Each row contains:
        - `label`
        - `value`
        - `intake`

Example response:

```json
[
    {
        "label": "Class 2B (8,500 to 10,000 lbs)",
        "value": "Class 2B",
        "intake": "open"
    }
]
```

### Approved Sellers

- Attachment option: `Approved Sellers`
- Endpoint:
    - `custom/v1/unity-approved-sellers-feed`
    - `custom/v1/unity-approved-sellers-feed.json`
- File type: CSV only
- Response behaviour:
    - CSV uploads are returned as flat rows keyed by the seller CSV headers
    - `mailing_unit` and `mailing_street_optional` headers are required, but their row values may be blank
    - The `Approved Sellers` Vue block renders the feed as a single sortable HTML table with a simple text filter
    - The table columns are `Company name`, `Location`, `Street address`, `Contact`, and `Approved since`

## CSV formats

### OEM CSV

Required headers:

```text
make,model,configuration,model_year,vehicle_type,vehicle_class,fuel_type,battery_size_range,battery_size,lower_battery_range,upper_battery_range
```

### Eligible Commercial Vehicles CSV

Required headers:

```text
make,model,configuration,model_year,vehicle_type,vehicle_class,fuel_type,battery_size_range,decision_date,battery_size,lower_battery_range,upper_battery_range
```

Notes for both feeds:

- the same full CSV format can be uploaded separately for both the OEM and Eligible Commercial Vehicles feeds
- OEM ignores the extra detail in the public response, but still accepts the full shared CSV

### Intake Class Status CSV

Required headers:

```text
label,value,intake
```

Example:

```text
label,value,intake
"Class 2B (8,500 to 10,000 lbs)",Class 2B,open
"Class 3 (10,001 to 14,000 lbs)",Class 3,open
```

### Approved Sellers CSV

Required headers:

```text
operating_org_name,city,postal_code,email,website,phone_number,decision_date,mailing_street,mailing_unit,mailing_street_optional
```

Notes:

- `mailing_unit` and `mailing_street_optional` may be blank in individual rows
- the `Approved Sellers` Vue block consumes this feed and renders a single table with column sorting and a text filter

## Eligible vehicles last updated tracking

For CSV-backed Eligible Commercial Vehicles uploads, the plugin tracks when a specific file was first activated for that feed.

Behaviour:

- history is keyed by the file fingerprint, not only by attachment ID
- unchecking and rechecking the same CSV keeps the original tracked date
- if the file contents change, the new fingerprint gets its own timestamp
- JSON-backed eligible feeds do not include this tracking header

The active CSV timestamp is exposed as the response header:

```text
X-CleanBCDX-Eligible-Vehicles-Last-Updated
```

The eligible commercial vehicles Vue app reads that header and shows a `Last updated:` line above the filter controls.

## Validation and errors

- Retroactive rejects non-JSON attachments
- CSV feeds reject:
    - missing headers
    - duplicate or empty headers
    - invalid row widths
    - missing required values
    - invalid numeric values
- Invalid feed files return `WP_Error` responses with HTTP `422`

## Implementation notes

Most Unity upload behaviour lives in `Hooks/MediaLibrary.php`, including:

- upload MIME handling
- Media Library attachment radio buttons
- active attachment selection
- REST route registration
- JSON passthrough
- CSV parsing and transformation
- eligible vehicles CSV last-updated tracking
- Vue mount points for the Eligible Commercial Vehicles and Approved Sellers blocks
