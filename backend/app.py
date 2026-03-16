import os
from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

from models.database import db
from routes.learning import learning_bp
from routes.references import references_bp


def create_app():
    app = Flask(__name__)

    # Configuration
    basedir = os.path.abspath(os.path.dirname(__file__))
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///" + os.path.join(
        basedir, "clinical_sidecar.db"
    )
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
    app.config["JSON_SORT_KEYS"] = False

    # CORS - allow the React frontend
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize extensions
    db.init_app(app)

    # Register blueprints
    app.register_blueprint(learning_bp)
    app.register_blueprint(references_bp)

    # Create tables and seed data on startup
    with app.app_context():
        db.create_all()
        _seed_learning_insights(db)

    return app


def _seed_learning_insights(db):
    """Seed LearningInsight table with MCNA examples from the spec."""
    from models.database import LearningInsight

    # Only seed if table is empty
    if LearningInsight.query.first() is not None:
        return

    seeds = [
        # MCNA D2330 - composite one surface, anterior
        LearningInsight(
            payer="MCNA",
            cdt_code="D2330",
            denial_rate=0.42,
            sample_size=156,
            factor="missing_photo",
            recommendation="Pre-op and post-op intraoral photos reduce denial rate from 42% to 8%. Attach clinical photos showing caries extent before prep.",
        ),
        LearningInsight(
            payer="MCNA",
            cdt_code="D2330",
            denial_rate=0.08,
            sample_size=89,
            factor="with_photo",
            recommendation="Claims with pre/post-op photos have 8% denial rate. Continue including clinical photography.",
        ),
        LearningInsight(
            payer="MCNA",
            cdt_code="D2330",
            denial_rate=0.35,
            sample_size=120,
            factor="missing_narrative",
            recommendation="Include a clinical narrative describing the lesion size, location, and why restoration is necessary. Narrative reduces denials by ~27%.",
        ),
        # MCNA D2740 - crown porcelain/ceramic
        LearningInsight(
            payer="MCNA",
            cdt_code="D2740",
            denial_rate=0.55,
            sample_size=78,
            factor="no_preauth",
            recommendation="MCNA requires pre-authorization for crowns. Denial rate drops from 55% to 12% with prior auth and radiographic evidence.",
        ),
        LearningInsight(
            payer="MCNA",
            cdt_code="D2740",
            denial_rate=0.12,
            sample_size=64,
            factor="with_preauth",
            recommendation="Pre-authorized crown claims with radiographs showing >50% structural loss have 12% denial rate.",
        ),
        # MCNA D4341 - SRP
        LearningInsight(
            payer="MCNA",
            cdt_code="D4341",
            denial_rate=0.38,
            sample_size=200,
            factor="missing_perio_charting",
            recommendation="Full-mouth perio charting with 4mm+ pocket depths required. Include BOP percentages and attachment loss measurements.",
        ),
        LearningInsight(
            payer="MCNA",
            cdt_code="D4341",
            denial_rate=0.10,
            sample_size=145,
            factor="with_perio_charting",
            recommendation="Claims with complete perio charting (6-point probing) have 10% denial. Document pocket depths per quadrant.",
        ),
        # MCNA D7140 - extraction erupted tooth
        LearningInsight(
            payer="MCNA",
            cdt_code="D7140",
            denial_rate=0.22,
            sample_size=310,
            factor="missing_radiograph",
            recommendation="PA radiograph required showing non-restorable tooth. Include narrative explaining why extraction is treatment of choice over restoration.",
        ),
        # MCNA D3310 - endo anterior
        LearningInsight(
            payer="MCNA",
            cdt_code="D3310",
            denial_rate=0.30,
            sample_size=95,
            factor="missing_pulp_test",
            recommendation="Document pulp vitality test results (cold, EPT, or percussion). Include pre-op PA showing periapical radiolucency.",
        ),
        # MCNA D1351 - sealant
        LearningInsight(
            payer="MCNA",
            cdt_code="D1351",
            denial_rate=0.18,
            sample_size=420,
            factor="age_limit",
            recommendation="MCNA covers sealants for permanent molars on patients under 16. Verify tooth is non-restored permanent molar and patient meets age requirement.",
        ),
        # MCNA D0220 - periapical first radiograph
        LearningInsight(
            payer="MCNA",
            cdt_code="D0220",
            denial_rate=0.05,
            sample_size=500,
            factor="frequency",
            recommendation="Periapical radiographs rarely denied when tied to specific diagnostic need. Document chief complaint and clinical findings.",
        ),
        # Commercial baseline
        LearningInsight(
            payer="Commercial",
            cdt_code="D2330",
            denial_rate=0.15,
            sample_size=250,
            factor="general",
            recommendation="Commercial payers typically require documentation of caries on radiograph or clinical exam. Ensure ICD-10 matches restoration location.",
        ),
    ]

    db.session.add_all(seeds)
    db.session.commit()


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
