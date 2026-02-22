import type {
  VisitRecord,
  AnalyticsSummary,
  ClinicalTrial,
  LiteratureResult,
} from "@/types";

/* ═══════════════════════════════════════════════════════════════════════════════
   MEDSIFT AI - SYNTHETIC DEMO DATA
   Comprehensive mock data to make the application look full and realistic
   ═══════════════════════════════════════════════════════════════════════════════ */

// ─── MOCK VISITS ────────────────────────────────────────────────────────────────
export const MOCK_VISITS: VisitRecord[] = [
  {
    id: 1,
    visit_date: "2026-02-21",
    visit_type: "Annual Physical",
    tags: ["wellness", "preventive"],
    patient_summary: {
      visit_summary: "Patient presented for routine annual physical examination. Overall health is good with well-controlled hypertension. Discussed importance of continued exercise and dietary modifications. Patient reports improved energy levels since starting new medication regimen.",
      medications: [
        { name: "Lisinopril", dose: "10mg", frequency: "Once daily", instructions: "Take in the morning with water", evidence: "Blood pressure has been well controlled at 128/82", status: "active" },
        { name: "Metformin", dose: "500mg", frequency: "Twice daily", instructions: "Take with meals to reduce GI upset", evidence: "HbA1c improved from 7.2% to 6.8%", status: "active" },
        { name: "Atorvastatin", dose: "20mg", frequency: "Once daily", instructions: "Take at bedtime for optimal effect", evidence: "LDL cholesterol reduced to 95 mg/dL", status: "active" },
        { name: "Aspirin", dose: "81mg", frequency: "Once daily", instructions: "Take with food", evidence: "For cardiovascular protection", status: "review" },
      ],
      tests_ordered: [
        { test_name: "Complete Metabolic Panel", instructions: "Fasting required for 8-12 hours", timeline: "Within 2 weeks" },
        { test_name: "Lipid Panel", instructions: "Fasting blood draw", timeline: "Within 2 weeks" },
        { test_name: "HbA1c", instructions: "No fasting required", timeline: "Within 1 month" },
      ],
      follow_up: { timeframe: "6 months", reason: "Routine follow-up for chronic disease management" },
      red_flags_for_patient: [],
    },
    clinician_note: {
      soap_note: {
        subjective: {
          chief_complaint: "Annual physical examination",
          history_of_present_illness: "58-year-old male presents for routine annual physical. Reports feeling well overall. Denies chest pain, shortness of breath, or palpitations. Notes occasional mild knee pain with prolonged walking.",
          review_of_systems: "Constitutional: No fever, weight loss. Cardiovascular: No chest pain. Respiratory: No cough or dyspnea. GI: No nausea, vomiting, or abdominal pain.",
          evidence: ["Patient states 'I've been feeling great lately'", "Reports walking 30 minutes daily"],
        },
        objective: {
          vitals: "BP: 128/82, HR: 72, Temp: 98.4°F, SpO2: 98%, BMI: 27.2",
          physical_exam_findings: "General: Alert, oriented, in no acute distress. HEENT: Normocephalic, PERRLA. Cardiovascular: Regular rate and rhythm, no murmurs. Lungs: Clear to auscultation bilaterally.",
          evidence: ["Blood pressure improved from last visit (was 138/88)"],
        },
        assessment: {
          diagnoses: ["Essential hypertension, controlled", "Type 2 diabetes mellitus, improved", "Hyperlipidemia, controlled"],
          clinical_impression: "Patient demonstrates excellent compliance with medication regimen and lifestyle modifications. All chronic conditions are well-managed.",
          evidence: ["Lab values show improvement across all metrics"],
        },
        plan: {
          follow_up: "Return in 6 months for routine follow-up",
          patient_education: "Discussed importance of continued exercise, low-sodium diet, and medication compliance. Reviewed signs and symptoms of hypoglycemia.",
          evidence: ["Patient verbalized understanding of all instructions"],
        },
      },
    },
    risk_assessment: {
      risk_score: 24,
      risk_level: "low",
      risk_factors: [
        { factor: "Age over 55", points: 8 },
        { factor: "Controlled hypertension", points: 6 },
        { factor: "Type 2 diabetes (controlled)", points: 10 },
      ],
      red_flags: [],
      total_factors_detected: 3,
    },
    transcript: "Doctor: Good morning! How have you been feeling since our last visit?\nPatient: Really good, doctor. I've been walking every day like you suggested...",
    redacted_transcript: "Doctor: Good morning! How have you been feeling since our last visit?\nPatient: Really good, doctor. I've been walking every day like you suggested...",
  },
  {
    id: 2,
    visit_date: "2026-02-20",
    visit_type: "Urgent Care",
    tags: ["respiratory", "acute"],
    patient_summary: {
      visit_summary: "Patient presented with 3-day history of productive cough, low-grade fever, and fatigue. Physical examination revealed diminished breath sounds in right lower lobe. Chest X-ray confirmed right lower lobe pneumonia. Started on antibiotic therapy.",
      medications: [
        { name: "Azithromycin", dose: "500mg", frequency: "Once daily", instructions: "Take first dose today, then 250mg daily for 4 more days", evidence: "Community-acquired pneumonia, typical pathogens suspected", status: "active" },
        { name: "Benzonatate", dose: "100mg", frequency: "Three times daily", instructions: "Swallow whole, do not chew. For cough suppression.", evidence: "Patient reports severe coughing episodes disrupting sleep", status: "active" },
        { name: "Acetaminophen", dose: "650mg", frequency: "Every 6 hours as needed", instructions: "For fever and discomfort", evidence: "Temperature elevated at 100.8°F", status: "active" },
        { name: "Ibuprofen", dose: "400mg", frequency: "As needed", instructions: "Previously prescribed", evidence: "Stopped due to potential interaction", status: "stopped" },
      ],
      tests_ordered: [
        { test_name: "Follow-up Chest X-ray", instructions: "To confirm resolution of pneumonia", timeline: "In 4-6 weeks" },
      ],
      follow_up: { timeframe: "3 days", reason: "Reassessment of pneumonia, sooner if symptoms worsen" },
      red_flags_for_patient: [
        { warning: "Seek immediate care if you develop difficulty breathing, chest pain, or fever above 103°F" },
        { warning: "Return immediately if you cough up blood or experience confusion" },
      ],
    },
    clinician_note: {
      soap_note: {
        subjective: {
          chief_complaint: "Cough and fever for 3 days",
          history_of_present_illness: "45-year-old female presents with productive cough producing yellow-green sputum, low-grade fever (max 101°F at home), fatigue, and mild chest discomfort with deep breathing. Symptoms began gradually 3 days ago.",
          review_of_systems: "Positive for cough, fever, fatigue, mild dyspnea on exertion. Negative for hemoptysis, weight loss, night sweats.",
          evidence: ["Patient reports 'I can't stop coughing, especially at night'"],
        },
        objective: {
          vitals: "BP: 118/76, HR: 92, Temp: 100.8°F, SpO2: 94% on room air, RR: 20",
          physical_exam_findings: "Lungs: Decreased breath sounds and crackles in right lower lobe. Dullness to percussion RLL. No wheezing. Cardiovascular: Tachycardic but regular rhythm.",
          evidence: ["Chest X-ray shows right lower lobe infiltrate consistent with pneumonia"],
        },
        assessment: {
          diagnoses: ["Community-acquired pneumonia, right lower lobe"],
          clinical_impression: "Moderate severity CAP in otherwise healthy adult. Low risk for complications but requires close monitoring.",
          evidence: ["CURB-65 score of 1 (low mortality risk)"],
        },
        plan: {
          follow_up: "Return in 3 days for reassessment, sooner if symptoms worsen",
          patient_education: "Discussed importance of completing full antibiotic course, rest, hydration, and warning signs requiring immediate care.",
          evidence: ["Patient given written instructions for red flag symptoms"],
        },
      },
    },
    risk_assessment: {
      risk_score: 58,
      risk_level: "medium",
      risk_factors: [
        { factor: "Active infection (pneumonia)", points: 25 },
        { factor: "Decreased oxygen saturation", points: 15 },
        { factor: "Elevated respiratory rate", points: 10 },
        { factor: "Fever", points: 8 },
      ],
      red_flags: [
        { flag: "Oxygen saturation below 95%", recommended_action: "Monitor closely, consider hospitalization if declining" },
      ],
      total_factors_detected: 4,
    },
    transcript: "Doctor: What brings you in today?\nPatient: I've had this terrible cough for three days now...",
    redacted_transcript: "Doctor: What brings you in today?\nPatient: I've had this terrible cough for three days now...",
  },
  {
    id: 3,
    visit_date: "2026-02-19",
    visit_type: "Follow-up",
    tags: ["cardiology", "chronic"],
    patient_summary: {
      visit_summary: "Follow-up visit for heart failure management. Patient reports improved exercise tolerance since medication adjustment. No episodes of chest pain or severe shortness of breath. Weight stable. Echocardiogram shows improved ejection fraction from 35% to 42%.",
      medications: [
        { name: "Entresto", dose: "97/103mg", frequency: "Twice daily", instructions: "Take with or without food. Do not take with ACE inhibitors.", evidence: "Ejection fraction improved on current regimen", status: "active" },
        { name: "Carvedilol", dose: "25mg", frequency: "Twice daily", instructions: "Take with food to reduce dizziness", evidence: "Heart rate well controlled at 68 bpm", status: "active" },
        { name: "Furosemide", dose: "40mg", frequency: "Once daily", instructions: "Take in the morning. Monitor daily weights.", evidence: "No peripheral edema noted, weight stable", status: "active" },
        { name: "Spironolactone", dose: "25mg", frequency: "Once daily", instructions: "Monitor potassium levels", evidence: "Potassium within normal limits at 4.2", status: "review" },
        { name: "Lisinopril", dose: "10mg", frequency: "Once daily", instructions: "Previously prescribed", evidence: "Stopped when Entresto was started", status: "stopped" },
      ],
      tests_ordered: [
        { test_name: "BNP Level", instructions: "No special preparation needed", timeline: "Today" },
        { test_name: "Basic Metabolic Panel", instructions: "To monitor electrolytes and kidney function", timeline: "Today" },
      ],
      follow_up: { timeframe: "3 months", reason: "Heart failure management, continue current regimen" },
      red_flags_for_patient: [
        { warning: "Weigh yourself daily. Call if you gain more than 3 pounds in one day or 5 pounds in one week." },
      ],
    },
    clinician_note: {
      soap_note: {
        subjective: {
          chief_complaint: "Heart failure follow-up",
          history_of_present_illness: "67-year-old male with HFrEF (EF 35% previously) returns for routine follow-up. Reports significant improvement in exercise tolerance - can now walk 4 blocks without stopping. Denies orthopnea, PND, or chest pain. Sleeping flat without difficulty.",
          review_of_systems: "Cardiovascular: Improved exercise tolerance. Respiratory: No dyspnea at rest. Extremities: No swelling noted by patient.",
          evidence: ["Patient states 'I feel like a new person compared to 6 months ago'"],
        },
        objective: {
          vitals: "BP: 110/68, HR: 68, SpO2: 97%, Weight: 185 lbs (stable from last visit)",
          physical_exam_findings: "Cardiovascular: Regular rate, no murmurs, no S3. Lungs: Clear, no crackles. Extremities: No peripheral edema. JVP not elevated.",
          evidence: ["Echocardiogram shows EF improved to 42%"],
        },
        assessment: {
          diagnoses: ["Heart failure with reduced ejection fraction, improved", "Hypertension, controlled"],
          clinical_impression: "Excellent response to guideline-directed medical therapy. EF has improved from 35% to 42%. Patient is NYHA Class I-II currently.",
          evidence: ["BNP decreased from 450 to 180 pg/mL"],
        },
        plan: {
          follow_up: "Return in 3 months, sooner if symptoms recur",
          patient_education: "Reinforced importance of daily weights, sodium restriction, medication compliance. Encouraged continued gradual increase in physical activity.",
          evidence: ["Patient demonstrates good understanding of self-monitoring"],
        },
      },
    },
    risk_assessment: {
      risk_score: 45,
      risk_level: "medium",
      risk_factors: [
        { factor: "History of heart failure", points: 20 },
        { factor: "Age over 65", points: 10 },
        { factor: "Reduced ejection fraction (though improved)", points: 15 },
      ],
      red_flags: [],
      total_factors_detected: 3,
    },
    transcript: "Doctor: How have you been feeling since we adjusted your medications?\nPatient: So much better! I can actually walk to the mailbox now without getting winded...",
    redacted_transcript: "Doctor: How have you been feeling since we adjusted your medications?\nPatient: So much better! I can actually walk to the mailbox now without getting winded...",
  },
  {
    id: 4,
    visit_date: "2026-02-18",
    visit_type: "New Patient",
    tags: ["endocrine", "new-diagnosis"],
    patient_summary: {
      visit_summary: "New patient presenting with fatigue, increased thirst, and frequent urination. Laboratory findings confirm new diagnosis of Type 2 diabetes mellitus with HbA1c of 8.2%. Started on metformin and lifestyle counseling provided. Referred to diabetes educator.",
      medications: [
        { name: "Metformin", dose: "500mg", frequency: "Once daily with dinner", instructions: "Start with once daily, will increase to twice daily in 1 week if tolerated. Take with food.", evidence: "Starting dose to minimize GI side effects", status: "active" },
        { name: "Glipizide", dose: "5mg", frequency: "Once daily", instructions: "Under consideration", evidence: "May add if metformin alone insufficient", status: "review" },
      ],
      tests_ordered: [
        { test_name: "Fasting Lipid Panel", instructions: "Fast for 12 hours before blood draw", timeline: "Within 2 weeks" },
        { test_name: "Comprehensive Metabolic Panel", instructions: "Fasting preferred", timeline: "Within 2 weeks" },
        { test_name: "Urine Microalbumin", instructions: "First morning urine sample preferred", timeline: "Within 2 weeks" },
        { test_name: "Dilated Eye Exam", instructions: "Schedule with ophthalmology", timeline: "Within 3 months" },
      ],
      follow_up: { timeframe: "2 weeks", reason: "Review labs, assess medication tolerance, increase metformin dose" },
      red_flags_for_patient: [
        { warning: "Seek care immediately if you experience severe nausea, vomiting, or abdominal pain" },
        { warning: "Monitor for signs of low blood sugar: shakiness, sweating, confusion" },
      ],
    },
    clinician_note: {
      soap_note: {
        subjective: {
          chief_complaint: "Fatigue and excessive thirst",
          history_of_present_illness: "52-year-old female presents as new patient with 2-month history of fatigue, polydipsia, and polyuria. Reports drinking 8-10 glasses of water daily and waking 3-4 times nightly to urinate. Unintentional weight loss of 8 lbs over past 2 months.",
          review_of_systems: "Positive for fatigue, polydipsia, polyuria, weight loss, occasional blurred vision. Negative for chest pain, shortness of breath, numbness/tingling.",
          evidence: ["Patient reports 'I just can't seem to quench my thirst'"],
        },
        objective: {
          vitals: "BP: 138/88, HR: 82, Weight: 187 lbs, BMI: 31.2",
          physical_exam_findings: "General: Overweight female, appears fatigued. Skin: Dry, decreased turgor. Feet: Intact sensation, no ulcers, pulses intact bilaterally.",
          evidence: ["Random glucose in office: 287 mg/dL", "HbA1c: 8.2%"],
        },
        assessment: {
          diagnoses: ["Type 2 diabetes mellitus, newly diagnosed", "Obesity", "Hypertension, newly identified"],
          clinical_impression: "New diagnosis of Type 2 DM with classic symptoms. Moderate hyperglycemia without evidence of DKA. Will start metformin and lifestyle modifications.",
          evidence: ["Meets ADA criteria for diabetes diagnosis"],
        },
        plan: {
          follow_up: "Return in 2 weeks to assess response to metformin and review labs",
          patient_education: "Extensive counseling on diabetes management, diet modifications, importance of glucose monitoring. Provided glucometer and training. Referral to diabetes educator.",
          evidence: ["Patient demonstrated correct use of glucometer before leaving"],
        },
      },
    },
    risk_assessment: {
      risk_score: 52,
      risk_level: "medium",
      risk_factors: [
        { factor: "New diabetes diagnosis", points: 20 },
        { factor: "HbA1c > 8%", points: 12 },
        { factor: "Obesity (BMI > 30)", points: 10 },
        { factor: "Newly identified hypertension", points: 10 },
      ],
      red_flags: [
        { flag: "Significant hyperglycemia at presentation", recommended_action: "Close follow-up to ensure response to treatment" },
      ],
      total_factors_detected: 4,
    },
    transcript: "Doctor: Tell me what's been going on.\nPatient: Well, I've just been so tired lately, and I'm always thirsty...",
    redacted_transcript: "Doctor: Tell me what's been going on.\nPatient: Well, I've just been so tired lately, and I'm always thirsty...",
  },
  {
    id: 5,
    visit_date: "2026-02-17",
    visit_type: "Follow-up",
    tags: ["mental-health", "medication-check"],
    patient_summary: {
      visit_summary: "Follow-up for depression and anxiety management. Patient reports significant improvement in mood and reduced anxiety since starting sertraline 6 weeks ago. PHQ-9 score improved from 18 to 8. GAD-7 improved from 15 to 6. Will continue current regimen.",
      medications: [
        { name: "Sertraline", dose: "100mg", frequency: "Once daily", instructions: "Take in the morning with food", evidence: "Good response at current dose, PHQ-9 improved", status: "active" },
        { name: "Hydroxyzine", dose: "25mg", frequency: "As needed for anxiety", instructions: "May take up to 3 times daily. Can cause drowsiness.", evidence: "Using 2-3 times weekly for breakthrough anxiety", status: "active" },
        { name: "Escitalopram", dose: "10mg", frequency: "Once daily", instructions: "Previously prescribed", evidence: "Switched to sertraline due to side effects", status: "stopped" },
      ],
      tests_ordered: [],
      follow_up: { timeframe: "3 months", reason: "Continue monitoring depression and anxiety" },
      red_flags_for_patient: [
        { warning: "Seek immediate help if you have thoughts of self-harm or suicide. Crisis line: 988" },
      ],
    },
    clinician_note: {
      soap_note: {
        subjective: {
          chief_complaint: "Depression/anxiety follow-up",
          history_of_present_illness: "34-year-old male returns for psychiatric medication follow-up. Started sertraline 100mg 6 weeks ago. Reports 'feeling like myself again.' Sleep improved, appetite normalized, able to return to work full-time. Occasional anxiety managed with hydroxyzine PRN.",
          review_of_systems: "Mood: Improved. Sleep: 7-8 hours nightly. Appetite: Normal. Energy: Improved. Concentration: Better.",
          evidence: ["Patient states 'I finally feel like I can handle things again'"],
        },
        objective: {
          vitals: "BP: 122/78, HR: 72",
          physical_exam_findings: "General: Well-groomed, good eye contact, appropriate affect. Mental status: Alert, oriented, mood 'good,' affect congruent.",
          evidence: ["PHQ-9: 8 (was 18)", "GAD-7: 6 (was 15)"],
        },
        assessment: {
          diagnoses: ["Major depressive disorder, improving on treatment", "Generalized anxiety disorder, controlled"],
          clinical_impression: "Excellent response to sertraline. Both depression and anxiety symptoms significantly improved. No side effects reported.",
          evidence: ["Standardized screening scores show meaningful clinical improvement"],
        },
        plan: {
          follow_up: "Return in 3 months, sooner if symptoms worsen",
          patient_education: "Discussed importance of continuing medication even when feeling well. Reviewed warning signs of relapse. Encouraged continued therapy sessions.",
          evidence: ["Patient engaged in ongoing CBT with outside therapist"],
        },
      },
    },
    risk_assessment: {
      risk_score: 28,
      risk_level: "low",
      risk_factors: [
        { factor: "History of depression", points: 15 },
        { factor: "History of anxiety", points: 8 },
        { factor: "On psychiatric medication", points: 5 },
      ],
      red_flags: [],
      total_factors_detected: 3,
    },
    transcript: "Doctor: How have you been doing since we started the sertraline?\nPatient: Honestly, so much better. I finally feel like myself again...",
    redacted_transcript: "Doctor: How have you been doing since we started the sertraline?\nPatient: Honestly, so much better. I finally feel like myself again...",
  },
  {
    id: 6,
    visit_date: "2026-02-16",
    visit_type: "Urgent Care",
    tags: ["orthopedic", "acute"],
    patient_summary: {
      visit_summary: "Patient presents after falling on ice yesterday. Right ankle pain and swelling. X-ray shows no fracture. Diagnosed with Grade II ankle sprain. RICE protocol initiated. Provided ankle brace and crutches.",
      medications: [
        { name: "Ibuprofen", dose: "600mg", frequency: "Three times daily with food", instructions: "Take for pain and inflammation. Do not exceed 1800mg daily.", evidence: "Moderate pain and swelling present", status: "active" },
        { name: "Acetaminophen", dose: "500mg", frequency: "Every 6 hours as needed", instructions: "Can alternate with ibuprofen for additional pain relief", evidence: "For breakthrough pain", status: "active" },
      ],
      tests_ordered: [],
      follow_up: { timeframe: "1 week", reason: "Reassess ankle, ensure healing progression" },
      red_flags_for_patient: [
        { warning: "Return if pain significantly worsens or you cannot bear any weight after 3 days" },
        { warning: "Seek care if you develop numbness, tingling, or color changes in your foot" },
      ],
    },
    clinician_note: {
      soap_note: {
        subjective: {
          chief_complaint: "Right ankle injury",
          history_of_present_illness: "28-year-old male slipped on ice yesterday, twisting right ankle. Immediate pain and swelling. Able to bear some weight but with significant pain. No numbness or tingling. Applied ice at home.",
          review_of_systems: "MSK: Right ankle pain 7/10, swelling. Neuro: No numbness/tingling.",
          evidence: ["Patient describes 'rolling' mechanism of injury"],
        },
        objective: {
          vitals: "BP: 128/82, HR: 78",
          physical_exam_findings: "Right ankle: Moderate swelling over lateral malleolus. Ecchymosis developing. Tender over ATFL. Negative squeeze test. Able to bear weight with difficulty. Intact sensation and pulses.",
          evidence: ["X-ray: No fracture identified. Soft tissue swelling noted."],
        },
        assessment: {
          diagnoses: ["Right ankle sprain, Grade II"],
          clinical_impression: "Lateral ankle sprain with partial ATFL involvement. No fracture on imaging. Good prognosis with conservative management.",
          evidence: ["Ottawa ankle rules negative for fracture"],
        },
        plan: {
          follow_up: "Return in 1 week for reassessment",
          patient_education: "RICE protocol: Rest, Ice (20 min every 2-3 hours), Compression (ace wrap), Elevation. Provided ankle brace and crutches. May begin gentle ROM exercises in 3-5 days.",
          evidence: ["Patient demonstrated proper use of crutches"],
        },
      },
    },
    risk_assessment: {
      risk_score: 18,
      risk_level: "low",
      risk_factors: [
        { factor: "Acute injury", points: 10 },
        { factor: "Moderate pain level", points: 8 },
      ],
      red_flags: [],
      total_factors_detected: 2,
    },
    transcript: "Doctor: What happened to your ankle?\nPatient: I slipped on some ice yesterday and my ankle twisted...",
    redacted_transcript: "Doctor: What happened to your ankle?\nPatient: I slipped on some ice yesterday and my ankle twisted...",
  },
  {
    id: 7,
    visit_date: "2026-02-15",
    visit_type: "Routine",
    tags: ["pediatric", "wellness"],
    patient_summary: {
      visit_summary: "Well-child visit for 4-year-old. Growth and development appropriate for age. Immunizations updated. No concerns from parents. Anticipatory guidance provided regarding nutrition and safety.",
      medications: [],
      tests_ordered: [
        { test_name: "Vision Screening", instructions: "Age-appropriate screening", timeline: "Completed today" },
        { test_name: "Hearing Screening", instructions: "Age-appropriate screening", timeline: "Completed today" },
      ],
      follow_up: { timeframe: "1 year", reason: "5-year well-child visit" },
      red_flags_for_patient: [],
    },
    clinician_note: {
      soap_note: {
        subjective: {
          chief_complaint: "4-year well-child check",
          history_of_present_illness: "Parents report child is doing well. No concerns about development. Eating well, sleeping through the night. Attends preschool 3 days/week with good social interactions.",
          review_of_systems: "All systems reviewed and negative for concerns.",
          evidence: ["Parents state 'She's been healthy all year'"],
        },
        objective: {
          vitals: "Weight: 38 lbs (60th percentile), Height: 40 in (55th percentile), BP: 95/60",
          physical_exam_findings: "General: Active, playful, interactive. HEENT: Normal. Heart: RRR, no murmur. Lungs: Clear. Abdomen: Soft, non-tender. Neuro: Age-appropriate milestones met.",
          evidence: ["Vision screening passed", "Hearing screening passed"],
        },
        assessment: {
          diagnoses: ["Well child, 4 years old", "Health maintenance"],
          clinical_impression: "Healthy 4-year-old with normal growth and development. Up to date on immunizations after today's visit.",
          evidence: ["Developmental screening (ASQ-3) within normal limits"],
        },
        plan: {
          follow_up: "Return for 5-year well-child visit",
          patient_education: "Discussed nutrition (limiting juice, encouraging vegetables), car seat safety, water safety, and importance of reading daily. Kindergarten readiness discussed.",
          evidence: ["Immunizations given: DTaP, IPV, MMR, Varicella boosters"],
        },
      },
    },
    risk_assessment: {
      risk_score: 5,
      risk_level: "low",
      risk_factors: [],
      red_flags: [],
      total_factors_detected: 0,
    },
    transcript: "Doctor: How has she been doing?\nParent: Great! She loves preschool and has been so healthy...",
    redacted_transcript: "Doctor: How has she been doing?\nParent: Great! She loves preschool and has been so healthy...",
  },
  {
    id: 8,
    visit_date: "2026-02-14",
    visit_type: "Follow-up",
    tags: ["chronic-pain", "medication-management"],
    patient_summary: {
      visit_summary: "Chronic low back pain follow-up. Pain moderately controlled on current regimen. Physical therapy helping. Discussed non-opioid management strategies. Will continue current medications and PT.",
      medications: [
        { name: "Duloxetine", dose: "60mg", frequency: "Once daily", instructions: "Take in the morning", evidence: "Helps with pain and mood", status: "active" },
        { name: "Cyclobenzaprine", dose: "10mg", frequency: "At bedtime", instructions: "Take at night due to drowsiness", evidence: "Muscle spasms improved", status: "active" },
        { name: "Topical Lidocaine 5%", dose: "Patch", frequency: "12 hours on, 12 hours off", instructions: "Apply to lower back", evidence: "Provides localized relief", status: "active" },
        { name: "Tramadol", dose: "50mg", frequency: "As needed", instructions: "Previously prescribed", evidence: "Discontinued - transitioning to non-opioid management", status: "stopped" },
        { name: "Gabapentin", dose: "300mg", frequency: "Three times daily", instructions: "Under evaluation", evidence: "Considering for neuropathic component", status: "review" },
      ],
      tests_ordered: [],
      follow_up: { timeframe: "2 months", reason: "Pain management follow-up" },
      red_flags_for_patient: [
        { warning: "Seek immediate care if you develop leg weakness, numbness, or loss of bladder/bowel control" },
      ],
    },
    clinician_note: {
      soap_note: {
        subjective: {
          chief_complaint: "Chronic low back pain follow-up",
          history_of_present_illness: "55-year-old female with chronic low back pain secondary to degenerative disc disease. Pain currently 4-5/10, down from 7/10 at last visit. Physical therapy twice weekly helping. Able to perform daily activities with minimal limitation.",
          review_of_systems: "MSK: Lower back pain, improved. Neuro: No radiating symptoms, no weakness.",
          evidence: ["Patient reports 'PT has really helped me function better'"],
        },
        objective: {
          vitals: "BP: 132/84, HR: 76",
          physical_exam_findings: "Lumbar spine: Mild paraspinal tenderness. ROM limited but improved. SLR negative bilaterally. Strength 5/5 in lower extremities. Sensation intact.",
          evidence: ["Oswestry Disability Index improved from 48% to 32%"],
        },
        assessment: {
          diagnoses: ["Chronic low back pain, improving", "Lumbar degenerative disc disease"],
          clinical_impression: "Good progress with multimodal approach including medications and physical therapy. No indication for interventional procedures at this time.",
          evidence: ["Functional improvement documented on standardized measures"],
        },
        plan: {
          follow_up: "Return in 2 months, continue PT",
          patient_education: "Discussed importance of home exercise program, proper body mechanics, and maintaining active lifestyle. Reviewed red flag symptoms.",
          evidence: ["Patient committed to continuing home exercises"],
        },
      },
    },
    risk_assessment: {
      risk_score: 32,
      risk_level: "low",
      risk_factors: [
        { factor: "Chronic pain condition", points: 15 },
        { factor: "Age over 50", points: 7 },
        { factor: "Multiple medications", points: 10 },
      ],
      red_flags: [],
      total_factors_detected: 3,
    },
    transcript: "Doctor: How has your back been doing?\nPatient: Actually, much better since I started PT...",
    redacted_transcript: "Doctor: How has your back been doing?\nPatient: Actually, much better since I started PT...",
  },
];

