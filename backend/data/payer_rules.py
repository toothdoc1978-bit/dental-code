"""
Payer-specific rules for dental claim validation.
MCNA-specific rules from the Clinical Sidecar spec: frequency limitations,
EPSDT requirements, age limits, mutually exclusive codes, documentation red flags.
Also includes basic commercial payer rule structure.
"""

PAYER_RULES = {
    # =========================================================================
    # MCNA (Managed Care of North America) - Medicaid dental
    # =========================================================================
    "MCNA": {
        "payer_type": "Medicaid",
        "display_name": "MCNA Dental",

        # Frequency limitations: how often a procedure can be performed
        # "days" = minimum days between services
        "frequency_limitations": {
            # Preventive
            "D0120": {
                "days": 180,
                "description": "Periodic oral eval once per 6 months",
                "per": "patient",
            },
            "D0150": {
                "days": 1095,
                "description": "Comprehensive eval once per 3 years or new patient",
                "per": "patient",
            },
            "D0210": {
                "days": 1095,
                "description": "Full mouth series once per 3 years",
                "per": "patient",
            },
            "D0272": {
                "days": 180,
                "description": "Bitewings (2 films) once per 6 months for patients under 12",
                "per": "patient",
                "age_max": 12,
            },
            "D0274": {
                "days": 180,
                "description": "Bitewings (4 films) once per 6 months for patients 12+",
                "per": "patient",
                "age_min": 12,
            },
            "D0330": {
                "days": 1095,
                "description": "Panoramic radiograph once per 3 years",
                "per": "patient",
            },
            "D1110": {
                "days": 180,
                "description": "Adult prophylaxis once per 6 months",
                "per": "patient",
            },
            "D1120": {
                "days": 180,
                "description": "Child prophylaxis once per 6 months",
                "per": "patient",
            },
            "D1206": {
                "days": 90,
                "description": "Fluoride varnish once per 3 months (under 6) or 6 months (6+)",
                "per": "patient",
                "notes": "Age-based frequency: under 6 = every 90 days, 6+ = every 180 days.",
            },
            "D1351": {
                "days": 1095,
                "description": "Sealant once per 3 years per tooth on non-restored permanent molars",
                "per": "tooth",
                "age_max": 16,
                "tooth_types": ["permanent_molar"],
            },
            # Restorative
            "D2330": {
                "days": 730,
                "description": "Composite restoration once per 2 years per surface per tooth",
                "per": "tooth_surface",
            },
            "D2331": {
                "days": 730,
                "description": "2-surface anterior composite once per 2 years per tooth",
                "per": "tooth_surface",
            },
            "D2391": {
                "days": 730,
                "description": "1-surface posterior composite once per 2 years per tooth",
                "per": "tooth_surface",
            },
            "D2392": {
                "days": 730,
                "description": "2-surface posterior composite once per 2 years per tooth",
                "per": "tooth_surface",
            },
            # Crowns
            "D2740": {
                "days": 1825,
                "description": "Crown once per 5 years per tooth",
                "per": "tooth",
                "requires_preauth": True,
            },
            "D2750": {
                "days": 1825,
                "description": "PFM crown once per 5 years per tooth",
                "per": "tooth",
                "requires_preauth": True,
            },
            # Periodontal
            "D4341": {
                "days": 730,
                "description": "SRP once per 2 years per quadrant",
                "per": "quadrant",
            },
            "D4342": {
                "days": 730,
                "description": "Limited SRP once per 2 years per quadrant",
                "per": "quadrant",
            },
            "D4910": {
                "days": 90,
                "description": "Perio maintenance once per 3 months following active perio therapy",
                "per": "patient",
            },
            # Endodontics
            "D3310": {
                "days": 0,
                "description": "Root canal once per tooth lifetime",
                "per": "tooth",
                "lifetime": True,
            },
            "D3320": {
                "days": 0,
                "description": "Root canal once per tooth lifetime",
                "per": "tooth",
                "lifetime": True,
            },
            "D3330": {
                "days": 0,
                "description": "Root canal once per tooth lifetime",
                "per": "tooth",
                "lifetime": True,
            },
            # Prosthetics
            "D5110": {
                "days": 2555,
                "description": "Complete denture once per 7 years",
                "per": "arch",
            },
            "D5120": {
                "days": 2555,
                "description": "Complete denture once per 7 years",
                "per": "arch",
            },
        },

        # EPSDT (Early and Periodic Screening, Diagnostic and Treatment)
        # For Medicaid patients under 21 - broader coverage
        "epsdt": {
            "enabled": True,
            "age_limit": 21,
            "description": (
                "EPSDT requires coverage of all medically necessary dental services "
                "for patients under 21, even if the service is not otherwise covered "
                "under the state Medicaid plan."
            ),
            "expanded_coverage": [
                "Orthodontics when medically necessary (handicapping malocclusion)",
                "Additional fluoride applications for high-caries-risk patients",
                "Sedation/general anesthesia for young children or patients with special needs",
                "Additional radiographs when clinically indicated",
                "Space maintainers for premature loss of primary teeth",
            ],
            "documentation_requirements": [
                "Medical necessity narrative required for services beyond standard limits",
                "Must document how condition affects health, growth, or development",
                "Prior authorization may still be required even under EPSDT",
            ],
        },

        # Age limits for specific procedures
        "age_limits": {
            "D1120": {"max_age": 14, "description": "Child prophy for patients 14 and under"},
            "D1110": {"min_age": 15, "description": "Adult prophy for patients 15 and older"},
            "D1351": {
                "max_age": 16,
                "description": "Sealants covered for patients 16 and under on permanent molars",
            },
            "D2930": {
                "tooth_type": "primary",
                "description": "Stainless steel crowns for primary teeth only (unless EPSDT exception)",
            },
            "D9230": {
                "max_age": 13,
                "description": "Nitrous oxide covered for patients 13 and under (standard); EPSDT may extend",
            },
            "D9222": {
                "max_age": 7,
                "description": "General anesthesia standard coverage for patients 7 and under; older requires medical necessity",
            },
        },

        # Mutually exclusive codes - cannot bill together
        "mutually_exclusive": [
            {
                "codes": ["D1110", "D1120"],
                "description": "Cannot bill adult and child prophy on same date of service",
            },
            {
                "codes": ["D1110", "D4355"],
                "description": "Cannot bill prophy and full mouth debridement on same date",
            },
            {
                "codes": ["D1120", "D4355"],
                "description": "Cannot bill child prophy and full mouth debridement on same date",
            },
            {
                "codes": ["D1110", "D4910"],
                "description": "Cannot bill prophy and perio maintenance on same date",
            },
            {
                "codes": ["D0150", "D0120"],
                "description": "Cannot bill comprehensive and periodic eval on same date",
            },
            {
                "codes": ["D0210", "D0330"],
                "description": "Cannot bill FMX and panoramic on same date",
            },
            {
                "codes": ["D2140", "D2330"],
                "description": "Cannot bill amalgam and composite on same tooth same surface",
                "qualifier": "same_tooth_surface",
            },
            {
                "codes": ["D2950", "D2330"],
                "description": "Core buildup not billable with composite on same tooth",
                "qualifier": "same_tooth",
            },
            {
                "codes": ["D7140", "D7210"],
                "description": "Cannot bill simple and surgical extraction on same tooth",
                "qualifier": "same_tooth",
            },
        ],

        # Documentation red flags - items that trigger higher scrutiny or denial
        "documentation_red_flags": [
            {
                "flag": "missing_radiograph",
                "applies_to": ["D2330", "D2331", "D2332", "D2335", "D2391", "D2392", "D2393", "D2394",
                               "D2740", "D2750", "D7140", "D7210", "D3310", "D3320", "D3330"],
                "severity": "high",
                "description": "Radiographic evidence required for restorative, crown, extraction, and endo procedures.",
            },
            {
                "flag": "missing_perio_charting",
                "applies_to": ["D4341", "D4342", "D4910"],
                "severity": "high",
                "description": "Full-mouth 6-point perio charting required for SRP and perio maintenance.",
            },
            {
                "flag": "missing_clinical_photo",
                "applies_to": ["D2330", "D2331", "D2332", "D2335"],
                "severity": "medium",
                "description": "Pre-op and post-op intraoral photos significantly reduce denial rates for anterior composites.",
            },
            {
                "flag": "missing_narrative",
                "applies_to": ["D2740", "D2750", "D7210", "D7220", "D7230", "D7240", "D9222"],
                "severity": "high",
                "description": "Clinical narrative required explaining medical necessity for crowns, surgical extractions, and general anesthesia.",
            },
            {
                "flag": "missing_preauthorization",
                "applies_to": ["D2740", "D2750", "D2751", "D2752", "D5110", "D5120", "D5213", "D5214",
                               "D6010", "D9222"],
                "severity": "critical",
                "description": "Prior authorization required. Claims without pre-auth have significantly higher denial rates.",
            },
            {
                "flag": "missing_pulp_test",
                "applies_to": ["D3310", "D3320", "D3330"],
                "severity": "high",
                "description": "Pulp vitality test results (cold, EPT, percussion) required for endodontic therapy.",
            },
            {
                "flag": "frequency_exceeded",
                "applies_to": ["D0120", "D0272", "D0274", "D1110", "D1120", "D1206", "D1351"],
                "severity": "high",
                "description": "Service exceeds frequency limitation. Will be auto-denied unless EPSDT exception applies.",
            },
            {
                "flag": "age_limit_exceeded",
                "applies_to": ["D1120", "D1351", "D9230"],
                "severity": "high",
                "description": "Patient age exceeds covered age limit for this procedure.",
            },
            {
                "flag": "missing_tooth_number",
                "applies_to": ["D2330", "D2331", "D2391", "D2392", "D2740", "D2750",
                               "D3310", "D3320", "D3330", "D7140", "D7210"],
                "severity": "critical",
                "description": "Tooth number required for tooth-specific procedures. Missing tooth number causes auto-denial.",
            },
            {
                "flag": "primary_tooth_crown_on_permanent",
                "applies_to": ["D2930"],
                "severity": "high",
                "description": "D2930 (SSC primary) billed on permanent tooth. Use D2931 for permanent teeth.",
            },
        ],

        # Pre-authorization requirements
        "preauth_required": [
            "D2740", "D2750", "D2751", "D2752", "D2790", "D2791", "D2792",
            "D5110", "D5120", "D5130", "D5140", "D5213", "D5214",
            "D6010", "D6058", "D6059", "D6065",
            "D7220", "D7230", "D7240", "D7241",
            "D9222", "D9223",
            "D4260", "D4261",
        ],

        # Bundled procedures - included in parent code, not separately billable
        "bundled_codes": {
            "D9215": {
                "bundled_with": "all_operative",
                "description": "Local anesthesia bundled with operative procedures. Not separately billable.",
            },
            "D0220": {
                "bundled_with": "D0210",
                "description": "Individual PA bundled with FMX on same date.",
            },
            "D2950": {
                "notes": "Core buildup not billable on same tooth as crown if tooth has >50% structure remaining.",
            },
        },
    },

    # =========================================================================
    # Commercial (generic commercial payer rules)
    # =========================================================================
    "Commercial": {
        "payer_type": "Commercial",
        "display_name": "Commercial Insurance (Generic)",

        "frequency_limitations": {
            "D0120": {
                "days": 180,
                "description": "Periodic oral eval once per 6 months",
                "per": "patient",
            },
            "D0150": {
                "days": 1095,
                "description": "Comprehensive eval once per 3 years",
                "per": "patient",
            },
            "D0210": {
                "days": 1825,
                "description": "Full mouth series once per 5 years",
                "per": "patient",
            },
            "D0274": {
                "days": 365,
                "description": "Bitewings once per 12 months",
                "per": "patient",
            },
            "D0330": {
                "days": 1825,
                "description": "Panoramic once per 5 years",
                "per": "patient",
            },
            "D1110": {
                "days": 180,
                "description": "Adult prophylaxis once per 6 months",
                "per": "patient",
            },
            "D1120": {
                "days": 180,
                "description": "Child prophylaxis once per 6 months",
                "per": "patient",
            },
            "D1206": {
                "days": 180,
                "description": "Fluoride once per 6 months",
                "per": "patient",
                "age_max": 18,
            },
            "D1351": {
                "days": 1095,
                "description": "Sealant once per 3 years per tooth",
                "per": "tooth",
                "age_max": 14,
            },
            "D2740": {
                "days": 1825,
                "description": "Crown once per 5 years per tooth",
                "per": "tooth",
            },
            "D4341": {
                "days": 730,
                "description": "SRP once per 2 years per quadrant",
                "per": "quadrant",
            },
            "D4910": {
                "days": 90,
                "description": "Perio maintenance once per 3 months",
                "per": "patient",
            },
            "D5110": {
                "days": 1825,
                "description": "Complete denture once per 5 years",
                "per": "arch",
            },
            "D5120": {
                "days": 1825,
                "description": "Complete denture once per 5 years",
                "per": "arch",
            },
        },

        "age_limits": {
            "D1120": {"max_age": 13, "description": "Child prophy for patients 13 and under"},
            "D1110": {"min_age": 14, "description": "Adult prophy for patients 14 and older"},
            "D1206": {"max_age": 18, "description": "Fluoride covered for patients 18 and under"},
            "D1351": {"max_age": 14, "description": "Sealants for patients 14 and under"},
        },

        "mutually_exclusive": [
            {
                "codes": ["D1110", "D1120"],
                "description": "Cannot bill adult and child prophy on same date",
            },
            {
                "codes": ["D1110", "D4910"],
                "description": "Cannot bill prophy and perio maintenance on same date",
            },
            {
                "codes": ["D0150", "D0120"],
                "description": "Cannot bill comprehensive and periodic eval on same date",
            },
        ],

        "documentation_red_flags": [
            {
                "flag": "missing_radiograph",
                "applies_to": ["D2740", "D2750", "D3310", "D3320", "D3330", "D7140", "D7210"],
                "severity": "high",
                "description": "Radiographic evidence required.",
            },
            {
                "flag": "missing_narrative",
                "applies_to": ["D2740", "D2750", "D9222"],
                "severity": "medium",
                "description": "Clinical narrative recommended for crowns and sedation.",
            },
        ],

        "preauth_required": [
            "D2740", "D2750", "D2751", "D2752",
            "D5110", "D5120", "D5213", "D5214",
            "D6010",
            "D9222",
        ],

        "bundled_codes": {
            "D9215": {
                "bundled_with": "all_operative",
                "description": "Local anesthesia bundled with operative procedures.",
            },
        },
    },

    # =========================================================================
    # Delta Dental (generic Delta Dental Premier/PPO rules)
    # =========================================================================
    "Delta Dental": {
        "payer_type": "Commercial",
        "display_name": "Delta Dental (Generic)",

        "frequency_limitations": {
            "D0120": {
                "days": 180,
                "description": "Periodic eval once per 6 months",
                "per": "patient",
            },
            "D0274": {
                "days": 365,
                "description": "Bitewings once per 12 months",
                "per": "patient",
            },
            "D0210": {
                "days": 1825,
                "description": "FMX once per 5 years",
                "per": "patient",
            },
            "D1110": {
                "days": 180,
                "description": "Adult prophy once per 6 months",
                "per": "patient",
            },
            "D1351": {
                "days": 1095,
                "description": "Sealant once per 3 years per tooth",
                "per": "tooth",
                "age_max": 14,
            },
            "D2740": {
                "days": 1825,
                "description": "Crown once per 5 years per tooth",
                "per": "tooth",
            },
            "D4341": {
                "days": 730,
                "description": "SRP once per 24 months per quadrant",
                "per": "quadrant",
            },
        },

        "age_limits": {
            "D1206": {"max_age": 18, "description": "Fluoride for patients 18 and under"},
            "D1351": {"max_age": 14, "description": "Sealants for patients 14 and under"},
        },

        "mutually_exclusive": [
            {
                "codes": ["D1110", "D4910"],
                "description": "Cannot bill prophy and perio maintenance on same date",
            },
        ],

        "preauth_required": [
            "D2740", "D2750",
            "D5110", "D5120",
            "D6010",
        ],

        "documentation_red_flags": [],
        "bundled_codes": {},
    },
}


