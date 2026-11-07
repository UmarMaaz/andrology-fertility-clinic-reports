import { ReportTemplate } from '../types';

export const BUILT_IN_TEMPLATES: ReportTemplate[] = [
  // 1. Core Scrotal / Varicocele Ultrasound (matches exact reference report!)
  {
    id: 'scrotal_varicocele',
    code: 'US-SCROT',
    name: 'Scrotal Ultrasound Report',
    category: 'Ultrasound',
    description: 'Bilateral scrotal ultrasound for testicular biometry, parenchymal texture, and color Doppler evaluation of varicocele.',
    defaultImpression: 'Bilateral varicocele (Grade III)',
    version: 2,
    isSystem: true,
    sections: [
      {
        id: 'testes_section',
        title: 'Testes',
        fields: [
          {
            id: 'right_testis',
            label: 'Right testis',
            type: 'dimensions3d',
            defaultValue: {
              length: 42,
              width: 28,
              height: 25,
              volume: 16,
              status: 'Normal',
              text: 'Normal size, echogenicity, and parenchymal echotexture. No focal lesion is seen.',
            },
            normalTextTemplate: 'Normal size, echogenicity, and parenchymal echotexture. No focal lesion is seen.',
          },
          {
            id: 'left_testis',
            label: 'Left testis',
            type: 'dimensions3d',
            defaultValue: {
              length: 40,
              width: 25,
              height: 28,
              volume: 15,
              status: 'Normal',
              text: 'Normal size, echogenicity, and parenchymal echotexture. No focal lesion is seen.',
            },
            normalTextTemplate: 'Normal size, echogenicity, and parenchymal echotexture. No focal lesion is seen.',
          },
        ],
      },
      {
        id: 'associated_findings_section',
        title: 'Associated findings',
        fields: [
          {
            id: 'vascularity',
            label: 'Vascularity',
            type: 'textarea',
            defaultValue: 'Normal blood flow is noted in both testes.',
            normalTextTemplate: 'Normal blood flow is noted in both testes.',
          },
          {
            id: 'epididymis',
            label: 'Epididymis',
            type: 'textarea',
            defaultValue: 'Both epididymis appear normal.',
            normalTextTemplate: 'Both epididymis appear normal.',
          },
          {
            id: 'hydrocele',
            label: 'Hydrocele',
            type: 'textarea',
            defaultValue: 'No hydrocele is seen on either side.',
            normalTextTemplate: 'No hydrocele is seen on either side.',
          },
          {
            id: 'inguinal_regions',
            label: 'Inguinal regions',
            type: 'textarea',
            defaultValue: 'No inguinal hernia is seen on either side.',
            normalTextTemplate: 'No inguinal hernia is seen on either side.',
          },
        ],
      },
      {
        id: 'varicocele_section',
        title: 'Varicocele',
        tag: 'Bilateral, Grade III',
        fields: [
          {
            id: 'varicocele',
            label: 'Varicocele',
            type: 'varicocele_measurements',
            defaultValue: {
              side: 'bilateral',
              grade: 'III',
              reflux: 'yes',
              leftMaxDiameter: 4.2,
              rightMaxDiameter: 3.9,
              customText: 'Dilated tortuous vessels noted on both sides, showing reflux seen on CDI with Valsalva maneuver.',
            },
            normalTextTemplate: 'No venous dilatation or retrograde flow noted in pampiniform plexus on either side.',
          },
        ],
      },
    ],
  },

  // 2. Ultrasound Abdomen Report
  {
    id: 'abdomen_ultrasound',
    code: 'US-ABD',
    name: 'Ultrasound Abdomen Report',
    category: 'Ultrasound',
    description: 'Transabdominal ultrasound examination of liver, gall bladder, pancreas, spleen, kidneys, urinary bladder, general abdomen, and prostate.',
    defaultImpression: 'Normal abdomen ultrasound study.',
    version: 2,
    isSystem: true,
    sections: [
      {
        id: 'hepatobiliary_section',
        title: 'Hepatobiliary System',
        fields: [
          {
            id: 'liver',
            label: 'Liver',
            type: 'textarea',
            defaultValue: 'Normal size, smooth margins, homogeneous parenchymal echotexture. Intrahepatic bile ducts not dilated. Portal vein normal.',
          },
          {
            id: 'gall_bladder',
            label: 'Gall bladder',
            type: 'textarea',
            defaultValue: 'Well-distended, thin-walled. Lumen acoustic free. No calculus, polyp, or sludge.',
          },
          {
            id: 'cbd',
            label: 'Common bile duct',
            type: 'textarea',
            defaultValue: 'Common bile duct is normal in caliber, measuring 4mm. No intraductal calculus.',
          },
        ],
      },
      {
        id: 'pancreas_spleen_section',
        title: 'Pancreas & Spleen',
        fields: [
          {
            id: 'pancreas',
            label: 'Pancreas',
            type: 'textarea',
            defaultValue: 'Normal size, contours, and echogenicity. Main pancreatic duct not dilated.',
          },
          {
            id: 'spleen',
            label: 'Spleen',
            type: 'textarea',
            defaultValue: 'Normal size and homogeneous texture. Splenic vein normal. No splenomegaly.',
          },
        ],
      },
      {
        id: 'renal_urinary_section',
        title: 'Renal & Urinary System',
        fields: [
          {
            id: 'right_kidney',
            label: 'Right kidney',
            type: 'dimensions3d',
            defaultValue: {
              length: 102,
              width: 45,
              height: 40,
              volume: 95,
              status: 'Normal',
              text: 'Normal size, position, and cortical thickness. Good corticomedullary differentiation. No calculus, hydronephrosis, or focal lesion.',
            },
          },
          {
            id: 'left_kidney',
            label: 'Left kidney',
            type: 'dimensions3d',
            defaultValue: {
              length: 105,
              width: 48,
              height: 42,
              volume: 108,
              status: 'Normal',
              text: 'Normal size, position, and cortical thickness. Good corticomedullary differentiation. No calculus, hydronephrosis, or focal lesion.',
            },
          },
          {
            id: 'urinary_bladder',
            label: 'Urinary bladder',
            type: 'textarea',
            defaultValue: 'Adequately distended with thin, smooth walls. Lumen clear. No mass, calculus, or diverticulum.',
          },
        ],
      },
      {
        id: 'peritoneal_pelvis_section',
        title: 'Peritoneal Cavity & Pelvis',
        fields: [
          {
            id: 'general_abdomen',
            label: 'Peritoneal cavity',
            type: 'textarea',
            defaultValue: 'No free fluid or collection in Morrison pouch, paracolic gutters, or pelvis. No retroperitoneal lymphadenopathy.',
          },
          {
            id: 'prostate_pelvis',
            label: 'Prostate / Pelvic organs',
            type: 'textarea',
            defaultValue: 'Normal transabdominal size and volume (~18g). Homogeneous echotexture with smooth capsule.',
          },
        ],
      },
    ],
  },

  // 3. KUB Ultrasound with PVR
  {
    id: 'kub_ultrasound',
    code: 'US-KUB',
    name: 'KUB Ultrasound Report with PVR',
    category: 'Ultrasound',
    description: 'Renal, ureteric, bladder and prostate biometry with post-void residual urine estimation.',
    defaultImpression: 'Normal KUB ultrasound study with insignificant post-void residual urine volume.',
    version: 2,
    isSystem: true,
    sections: [
      {
        id: 'kidneys_ureters_section',
        title: 'Kidneys & Ureters',
        fields: [
          {
            id: 'right_kidney',
            label: 'Right kidney',
            type: 'dimensions3d',
            defaultValue: {
              length: 104,
              width: 46,
              height: 42,
              volume: 103,
              status: 'Normal',
              text: 'Normal size, position, and cortical thickness. Good corticomedullary differentiation. No calculus or hydronephrosis.',
            },
          },
          {
            id: 'left_kidney',
            label: 'Left kidney',
            type: 'dimensions3d',
            defaultValue: {
              length: 106,
              width: 48,
              height: 43,
              volume: 112,
              status: 'Normal',
              text: 'Normal size, position, and cortical thickness. Good corticomedullary differentiation. No calculus or hydronephrosis.',
            },
          },
          {
            id: 'ureters',
            label: 'Both ureters',
            type: 'textarea',
            defaultValue: 'Both ureters are non-dilated. No upper, mid, or lower ureteric calculus visible.',
          },
        ],
      },
      {
        id: 'bladder_prostate_section',
        title: 'Urinary Bladder & Prostate',
        fields: [
          {
            id: 'urinary_bladder',
            label: 'Urinary bladder',
            type: 'textarea',
            defaultValue: 'Adequately distended. Wall thickness normal (~2.8 mm). Lumen clear. Normal bilateral ureteric jets on CDI.',
          },
          {
            id: 'prostate',
            label: 'Prostate gland',
            type: 'textarea',
            defaultValue: 'Normal transabdominal volume (~19g). Smooth margins and homogeneous echo pattern.',
          },
        ],
      },
      {
        id: 'pvr_section',
        title: 'Post-Void Residual (PVR)',
        fields: [
          {
            id: 'pre_void_volume',
            label: 'Pre-void bladder volume',
            type: 'text',
            defaultValue: '380 ml',
          },
          {
            id: 'post_void_volume',
            label: 'Post-void residual volume (PVR)',
            type: 'text',
            defaultValue: '12 ml (Insignificant / Normal)',
          },
        ],
      },
    ],
  },

  // 4. Penile Pharmaco-Doppler Study
  {
    id: 'penile_doppler',
    code: 'US-PEN-DOP',
    name: 'Penile Pharmaco-Doppler Study',
    category: 'Ultrasound',
    description: 'Hemodynamic evaluation for vasculogenic erectile dysfunction post-intracavernosal injection.',
    defaultImpression: 'Normal penile pharmaco-doppler response. Normal cavernosal arterial inflow with intact veno-occlusive mechanism.',
    version: 2,
    isSystem: true,
    sections: [
      {
        id: 'b_mode_section',
        title: 'B-Mode Morphology',
        fields: [
          {
            id: 'tunica_albuginea',
            label: 'Tunica albuginea',
            type: 'textarea',
            defaultValue: 'Smooth, continuous, normal thickness bilaterally. No fibrotic plaques or calcifications.',
          },
          {
            id: 'cavernous_bodies',
            label: 'Corpora cavernosa',
            type: 'textarea',
            defaultValue: 'Symmetric corporocavernosal tissue with homogeneous echogenicity bilaterally.',
          },
          {
            id: 'corpus_spongiosum',
            label: 'Corpus spongiosum',
            type: 'textarea',
            defaultValue: 'Normal caliber and acoustic transmission. Urethral lumen clear.',
          },
        ],
      },
      {
        id: 'cavernosal_doppler_section',
        title: 'Cavernosal Artery Doppler (Post-ICI)',
        fields: [
          {
            id: 'right_cavernosal_artery',
            label: 'Right cavernosal artery',
            type: 'textarea',
            defaultValue: 'Peak Systolic Velocity (PSV) = 38 cm/s (>35 cm/s, normal arterial inflow). End-Diastolic Velocity (EDV) = 0 cm/s. Resistive Index (RI) = 1.0.',
          },
          {
            id: 'left_cavernosal_artery',
            label: 'Left cavernosal artery',
            type: 'textarea',
            defaultValue: 'Peak Systolic Velocity (PSV) = 39 cm/s (>35 cm/s, normal arterial inflow). End-Diastolic Velocity (EDV) = 0 cm/s. Resistive Index (RI) = 1.0.',
          },
        ],
      },
      {
        id: 'veno_occlusive_section',
        title: 'Veno-Occlusive Mechanism',
        fields: [
          {
            id: 'deep_dorsal_vein',
            label: 'Deep dorsal venous flow',
            type: 'textarea',
            defaultValue: 'Absent retrograde flow during full rigid erection, confirming competent veno-occlusion.',
          },
        ],
      },
    ],
  },

  // 5. Prostate Transabdominal Ultrasound
  {
    id: 'prostate_ultrasound',
    code: 'US-PROST',
    name: 'Prostate Transabdominal Ultrasound',
    category: 'Ultrasound',
    description: 'Transabdominal evaluation of prostatic volume, zonal architecture, and median lobe protrusion.',
    defaultImpression: 'Mild benign prostatic hyperplasia (BPH Grade I). Insignificant post-void residue.',
    version: 2,
    isSystem: true,
    sections: [
      {
        id: 'prostate_biometry_section',
        title: 'Prostate Biometry & Parenchyma',
        fields: [
          {
            id: 'prostate_dimensions',
            label: 'Prostate dimensions',
            type: 'dimensions3d',
            defaultValue: {
              length: 38,
              width: 42,
              height: 35,
              volume: 28,
              status: 'Normal',
              text: 'Prostate measures 38 × 42 × 35 mm. Estimated volume: 28 ml / grams. Mild benign enlargement noted.',
            },
          },
          {
            id: 'parenchyma',
            label: 'Parenchymal texture',
            type: 'textarea',
            defaultValue: 'Slightly coarse, homogeneous transition and peripheral zones. Well-demarcated surgical capsule without nodular breaches.',
          },
          {
            id: 'median_lobe',
            label: 'Median lobe',
            type: 'textarea',
            defaultValue: 'No intravesical prostatic protrusion (IPP Grade 0).',
          },
        ],
      },
      {
        id: 'prostate_bladder_section',
        title: 'Bladder Correlation & Residual',
        fields: [
          {
            id: 'bladder_wall',
            label: 'Bladder wall',
            type: 'textarea',
            defaultValue: 'Bladder wall shows mild trabeculation, thickness 3.2 mm.',
          },
          {
            id: 'pvr_residual',
            label: 'Post-void residual',
            type: 'textarea',
            defaultValue: 'Pre-void volume: 320 ml. Post-void residual: 28 ml.',
          },
        ],
      },
    ],
  },

  // 6. Computerized Semen Analysis (WHO 6th Ed.)
  {
    id: 'semen_analysis',
    code: 'LAB-SEMEN',
    name: 'Computerized Semen Analysis Report',
    category: 'Andrology & Fertility',
    description: 'Comprehensive semen analysis as per World Health Organization (WHO) 6th Edition reference values.',
    defaultImpression: 'Normozoospermia as per WHO 6th Edition reference standards. Normal semen parameters.',
    version: 2,
    isSystem: true,
    sections: [
      {
        id: 'macroscopic_section',
        title: 'Macroscopic / Physical Parameters',
        fields: [
          {
            id: 'abstinence_days',
            label: 'Abstinence period',
            type: 'text',
            defaultValue: '4 days (Normal: 2 - 7 days)',
          },
          {
            id: 'collection_liquefaction',
            label: 'Liquefaction & Appearance',
            type: 'textarea',
            defaultValue: 'Liquefaction: Complete within 25 minutes at 37°C. Appearance: Normal pearl-grey, opalescent.',
          },
          {
            id: 'viscosity_ph',
            label: 'Viscosity & pH',
            type: 'textarea',
            defaultValue: 'Viscosity: Normal (threads < 2 cm). pH: 7.6 (Normal ≥ 7.2).',
          },
          {
            id: 'volume_ml',
            label: 'Ejaculate volume',
            type: 'text',
            defaultValue: '3.2 ml (WHO 6th Reference: ≥ 1.4 ml)',
          },
        ],
      },
      {
        id: 'microscopic_section',
        title: 'Microscopic & Motility Findings',
        fields: [
          {
            id: 'concentration',
            label: 'Sperm concentration',
            type: 'textarea',
            defaultValue: 'Sperm Concentration: 48 million / ml (WHO 6th Ref: ≥ 16 million/ml). Total Sperm Count: 153.6 million / ejaculate (Ref: ≥ 39 million).',
          },
          {
            id: 'motility_grades',
            label: 'Motility grading',
            type: 'textarea',
            defaultValue: 'Progressive Motility (PR): 52% (Reference: ≥ 30%)\nNon-Progressive Motility (NP): 14%\nTotal Motility (PR + NP): 66% (Reference: ≥ 42%)\nImmotile (IM): 34%',
          },
          {
            id: 'viability_morphology',
            label: 'Vitality & Morphology',
            type: 'textarea',
            defaultValue: 'Vitality / Viability: 78% live forms (Reference: ≥ 54%)\nNormal Morphology (Strict Tygerberg/Kruger Criteria): 6% normal forms (Reference: ≥ 4%)',
          },
        ],
      },
      {
        id: 'cellular_section',
        title: 'Cellular Elements & Notes',
        fields: [
          {
            id: 'round_cells',
            label: 'Other cells & Agglutination',
            type: 'textarea',
            defaultValue: 'Round Cells: 0.6 million / ml (< 1 million/ml)\nLeukocytes / WBCs: < 1 million / ml\nErythrocytes: Nil\nAgglutination: None',
          },
        ],
      },
    ],
  },

  // 7. Transvaginal / Pelvic Ultrasound
  {
    id: 'transvaginal_ultrasound',
    code: 'US-TVS',
    name: 'Transvaginal Pelvic Ultrasound Report',
    category: 'Ultrasound',
    description: 'High-resolution transvaginal examination of uterus, endometrium, adnexa, and Pouch of Douglas.',
    defaultImpression: 'Normal transvaginal pelvic ultrasound examination.',
    version: 2,
    isSystem: true,
    signatories: [
      {
        id: 'sig_1',
        name: 'Dr. Abdus salam',
        qualifications: 'MBBS, FCPS Radiology',
        title: 'Consultant Radiologist',
        signatureImageUrl: 'assets/signatures/sig_abdus_salam.png',
        active: true,
      },
      {
        id: 'sig_4',
        name: 'Dr. Spogmai Siddique',
        qualifications: 'MBBS, FCPS (Gynae)',
        title: 'Consultant Gynecologist',
        signatureImageUrl: '',
        active: true,
      },
      {
        id: 'sig_3',
        name: 'Mr. Atta ur Rahman',
        qualifications: 'Ms. Ultrasound',
        title: 'Senior Medical Sonologist',
        signatureImageUrl: 'assets/signatures/sig_atta_ur_rahman.png',
        active: true,
      },
    ],
    sections: [
      {
        id: 'uterus_section',
        title: 'Uterus & Endometrium',
        fields: [
          {
            id: 'uterus',
            label: 'Uterus',
            type: 'dimensions3d',
            defaultValue: {
              length: 75,
              width: 42,
              height: 38,
              volume: 62,
              status: 'Normal',
              text: 'Uterus is anteverted, measuring 75 × 42 × 38 mm. Myometrium shows normal homogeneous echotexture. No fibroid or focal lesion.',
            },
          },
          {
            id: 'endometrium',
            label: 'Endometrium',
            type: 'textarea',
            defaultValue: 'Endometrium is central, regular, measuring 8.5 mm in thickness with trilaminar secretory pattern. Cavity clear.',
          },
          {
            id: 'cervix',
            label: 'Cervix',
            type: 'textarea',
            defaultValue: 'Cervix is normal in length and architecture. No Nabothian cyst.',
          },
        ],
      },
      {
        id: 'ovaries_adnexa_section',
        title: 'Ovaries & Adnexa',
        fields: [
          {
            id: 'right_ovary',
            label: 'Right ovary',
            type: 'dimensions3d',
            defaultValue: {
              length: 30,
              width: 22,
              height: 18,
              volume: 6.2,
              status: 'Normal',
              text: 'Normal size, stromal echogenicity, and follicular pattern. No cyst or mass lesion.',
            },
          },
          {
            id: 'left_ovary',
            label: 'Left ovary',
            type: 'dimensions3d',
            defaultValue: {
              length: 28,
              width: 20,
              height: 17,
              volume: 5.0,
              status: 'Normal',
              text: 'Normal size, stromal echogenicity, and follicular pattern. No cyst or mass lesion.',
            },
          },
          {
            id: 'pouch_of_douglas',
            label: 'Pouch of Douglas & Adnexa',
            type: 'textarea',
            defaultValue: 'No free fluid or mass lesion seen in Pouch of Douglas or adnexal regions.',
          },
        ],
      },
    ],
  },

  // 8. Follicular Tracking Study (Serial)
  {
    id: 'follicular_study',
    code: 'US-FOLL',
    name: 'Follicular Tracking Study Report',
    category: 'Andrology & Fertility',
    description: 'Serial folliculometry monitoring ovulation induction and endometrial receptivity.',
    defaultImpression: 'Single dominant mature pre-ovulatory follicle in right ovary (mean 20.3 mm) with favorable triple-line endometrium (9.2 mm). Ripe for ovulation / trigger.',
    version: 2,
    isSystem: true,
    sections: [
      {
        id: 'follicular_endometrium_section',
        title: 'Endometrial Biometry',
        fields: [
          {
            id: 'cycle_endometrium',
            label: 'Endometrial thickness & pattern',
            type: 'textarea',
            defaultValue: 'Cycle Day: Day 12. Endometrial thickness measures 9.2 mm with distinct multilayered triple-line pattern.',
          },
        ],
      },
      {
        id: 'follicular_right_ovary_section',
        title: 'Right Ovary Folliculometry',
        fields: [
          {
            id: 'right_follicles',
            label: 'Dominant follicle (Right)',
            type: 'textarea',
            defaultValue: 'Right Ovary: Contains dominant mature follicle measuring 21.0 × 19.5 mm (Mean diameter: 20.3 mm) with distinct cumulus oophorus visualization. 4-5 smaller antral follicles (5-8 mm) noted in background.',
          },
        ],
      },
      {
        id: 'follicular_left_ovary_section',
        title: 'Left Ovary & Pelvic Survey',
        fields: [
          {
            id: 'left_follicles',
            label: 'Left ovary follicles',
            type: 'textarea',
            defaultValue: 'Left Ovary: 5-6 quiescent antral follicles (ranging 4-7 mm). No dominant follicle.',
          },
          {
            id: 'free_fluid',
            label: 'Pouch of Douglas',
            type: 'textarea',
            defaultValue: 'Minimal physiological free fluid noted in Pouch of Douglas (~3 ml).',
          },
        ],
      },
    ],
  },

  // 9. Obstetric Ultrasound Report
  {
    id: 'obstetric_ultrasound',
    code: 'US-OBS',
    name: 'Obstetric Ultrasound Report',
    category: 'Ultrasound',
    description: 'Fetal growth biometric survey, presentation, cardiac activity, and placental localisation.',
    defaultImpression: 'Single live intrauterine gestation of approximately 29 weeks 1 day in cephalic presentation. Normal fetal growth velocity, adequate liquor, and normal placenta.',
    version: 2,
    isSystem: true,
    sections: [
      {
        id: 'fetal_overview_section',
        title: 'Fetal Viability & Presentation',
        fields: [
          {
            id: 'fetal_presentation',
            label: 'Fetal viability & presentation',
            type: 'textarea',
            defaultValue: 'Single live intrauterine fetus in cephalic presentation. Active somatic and limb movements noted. Fetal cardiac activity regular, baseline FHR: 146 bpm.',
          },
        ],
      },
      {
        id: 'fetal_biometry_section',
        title: 'Fetal Biometry (2nd/3rd Trimester)',
        fields: [
          {
            id: 'biometry_measurements',
            label: 'Biometric measurements',
            type: 'textarea',
            defaultValue: 'BPD: 72 mm (28w 6d)\nHC: 268 mm (29w 1d)\nAC: 250 mm (29w 2d)\nFL: 56 mm (29w 3d)\nEstimated Fetal Weight (EFW): 1340 g ± 150 g\nComposite GA: 29 weeks 1 day',
          },
        ],
      },
      {
        id: 'fetal_placenta_section',
        title: 'Placenta & Amniotic Fluid',
        fields: [
          {
            id: 'placenta',
            label: 'Placenta',
            type: 'textarea',
            defaultValue: 'Placental location: Posterior, high, clear of internal os (Grade II maturity). Cord: 3-vessel umbilical cord.',
          },
          {
            id: 'liquor',
            label: 'Amniotic fluid',
            type: 'textarea',
            defaultValue: 'Amniotic fluid volume is adequate. Deepest vertical pocket (DVP): 4.8 cm. Amniotic Fluid Index (AFI): 14.5 cm.',
          },
        ],
      },
    ],
  },

  // 10. Thyroid Ultrasound Report
  {
    id: 'thyroid_ultrasound',
    code: 'US-THY',
    name: 'Thyroid Ultrasound Report',
    category: 'Ultrasound',
    description: 'High-frequency bilateral thyroid lobe and isthmus assessment with TI-RADS classification.',
    defaultImpression: 'Normal thyroid gland ultrasound. No focal nodules or parenchymal disease (TI-RADS 1).',
    version: 2,
    isSystem: true,
    sections: [
      {
        id: 'thyroid_right_section',
        title: 'Right Thyroid Lobe',
        fields: [
          {
            id: 'right_lobe',
            label: 'Right lobe biometry',
            type: 'dimensions3d',
            defaultValue: {
              length: 44,
              width: 16,
              height: 14,
              volume: 5.1,
              status: 'Normal',
              text: 'Right thyroid lobe measures 44 × 16 × 14 mm. Normal homogeneous parenchymal echotexture. No discrete nodule, microcalcification, or cystic change (TI-RADS 1).',
            },
          },
        ],
      },
      {
        id: 'thyroid_left_section',
        title: 'Left Thyroid Lobe',
        fields: [
          {
            id: 'left_lobe',
            label: 'Left lobe biometry',
            type: 'dimensions3d',
            defaultValue: {
              length: 42,
              width: 15,
              height: 13,
              volume: 4.3,
              status: 'Normal',
              text: 'Left thyroid lobe measures 42 × 15 × 13 mm. Normal homogeneous parenchymal echotexture. No discrete nodule, microcalcification, or cystic change (TI-RADS 1).',
            },
          },
        ],
      },
      {
        id: 'thyroid_isthmus_section',
        title: 'Isthmus & Cervical Nodes',
        fields: [
          {
            id: 'isthmus',
            label: 'Isthmus',
            type: 'textarea',
            defaultValue: 'Isthmus measures 2.8 mm in AP diameter with normal texture.',
          },
          {
            id: 'lymph_nodes',
            label: 'Cervical lymph nodes',
            type: 'textarea',
            defaultValue: 'Both carotid sheaths and internal jugular chains surveyed: No pathological cervical lymphadenopathy.',
          },
        ],
      },
    ],
  },

  // 11. Breast Ultrasound Report (Bilateral)
  {
    id: 'breast_ultrasound',
    code: 'US-BRST',
    name: 'Breast Ultrasound Report (Bilateral)',
    category: 'Ultrasound',
    description: 'Bilateral high-resolution sonomammography with BI-RADS categorization.',
    defaultImpression: 'Bilateral normal breast ultrasound study (BI-RADS Category 1: Negative).',
    version: 2,
    isSystem: true,
    sections: [
      {
        id: 'breast_right_section',
        title: 'Right Breast',
        fields: [
          {
            id: 'right_breast',
            label: 'Right breast parenchyma',
            type: 'textarea',
            defaultValue: 'Normal skin line, subcutaneous fat, and fibroglandular parenchyma. No solid mass, cyst, architectural distortion, or microcalcification. BI-RADS 1.',
          },
        ],
      },
      {
        id: 'breast_left_section',
        title: 'Left Breast',
        fields: [
          {
            id: 'left_breast',
            label: 'Left breast parenchyma',
            type: 'textarea',
            defaultValue: 'Normal skin line, subcutaneous fat, and fibroglandular parenchyma. No solid mass, cyst, architectural distortion, or microcalcification. BI-RADS 1.',
          },
        ],
      },
      {
        id: 'breast_axillae_section',
        title: 'Axillary Regions',
        fields: [
          {
            id: 'axillae',
            label: 'Axillary lymph nodes',
            type: 'textarea',
            defaultValue: 'Both axillae show normal fatty-infiltrated lymph nodes with preserved reniform shape. No suspicious lymphadenopathy.',
          },
        ],
      },
    ],
  },

  // 12. Lower Limb Venous Doppler Study
  {
    id: 'lower_limb_doppler',
    code: 'US-LL-DOP',
    name: 'Lower Limb Venous Doppler Study',
    category: 'Ultrasound',
    description: 'Duplex Doppler study of lower extremity deep and superficial venous systems for DVT or incompetence.',
    defaultImpression: 'Normal lower limb venous Doppler study. No evidence of deep venous thrombosis (DVT) or superficial venous insufficiency.',
    version: 2,
    isSystem: true,
    sections: [
      {
        id: 'deep_veins_section',
        title: 'Deep Venous System',
        fields: [
          {
            id: 'deep_system',
            label: 'Deep veins',
            type: 'textarea',
            defaultValue: 'Common femoral, femoral, popliteal, and calf deep veins show normal spontaneous, phasic flow with respiratory variation and immediate distal augmentation. Complete luminal compressibility demonstrated. No thrombus.',
          },
        ],
      },
      {
        id: 'superficial_veins_section',
        title: 'Superficial Venous System',
        fields: [
          {
            id: 'superficial_system',
            label: 'Saphenous veins',
            type: 'textarea',
            defaultValue: 'Great and small saphenous veins are competent with normal luminal caliber. No retrograde reflux upon Valsalva maneuver or calf release. No thrombophlebitis.',
          },
        ],
      },
      {
        id: 'perforators_section',
        title: 'Perforator Veins',
        fields: [
          {
            id: 'perforators',
            label: 'Perforating veins',
            type: 'textarea',
            defaultValue: 'Thigh and medial calf perforator veins are competent without pathological dilatation (< 3.5 mm) or bidirectional flow.',
          },
        ],
      },
    ],
  },

  // 13. Male Hormone Profile
  {
    id: 'male_hormone_profile',
    code: 'LAB-HORM',
    name: 'Male Hormone Profile Report',
    category: 'Andrology & Fertility',
    description: 'Serum reproductive endocrine panel for male subfertility and hypogonadism evaluation.',
    defaultImpression: 'Euhormonal male pituitary-gonadal profile. Normal serum testosterone and gonadotropin levels.',
    version: 2,
    isSystem: true,
    sections: [
      {
        id: 'gonadotropins_section',
        title: 'Gonadal Steroids & Gonadotropins',
        fields: [
          {
            id: 'hormones',
            label: 'Endocrine panel',
            type: 'textarea',
            defaultValue: 'Serum Total Testosterone: 5.8 ng/mL (Ref: 2.8 - 8.0 ng/mL)\nSerum Free Testosterone: 18.2 pg/mL (Ref: 8.7 - 25.1 pg/mL)\nFollicle Stimulating Hormone (FSH): 4.2 mIU/mL (Ref: 1.5 - 12.4 mIU/mL)\nLuteinizing Hormone (LH): 3.6 mIU/mL (Ref: 1.7 - 8.6 mIU/mL)\nSerum Prolactin: 8.5 ng/mL (Ref: 4.0 - 15.2 ng/mL)\nSerum Estradiol (E2): 26 pg/mL (Ref: 11 - 44 pg/mL)',
          },
        ],
      },
    ],
  },

  // 14. Complete Blood Count (CBC)
  {
    id: 'cbc_report',
    code: 'LAB-CBC',
    name: 'Complete Blood Count (CBC) Report',
    category: 'General Lab',
    description: 'Automated hematology analyzer count with differential leukocyte count and red cell indices.',
    defaultImpression: 'Normal complete blood count. No anemia, leukocytosis, or thrombocytopenia.',
    version: 2,
    isSystem: true,
    sections: [
      {
        id: 'erythrocyte_section',
        title: 'Erythrocyte Indices',
        fields: [
          {
            id: 'rbc_indices',
            label: 'Red blood cell parameters',
            type: 'textarea',
            defaultValue: 'Hemoglobin (Hb): 15.2 g/dL (Ref: 13.5 - 17.5 g/dL)\nRBC Count: 5.1 × 10¹²/L (Ref: 4.5 - 5.9 × 10¹²/L)\nHematocrit (PCV): 45.6% (Ref: 41 - 50%)\nMCV: 89.4 fL (Ref: 80 - 96 fL)\nMCH: 29.8 pg (Ref: 27 - 33 pg)\nMCHC: 33.3 g/dL (Ref: 32 - 36 g/dL)\nRDW-CV: 12.8% (Ref: 11.5 - 14.5%)',
          },
        ],
      },
      {
        id: 'leukocytes_section',
        title: 'Leukocytes & Platelets',
        fields: [
          {
            id: 'wbc_platelets',
            label: 'White cells & platelets',
            type: 'textarea',
            defaultValue: 'Total Leukocyte Count (TLC): 7,200 /µL (Ref: 4,000 - 11,000 /µL)\nNeutrophils: 62% (Ref: 40 - 75%)\nLymphocytes: 29% (Ref: 20 - 45%)\nMonocytes: 6% (Ref: 2 - 10%)\nEosinophils: 3% (Ref: 1 - 6%)\nBasophils: 0% (Ref: 0 - 1%)\nPlatelet Count: 265,000 /µL (Ref: 150,000 - 450,000 /µL)',
          },
        ],
      },
    ],
  },

  // 15. Liver Function Tests (LFT)
  {
    id: 'lft_report',
    code: 'LAB-LFT',
    name: 'Liver Function Tests (LFT) Report',
    category: 'General Lab',
    description: 'Biochemical assessment of hepatic parenchymal integrity and biliary excretory capacity.',
    defaultImpression: 'Normal liver function tests. Preserved synthetic and excretory hepatic function.',
    version: 2,
    isSystem: true,
    sections: [
      {
        id: 'hepatic_section',
        title: 'Hepatic Enzymes & Bilirubin',
        fields: [
          {
            id: 'lft_parameters',
            label: 'Hepatic panel',
            type: 'textarea',
            defaultValue: 'Total Bilirubin: 0.8 mg/dL (Ref: 0.2 - 1.2 mg/dL)\nDirect Bilirubin: 0.2 mg/dL (Ref: 0.0 - 0.3 mg/dL)\nIndirect Bilirubin: 0.6 mg/dL (Ref: 0.2 - 0.9 mg/dL)\nALT / SGPT: 28 U/L (Ref: 10 - 45 U/L)\nAST / SGOT: 24 U/L (Ref: 10 - 40 U/L)\nAlkaline Phosphatase (ALP): 85 U/L (Ref: 44 - 147 U/L)\nTotal Protein: 7.2 g/dL (Ref: 6.4 - 8.3 g/dL)\nSerum Albumin: 4.4 g/dL (Ref: 3.5 - 5.0 g/dL)',
          },
        ],
      },
    ],
  },

  // 16. Renal Function & Electrolytes (RFT)
  {
    id: 'rft_report',
    code: 'LAB-RFT',
    name: 'Renal Function & Electrolytes Report',
    category: 'General Lab',
    description: 'Renal filtration biomarkers, urea, creatinine, uric acid, and serum electrolyte status.',
    defaultImpression: 'Normal renal function and serum electrolytes.',
    version: 2,
    isSystem: true,
    sections: [
      {
        id: 'renal_section',
        title: 'Renal Biomarkers & Electrolytes',
        fields: [
          {
            id: 'rft_parameters',
            label: 'Renal & Electrolyte panel',
            type: 'textarea',
            defaultValue: 'Blood Urea: 26 mg/dL (Ref: 15 - 45 mg/dL)\nSerum Creatinine: 0.9 mg/dL (Ref: 0.6 - 1.2 mg/dL)\nSerum Uric Acid: 5.2 mg/dL (Ref: 3.4 - 7.0 mg/dL)\nSerum Sodium (Na⁺): 140 mEq/L (Ref: 135 - 145 mEq/L)\nSerum Potassium (K⁺): 4.3 mEq/L (Ref: 3.5 - 5.0 mEq/L)\nSerum Chloride (Cl⁻): 102 mEq/L (Ref: 98 - 107 mEq/L)',
          },
        ],
      },
    ],
  },
];
