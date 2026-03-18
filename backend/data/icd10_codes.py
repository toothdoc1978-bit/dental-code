"""
Common dental ICD-10 codes covering: caries, periodontal, pulpal, periapical,
fracture, TMJ, examination, and other dental-relevant diagnoses.
"""

ICD10_CODES = {
    # =========================================================================
    # CARIES (K02)
    # =========================================================================
    "K02.3": {
        "description": "Arrested dental caries",
        "category": "Caries",
        "notes": "Caries that has been remineralized or arrested (e.g., after SDF).",
    },
    "K02.51": {
        "description": "Dental caries on pit and fissure surface limited to enamel",
        "category": "Caries",
        "notes": "Incipient caries confined to enamel on occlusal surface.",
    },
    "K02.52": {
        "description": "Dental caries on pit and fissure surface penetrating into dentin",
        "category": "Caries",
        "notes": "Caries extending into dentin on occlusal surface.",
    },
    "K02.53": {
        "description": "Dental caries on pit and fissure surface penetrating into pulp",
        "category": "Caries",
        "notes": "Deep caries with pulp involvement on occlusal surface.",
    },
    "K02.61": {
        "description": "Dental caries on smooth surface limited to enamel",
        "category": "Caries",
        "notes": "Incipient interproximal or smooth surface caries in enamel.",
    },
    "K02.62": {
        "description": "Dental caries on smooth surface penetrating into dentin",
        "category": "Caries",
        "notes": "Smooth surface caries extending into dentin.",
    },
    "K02.63": {
        "description": "Dental caries on smooth surface penetrating into pulp",
        "category": "Caries",
        "notes": "Deep smooth surface caries with pulp exposure.",
    },
    "K02.7": {
        "description": "Dental root caries",
        "category": "Caries",
        "notes": "Caries on exposed root surface.",
    },
    "K02.9": {
        "description": "Dental caries, unspecified",
        "category": "Caries",
        "notes": "General caries diagnosis when specificity not documented.",
    },
    # =========================================================================
    # PERIODONTAL DISEASE (K05)
    # =========================================================================
    "K05.00": {
        "description": "Acute gingivitis, plaque induced",
        "category": "Periodontal",
        "notes": "Gingivitis caused by dental plaque.",
    },
    "K05.01": {
        "description": "Acute gingivitis, non-plaque induced",
        "category": "Periodontal",
        "notes": "Gingivitis not related to plaque (viral, fungal, etc.).",
    },
    "K05.10": {
        "description": "Chronic gingivitis, plaque induced",
        "category": "Periodontal",
        "notes": "Long-standing plaque-induced gingivitis.",
    },
    "K05.11": {
        "description": "Chronic gingivitis, non-plaque induced",
        "category": "Periodontal",
        "notes": "Chronic gingivitis not from plaque.",
    },
    "K05.20": {
        "description": "Aggressive periodontitis, unspecified",
        "category": "Periodontal",
        "notes": "Rapidly progressive periodontitis.",
    },
    "K05.211": {
        "description": "Aggressive periodontitis, localized, slight",
        "category": "Periodontal",
        "notes": "Localized aggressive periodontitis with slight bone loss (1-2mm).",
    },
    "K05.212": {
        "description": "Aggressive periodontitis, localized, moderate",
        "category": "Periodontal",
        "notes": "Localized aggressive periodontitis with moderate bone loss (3-4mm).",
    },
    "K05.213": {
        "description": "Aggressive periodontitis, localized, severe",
        "category": "Periodontal",
        "notes": "Localized aggressive periodontitis with severe bone loss (5mm+).",
    },
    "K05.221": {
        "description": "Aggressive periodontitis, generalized, slight",
        "category": "Periodontal",
        "notes": "Generalized aggressive periodontitis, slight bone loss.",
    },
    "K05.222": {
        "description": "Aggressive periodontitis, generalized, moderate",
        "category": "Periodontal",
        "notes": "Generalized aggressive periodontitis, moderate bone loss.",
    },
    "K05.223": {
        "description": "Aggressive periodontitis, generalized, severe",
        "category": "Periodontal",
        "notes": "Generalized aggressive periodontitis, severe bone loss.",
    },
    "K05.30": {
        "description": "Chronic periodontitis, unspecified",
        "category": "Periodontal",
        "notes": "General chronic periodontitis diagnosis.",
    },
    "K05.311": {
        "description": "Chronic periodontitis, localized, slight",
        "category": "Periodontal",
        "notes": "Localized chronic periodontitis with 1-2mm attachment loss.",
    },
    "K05.312": {
        "description": "Chronic periodontitis, localized, moderate",
        "category": "Periodontal",
        "notes": "Localized chronic periodontitis with 3-4mm attachment loss.",
    },
    "K05.313": {
        "description": "Chronic periodontitis, localized, severe",
        "category": "Periodontal",
        "notes": "Localized chronic periodontitis with 5mm+ attachment loss.",
    },
    "K05.321": {
        "description": "Chronic periodontitis, generalized, slight",
        "category": "Periodontal",
        "notes": "Generalized chronic periodontitis, 1-2mm attachment loss.",
    },
    "K05.322": {
        "description": "Chronic periodontitis, generalized, moderate",
        "category": "Periodontal",
        "notes": "Generalized chronic periodontitis, 3-4mm attachment loss.",
    },
    "K05.323": {
        "description": "Chronic periodontitis, generalized, severe",
        "category": "Periodontal",
        "notes": "Generalized chronic periodontitis, 5mm+ attachment loss.",
    },
    "K05.4": {
        "description": "Periodontosis",
        "category": "Periodontal",
        "notes": "Juvenile periodontosis.",
    },
    "K05.5": {
        "description": "Other periodontal diseases",
        "category": "Periodontal",
        "notes": "Other specified periodontal conditions.",
    },
    "K05.6": {
        "description": "Periodontal disease, unspecified",
        "category": "Periodontal",
        "notes": "Unspecified periodontal disease.",
    },
    "K06.010": {
        "description": "Localized gingival recession, unspecified",
        "category": "Periodontal",
        "notes": "Gingival recession at a specific site.",
    },
    "K06.012": {
        "description": "Localized gingival recession, moderate",
        "category": "Periodontal",
        "notes": "Moderate gingival recession exposing root surface.",
    },
    "K06.020": {
        "description": "Generalized gingival recession, unspecified",
        "category": "Periodontal",
        "notes": "Widespread gingival recession.",
    },
    "K06.1": {
        "description": "Gingival enlargement",
        "category": "Periodontal",
        "notes": "Gingival hyperplasia/overgrowth.",
    },
    # =========================================================================
    # PULPAL AND PERIAPICAL (K04)
    # =========================================================================
    "K04.0": {
        "description": "Pulpitis",
        "category": "Pulpal",
        "notes": "Inflammation of the dental pulp. Use for reversible and irreversible.",
    },
    "K04.01": {
        "description": "Reversible pulpitis",
        "category": "Pulpal",
        "notes": "Pulp inflammation that can resolve with treatment.",
    },
    "K04.02": {
        "description": "Irreversible pulpitis",
        "category": "Pulpal",
        "notes": "Pulp inflammation requiring endodontic treatment.",
    },
    "K04.1": {
        "description": "Necrosis of pulp",
        "category": "Pulpal",
        "notes": "Death of pulp tissue. Non-vital tooth.",
    },
    "K04.2": {
        "description": "Pulp degeneration",
        "category": "Pulpal",
        "notes": "Pulp calcification, denticles, pulp stones.",
    },
    "K04.3": {
        "description": "Abnormal hard tissue formation in pulp",
        "category": "Pulpal",
        "notes": "Secondary/tertiary dentin, pulp calcification.",
    },
    "K04.4": {
        "description": "Acute apical periodontitis of pulpal origin",
        "category": "Periapical",
        "notes": "Acute inflammation at root apex from pulpal infection.",
    },
    "K04.5": {
        "description": "Chronic apical periodontitis",
        "category": "Periapical",
        "notes": "Chronic periapical inflammation, may show radiolucency.",
    },
    "K04.6": {
        "description": "Periapical abscess with sinus",
        "category": "Periapical",
        "notes": "Periapical abscess draining through a sinus tract (fistula).",
    },
    "K04.7": {
        "description": "Periapical abscess without sinus",
        "category": "Periapical",
        "notes": "Periapical abscess without draining sinus tract.",
    },
    "K04.8": {
        "description": "Radicular cyst",
        "category": "Periapical",
        "notes": "Cyst at root apex from chronic periapical inflammation.",
    },
    "K04.99": {
        "description": "Other and unspecified diseases of pulp and periapical tissues",
        "category": "Periapical",
        "notes": "Other pulp/periapical conditions not elsewhere classified.",
    },
    # =========================================================================
    # TOOTH FRACTURES AND TRAUMA (S02, K03, K08)
    # =========================================================================
    "S02.5XXA": {
        "description": "Fracture of tooth (traumatic), initial encounter",
        "category": "Fracture",
        "notes": "Traumatic tooth fracture, first visit.",
    },
    "S02.5XXD": {
        "description": "Fracture of tooth (traumatic), subsequent encounter",
        "category": "Fracture",
        "notes": "Traumatic tooth fracture, follow-up visit.",
    },
    "S02.5XXS": {
        "description": "Fracture of tooth (traumatic), sequela",
        "category": "Fracture",
        "notes": "Late effect of traumatic tooth fracture.",
    },
    "K03.81": {
        "description": "Cracked tooth",
        "category": "Fracture",
        "notes": "Cracked tooth syndrome. Incomplete fracture.",
    },
    "K08.0": {
        "description": "Exfoliation of teeth due to systemic causes",
        "category": "Fracture",
        "notes": "Tooth loss from systemic disease.",
    },
    "K08.109": {
        "description": "Complete loss of teeth, unspecified cause, unspecified class",
        "category": "Fracture",
        "notes": "Edentulism, cause unspecified.",
    },
    "K08.111": {
        "description": "Complete loss of teeth due to trauma, class I",
        "category": "Fracture",
        "notes": "Complete tooth loss from trauma.",
    },
    "K08.119": {
        "description": "Complete loss of teeth due to trauma, unspecified class",
        "category": "Fracture",
        "notes": "Complete tooth loss from trauma, unspecified class.",
    },
    "K08.121": {
        "description": "Complete loss of teeth due to periodontal diseases, class I",
        "category": "Fracture",
        "notes": "Complete tooth loss from periodontal disease.",
    },
    "K08.129": {
        "description": "Complete loss of teeth due to periodontal diseases, unspecified class",
        "category": "Fracture",
        "notes": "Complete tooth loss from periodontal disease.",
    },
    "K08.401": {
        "description": "Partial loss of teeth, unspecified cause, class I",
        "category": "Fracture",
        "notes": "Partial edentulism.",
    },
    "K08.409": {
        "description": "Partial loss of teeth, unspecified cause, unspecified class",
        "category": "Fracture",
        "notes": "Partial edentulism, unspecified.",
    },
    "K08.411": {
        "description": "Partial loss of teeth due to trauma, class I",
        "category": "Fracture",
        "notes": "Partial tooth loss from trauma.",
    },
    "K08.421": {
        "description": "Partial loss of teeth due to periodontal diseases, class I",
        "category": "Fracture",
        "notes": "Partial tooth loss from periodontal disease.",
    },
    "K08.491": {
        "description": "Partial loss of teeth due to other specified cause, class I",
        "category": "Fracture",
        "notes": "Partial tooth loss from caries or other causes.",
    },
    # =========================================================================
    # OTHER DENTAL CONDITIONS (K00-K03, K06, K08-K14)
    # =========================================================================
    "K00.0": {
        "description": "Anodontia",
        "category": "Developmental",
        "notes": "Congenital absence of teeth.",
    },
    "K00.1": {
        "description": "Supernumerary teeth",
        "category": "Developmental",
        "notes": "Extra teeth (mesiodens, etc.).",
    },
    "K00.2": {
        "description": "Abnormalities of size and form of teeth",
        "category": "Developmental",
        "notes": "Macrodontia, microdontia, fusion, gemination.",
    },
    "K00.6": {
        "description": "Disturbances in tooth eruption",
        "category": "Developmental",
        "notes": "Delayed eruption, premature eruption, natal teeth.",
    },
    "K00.7": {
        "description": "Teething syndrome",
        "category": "Developmental",
        "notes": "Symptoms associated with tooth eruption.",
    },
    "K01.0": {
        "description": "Embedded teeth",
        "category": "Developmental",
        "notes": "Tooth that has failed to erupt without obstruction.",
    },
    "K01.1": {
        "description": "Impacted teeth",
        "category": "Developmental",
        "notes": "Tooth impacted by adjacent tooth or bone.",
    },
    "K03.0": {
        "description": "Excessive attrition of teeth",
        "category": "Other Dental",
        "notes": "Wear from tooth-to-tooth contact (bruxism).",
    },
    "K03.1": {
        "description": "Abrasion of teeth",
        "category": "Other Dental",
        "notes": "Tooth wear from external factors (brushing, habits).",
    },
    "K03.2": {
        "description": "Erosion of teeth",
        "category": "Other Dental",
        "notes": "Chemical dissolution of tooth structure (acid reflux, diet).",
    },
    "K03.3": {
        "description": "Pathological resorption of teeth",
        "category": "Other Dental",
        "notes": "Internal or external root resorption.",
    },
    "K03.89": {
        "description": "Other specified diseases of hard tissues of teeth",
        "category": "Other Dental",
        "notes": "Other enamel or dentin conditions.",
    },
    "K08.3": {
        "description": "Retained dental root",
        "category": "Other Dental",
        "notes": "Retained root tip after extraction or fracture.",
    },
    "K08.50": {
        "description": "Unsatisfactory restoration of tooth, unspecified",
        "category": "Other Dental",
        "notes": "Failed or defective dental restoration.",
    },
    "K08.51": {
        "description": "Open restoration margins of tooth",
        "category": "Other Dental",
        "notes": "Defective margins allowing leakage.",
    },
    "K08.530": {
        "description": "Fractured dental restorative material without loss of material",
        "category": "Other Dental",
        "notes": "Cracked restoration without missing pieces.",
    },
    "K08.531": {
        "description": "Fractured dental restorative material with loss of material",
        "category": "Other Dental",
        "notes": "Broken restoration with material lost.",
    },
    "K08.539": {
        "description": "Fractured dental restorative material, unspecified",
        "category": "Other Dental",
        "notes": "Fractured restoration, unspecified.",
    },
    "K08.54": {
        "description": "Contour of existing restoration of tooth biologically incompatible with oral health",
        "category": "Other Dental",
        "notes": "Over-contoured restoration causing tissue issues.",
    },
    "K08.56": {
        "description": "Poor aesthetic of existing restoration of tooth",
        "category": "Other Dental",
        "notes": "Cosmetically unacceptable restoration.",
    },
    "K08.89": {
        "description": "Other specified disorders of teeth and supporting structures",
        "category": "Other Dental",
        "notes": "Other dental/supporting structure conditions.",
    },
    "K09.0": {
        "description": "Developmental odontogenic cysts",
        "category": "Other Dental",
        "notes": "Dentigerous cyst, eruption cyst, etc.",
    },
    "K09.1": {
        "description": "Developmental (nonodontogenic) cysts of oral region",
        "category": "Other Dental",
        "notes": "Nasopalatine duct cyst, etc.",
    },
    "K11.20": {
        "description": "Sialoadenitis, unspecified",
        "category": "Other Dental",
        "notes": "Inflammation of salivary gland.",
    },
    "K11.7": {
        "description": "Disturbances of salivary secretion",
        "category": "Other Dental",
        "notes": "Xerostomia, ptyalism, hyposalivation.",
    },
    "K12.0": {
        "description": "Recurrent oral aphthae",
        "category": "Other Dental",
        "notes": "Aphthous ulcers (canker sores).",
    },
    "K12.1": {
        "description": "Other forms of stomatitis",
        "category": "Other Dental",
        "notes": "Stomatitis NOS, denture stomatitis.",
    },
    "K12.2": {
        "description": "Cellulitis and abscess of mouth",
        "category": "Other Dental",
        "notes": "Oral soft tissue infection/abscess.",
    },
    "K13.0": {
        "description": "Diseases of lips",
        "category": "Other Dental",
        "notes": "Cheilitis, angular cheilitis.",
    },
    "K13.1": {
        "description": "Cheek and lip biting",
        "category": "Other Dental",
        "notes": "Habitual cheek/lip biting.",
    },
    "K13.21": {
        "description": "Leukoplakia of oral mucosa, including tongue",
        "category": "Other Dental",
        "notes": "White patch that cannot be scraped off. Biopsy may be needed.",
    },
    "K13.29": {
        "description": "Other disturbances of oral epithelium, including tongue",
        "category": "Other Dental",
        "notes": "Other oral mucosal conditions.",
    },
    "K13.70": {
        "description": "Unspecified lesions of oral mucosa",
        "category": "Other Dental",
        "notes": "Oral mucosal lesion NOS.",
    },
    "K14.0": {
        "description": "Glossitis",
        "category": "Other Dental",
        "notes": "Inflammation of the tongue.",
    },
    "K14.6": {
        "description": "Glossodynia",
        "category": "Other Dental",
        "notes": "Painful tongue / burning mouth syndrome.",
    },
    # =========================================================================
    # TMJ (M26)
    # =========================================================================
    "M26.60": {
        "description": "Temporomandibular joint disorder, unspecified",
        "category": "TMJ",
        "notes": "TMJ disorder NOS.",
    },
    "M26.601": {
        "description": "Right temporomandibular joint disorder, unspecified",
        "category": "TMJ",
        "notes": "Right TMJ disorder.",
    },
    "M26.602": {
        "description": "Left temporomandibular joint disorder, unspecified",
        "category": "TMJ",
        "notes": "Left TMJ disorder.",
    },
    "M26.603": {
        "description": "Bilateral temporomandibular joint disorder, unspecified",
        "category": "TMJ",
        "notes": "Bilateral TMJ disorder.",
    },
    "M26.611": {
        "description": "Adhesions and ankylosis of right temporomandibular joint",
        "category": "TMJ",
        "notes": "Right TMJ adhesion or ankylosis.",
    },
    "M26.62": {
        "description": "Arthralgia of temporomandibular joint",
        "category": "TMJ",
        "notes": "TMJ pain.",
    },
    "M26.63": {
        "description": "Articular disc disorder of temporomandibular joint",
        "category": "TMJ",
        "notes": "TMJ disc displacement, clicking, locking.",
    },
    "M26.69": {
        "description": "Other specified disorders of temporomandibular joint",
        "category": "TMJ",
        "notes": "Other TMJ disorders.",
    },
    # =========================================================================
    # EXAMINATION / ENCOUNTER CODES (Z01, Z41)
    # =========================================================================
    "Z01.20": {
        "description": "Encounter for dental examination and cleaning without abnormal findings",
        "category": "Examination",
        "notes": "Routine dental exam - no issues found.",
    },
    "Z01.21": {
        "description": "Encounter for dental examination and cleaning with abnormal findings",
        "category": "Examination",
        "notes": "Routine dental exam with findings requiring treatment.",
    },
    "Z41.8": {
        "description": "Encounter for other procedures for purposes other than remedying health state",
        "category": "Examination",
        "notes": "Elective/cosmetic dental procedures.",
    },
    "Z46.3": {
        "description": "Encounter for fitting and adjustment of dental prosthetic device",
        "category": "Examination",
        "notes": "Denture adjustment, delivery, or fitting.",
    },
    "Z87.39": {
        "description": "Personal history of other diseases of the musculoskeletal system and connective tissue",
        "category": "Examination",
        "notes": "History of TMJ disorder or jaw condition.",
    },
    "Z96.5": {
        "description": "Presence of tooth-root and mandibular implant",
        "category": "Examination",
        "notes": "Patient has existing dental implant(s).",
    },
    "Z98.810": {
        "description": "Dental sealant status",
        "category": "Examination",
        "notes": "Patient has existing dental sealants.",
    },
    "Z98.811": {
        "description": "Dental restoration status",
        "category": "Examination",
        "notes": "Patient has existing dental restorations.",
    },
}