// ─── MOCK ANALYTICS ─────────────────────────────────────────────────────────────
export const MOCK_ANALYTICS: AnalyticsSummary = {
  total_visits: 847,
  avg_risk_score: 34,
  risk_distribution: {
    low: 512,
    medium: 268,
    high: 67,
  },
  top_conditions: [
    { condition: "Hypertension", count: 187 },
    { condition: "Type 2 Diabetes", count: 143 },
    { condition: "Hyperlipidemia", count: 128 },
    { condition: "Anxiety/Depression", count: 95 },
    { condition: "Low Back Pain", count: 82 },
    { condition: "Upper Respiratory Infection", count: 76 },
    { condition: "Osteoarthritis", count: 64 },
    { condition: "GERD", count: 58 },
  ],
  top_medications: [
    { medication: "Lisinopril", count: 156 },
    { medication: "Metformin", count: 134 },
    { medication: "Atorvastatin", count: 121 },
    { medication: "Omeprazole", count: 98 },
    { medication: "Amlodipine", count: 87 },
    { medication: "Levothyroxine", count: 76 },
    { medication: "Sertraline", count: 68 },
    { medication: "Gabapentin", count: 54 },
  ],
  top_boosted_keywords: [
    { keyword: "diabetes management", positive_count: 45, negative_count: 3, boost_score: 87.5 },
    { keyword: "blood pressure control", positive_count: 38, negative_count: 5, boost_score: 76.7 },
    { keyword: "medication adherence", positive_count: 32, negative_count: 2, boost_score: 88.2 },
    { keyword: "lifestyle modifications", positive_count: 28, negative_count: 4, boost_score: 75.0 },
    { keyword: "follow-up care", positive_count: 25, negative_count: 1, boost_score: 92.3 },
  ],
  weekly_visits: [
    { week: "Feb 10", count: 42 },
    { week: "Feb 3", count: 38 },
    { week: "Jan 27", count: 45 },
    { week: "Jan 20", count: 41 },
    { week: "Jan 13", count: 36 },
    { week: "Jan 6", count: 39 },
  ],
};