def get_payer_rules(payer_name):
    """Get rules for a specific payer. Returns None if payer not found."""
    return PAYER_RULES.get(payer_name)


def get_frequency_limit(payer_name, cdt_code):
    """Get frequency limitation for a specific payer and CDT code."""
    rules = PAYER_RULES.get(payer_name, {})
    return rules.get("frequency_limitations", {}).get(cdt_code)


def get_mutually_exclusive(payer_name, cdt_code):
    """Get mutually exclusive code groups that include the given CDT code."""
    rules = PAYER_RULES.get(payer_name, {})
    exclusions = rules.get("mutually_exclusive", [])
    return [ex for ex in exclusions if cdt_code in ex.get("codes", [])]


def get_red_flags(payer_name, cdt_code):
    """Get documentation red flags for a specific payer and CDT code."""
    rules = PAYER_RULES.get(payer_name, {})
    flags = rules.get("documentation_red_flags", [])
    return [f for f in flags if cdt_code in f.get("applies_to", [])]


def requires_preauth(payer_name, cdt_code):
    """Check if a procedure requires pre-authorization for the given payer."""
    rules = PAYER_RULES.get(payer_name, {})
    return cdt_code in rules.get("preauth_required", [])


def check_age_limit(payer_name, cdt_code, patient_age):
    """Check if patient age meets requirements for a procedure. Returns (ok, message)."""
    rules = PAYER_RULES.get(payer_name, {})
    age_limits = rules.get("age_limits", {})
    limit = age_limits.get(cdt_code)

    if not limit:
        return True, None

    if "max_age" in limit and patient_age > limit["max_age"]:
        return False, f"{limit['description']}. Patient age {patient_age} exceeds maximum of {limit['max_age']}."

    if "min_age" in limit and patient_age < limit["min_age"]:
        return False, f"{limit['description']}. Patient age {patient_age} below minimum of {limit['min_age']}."

    return True, None
