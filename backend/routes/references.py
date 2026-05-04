from flask import Blueprint, jsonify, request
from data.cdt_codes import CDT_CODES
from data.icd10_codes import ICD10_CODES

references_bp = Blueprint("references", __name__)


@references_bp.route("/api/cdt/search", methods=["GET"])
def search_cdt():
    """Search CDT codes by code or description."""
    query = request.args.get("q", "").strip().upper()
    if not query or len(query) < 2:
        return jsonify({
            "error": "Query parameter 'q' must be at least 2 characters."
        }), 400

    limit = request.args.get("limit", 25, type=int)
    results = []

    for code, info in CDT_CODES.items():
        if query in code.upper() or query in info["description"].upper():
            results.append({
                "code": code,
                "description": info["description"],
                "category": info.get("category", ""),
            })
            if len(results) >= limit:
                break

    return jsonify({"query": query, "count": len(results), "results": results}), 200


@references_bp.route("/api/icd10/search", methods=["GET"])
def search_icd10():
    """Search ICD-10 codes by code or description."""
    query = request.args.get("q", "").strip().upper()
    if not query or len(query) < 2:
        return jsonify({
            "error": "Query parameter 'q' must be at least 2 characters."
        }), 400

    limit = request.args.get("limit", 25, type=int)
    results = []

    for code, info in ICD10_CODES.items():
        if query in code.upper() or query in info["description"].upper():
            results.append({
                "code": code,
                "description": info["description"],
                "category": info.get("category", ""),
            })
            if len(results) >= limit:
                break

    return jsonify({"query": query, "count": len(results), "results": results}), 200


@references_bp.route("/api/cdt/<code>", methods=["GET"])
def lookup_cdt(code):
    """Look up a specific CDT code."""
    code = code.upper()
    if code in CDT_CODES:
        info = CDT_CODES[code]
        return jsonify({
            "code": code,
            "description": info["description"],
            "category": info.get("category", ""),
            "notes": info.get("notes", ""),
        }), 200

    return jsonify({"error": f"CDT code {code} not found."}), 404


@references_bp.route("/api/icd10/<code>", methods=["GET"])
def lookup_icd10(code):
    """Look up a specific ICD-10 code."""
    code = code.upper()
    if code in ICD10_CODES:
        info = ICD10_CODES[code]
        return jsonify({
            "code": code,
            "description": info["description"],
            "category": info.get("category", ""),
            "notes": info.get("notes", ""),
        }), 200

    return jsonify({"error": f"ICD-10 code {code} not found."}), 404
