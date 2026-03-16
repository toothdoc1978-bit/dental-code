"""
Common dental CDT codes covering all 10 priority categories:
Composites/Restorative, Crowns, SRP/Periodontal, Extractions, Endodontics,
Sedation/Nitrous, Radiographs, Emergency/Limited Evals, Preventive (including SDF),
and Prosthetics.
"""

CDT_CODES = {
    # =========================================================================
    # RADIOGRAPHS (D0100-D0999)
    # =========================================================================
    "D0120": {
        "description": "Periodic oral evaluation - established patient",
        "category": "Diagnostic/Evaluation",
        "notes": "Typically once every 6 months.",
    },
    "D0140": {
        "description": "Limited oral evaluation - problem focused",
        "category": "Emergency/Limited Evals",
        "notes": "For emergency or specific problem visits.",
    },
    "D0145": {
        "description": "Oral evaluation for a patient under three years of age and counseling with primary caregiver",
        "category": "Diagnostic/Evaluation",
        "notes": "Pediatric-specific evaluation.",
    },
    "D0150": {
        "description": "Comprehensive oral evaluation - new or established patient",
        "category": "Diagnostic/Evaluation",
        "notes": "Typically for new patients or significant change in health condition.",
    },
    "D0160": {
        "description": "Detailed and extensive oral evaluation - problem focused, by report",
        "category": "Emergency/Limited Evals",
        "notes": "For unusual or complicated diagnostic problems.",
    },
    "D0170": {
        "description": "Re-evaluation - limited, problem focused (established patient; not post-operative visit)",
        "category": "Emergency/Limited Evals",
        "notes": "Follow-up on a previously diagnosed condition.",
    },
    "D0180": {
        "description": "Comprehensive periodontal evaluation - new or established patient",
        "category": "Diagnostic/Evaluation",
        "notes": "Includes full perio charting, assessment of periodontal conditions.",
    },
    "D0210": {
        "description": "Intraoral - complete series of radiographic images",
        "category": "Radiographs",
        "notes": "Full mouth series. Typically once every 3-5 years.",
    },
    "D0220": {
        "description": "Intraoral - periapical first radiographic image",
        "category": "Radiographs",
        "notes": "Single PA film for diagnostic purposes.",
    },
    "D0230": {
        "description": "Intraoral - periapical each additional radiographic image",
        "category": "Radiographs",
        "notes": "Each additional PA beyond the first.",
    },
    "D0240": {
        "description": "Intraoral - occlusal radiographic image",
        "category": "Radiographs",
        "notes": "Occlusal view.",
    },
    "D0250": {
        "description": "Extra-oral - 2D projection radiographic image created using a stationary radiation source, and detector",
        "category": "Radiographs",
        "notes": "Lateral ceph, posteroanterior, etc.",
    },
    "D0270": {
        "description": "Bitewing - single radiographic image",
        "category": "Radiographs",
        "notes": "Single bitewing film.",
    },
    "D0272": {
        "description": "Bitewings - two radiographic images",
        "category": "Radiographs",
        "notes": "Two bitewing films. Typically once every 6-12 months.",
    },
    "D0274": {
        "description": "Bitewings - four radiographic images",
        "category": "Radiographs",
        "notes": "Four bitewing films. Typically once every 6-12 months.",
    },
    "D0277": {
        "description": "Vertical bitewings - 7 to 8 radiographic images",
        "category": "Radiographs",
        "notes": "Full mouth vertical bitewing series.",
    },
    "D0330": {
        "description": "Panoramic radiographic image",
        "category": "Radiographs",
        "notes": "Panorex. Typically once every 3-5 years.",
    },
    "D0340": {
        "description": "2D cephalometric radiographic image - acquisition, measurement and analysis",
        "category": "Radiographs",
        "notes": "Orthodontic or surgical planning.",
    },
    "D0350": {
        "description": "2D oral/facial photographic image obtained intraorally or extraorally",
        "category": "Radiographs",
        "notes": "Clinical photos for documentation.",
    },
    "D0367": {
        "description": "Cone beam CT capture and interpretation with limited field of view",
        "category": "Radiographs",
        "notes": "CBCT limited FOV, used for implant planning, endo, impactions.",
    },
    "D0460": {
        "description": "Pulp vitality tests",
        "category": "Diagnostic/Evaluation",
        "notes": "Cold test, EPT, heat test. Document results.",
    },
    "D0470": {
        "description": "Diagnostic casts",
        "category": "Diagnostic/Evaluation",
        "notes": "Study models for treatment planning.",
    },
    # =========================================================================
    # PREVENTIVE (D1000-D1999) including SDF
    # =========================================================================
    "D1110": {
        "description": "Prophylaxis - adult",
        "category": "Preventive",
        "notes": "Routine cleaning for adult patients. Typically 2x per year.",
    },
    "D1120": {
        "description": "Prophylaxis - child",
        "category": "Preventive",
        "notes": "Routine cleaning for child patients. Typically 2x per year.",
    },
    "D1206": {
        "description": "Topical application of fluoride varnish",
        "category": "Preventive",
        "notes": "Fluoride varnish application. Frequency varies by payer.",
    },
    "D1208": {
        "description": "Topical application of fluoride - excluding varnish",
        "category": "Preventive",
        "notes": "Fluoride gel, foam, or rinse application.",
    },
    "D1310": {
        "description": "Nutritional counseling for control of dental disease",
        "category": "Preventive",
        "notes": "Dietary counseling related to caries risk.",
    },
    "D1320": {
        "description": "Tobacco counseling for the control and prevention of oral disease",
        "category": "Preventive",
        "notes": "Tobacco cessation counseling.",
    },
    "D1330": {
        "description": "Oral hygiene instructions",
        "category": "Preventive",
        "notes": "Brushing and flossing instruction.",
    },
    "D1351": {
        "description": "Sealant - per tooth",
        "category": "Preventive",
        "notes": "Pit and fissure sealant on permanent molars. Age limits apply.",
    },
    "D1352": {
        "description": "Preventive resin restoration in a moderate to high caries risk patient - permanent tooth",
        "category": "Preventive",
        "notes": "Conservative resin placed in pit/fissure with incipient caries.",
    },
    "D1353": {
        "description": "Sealant repair - per tooth",
        "category": "Preventive",
        "notes": "Repair of a previously placed sealant.",
    },
    "D1354": {
        "description": "Interim caries arresting medicament application - per tooth",
        "category": "Preventive",
        "notes": "Silver diamine fluoride (SDF) application. Used for caries arrest.",
    },
    "D1510": {
        "description": "Space maintainer - fixed, unilateral - per quadrant",
        "category": "Preventive",
        "notes": "Band and loop space maintainer.",
    },
    "D1516": {
        "description": "Space maintainer - fixed - bilateral, maxillary",
        "category": "Preventive",
        "notes": "Nance or transpalatal arch.",
    },
    "D1517": {
        "description": "Space maintainer - fixed - bilateral, mandibular",
        "category": "Preventive",
        "notes": "Lower lingual holding arch.",
    },
    "D1520": {
        "description": "Space maintainer - removable - unilateral - per quadrant",
        "category": "Preventive",
        "notes": "Removable space maintainer.",
    },
    "D1551": {
        "description": "Re-cement or re-bond bilateral space maintainer - maxillary",
        "category": "Preventive",
        "notes": "Re-cementation of existing space maintainer.",
    },
    "D1575": {
        "description": "Distal shoe space maintainer - fixed, unilateral - per quadrant",
        "category": "Preventive",
        "notes": "Placed before eruption of first permanent molar.",
    },
    # =========================================================================
    # COMPOSITES / RESTORATIVE (D2000-D2999)
    # =========================================================================
    "D2140": {
        "description": "Amalgam - one surface, primary or permanent",
        "category": "Restorative",
        "notes": "Single surface amalgam restoration.",
    },
    "D2150": {
        "description": "Amalgam - two surfaces, primary or permanent",
        "category": "Restorative",
        "notes": "Two surface amalgam restoration.",
    },
    "D2160": {
        "description": "Amalgam - three surfaces, primary or permanent",
        "category": "Restorative",
        "notes": "Three surface amalgam restoration.",
    },
    "D2161": {
        "description": "Amalgam - four or more surfaces, primary or permanent",
        "category": "Restorative",
        "notes": "Four+ surface amalgam restoration.",
    },
    "D2330": {
        "description": "Resin-based composite - one surface, anterior",
        "category": "Composites/Restorative",
        "notes": "Single surface composite on anterior tooth. Photo documentation recommended for MCNA.",
    },
    "D2331": {
        "description": "Resin-based composite - two surfaces, anterior",
        "category": "Composites/Restorative",
        "notes": "Two surface composite on anterior tooth.",
    },
    "D2332": {
        "description": "Resin-based composite - three surfaces, anterior",
        "category": "Composites/Restorative",
        "notes": "Three surface composite on anterior tooth.",
    },
    "D2335": {
        "description": "Resin-based composite - four or more surfaces or involving incisal angle (anterior)",
        "category": "Composites/Restorative",
        "notes": "Four+ surface anterior composite or incisal angle involvement.",
    },
    "D2390": {
        "description": "Resin-based composite crown, anterior",
        "category": "Composites/Restorative",
        "notes": "Full composite crown on anterior tooth.",
    },
    "D2391": {
        "description": "Resin-based composite - one surface, posterior - permanent",
        "category": "Composites/Restorative",
        "notes": "Single surface posterior composite.",
    },
    "D2392": {
        "description": "Resin-based composite - two surfaces, posterior - permanent",
        "category": "Composites/Restorative",
        "notes": "Two surface posterior composite.",
    },
    "D2393": {
        "description": "Resin-based composite - three surfaces, posterior - permanent",
        "category": "Composites/Restorative",
        "notes": "Three surface posterior composite.",
    },
    "D2394": {
        "description": "Resin-based composite - four or more surfaces, posterior - permanent",
        "category": "Composites/Restorative",
        "notes": "Four+ surface posterior composite.",
    },
    "D2929": {
        "description": "Prefabricated porcelain/ceramic crown - primary tooth",
        "category": "Restorative",
        "notes": "Zirconia crown for primary teeth.",
    },
    "D2930": {
        "description": "Prefabricated stainless steel crown - primary tooth",
        "category": "Restorative",
        "notes": "SSC for primary tooth.",
    },
    "D2931": {
        "description": "Prefabricated stainless steel crown - permanent tooth",
        "category": "Restorative",
        "notes": "SSC for permanent tooth.",
    },
    "D2940": {
        "description": "Protective restoration",
        "category": "Restorative",
        "notes": "Sedative or temporary filling (IRM, Cavit).",
    },
    "D2950": {
        "description": "Core buildup, including any pins when required",
        "category": "Restorative",
        "notes": "Buildup for crown retention. Must document structural loss.",
    },
    "D2951": {
        "description": "Pin retention - per tooth, in addition to restoration",
        "category": "Restorative",
        "notes": "Retention pin placed in addition to restoration.",
    },
    "D2954": {
        "description": "Prefabricated post and core in addition to crown",
        "category": "Restorative",
        "notes": "Post and core for endodontically treated tooth.",
    },
    # =========================================================================
    # CROWNS (D2700-D2799)
    # =========================================================================
    "D2710": {
        "description": "Crown - resin-based composite (indirect)",
        "category": "Crowns",
        "notes": "Indirect composite crown.",
    },
    "D2712": {
        "description": "Crown - 3/4 resin-based composite (indirect)",
        "category": "Crowns",
        "notes": "Three-quarter indirect composite crown.",
    },
    "D2720": {
        "description": "Crown - resin with high noble metal",
        "category": "Crowns",
        "notes": "Resin crown with high noble metal substructure.",
    },
    "D2740": {
        "description": "Crown - porcelain/ceramic",
        "category": "Crowns",
        "notes": "All-ceramic or all-porcelain crown. Pre-auth often required.",
    },
    "D2750": {
        "description": "Crown - porcelain fused to high noble metal",
        "category": "Crowns",
        "notes": "PFM crown with high noble metal.",
    },
    "D2751": {
        "description": "Crown - porcelain fused to predominantly base metal",
        "category": "Crowns",
        "notes": "PFM crown with base metal.",
    },
    "D2752": {
        "description": "Crown - porcelain fused to noble metal",
        "category": "Crowns",
        "notes": "PFM crown with noble metal.",
    },
    "D2780": {
        "description": "Crown - 3/4 cast high noble metal",
        "category": "Crowns",
        "notes": "Three-quarter cast crown, high noble.",
    },
    "D2790": {
        "description": "Crown - full cast high noble metal",
        "category": "Crowns",
        "notes": "Full gold crown.",
    },
    "D2791": {
        "description": "Crown - full cast predominantly base metal",
        "category": "Crowns",
        "notes": "Full cast crown, base metal.",
    },
    "D2792": {
        "description": "Crown - full cast noble metal",
        "category": "Crowns",
        "notes": "Full cast crown, noble metal.",
    },
    "D2799": {
        "description": "Provisional crown - further treatment or completion of diagnosis necessary prior to final impression",
        "category": "Crowns",
        "notes": "Temporary/provisional crown.",
    },
    # =========================================================================
    # ENDODONTICS (D3000-D3999)
    # =========================================================================
    "D3110": {
        "description": "Pulp cap - direct (excluding final restoration)",
        "category": "Endodontics",
        "notes": "Direct pulp capping with biocompatible material.",
    },
    "D3120": {
        "description": "Pulp cap - indirect (excluding final restoration)",
        "category": "Endodontics",
        "notes": "Indirect pulp capping.",
    },
    "D3220": {
        "description": "Therapeutic pulpotomy (excluding final restoration) - removal of pulp coronal to the dentinocemental junction and application of medicament",
        "category": "Endodontics",
        "notes": "Pulpotomy for primary teeth or vital pulp therapy.",
    },
    "D3230": {
        "description": "Pulpal therapy (resorbable filling) - anterior, primary tooth (excluding final restoration)",
        "category": "Endodontics",
        "notes": "Pulpectomy on primary anterior tooth.",
    },
    "D3240": {
        "description": "Pulpal therapy (resorbable filling) - posterior, primary tooth (excluding final restoration)",
        "category": "Endodontics",
        "notes": "Pulpectomy on primary posterior tooth.",
    },
    "D3310": {
        "description": "Endodontic therapy, anterior tooth (excluding final restoration)",
        "category": "Endodontics",
        "notes": "Root canal on anterior tooth. Requires PA radiograph and pulp test documentation.",
    },
    "D3320": {
        "description": "Endodontic therapy, premolar tooth (excluding final restoration)",
        "category": "Endodontics",
        "notes": "Root canal on premolar tooth.",
    },
    "D3330": {
        "description": "Endodontic therapy, molar tooth (excluding final restoration)",
        "category": "Endodontics",
        "notes": "Root canal on molar tooth.",
    },
    "D3346": {
        "description": "Retreatment of previous root canal therapy - anterior",
        "category": "Endodontics",
        "notes": "Retreatment of failed anterior root canal.",
    },
    "D3347": {
        "description": "Retreatment of previous root canal therapy - premolar",
        "category": "Endodontics",
        "notes": "Retreatment of failed premolar root canal.",
    },
    "D3348": {
        "description": "Retreatment of previous root canal therapy - molar",
        "category": "Endodontics",
        "notes": "Retreatment of failed molar root canal.",
    },
    "D3410": {
        "description": "Apicoectomy - anterior",
        "category": "Endodontics",
        "notes": "Surgical root end resection, anterior tooth.",
    },
    "D3421": {
        "description": "Apicoectomy - premolar (first root)",
        "category": "Endodontics",
        "notes": "Surgical root end resection, premolar.",
    },
    "D3425": {
        "description": "Apicoectomy - molar (first root)",
        "category": "Endodontics",
        "notes": "Surgical root end resection, molar.",
    },
    "D3450": {
        "description": "Root amputation - per root",
        "category": "Endodontics",
        "notes": "Removal of one root of a multi-rooted tooth.",
    },
    # =========================================================================
    # SRP / PERIODONTAL (D4000-D4999)
    # =========================================================================
    "D4210": {
        "description": "Gingivectomy or gingivoplasty - four or more contiguous teeth or tooth bounded spaces per quadrant",
        "category": "Periodontal",
        "notes": "Surgical excision of gingival tissue.",
    },
    "D4211": {
        "description": "Gingivectomy or gingivoplasty - one to three contiguous teeth or tooth bounded spaces per quadrant",
        "category": "Periodontal",
        "notes": "Limited gingivectomy.",
    },
    "D4240": {
        "description": "Gingival flap procedure, including root planing - four or more contiguous teeth or tooth bounded spaces per quadrant",
        "category": "Periodontal",
        "notes": "Open flap debridement with root planing.",
    },
    "D4241": {
        "description": "Gingival flap procedure, including root planing - one to three contiguous teeth or tooth bounded spaces per quadrant",
        "category": "Periodontal",
        "notes": "Limited open flap debridement.",
    },
    "D4249": {
        "description": "Clinical crown lengthening - hard tissue",
        "category": "Periodontal",
        "notes": "Osseous recontouring for restorative access.",
    },
    "D4260": {
        "description": "Osseous surgery (including elevation of a full thickness flap and closure) - four or more contiguous teeth or tooth bounded spaces per quadrant",
        "category": "Periodontal",
        "notes": "Osseous surgery with flap.",
    },
    "D4261": {
        "description": "Osseous surgery (including elevation of a full thickness flap and closure) - one to three contiguous teeth or tooth bounded spaces per quadrant",
        "category": "Periodontal",
        "notes": "Limited osseous surgery.",
    },
    "D4341": {
        "description": "Periodontal scaling and root planing - four or more teeth per quadrant",
        "category": "SRP/Periodontal",
        "notes": "SRP per quadrant. Requires perio charting with 4mm+ pockets. Full mouth charting needed.",
    },
    "D4342": {
        "description": "Periodontal scaling and root planing - one to three teeth per quadrant",
        "category": "SRP/Periodontal",
        "notes": "Limited SRP per quadrant.",
    },
    "D4355": {
        "description": "Full mouth debridement to enable a comprehensive oral evaluation and diagnosis on a subsequent visit",
        "category": "SRP/Periodontal",
        "notes": "Gross debridement when calculus prevents exam. Cannot be billed with prophy same day.",
    },
    "D4381": {
        "description": "Localized delivery of antimicrobial agents via a controlled release vehicle into diseased crevicular tissue, per tooth",
        "category": "Periodontal",
        "notes": "Arestin (minocycline microspheres) placement.",
    },
    "D4910": {
        "description": "Periodontal maintenance",
        "category": "SRP/Periodontal",
        "notes": "Perio maintenance following active therapy. Typically every 3-4 months.",
    },
    "D4921": {
        "description": "Gingival irrigation - per quadrant",
        "category": "Periodontal",
        "notes": "Subgingival irrigation with antimicrobial agent.",
    },
    # =========================================================================
    # EXTRACTIONS (D7000-D7999)
    # =========================================================================
    "D7111": {
        "description": "Extraction, coronal remnants - primary tooth",
        "category": "Extractions",
        "notes": "Removal of retained primary tooth roots.",
    },
    "D7140": {
        "description": "Extraction, erupted tooth or exposed root (elevation and/or forceps removal)",
        "category": "Extractions",
        "notes": "Simple extraction. Requires PA radiograph showing non-restorable tooth.",
    },
    "D7210": {
        "description": "Extraction, erupted tooth requiring removal of bone and/or sectioning of tooth",
        "category": "Extractions",
        "notes": "Surgical extraction with bone removal or sectioning.",
    },
    "D7220": {
        "description": "Removal of impacted tooth - soft tissue",
        "category": "Extractions",
        "notes": "Soft tissue impaction removal.",
    },
    "D7230": {
        "description": "Removal of impacted tooth - partially bony",
        "category": "Extractions",
        "notes": "Partial bony impaction removal.",
    },
    "D7240": {
        "description": "Removal of impacted tooth - completely bony",
        "category": "Extractions",
        "notes": "Full bony impaction removal.",
    },
    "D7241": {
        "description": "Removal of impacted tooth - completely bony, with unusual surgical complications",
        "category": "Extractions",
        "notes": "Complex full bony impaction with complications.",
    },
    "D7250": {
        "description": "Removal of residual tooth roots (cutting procedure)",
        "category": "Extractions",
        "notes": "Surgical removal of retained roots.",
    },
    "D7260": {
        "description": "Oroantral fistula closure",
        "category": "Extractions",
        "notes": "Surgical closure of communication between oral cavity and maxillary sinus.",
    },
    "D7270": {
        "description": "Tooth reimplantation and/or stabilization of accidentally evulsed or displaced tooth",
        "category": "Extractions",
        "notes": "Replantation of avulsed tooth.",
    },
    "D7280": {
        "description": "Exposure of an unerupted tooth",
        "category": "Extractions",
        "notes": "Surgical exposure for orthodontic purposes.",
    },
    "D7283": {
        "description": "Placement of device to facilitate eruption of impacted tooth",
        "category": "Extractions",
        "notes": "Bonding bracket or chain to impacted tooth.",
    },
    "D7310": {
        "description": "Alveoloplasty in conjunction with extractions - four or more teeth or tooth spaces, per quadrant",
        "category": "Extractions",
        "notes": "Bone recontouring after extractions.",
    },
    "D7311": {
        "description": "Alveoloplasty in conjunction with extractions - one to three teeth or tooth spaces, per quadrant",
        "category": "Extractions",
        "notes": "Limited bone recontouring after extractions.",
    },
    "D7471": {
        "description": "Removal of lateral exostosis",
        "category": "Extractions",
        "notes": "Removal of bony growth (torus mandibularis or buccal exostosis).",
    },
    "D7472": {
        "description": "Removal of torus palatinus",
        "category": "Extractions",
        "notes": "Removal of palatal torus.",
    },
    "D7510": {
        "description": "Incision and drainage of abscess - intraoral soft tissue",
        "category": "Extractions",
        "notes": "I&D of intraoral abscess.",
    },
    "D7511": {
        "description": "Incision and drainage of abscess - intraoral soft tissue - complicated (includes drainage of multiple fascial spaces)",
        "category": "Extractions",
        "notes": "Complex I&D involving multiple spaces.",
    },
    "D7520": {
        "description": "Incision and drainage of abscess - extraoral soft tissue",
        "category": "Extractions",
        "notes": "I&D of extraoral abscess.",
    },
    # =========================================================================
    # SEDATION / NITROUS (D9000-D9999)
    # =========================================================================
    "D9110": {
        "description": "Palliative (emergency) treatment of dental pain - minor procedure",
        "category": "Emergency/Limited Evals",
        "notes": "Emergency pain relief. Document chief complaint and findings.",
    },
    "D9210": {
        "description": "Local anesthesia not in conjunction with operative or surgical procedures",
        "category": "Sedation/Nitrous",
        "notes": "Stand-alone local anesthetic administration.",
    },
    "D9215": {
        "description": "Local anesthesia in conjunction with operative or surgical procedures",
        "category": "Sedation/Nitrous",
        "notes": "Local anesthetic with procedure. Often bundled.",
    },
    "D9219": {
        "description": "Evaluation for moderate sedation, deep sedation, or general anesthesia",
        "category": "Sedation/Nitrous",
        "notes": "Pre-sedation evaluation.",
    },
    "D9222": {
        "description": "Deep sedation/general anesthesia - first 15 minutes",
        "category": "Sedation/Nitrous",
        "notes": "Initial deep sedation/GA period. Requires documentation of medical necessity.",
    },
    "D9223": {
        "description": "Deep sedation/general anesthesia - each subsequent 15 minute increment",
        "category": "Sedation/Nitrous",
        "notes": "Additional 15-min increments of deep sedation/GA.",
    },
    "D9230": {
        "description": "Inhalation of nitrous oxide / analgesia, anxiolysis",
        "category": "Sedation/Nitrous",
        "notes": "Nitrous oxide administration. Some payers limit to pediatric patients.",
    },
    "D9239": {
        "description": "Intravenous moderate (conscious) sedation/analgesia - first 15 minutes",
        "category": "Sedation/Nitrous",
        "notes": "IV moderate sedation initial period.",
    },
    "D9243": {
        "description": "Intravenous moderate (conscious) sedation/analgesia - each subsequent 15 minute increment",
        "category": "Sedation/Nitrous",
        "notes": "Additional 15-min increments of IV sedation.",
    },
    "D9248": {
        "description": "Non-intravenous conscious sedation",
        "category": "Sedation/Nitrous",
        "notes": "Oral or intranasal sedation.",
    },
    "D9310": {
        "description": "Consultation - diagnostic service provided by dentist or physician other than requesting dentist or physician",
        "category": "Diagnostic/Evaluation",
        "notes": "Specialist consultation.",
    },
    "D9420": {
        "description": "Hospital or ambulatory surgical center call",
        "category": "Sedation/Nitrous",
        "notes": "Facility fee for operating room use.",
    },
    "D9430": {
        "description": "Office visit for observation (during regularly scheduled hours) - no other services performed",
        "category": "Emergency/Limited Evals",
        "notes": "Post-op check or observation visit.",
    },
    "D9440": {
        "description": "Office visit - after regularly scheduled hours",
        "category": "Emergency/Limited Evals",
        "notes": "After-hours emergency visit.",
    },
    "D9610": {
        "description": "Therapeutic parenteral drug, single administration",
        "category": "Sedation/Nitrous",
        "notes": "IM or IV drug administration (e.g., antibiotic, steroid).",
    },
    "D9612": {
        "description": "Therapeutic parenteral drugs, two or more administrations, different medications",
        "category": "Sedation/Nitrous",
        "notes": "Multiple parenteral drug administrations.",
    },
    "D9630": {
        "description": "Drugs or medicaments dispensed in the office for home use",
        "category": "Sedation/Nitrous",
        "notes": "Take-home medications dispensed by dental office.",
    },
    "D9910": {
        "description": "Application of desensitizing medicament",
        "category": "Preventive",
        "notes": "Desensitizing agent application (e.g., fluoride varnish for sensitivity).",
    },
    "D9911": {
        "description": "Application of desensitizing resin for cervical and/or root surface, per tooth",
        "category": "Preventive",
        "notes": "Bonding agent applied to sensitive exposed root surfaces.",
    },
    "D9930": {
        "description": "Treatment of complications (post-surgical) - unusual circumstances, by report",
        "category": "Emergency/Limited Evals",
        "notes": "Management of post-operative complications.",
    },
    "D9943": {
        "description": "Occlusal guard adjustment",
        "category": "Prosthetics",
        "notes": "Adjustment of night guard / occlusal splint.",
    },
    "D9944": {
        "description": "Occlusal guard - hard appliance, full arch",
        "category": "Prosthetics",
        "notes": "Hard acrylic night guard for bruxism/TMJ.",
    },
    "D9945": {
        "description": "Occlusal guard - soft appliance, full arch",
        "category": "Prosthetics",
        "notes": "Soft night guard for bruxism.",
    },
    "D9946": {
        "description": "Occlusal guard - hard appliance, partial arch",
        "category": "Prosthetics",
        "notes": "Partial coverage hard occlusal guard.",
    },
    "D9951": {
        "description": "Occlusal adjustment - limited",
        "category": "Prosthetics",
        "notes": "Limited adjustment of occlusion.",
    },
    "D9952": {
        "description": "Occlusal adjustment - complete",
        "category": "Prosthetics",
        "notes": "Complete occlusal equilibration.",
    },
    # =========================================================================
    # PROSTHETICS (D5000-D6999)
    # =========================================================================
    "D5110": {
        "description": "Complete denture - maxillary",
        "category": "Prosthetics",
        "notes": "Full upper denture.",
    },
    "D5120": {
        "description": "Complete denture - mandibular",
        "category": "Prosthetics",
        "notes": "Full lower denture.",
    },
    "D5130": {
        "description": "Immediate denture - maxillary",
        "category": "Prosthetics",
        "notes": "Immediate upper denture placed at time of extractions.",
    },
    "D5140": {
        "description": "Immediate denture - mandibular",
        "category": "Prosthetics",
        "notes": "Immediate lower denture placed at time of extractions.",
    },
    "D5211": {
        "description": "Maxillary partial denture - resin base (including retentive/clasping materials, rests, and teeth)",
        "category": "Prosthetics",
        "notes": "Upper acrylic partial denture (flipper).",
    },
    "D5212": {
        "description": "Mandibular partial denture - resin base (including retentive/clasping materials, rests, and teeth)",
        "category": "Prosthetics",
        "notes": "Lower acrylic partial denture (flipper).",
    },
    "D5213": {
        "description": "Maxillary partial denture - cast metal framework with resin denture bases (including retentive/clasping materials, rests, and teeth)",
        "category": "Prosthetics",
        "notes": "Upper cast metal partial denture.",
    },
    "D5214": {
        "description": "Mandibular partial denture - cast metal framework with resin denture bases (including retentive/clasping materials, rests, and teeth)",
        "category": "Prosthetics",
        "notes": "Lower cast metal partial denture.",
    },
    "D5410": {
        "description": "Adjust complete denture - maxillary",
        "category": "Prosthetics",
        "notes": "Adjustment of upper complete denture.",
    },
    "D5411": {
        "description": "Adjust complete denture - mandibular",
        "category": "Prosthetics",
        "notes": "Adjustment of lower complete denture.",
    },
    "D5421": {
        "description": "Adjust partial denture - maxillary",
        "category": "Prosthetics",
        "notes": "Adjustment of upper partial denture.",
    },
    "D5422": {
        "description": "Adjust partial denture - mandibular",
        "category": "Prosthetics",
        "notes": "Adjustment of lower partial denture.",
    },
    "D5510": {
        "description": "Repair broken complete denture base, mandibular",
        "category": "Prosthetics",
        "notes": "Repair of fractured lower denture.",
    },
    "D5520": {
        "description": "Replace missing or broken teeth - complete denture (each tooth)",
        "category": "Prosthetics",
        "notes": "Replace tooth on complete denture.",
    },
    "D5611": {
        "description": "Repair resin partial denture base, mandibular",
        "category": "Prosthetics",
        "notes": "Repair of lower partial denture base.",
    },
    "D5621": {
        "description": "Repair cast partial framework, mandibular",
        "category": "Prosthetics",
        "notes": "Repair of lower cast partial framework.",
    },
    "D5630": {
        "description": "Repair or replace broken retentive clasping materials - per tooth",
        "category": "Prosthetics",
        "notes": "Clasp repair or replacement.",
    },
    "D5640": {
        "description": "Replace broken teeth - per tooth",
        "category": "Prosthetics",
        "notes": "Replace tooth on partial denture.",
    },
    "D5710": {
        "description": "Rebase complete maxillary denture",
        "category": "Prosthetics",
        "notes": "Replace entire denture base material - upper.",
    },
    "D5711": {
        "description": "Rebase complete mandibular denture",
        "category": "Prosthetics",
        "notes": "Replace entire denture base material - lower.",
    },
    "D5730": {
        "description": "Reline complete maxillary denture (chairside)",
        "category": "Prosthetics",
        "notes": "Chairside reline of upper denture.",
    },
    "D5731": {
        "description": "Reline complete mandibular denture (chairside)",
        "category": "Prosthetics",
        "notes": "Chairside reline of lower denture.",
    },
    "D5750": {
        "description": "Reline complete maxillary denture (laboratory)",
        "category": "Prosthetics",
        "notes": "Lab reline of upper denture.",
    },
    "D5751": {
        "description": "Reline complete mandibular denture (laboratory)",
        "category": "Prosthetics",
        "notes": "Lab reline of lower denture.",
    },
    "D5820": {
        "description": "Interim partial denture (including retentive/clasping materials, rests, and teeth), maxillary",
        "category": "Prosthetics",
        "notes": "Temporary upper partial (flipper/stayplate).",
    },
    "D5821": {
        "description": "Interim partial denture (including retentive/clasping materials, rests, and teeth), mandibular",
        "category": "Prosthetics",
        "notes": "Temporary lower partial (flipper/stayplate).",
    },
    # Fixed prosthodontics (bridges)
    "D6210": {
        "description": "Pontic - cast high noble metal",
        "category": "Prosthetics",
        "notes": "Bridge pontic, high noble metal.",
    },
    "D6240": {
        "description": "Pontic - porcelain fused to high noble metal",
        "category": "Prosthetics",
        "notes": "PFM bridge pontic.",
    },
    "D6241": {
        "description": "Pontic - porcelain fused to predominantly base metal",
        "category": "Prosthetics",
        "notes": "PFM bridge pontic, base metal.",
    },
    "D6242": {
        "description": "Pontic - porcelain fused to noble metal",
        "category": "Prosthetics",
        "notes": "PFM bridge pontic, noble metal.",
    },
    "D6245": {
        "description": "Pontic - porcelain/ceramic",
        "category": "Prosthetics",
        "notes": "All-ceramic bridge pontic.",
    },
    "D6250": {
        "description": "Pontic - resin with high noble metal",
        "category": "Prosthetics",
        "notes": "Resin bridge pontic with noble metal.",
    },
    "D6750": {
        "description": "Retainer crown - porcelain fused to high noble metal",
        "category": "Prosthetics",
        "notes": "PFM bridge abutment crown.",
    },
    "D6751": {
        "description": "Retainer crown - porcelain fused to predominantly base metal",
        "category": "Prosthetics",
        "notes": "PFM bridge abutment, base metal.",
    },
    "D6752": {
        "description": "Retainer crown - porcelain fused to noble metal",
        "category": "Prosthetics",
        "notes": "PFM bridge abutment, noble metal.",
    },
    "D6780": {
        "description": "Retainer crown - 3/4 cast high noble metal",
        "category": "Prosthetics",
        "notes": "3/4 bridge abutment crown.",
    },
    "D6790": {
        "description": "Retainer crown - full cast high noble metal",
        "category": "Prosthetics",
        "notes": "Full gold bridge abutment crown.",
    },
    # Implants
    "D6010": {
        "description": "Surgical placement of implant body: endosteal implant",
        "category": "Prosthetics",
        "notes": "Implant placement. Usually requires pre-auth and CBCT.",
    },
    "D6056": {
        "description": "Prefabricated abutment - includes modification and placement",
        "category": "Prosthetics",
        "notes": "Stock abutment for implant.",
    },
    "D6058": {
        "description": "Abutment supported porcelain/ceramic crown",
        "category": "Prosthetics",
        "notes": "Implant crown - all ceramic.",
    },
    "D6059": {
        "description": "Abutment supported porcelain fused to metal crown (high noble metal)",
        "category": "Prosthetics",
        "notes": "Implant PFM crown.",
    },
    "D6065": {
        "description": "Implant supported porcelain/ceramic crown",
        "category": "Prosthetics",
        "notes": "Screw-retained implant crown.",
    },
    "D6110": {
        "description": "Implant/abutment supported removable denture for completely edentulous arch - maxillary",
        "category": "Prosthetics",
        "notes": "Implant overdenture, upper.",
    },
    "D6111": {
        "description": "Implant/abutment supported removable denture for completely edentulous arch - mandibular",
        "category": "Prosthetics",
        "notes": "Implant overdenture, lower.",
    },
}
