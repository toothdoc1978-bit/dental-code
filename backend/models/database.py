from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


class ClaimRecord(db.Model):
    __tablename__ = "claim_records"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    payer = db.Column(db.String(100), nullable=False, index=True)
    dos = db.Column(db.Date, nullable=False)  # date of service
    provider = db.Column(db.String(200), nullable=True)
    outcome = db.Column(db.String(50), nullable=False)  # paid, denied, partial
    denial_reason = db.Column(db.String(500), nullable=True)
    appeal_outcome = db.Column(db.String(50), nullable=True)
    narrative_hash = db.Column(db.String(64), nullable=True)
    created_at = db.Column(
        db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc)
    )

    # Relationships
    procedures = db.relationship(
        "ProcedureRecord", backref="claim", cascade="all, delete-orphan"
    )
    attachments = db.relationship(
        "AttachmentRecord", backref="claim", cascade="all, delete-orphan"
    )

    def to_dict(self):
        return {
            "id": self.id,
            "payer": self.payer,
            "dos": self.dos.isoformat() if self.dos else None,
            "provider": self.provider,
            "outcome": self.outcome,
            "denial_reason": self.denial_reason,
            "appeal_outcome": self.appeal_outcome,
            "narrative_hash": self.narrative_hash,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "procedures": [p.to_dict() for p in self.procedures],
            "attachments": [a.to_dict() for a in self.attachments],
        }


class ProcedureRecord(db.Model):
    __tablename__ = "procedure_records"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    claim_id = db.Column(
        db.Integer, db.ForeignKey("claim_records.id"), nullable=False, index=True
    )
    cdt = db.Column(db.String(10), nullable=False, index=True)
    icd10_codes = db.Column(db.JSON, nullable=True)  # list of ICD-10 codes
    surfaces = db.Column(db.JSON, nullable=True)  # e.g. ["M", "O", "D"]
    tooth = db.Column(db.String(5), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "claim_id": self.claim_id,
            "cdt": self.cdt,
            "icd10_codes": self.icd10_codes,
            "surfaces": self.surfaces,
            "tooth": self.tooth,
        }


class AttachmentRecord(db.Model):
    __tablename__ = "attachment_records"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    claim_id = db.Column(
        db.Integer, db.ForeignKey("claim_records.id"), nullable=False, index=True
    )
    type = db.Column(db.String(100), nullable=False)  # photo, radiograph, narrative
    present = db.Column(db.Boolean, nullable=False, default=False)

    def to_dict(self):
        return {
            "id": self.id,
            "claim_id": self.claim_id,
            "type": self.type,
            "present": self.present,
        }


class FrequencyRecord(db.Model):
    __tablename__ = "frequency_records"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    patient_id = db.Column(db.String(100), nullable=False, index=True)
    cdt_code = db.Column(db.String(10), nullable=False, index=True)
    last_service_date = db.Column(db.Date, nullable=False)
    payer = db.Column(db.String(100), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "patient_id": self.patient_id,
            "cdt_code": self.cdt_code,
            "last_service_date": self.last_service_date.isoformat()
            if self.last_service_date
            else None,
            "payer": self.payer,
        }


class LearningInsight(db.Model):
    __tablename__ = "learning_insights"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    payer = db.Column(db.String(100), nullable=False, index=True)
    cdt_code = db.Column(db.String(10), nullable=False, index=True)
    denial_rate = db.Column(db.Float, nullable=False)
    sample_size = db.Column(db.Integer, nullable=False, default=0)
    factor = db.Column(db.String(200), nullable=True)
    recommendation = db.Column(db.Text, nullable=True)
    updated_at = db.Column(
        db.DateTime,
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    def to_dict(self):
        return {
            "id": self.id,
            "payer": self.payer,
            "cdt_code": self.cdt_code,
            "denial_rate": self.denial_rate,
            "sample_size": self.sample_size,
            "factor": self.factor,
            "recommendation": self.recommendation,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
