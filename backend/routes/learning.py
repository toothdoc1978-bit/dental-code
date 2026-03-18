from datetime import date, datetime, timezone
from flask import Blueprint, jsonify, request
from models.database import (
    db,
    ClaimRecord,
    ProcedureRecord,
    AttachmentRecord,
    FrequencyRecord,
    LearningInsight,
)

learning_bp = Blueprint("learning", __name__)


@learning_bp.route("/api/learning/<payer>/<cdt_code>", methods=["GET"])
def get_learning_insights(payer, cdt_code):
    """Return denial rate and recommendations for a payer/CDT code pair."""
    insights = LearningInsight.query.filter_by(
        payer=payer, cdt_code=cdt_code.upper()
    ).all()

    if not insights:
        return jsonify({
            "payer": payer,
            "cdt_code": cdt_code.upper(),
            "insights": [],
            "message": "No learning data available for this payer/code combination.",
        }), 200

    # Compute aggregate denial rate (weighted by sample_size)
    total_samples = sum(i.sample_size for i in insights)
    weighted_rate = (
        sum(i.denial_rate * i.sample_size for i in insights) / total_samples
        if total_samples > 0
        else 0
    )

    return jsonify({
        "payer": payer,
        "cdt_code": cdt_code.upper(),
        "aggregate_denial_rate": round(weighted_rate, 3),
        "total_sample_size": total_samples,
        "insights": [i.to_dict() for i in insights],
    }), 200


@learning_bp.route("/api/claims", methods=["POST"])
def record_claim():
    """Record a claim outcome for learning purposes."""
    data = request.get_json()
    if not data:
        return jsonify({"error": "Request body is required"}), 400

    # Validate required fields
    required = ["payer", "dos", "outcome"]
    missing = [f for f in required if f not in data]
    if missing:
        return jsonify({"error": f"Missing required fields: {', '.join(missing)}"}), 400

    # Parse date of service
    try:
        dos = date.fromisoformat(data["dos"])
    except (ValueError, TypeError):
        return jsonify({"error": "Invalid date format for dos. Use YYYY-MM-DD."}), 400

    # Validate outcome
    valid_outcomes = ["paid", "denied", "partial", "pending"]
    if data["outcome"] not in valid_outcomes:
        return jsonify({
            "error": f"Invalid outcome. Must be one of: {', '.join(valid_outcomes)}"
        }), 400

    # Create claim record
    claim = ClaimRecord(
        payer=data["payer"],
        dos=dos,
        provider=data.get("provider"),
        outcome=data["outcome"],
        denial_reason=data.get("denial_reason"),
        appeal_outcome=data.get("appeal_outcome"),
        narrative_hash=data.get("narrative_hash"),
    )
    db.session.add(claim)
    db.session.flush()  # get claim.id before adding children

    # Add procedures
    for proc in data.get("procedures", []):
        procedure = ProcedureRecord(
            claim_id=claim.id,
            cdt=proc.get("cdt", "").upper(),
            icd10_codes=proc.get("icd10_codes"),
            surfaces=proc.get("surfaces"),
            tooth=proc.get("tooth"),
        )
        db.session.add(procedure)

    # Add attachments
    for att in data.get("attachments", []):
        attachment = AttachmentRecord(
            claim_id=claim.id,
            type=att.get("type", ""),
            present=att.get("present", False),
        )
        db.session.add(attachment)

    # Update frequency records if patient_id provided
    patient_id = data.get("patient_id")
    if patient_id:
        for proc in data.get("procedures", []):
            cdt_code = proc.get("cdt", "").upper()
            if cdt_code:
                freq = FrequencyRecord.query.filter_by(
                    patient_id=patient_id, cdt_code=cdt_code, payer=data["payer"]
                ).first()
                if freq:
                    freq.last_service_date = dos
                else:
                    freq = FrequencyRecord(
                        patient_id=patient_id,
                        cdt_code=cdt_code,
                        last_service_date=dos,
                        payer=data["payer"],
                    )
                    db.session.add(freq)

    db.session.commit()

    return jsonify({
        "message": "Claim recorded successfully",
        "claim": claim.to_dict(),
    }), 201


@learning_bp.route("/api/frequency/<patient_id>/<cdt_code>", methods=["GET"])
def check_frequency(patient_id, cdt_code):
    """Check last service date for a patient/CDT code combination."""
    payer = request.args.get("payer")

    query = FrequencyRecord.query.filter_by(
        patient_id=patient_id, cdt_code=cdt_code.upper()
    )
    if payer:
        query = query.filter_by(payer=payer)

    records = query.order_by(FrequencyRecord.last_service_date.desc()).all()

    if not records:
        return jsonify({
            "patient_id": patient_id,
            "cdt_code": cdt_code.upper(),
            "records": [],
            "message": "No prior service records found.",
        }), 200

    # Check against payer rules if available
    from data.payer_rules import PAYER_RULES

    warnings = []
    latest = records[0]
    if payer and payer in PAYER_RULES:
        rules = PAYER_RULES[payer]
        freq_limits = rules.get("frequency_limitations", {})
        if cdt_code.upper() in freq_limits:
            limit = freq_limits[cdt_code.upper()]
            days_since = (date.today() - latest.last_service_date).days
            limit_days = limit.get("days", 0)
            if days_since < limit_days:
                remaining = limit_days - days_since
                warnings.append(
                    f"Frequency limitation: {limit.get('description', '')}. "
                    f"{remaining} days remaining before eligible."
                )

    return jsonify({
        "patient_id": patient_id,
        "cdt_code": cdt_code.upper(),
        "records": [r.to_dict() for r in records],
        "last_service_date": latest.last_service_date.isoformat(),
        "warnings": warnings,
    }), 200