// ─── MOCK CLINICAL TRIALS ───────────────────────────────────────────────────────
export const MOCK_TRIALS: ClinicalTrial[] = [
  {
    nct_id: "NCT05847291",
    title: "Novel GLP-1 Agonist for Type 2 Diabetes Management",
    status: "Recruiting",
    phase: "Phase 3",
    conditions: ["Type 2 Diabetes Mellitus"],
    interventions: ["Drug: TZP-2847"],
    locations: ["Atlanta, GA", "Boston, MA", "Chicago, IL"],
    summary: "A randomized, double-blind study evaluating the efficacy and safety of TZP-2847 compared to placebo in patients with inadequately controlled Type 2 diabetes.",
    url: "https://clinicaltrials.gov/study/NCT05847291",
  },
  {
    nct_id: "NCT05912384",
    title: "Digital Therapeutics for Chronic Pain Management",
    status: "Recruiting",
    phase: "Phase 2",
    conditions: ["Chronic Low Back Pain"],
    interventions: ["Device: PainRelief App", "Behavioral: Cognitive Behavioral Therapy"],
    locations: ["San Francisco, CA", "New York, NY"],
    summary: "Investigating the effectiveness of a smartphone-based digital therapeutic program for chronic low back pain management.",
    url: "https://clinicaltrials.gov/study/NCT05912384",
  },
  {
    nct_id: "NCT05738492",
    title: "AI-Assisted Hypertension Management",
    status: "Recruiting",
    phase: "Phase 4",
    conditions: ["Hypertension"],
    interventions: ["Other: AI Monitoring System", "Drug: Standard of Care"],
    locations: ["Houston, TX", "Phoenix, AZ", "Philadelphia, PA"],
    summary: "Evaluating the impact of AI-assisted blood pressure monitoring on hypertension control in primary care settings.",
    url: "https://clinicaltrials.gov/study/NCT05738492",
  },
];

// ─── MOCK LITERATURE ────────────────────────────────────────────────────────────
export const MOCK_LITERATURE: LiteratureResult[] = [
  {
    paper_id: "PMC9847291",
    title: "Advances in Type 2 Diabetes Management: A Comprehensive Review of Novel Therapeutics",
    authors: ["Chen S", "Williams R", "Patel K", "Johnson M"],
    journal: "Journal of Clinical Endocrinology",
    year: 2025,
    abstract: "This comprehensive review examines recent advances in Type 2 diabetes management, including novel GLP-1 receptor agonists, dual-action medications, and emerging digital health interventions. We analyze clinical trial data from the past 5 years and provide evidence-based recommendations for clinical practice.",
    citation_count: 287,
    url: "https://pubmed.ncbi.nlm.nih.gov/38947291",
    relevance_score: 0.94,
  },
  {
    paper_id: "PMC9823456",
    title: "Machine Learning Applications in Primary Care: A Systematic Review",
    authors: ["Rodriguez A", "Kim J", "Thompson B"],
    journal: "JAMA Internal Medicine",
    year: 2025,
    abstract: "We systematically reviewed 156 studies examining machine learning applications in primary care settings. Applications included risk prediction, diagnostic support, and treatment optimization. Our findings suggest significant potential for ML to improve patient outcomes when integrated thoughtfully into clinical workflows.",
    citation_count: 412,
    url: "https://pubmed.ncbi.nlm.nih.gov/38823456",
    relevance_score: 0.89,
  },
  {
    paper_id: "PMC9756123",
    title: "Community-Acquired Pneumonia in Adults: Updated Guidelines and Management Strategies",
    authors: ["Martin L", "Garcia C", "Anderson P", "Lee S"],
    journal: "Chest",
    year: 2025,
    abstract: "Updated clinical practice guidelines for the management of community-acquired pneumonia in immunocompetent adults. This document incorporates recent evidence on antibiotic selection, duration of therapy, and role of adjunctive treatments including corticosteroids.",
    citation_count: 534,
    url: "https://pubmed.ncbi.nlm.nih.gov/38756123",
    relevance_score: 0.92,
  },
  {
    paper_id: "PMC9634789",
    title: "Heart Failure with Reduced Ejection Fraction: 2025 Update on Guideline-Directed Medical Therapy",
    authors: ["Brown D", "Wilson K", "Taylor R"],
    journal: "Circulation",
    year: 2025,
    abstract: "This update reviews the current evidence supporting the four pillars of guideline-directed medical therapy for HFrEF, including practical guidance on initiation, titration, and management of side effects. We also discuss emerging therapies and their potential role in future treatment paradigms.",
    citation_count: 621,
    url: "https://pubmed.ncbi.nlm.nih.gov/38634789",
    relevance_score: 0.91,
  },
];

// ─── HELPER FUNCTION TO GET MOCK DATA ───────────────────────────────────────────
export function getMockVisits(): VisitRecord[] {
  return MOCK_VISITS;
}

export function getMockAnalytics(): AnalyticsSummary {
  return MOCK_ANALYTICS;
}

export function getMockTrials(): ClinicalTrial[] {
  return MOCK_TRIALS;
}

export function getMockLiterature(): LiteratureResult[] {
  return MOCK_LITERATURE;
}