// server.ts
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type, ThinkingLevel } from "@google/genai";

// src/data/nigeriaHealthcareData.ts
var NATIONAL_EMERGENCY_NUMBERS = [
  { label: "National Emergency Toll-Free", number: "112", description: "Federal emergency response (Police, Ambulance, Fire)" },
  { label: "NCDC Toll-Free Helpline", number: "6232", description: "Nigeria Centre for Disease Control & Prevention" },
  { label: "Lagos State Emergency", number: "767", description: "Lagos State Emergency Management (LASEMA)" },
  { label: "Nigerian Red Cross Society", number: "0803 123 0315", description: "First aid, disaster & casualty response" },
  { label: "National Blood Service Agency", number: "0907 888 8802", description: "Emergency blood donation & access" }
];
var RED_FLAG_SYMPTOMS = [
  {
    title: "Severe / Sharp Chest Pain",
    description: "Crushing sensation, pain radiating to left arm/jaw, sweating, or collapsing.",
    action: "Suspected heart event. Rush to nearest Emergency Room immediately."
  },
  {
    title: "Severe Difficulty Breathing",
    description: "Gasping, blue lips/fingertips, unable to speak in full sentences, chest retractions.",
    action: "Critical oxygen deficit. Seek emergency medical care immediately."
  },
  {
    title: "Sudden Half-Body Weakness or Facial Droop",
    description: "Arm weakness, slurred speech, sudden confusion, or loss of balance (FAST signs).",
    action: "Suspected stroke. Every minute counts \u2014 get to a tertiary/general hospital NOW."
  },
  {
    title: "Heavy Uncontrolled Bleeding",
    description: "Pumping/spurting blood, deep wounds not stopping after 10 minutes of direct pressure.",
    action: "Risk of hypovolemic shock. Apply firm direct pressure with clean cloth and rush to hospital."
  },
  {
    title: "Loss of Consciousness / Unresponsiveness",
    description: "Cannot be woken up, repeated convulsions/seizures, or severe lethargy in baby.",
    action: "Emergency. Place in recovery position if breathing; rush to nearest hospital."
  },
  {
    title: "Severe Dehydration with Purging & Vomiting",
    description: "Sunken eyes, no urine for hours, extreme thirst, wrinkly skin tenting (Cholera alert).",
    action: "Emergency dehydration. Give ORS immediately while transporting to health facility."
  },
  {
    title: "Pregnancy Danger Signs (Bleeding, Severe Headache, Blurred Vision)",
    description: "Vaginal bleeding, water breaking early, face/hand swelling with headache/blurry vision, convulsions, or baby stopped moving.",
    action: "Obstetric emergency. Do NOT take herbs or home painkillers \u2014 go straight to Maternity Emergency Ward."
  }
];
var NIGERIAN_STATES_DATA = {
  "Abia": {
    name: "Abia",
    capital: "Umuahia",
    emergencyHotlines: ["112", "0803 543 5432"],
    facilities: [
      { name: "Federal Medical Centre (FMC) Umuahia", type: "Federal Medical Centre", city: "Umuahia", state: "Abia", address: "Bende Road, Umuahia" },
      { name: "Abia State University Teaching Hospital (ABSUTH)", type: "Teaching Hospital", city: "Aba", state: "Abia", address: "Aba-Owerri Road, Aba" },
      { name: "General Hospital Aba", type: "General Hospital", city: "Aba", state: "Abia" }
    ]
  },
  "Adamawa": {
    name: "Adamawa",
    capital: "Yola",
    emergencyHotlines: ["112", "0808 967 5333"],
    facilities: [
      { name: "Modibbo Adama University Teaching Hospital (MAUTH)", type: "Teaching Hospital", city: "Yola", state: "Adamawa" },
      { name: "Specialist Hospital Yola", type: "Specialist Hospital", city: "Yola", state: "Adamawa" },
      { name: "General Hospital Mubi", type: "General Hospital", city: "Mubi", state: "Adamawa" }
    ]
  },
  "Akwa Ibom": {
    name: "Akwa Ibom",
    capital: "Uyo",
    emergencyHotlines: ["112", "0803 899 4299"],
    facilities: [
      { name: "University of Uyo Teaching Hospital (UUTH)", type: "Teaching Hospital", city: "Uyo", state: "Akwa Ibom", address: "Abak Road, Uyo" },
      { name: "General Hospital Ikot Ekpene", type: "General Hospital", city: "Ikot Ekpene", state: "Akwa Ibom" },
      { name: "Immanuel General Hospital Eket", type: "General Hospital", city: "Eket", state: "Akwa Ibom" }
    ]
  },
  "Anambra": {
    name: "Anambra",
    capital: "Awka",
    emergencyHotlines: ["112", "0703 989 6443"],
    facilities: [
      { name: "Nnamdi Azikiwe University Teaching Hospital (NAUTH)", type: "Teaching Hospital", city: "Nnewi", state: "Anambra" },
      { name: "Chukwuemeka Odumegwu Ojukwu University Teaching Hospital (COOUTH)", type: "Teaching Hospital", city: "Awka", state: "Anambra", address: "Amaku, Awka" },
      { name: "General Hospital Onitsha", type: "General Hospital", city: "Onitsha", state: "Anambra" }
    ]
  },
  "Bauchi": {
    name: "Bauchi",
    capital: "Bauchi",
    emergencyHotlines: ["112", "0803 836 2926"],
    facilities: [
      { name: "Abubakar Tafawa Balewa University Teaching Hospital (ATBUTH)", type: "Teaching Hospital", city: "Bauchi", state: "Bauchi", address: "Hospital Road, Bauchi" },
      { name: "Specialist Hospital Bauchi", type: "Specialist Hospital", city: "Bauchi", state: "Bauchi" },
      { name: "General Hospital Azare", type: "General Hospital", city: "Azare", state: "Bauchi" }
    ]
  },
  "Bayelsa": {
    name: "Bayelsa",
    capital: "Yenagoa",
    emergencyHotlines: ["112", "0803 921 3998"],
    facilities: [
      { name: "Federal Medical Centre (FMC) Yenagoa", type: "Federal Medical Centre", city: "Yenagoa", state: "Bayelsa" },
      { name: "Niger Delta University Teaching Hospital (NDUTH)", type: "Teaching Hospital", city: "Okolobiri", state: "Bayelsa" },
      { name: "Dieteko Koki Memorial Hospital", type: "General Hospital", city: "Yenagoa", state: "Bayelsa" }
    ]
  },
  "Benue": {
    name: "Benue",
    capital: "Makurdi",
    emergencyHotlines: ["112", "0803 389 4212"],
    facilities: [
      { name: "Benue State University Teaching Hospital (BSUTH)", type: "Teaching Hospital", city: "Makurdi", state: "Benue" },
      { name: "Federal Medical Centre (FMC) Makurdi", type: "Federal Medical Centre", city: "Makurdi", state: "Benue" },
      { name: "General Hospital Gboko", type: "General Hospital", city: "Gboko", state: "Benue" }
    ]
  },
  "Borno": {
    name: "Borno",
    capital: "Maiduguri",
    emergencyHotlines: ["112", "0806 840 4281"],
    facilities: [
      { name: "University of Maiduguri Teaching Hospital (UMTH)", type: "Teaching Hospital", city: "Maiduguri", state: "Borno", address: "Bama Road, Maiduguri" },
      { name: "State Specialist Hospital Maiduguri", type: "Specialist Hospital", city: "Maiduguri", state: "Borno" },
      { name: "General Hospital Biu", type: "General Hospital", city: "Biu", state: "Borno" }
    ]
  },
  "Cross River": {
    name: "Cross River",
    capital: "Calabar",
    emergencyHotlines: ["112", "0803 869 4140"],
    facilities: [
      { name: "University of Calabar Teaching Hospital (UCTH)", type: "Teaching Hospital", city: "Calabar", state: "Cross River" },
      { name: "General Hospital Calabar (Mary Slessor)", type: "General Hospital", city: "Calabar", state: "Cross River" },
      { name: "General Hospital Ogoja", type: "General Hospital", city: "Ogoja", state: "Cross River" }
    ]
  },
  "Delta": {
    name: "Delta",
    capital: "Asaba",
    emergencyHotlines: ["112", "0803 123 7890"],
    facilities: [
      { name: "Federal Medical Centre (FMC) Asaba", type: "Federal Medical Centre", city: "Asaba", state: "Delta" },
      { name: "Delta State University Teaching Hospital (DELSUTH)", type: "Teaching Hospital", city: "Oghara", state: "Delta" },
      { name: "Central Hospital Warri", type: "General Hospital", city: "Warri", state: "Delta" }
    ]
  },
  "Ebonyi": {
    name: "Ebonyi",
    capital: "Abakaliki",
    emergencyHotlines: ["112", "0803 762 1089"],
    facilities: [
      { name: "Alex Ekwueme Federal University Teaching Hospital (AE-FUTHA)", type: "Teaching Hospital", city: "Abakaliki", state: "Ebonyi" },
      { name: "National Obstetric Fistula Centre", type: "Specialist Hospital", city: "Abakaliki", state: "Ebonyi" },
      { name: "General Hospital Afikpo", type: "General Hospital", city: "Afikpo", state: "Ebonyi" }
    ]
  },
  "Edo": {
    name: "Edo",
    capital: "Benin City",
    emergencyHotlines: ["112", "0803 333 4567"],
    facilities: [
      { name: "University of Benin Teaching Hospital (UBTH)", type: "Teaching Hospital", city: "Benin City", state: "Edo", address: "Ugbowo, Benin City" },
      { name: "Irrua Specialist Teaching Hospital (ISTH - Lassa Fever Centre)", type: "Specialist Hospital", city: "Irrua", state: "Edo" },
      { name: "Central Hospital Benin City", type: "General Hospital", city: "Benin City", state: "Edo" }
    ]
  },
  "Ekiti": {
    name: "Ekiti",
    capital: "Ado-Ekiti",
    emergencyHotlines: ["112", "0802 345 6789"],
    facilities: [
      { name: "Ekiti State University Teaching Hospital (EKSUTH)", type: "Teaching Hospital", city: "Ado-Ekiti", state: "Ekiti" },
      { name: "Federal Teaching Hospital Ido-Ekiti (FTHI)", type: "Teaching Hospital", city: "Ido-Ekiti", state: "Ekiti" },
      { name: "State Specialist Hospital Ikole-Ekiti", type: "Specialist Hospital", city: "Ikole-Ekiti", state: "Ekiti" }
    ]
  },
  "Enugu": {
    name: "Enugu",
    capital: "Enugu",
    emergencyHotlines: ["112", "0803 123 4567"],
    facilities: [
      { name: "University of Nigeria Teaching Hospital (UNTH)", type: "Teaching Hospital", city: "Ituku-Ozalla / Enugu", state: "Enugu" },
      { name: "Enugu State University Teaching Hospital (ESUT Parklane)", type: "Teaching Hospital", city: "Enugu", state: "Enugu", address: "Parklane, GRA, Enugu" },
      { name: "National Orthopaedic Hospital Enugu", type: "Specialist Hospital", city: "Enugu", state: "Enugu", address: "Abakaliki Road, Enugu" },
      { name: "District Hospital Nsukka", type: "General Hospital", city: "Nsukka", state: "Enugu" }
    ]
  },
  "FCT - Abuja": {
    name: "FCT - Abuja",
    capital: "Abuja",
    emergencyHotlines: ["112", "0809 993 6312", "6232"],
    facilities: [
      { name: "National Hospital Abuja", type: "Specialist Hospital", city: "Central Area, Abuja", state: "FCT - Abuja", address: "Plot 132 Central District, Abuja" },
      { name: "University of Abuja Teaching Hospital (UATH)", type: "Teaching Hospital", city: "Gwagwalada", state: "FCT - Abuja" },
      { name: "Maitama District Hospital", type: "General Hospital", city: "Maitama, Abuja", state: "FCT - Abuja", address: "Aguiyi Ironsi Way, Maitama" },
      { name: "Asokoro District Hospital", type: "General Hospital", city: "Asokoro, Abuja", state: "FCT - Abuja" },
      { name: "Wuse District Hospital", type: "General Hospital", city: "Wuse Zone 3, Abuja", state: "FCT - Abuja" },
      { name: "Kubwa General Hospital", type: "General Hospital", city: "Kubwa, Abuja", state: "FCT - Abuja" }
    ]
  },
  "Gombe": {
    name: "Gombe",
    capital: "Gombe",
    emergencyHotlines: ["112", "0803 971 6390"],
    facilities: [
      { name: "Federal Teaching Hospital Gombe (FTHG)", type: "Teaching Hospital", city: "Gombe", state: "Gombe" },
      { name: "State Specialist Hospital Gombe", type: "Specialist Hospital", city: "Gombe", state: "Gombe" },
      { name: "General Hospital Kaltungo", type: "General Hospital", city: "Kaltungo", state: "Gombe" }
    ]
  },
  "Imo": {
    name: "Imo",
    capital: "Owerri",
    emergencyHotlines: ["112", "0803 478 9012"],
    facilities: [
      { name: "Federal University Teaching Hospital Owerri (FUTHO / formerly FMC)", type: "Teaching Hospital", city: "Owerri", state: "Imo" },
      { name: "Imo State University Teaching Hospital (IMSUTH)", type: "Teaching Hospital", city: "Orlu", state: "Imo" },
      { name: "General Hospital Umuguma", type: "General Hospital", city: "Owerri", state: "Imo" }
    ]
  },
  "Jigawa": {
    name: "Jigawa",
    capital: "Dutse",
    emergencyHotlines: ["112", "0803 897 1234"],
    facilities: [
      { name: "Federal University Teaching Hospital Dutse", type: "Teaching Hospital", city: "Dutse", state: "Jigawa" },
      { name: "Rasheed Shekoni Specialist Hospital", type: "Specialist Hospital", city: "Dutse", state: "Jigawa" },
      { name: "General Hospital Hadejia", type: "General Hospital", city: "Hadejia", state: "Jigawa" }
    ]
  },
  "Kaduna": {
    name: "Kaduna",
    capital: "Kaduna",
    emergencyHotlines: ["112", "0803 587 1662"],
    facilities: [
      { name: "Ahmadu Bello University Teaching Hospital (ABUTH)", type: "Teaching Hospital", city: "Zaria", state: "Kaduna", address: "Shika, Zaria" },
      { name: "Barau Dikko Teaching Hospital (KASUTH)", type: "Teaching Hospital", city: "Kaduna", state: "Kaduna", address: "Lafia Road, Kaduna" },
      { name: "National Eye Centre Kaduna", type: "Specialist Hospital", city: "Kaduna", state: "Kaduna" },
      { name: "General Hospital Kafanchan", type: "General Hospital", city: "Kafanchan", state: "Kaduna" }
    ]
  },
  "Kano": {
    name: "Kano",
    capital: "Kano",
    emergencyHotlines: ["112", "0803 978 4567"],
    facilities: [
      { name: "Aminu Kano Teaching Hospital (AKTH)", type: "Teaching Hospital", city: "Kano", state: "Kano", address: "Zaria Road, Kano" },
      { name: "Murtala Muhammad Specialist Hospital", type: "Specialist Hospital", city: "Kano City", state: "Kano" },
      { name: "Muhammad Abdullahi Wase Teaching Hospital (Nassarawa Hospital)", type: "Teaching Hospital", city: "Kano", state: "Kano" },
      { name: "General Hospital Bichi", type: "General Hospital", city: "Bichi", state: "Kano" }
    ]
  },
  "Katsina": {
    name: "Katsina",
    capital: "Katsina",
    emergencyHotlines: ["112", "0803 214 5678"],
    facilities: [
      { name: "Federal Teaching Hospital Katsina (formerly FMC)", type: "Teaching Hospital", city: "Katsina", state: "Katsina" },
      { name: "General Hospital Katsina", type: "General Hospital", city: "Katsina", state: "Katsina" },
      { name: "General Hospital Funtua", type: "General Hospital", city: "Funtua", state: "Katsina" }
    ]
  },
  "Kebbi": {
    name: "Kebbi",
    capital: "Birnin Kebbi",
    emergencyHotlines: ["112", "0803 456 7891"],
    facilities: [
      { name: "Federal Medical Centre (FMC) Birnin Kebbi", type: "Federal Medical Centre", city: "Birnin Kebbi", state: "Kebbi" },
      { name: "Sir Yahaya Memorial Hospital", type: "General Hospital", city: "Birnin Kebbi", state: "Kebbi" }
    ]
  },
  "Kogi": {
    name: "Kogi",
    capital: "Lokoja",
    emergencyHotlines: ["112", "0803 678 9012"],
    facilities: [
      { name: "Federal Teaching Hospital Lokoja (formerly FMC Lokoja)", type: "Teaching Hospital", city: "Lokoja", state: "Kogi" },
      { name: "Kogi State Specialist Hospital", type: "Specialist Hospital", city: "Lokoja", state: "Kogi" },
      { name: "General Hospital Okene", type: "General Hospital", city: "Okene", state: "Kogi" }
    ]
  },
  "Kwara": {
    name: "Kwara",
    capital: "Ilorin",
    emergencyHotlines: ["112", "0803 789 0123"],
    facilities: [
      { name: "University of Ilorin Teaching Hospital (UITH)", type: "Teaching Hospital", city: "Ilorin", state: "Kwara", address: "Old Jebba Road, Oke-Ose, Ilorin" },
      { name: "General Hospital Ilorin", type: "General Hospital", city: "Ilorin", state: "Kwara" },
      { name: "General Hospital Offa", type: "General Hospital", city: "Offa", state: "Kwara" }
    ]
  },
  "Lagos": {
    name: "Lagos",
    capital: "Ikeja",
    emergencyHotlines: ["112", "767", "0800 000 5246"],
    facilities: [
      { name: "Lagos University Teaching Hospital (LUTH)", type: "Teaching Hospital", city: "Idi-Araba, Surulere", state: "Lagos", address: "Ishaga Road, Idi-Araba, Lagos" },
      { name: "Lagos State University Teaching Hospital (LASUTH)", type: "Teaching Hospital", city: "Ikeja", state: "Lagos", address: "1-5 Oba Akinjobi Way, GRA, Ikeja" },
      { name: "Federal Medical Centre (FMC) Ebute Metta", type: "Federal Medical Centre", city: "Ebute Metta", state: "Lagos" },
      { name: "General Hospital Lagos Island (Broad Street)", type: "General Hospital", city: "Lagos Island", state: "Lagos", address: "1-3 Broad Street, Lagos Island" },
      { name: "General Hospital Gbagada", type: "General Hospital", city: "Gbagada", state: "Lagos", address: "Hospital Road, Gbagada" },
      { name: "General Hospital Ikorodu", type: "General Hospital", city: "Ikorodu", state: "Lagos" },
      { name: "General Hospital Alimosho (Igando)", type: "General Hospital", city: "Igando, Alimosho", state: "Lagos" }
    ]
  },
  "Nasarawa": {
    name: "Nasarawa",
    capital: "Lafia",
    emergencyHotlines: ["112", "0803 890 1234"],
    facilities: [
      { name: "Dalhatu Araf Specialist Hospital (DASH)", type: "Specialist Hospital", city: "Lafia", state: "Nasarawa" },
      { name: "Federal Medical Centre (FMC) Keffi", type: "Federal Medical Centre", city: "Keffi", state: "Nasarawa" },
      { name: "General Hospital Mararaba", type: "General Hospital", city: "Karu / Mararaba", state: "Nasarawa" }
    ]
  },
  "Niger": {
    name: "Niger",
    capital: "Minna",
    emergencyHotlines: ["112", "0803 901 2345"],
    facilities: [
      { name: "Federal Medical Centre (FMC) Bida", type: "Federal Medical Centre", city: "Bida", state: "Niger" },
      { name: "General Hospital Minna", type: "General Hospital", city: "Minna", state: "Niger" },
      { name: "General Hospital Suleja", type: "General Hospital", city: "Suleja", state: "Niger" }
    ]
  },
  "Ogun": {
    name: "Ogun",
    capital: "Abeokuta",
    emergencyHotlines: ["112", "0803 012 3456"],
    facilities: [
      { name: "Federal Medical Centre (FMC) Abeokuta", type: "Federal Medical Centre", city: "Abeokuta", state: "Ogun", address: "Bisi Onabanjo Way, Idi-Aba, Abeokuta" },
      { name: "Olabisi Onabanjo University Teaching Hospital (OOUTH)", type: "Teaching Hospital", city: "Sagamu", state: "Ogun" },
      { name: "State Hospital Ijebu-Ode", type: "General Hospital", city: "Ijebu-Ode", state: "Ogun" },
      { name: "State Hospital Ota", type: "General Hospital", city: "Ota", state: "Ogun" }
    ]
  },
  "Ondo": {
    name: "Ondo",
    capital: "Akure",
    emergencyHotlines: ["112", "0803 123 4568"],
    facilities: [
      { name: "University of Medical Sciences Teaching Hospital (UNIMEDTH)", type: "Teaching Hospital", city: "Ondo Town / Akure", state: "Ondo" },
      { name: "Federal Medical Centre (FMC) Owo", type: "Federal Medical Centre", city: "Owo", state: "Ondo" },
      { name: "State Specialist Hospital Akure", type: "Specialist Hospital", city: "Akure", state: "Ondo" }
    ]
  },
  "Osun": {
    name: "Osun",
    capital: "Osogbo",
    emergencyHotlines: ["112", "0803 234 5679"],
    facilities: [
      { name: "Obafemi Awolowo University Teaching Hospitals Complex (OAUTHC)", type: "Teaching Hospital", city: "Ile-Ife", state: "Osun" },
      { name: "Osun State University Teaching Hospital (UNIOSUNTH)", type: "Teaching Hospital", city: "Osogbo", state: "Osun" },
      { name: "State Hospital Asubiaro", type: "General Hospital", city: "Osogbo", state: "Osun" }
    ]
  },
  "Oyo": {
    name: "Oyo",
    capital: "Ibadan",
    emergencyHotlines: ["112", "615", "0803 345 6780"],
    facilities: [
      { name: "University College Hospital (UCH)", type: "Teaching Hospital", city: "Ibadan", state: "Oyo", address: "Queen Elizabeth Road, Oritamefa, Ibadan" },
      { name: "Adeoyo Maternity Teaching Hospital", type: "Teaching Hospital", city: "Yemetu, Ibadan", state: "Oyo" },
      { name: "State Hospital Ring Road", type: "General Hospital", city: "Ibadan", state: "Oyo" },
      { name: "General Hospital Ogbomoso", type: "General Hospital", city: "Ogbomoso", state: "Oyo" }
    ]
  },
  "Plateau": {
    name: "Plateau",
    capital: "Jos",
    emergencyHotlines: ["112", "0803 456 7892"],
    facilities: [
      { name: "Jos University Teaching Hospital (JUTH)", type: "Teaching Hospital", city: "Jos", state: "Plateau", address: "Lamingo, Jos" },
      { name: "Plateau State Specialist Hospital", type: "Specialist Hospital", city: "Jos", state: "Plateau" },
      { name: "General Hospital Pankshin", type: "General Hospital", city: "Pankshin", state: "Plateau" }
    ]
  },
  "Rivers": {
    name: "Rivers",
    capital: "Port Harcourt",
    emergencyHotlines: ["112", "0803 567 8903"],
    facilities: [
      { name: "University of Port Harcourt Teaching Hospital (UPTH)", type: "Teaching Hospital", city: "Port Harcourt", state: "Rivers", address: "East-West Road, Alakahia, Port Harcourt" },
      { name: "Rivers State University Teaching Hospital (RSUTH / Braithwaite BMH)", type: "Teaching Hospital", city: "Port Harcourt", state: "Rivers", address: "Harley Street, Old GRA, Port Harcourt" },
      { name: "General Hospital Ahoada", type: "General Hospital", city: "Ahoada", state: "Rivers" }
    ]
  },
  "Sokoto": {
    name: "Sokoto",
    capital: "Sokoto",
    emergencyHotlines: ["112", "0803 678 9014"],
    facilities: [
      { name: "Usmanu Danfodiyo University Teaching Hospital (UDUTH)", type: "Teaching Hospital", city: "Sokoto", state: "Sokoto" },
      { name: "Specialist Hospital Sokoto", type: "Specialist Hospital", city: "Sokoto", state: "Sokoto" },
      { name: "Noma Children Hospital", type: "Specialist Hospital", city: "Sokoto", state: "Sokoto" }
    ]
  },
  "Taraba": {
    name: "Taraba",
    capital: "Jalingo",
    emergencyHotlines: ["112", "0803 789 0125"],
    facilities: [
      { name: "Federal Medical Centre (FMC) Jalingo", type: "Federal Medical Centre", city: "Jalingo", state: "Taraba" },
      { name: "Taraba State Specialist Hospital", type: "Specialist Hospital", city: "Jalingo", state: "Taraba" },
      { name: "General Hospital Wukari", type: "General Hospital", city: "Wukari", state: "Taraba" }
    ]
  },
  "Yobe": {
    name: "Yobe",
    capital: "Damaturu",
    emergencyHotlines: ["112", "0803 890 1236"],
    facilities: [
      { name: "Yobe State University Teaching Hospital (YSUTH)", type: "Teaching Hospital", city: "Damaturu", state: "Yobe" },
      { name: "Federal Medical Centre (FMC) Nguru", type: "Federal Medical Centre", city: "Nguru", state: "Yobe" },
      { name: "General Hospital Potiskum", type: "General Hospital", city: "Potiskum", state: "Yobe" }
    ]
  },
  "Zamfara": {
    name: "Zamfara",
    capital: "Gusau",
    emergencyHotlines: ["112", "0803 901 2347"],
    facilities: [
      { name: "Federal Medical Centre (FMC) Gusau", type: "Federal Medical Centre", city: "Gusau", state: "Zamfara" },
      { name: "Ahmad Sani Yariman Bakura Specialist Hospital", type: "Specialist Hospital", city: "Gusau", state: "Zamfara" }
    ]
  }
};

// src/data/fallbackTriage.ts
function getSectionHeaders(language) {
  switch (language) {
    case "english":
      return {
        causes: "Potential Causes",
        home: "Home Management",
        action: "Action Plan",
        disclaimer: "\u26A0\uFE0F Medical Disclaimer: NaijaHealth AI is an informational triage support tool and does not provide formal medical diagnoses or prescriptions. In emergencies, visit the nearest hospital or call 112 immediately."
      };
    case "hausa":
      return {
        causes: "Abubuwan Da Ka Iya Kawo Shi",
        home: "Maganin Gida",
        action: "Mataki Na Gaba",
        disclaimer: "\u26A0\uFE0F Tunatarwa: Ni mataimakin AI ne (NaijaHealth AI), ba likita na gaskiya ba. Idan jiki yayi tsanani, tafi asibiti kusa da kai ko kira 112."
      };
    case "yoruba":
      return {
        causes: "Kini O Le Fa E",
        home: "Ohun Ti O Le Se Ni Ile",
        action: "Igbese To Kan",
        disclaimer: "\u26A0\uFE0F \xCCk\xECl\u1ECD\u0300: \xC8mi j\u1EB9\u0301 ol\xF9r\xE0nl\u1ECD\u0301w\u1ECD\u0301 AI, mi k\xEC\xED \u1E63e d\u1ECD\u0301k\xEDt\xE0 gidi. T\xED ara b\xE1 le koko, \u1EB9 l\u1ECD s\xED il\xE9-\xECw\xF2s\xE0n t\xE0b\xED k\xED \u1EB9 pe 112 l\u1EB9\u0301s\u1EB9\u0300k\u1EB9s\u1EB9\u0300."
      };
    case "igbo":
      return {
        causes: "Ihe Nwere Ike Na-ebute Ya",
        home: "Ihe I Nwere Ike Ime n'Ulo",
        action: "Ihe I Ga-eme Na-eson\u1EE5",
        disclaimer: "\u26A0\uFE0F R\u1ECBba ama: Ab\u1EE5 m onye inyeaka AI, ab\u1EE5gh\u1ECB m ezigbo d\u1ECDk\u1ECBta. \u1ECC b\u1EE5r\u1EE5 na ah\u1EE5 ad\u1ECBgh\u1ECB g\u1ECB mma nke ukwuu, gaa \u1EE5l\u1ECD \u1ECDgw\u1EE5 ma \u1ECD b\u1EE5 kp\u1ECD\u1ECD 112 ugbu a."
      };
    case "pidgin":
    default:
      return {
        causes: "Wetin Fit Dey Happen",
        home: "Wetin You Fit Do For House",
        action: "Next Step",
        disclaimer: "\u26A0\uFE0F Abeg remember: I be NaijaHealth AI assistant o, I no be real medical doctor. If body no do you well or the matter tight, go meet doctor for hospital or call 112 sharp-sharp."
      };
  }
}
function buildFormattedResponse(language, data) {
  const headers = getSectionHeaders(language);
  const disclaimer = data.disclaimer || headers.disclaimer;
  if (data.isRedFlag) {
    return `\u{1F6A8} ${data.emergencyWarning || headers.causes}

**[${headers.causes}]**
${data.causes}

**[${headers.home}]**
${data.home}

**[${headers.action}]**
${data.action}

${disclaimer}`;
  }
  return `\u{1F49A} ${data.empathyNote || ""}

**[${headers.causes}]**
${data.causes}

**[${headers.home}]**
${data.home}

**[${headers.action}]**
${data.action}

${disclaimer}`;
}
function detectLocalRedFlags(text) {
  const lower = text.toLowerCase();
  const isExplicitMildChestTight = /(tight small|mild chest tightness|matsewa kadan|ìfúnpa díẹ̀|siri ike ntakịrị|siri ike ntakiri)/i.test(lower) && !/(severe|sharp|heavy|crushing|sudden|breath.*seize|cannot breathe|kasa numfashi|àìlè mí|enweghị ike iku ume|mgbu obi dị egwu)/i.test(lower);
  const redFlagPatterns = [
    {
      pattern: /(sharp|crushing|severe|heavy|sudden).*(chest|heart|kirji|aya|obi)/i,
      name: "Heavy Chest Pain / Heart Emergency"
    },
    {
      pattern: /(chest pain|pain in my chest|chest dey pain|ciwon kirji mai tsanani|aya didun lile|àyà mi bẹ̀rẹ̀ sí ro mí líle|mgbu obi dị egwu|mgbu obi di egwu)/i,
      name: "Acute Chest Pain"
    },
    {
      pattern: /(cannot breathe|severe difficulty breathing|shortness of breath|gasping for air|struggling to breathe|blue lips|breath seize|breath dey seize|suffocat|kasa numfashi|kasa hema|àìlè mí|mi ò sì lè mí|kò lè mí|anaghị m enwe ike iku ume|enweghi ike iku ume)/i,
      name: "Severe Breathing Difficulty"
    },
    {
      pattern: /(face droop|half body|one side.*(weak|paralyz)|slurred speech|sudden numbness|hand and leg no fit move|shanyewar jiki|apa kan ro|akụkụ ahụ ịda ogbu|strok)/i,
      name: "Sudden Stroke Signs / Paralysis"
    },
    {
      pattern: /(heavy bleeding|uncontrolled bleeding|bleeding continuously|spurting blood|coughing.*blood|vomiting.*blood|heavy blood|blood dey rush|zubar jini mai yawa|eje pupo|ẹ̀jẹ̀ púpọ̀|ọbara ịgba nke ukwuu|obara igba)/i,
      name: "Heavy Uncontrolled Bleeding"
    },
    {
      pattern: /(convuls|seizure|passed out|unconscious|fainted and not waking|coma|person faint|eye turn collapse|farfadiya|suma|daku|dídákú|ịda mba|tụbọọ|tuboo)/i,
      name: "Loss of Consciousness / Seizure"
    },
    {
      pattern: /(stiff neck.*fever|cannot bend neck|high fever.*hallucinat|neck strong.*hot body|tashin hankali|wuya ya kankame|ọrùn líle)/i,
      name: "Meningitis / Severe Brain Danger"
    },
    {
      pattern: /(pregnan|expectant|get belle|carry belle|mai ciki|juna biyu|oyún|oyun|aboyún|loyún|dị ime|di ime|afọ ime).*(bleed|spotting|blood|zubar jini|jini|ẹ̀jẹ̀|eje|ọbara|obara)|(bleed|spotting|heavy blood|zubar jini|ẹ̀jẹ̀|ọbara).*(pregnan|belle|ciki|juna biyu|oyún|oyun|ime)/i,
      name: "Bleeding During Pregnancy (Obstetric Emergency)"
    },
    {
      pattern: /(pregnan|expectant|get belle|carry belle|mai ciki|juna biyu|oyún|oyun|aboyún|loyún|dị ime|di ime|afọ ime).*(blur|blurred vision|eye blur|swollen face|face swell|hand swell|severe headache|pounding headache|pre-?eclampsia|eclamps|ciwon kai mai tsanani|orí fífọ́ líle|isi ọwụwa dị egwu)/i,
      name: "Pregnancy Pre-Eclampsia Warning Signs"
    },
    {
      pattern: /(water break|water broke|leaking fluid|amniotic|baby stopped moving|baby no dey kick|baby not moving|no fetal movement|jariri bai motsi|ọmọ kò ṣe|nwa anaghị emegharị)/i,
      name: "Obstetric Labor / Fetal Movement Alert"
    }
  ];
  for (const item of redFlagPatterns) {
    if (item.pattern.test(lower)) {
      if (isExplicitMildChestTight && item.name.includes("Chest Pain")) {
        continue;
      }
      return { isRedFlag: true, matchedSymptom: item.name };
    }
  }
  return { isRedFlag: false };
}
function detectStateFromText(text) {
  const lower = text.toLowerCase();
  for (const stateName of Object.keys(NIGERIAN_STATES_DATA)) {
    if (lower.includes(stateName.toLowerCase())) {
      return stateName;
    }
    const stateInfo = NIGERIAN_STATES_DATA[stateName];
    if (stateInfo.capital && lower.includes(stateInfo.capital.toLowerCase())) {
      return stateName;
    }
    for (const fac of stateInfo.facilities) {
      if (lower.includes(fac.city.toLowerCase())) {
        return stateName;
      }
    }
  }
  if (lower.includes("abuja") || lower.includes("fct") || lower.includes("gwagwalada")) return "FCT - Abuja";
  if (lower.includes("lagos") || lower.includes("ikeja") || lower.includes("yaba") || lower.includes("lekki") || lower.includes("surulere") || lower.includes("ikorodu") || lower.includes("eko")) return "Lagos";
  if (lower.includes("port harcourt") || lower.includes("pitakwa")) return "Rivers";
  if (lower.includes("ibadan") || lower.includes("ogbomoso")) return "Oyo";
  if (lower.includes("onitsha") || lower.includes("awka") || lower.includes("nnewi")) return "Anambra";
  if (lower.includes("enugu") || lower.includes("nsukka")) return "Enugu";
  if (lower.includes("owerri") || lower.includes("orlu") || lower.includes("okigwe")) return "Imo";
  if (lower.includes("benin") || lower.includes("irrua")) return "Edo";
  if (lower.includes("zaria") || lower.includes("kaduna")) return "Kaduna";
  if (lower.includes("warri") || lower.includes("asaba")) return "Delta";
  if (lower.includes("aba") || lower.includes("umuahia")) return "Abia";
  if (lower.includes("jos")) return "Plateau";
  if (lower.includes("kano")) return "Kano";
  if (lower.includes("abeokuta") || lower.includes("ijebu")) return "Ogun";
  if (lower.includes("ilorin")) return "Kwara";
  if (lower.includes("calabar")) return "Cross River";
  if (lower.includes("uyo") || lower.includes("eket")) return "Akwa Ibom";
  if (lower.includes("maiduguri")) return "Borno";
  if (lower.includes("sokoto")) return "Sokoto";
  if (lower.includes("bauchi")) return "Bauchi";
  if (lower.includes("makurdi")) return "Benue";
  if (lower.includes("abakaliki")) return "Ebonyi";
  if (lower.includes("akure") || lower.includes("ondo")) return "Ondo";
  if (lower.includes("osogbo") || lower.includes("ife")) return "Osun";
  return void 0;
}
function detectCategory(text) {
  const lower = text.toLowerCase();
  if (/(pikin|child|baby|toddler|infant|year-old|yaro|jariri|shekara|ọmọ|omo|ọlọ́dún|ọmọdé|nwa|nwatakịrị|afọ atọ)/i.test(lower) && /(hot|fever|vomit|refuse to eat|zazzabi|amai|gbóná|gbona|èébì|eebi|ọkụ|oku|gbọọla|igbo agbo)/i.test(lower)) {
    return "child_fever";
  }
  if (/(pregnan|expectant|antenatal|trimester|maternal|morning sickness|get belle|carry belle|belle woman|mai ciki|juna biyu|oyún|oyun|aboyún|loyún|dị ime|di ime|afọ ime)/i.test(
    lower
  )) {
    return "pregnancy";
  }
  if (/(purg|stool|watery|diarrh|belly|belle|stomach|cramp|cholera|zawo|murda ciki|ciwon ciki|igbe|ìgbẹ́|gbuuru|inú|inu rirun|afọ ọsịsa|afo osisa|afọ mgbu|afo mgbu|nsị mmiri|nsi mmiri|afọ na-egbu)/i.test(lower)) {
    return "purging";
  }
  if (/(fever|hot body|body dey hot|hot like fire|chills|shaking|bitter|malaria|typhoid|headache|head dey hammer|zazzabi|zafi|ciwon kai|rawar jiki|daci|iba|ibà|gbóná|gbona|orififo|orí fífọ́|korò|ọkụ|oku|ahụ ọkụ|ahu oku|isi ọwụwa|isi na-awa|ilu|jijiji)/i.test(lower)) {
    return "fever";
  }
  if (/(cough|catarrh|phlegm|throat|chest tight|chest dey tight|tari|matsewar kirji|mura|ikọ́|iko|fífún|àpótí àyà|ụkwara|ukwara|obi siri ike|akpịrị)/i.test(lower)) {
    return "cough";
  }
  if (/(joint|bone|waist|sickle|crisis|arthritis|gabbai|kashi|kugu|oríkèé|orikee|egungun|ìbàdí|ibadi|nkwonkwo|ọkpụkpụ|okpukpu|úkwù)/i.test(lower)) {
    return "joint_pain";
  }
  return "general";
}
function buildFallbackTriage(message, stateName = "Lagos", language = "pidgin") {
  const redFlag = detectLocalRedFlags(message);
  const stateData = NIGERIAN_STATES_DATA[stateName] || NIGERIAN_STATES_DATA["Lagos"];
  const topFacilities = stateData.facilities.map((f) => `${f.name} (${f.city})`).slice(0, 3);
  const headers = getSectionHeaders(language);
  const hotlines = stateData.emergencyHotlines.join(", ");
  const primaryHospital = topFacilities[0] || `Nearest General Hospital in ${stateName}`;
  if (redFlag.isRedFlag) {
    const isObstetricRedFlag = /pregnancy|obstetric|fetal/i.test(redFlag.matchedSymptom || "");
    const emergencyCopy = {
      pidgin: isObstetricRedFlag ? {
        warning: `\u{1F6A8} PREGNANCY DANGER SIGN: Dis sign inside belle (${redFlag.matchedSymptom}) na emergency wey Maternity Doctor must check sharp-sharp!`,
        empathy: `Pele mummy! Make you no fear, but abeg rush go Maternity / Labour Ward right now to protect both you and your baby.`,
        causes: `Bleeding inside belle, heavy headache with eye blur/swollen face (Pre-eclampsia high BP), early water break, or baby wey stop to kick fit put both mother and baby life inside danger if doctor no attend fast.`,
        home: `NO TAKE ANY DRUG OR AGBO FOR HOUSE! Cancel all herbal mix, painkiller, or chemist medicine now. Lie slightly on your left side while somebody carry you go hospital sharp-sharp.`,
        action: `\u{1F6A8} RUSH GO MATERNITY / EMERGENCY WARD NOW! Proceed straight to ${primaryHospital} or the nearest General Hospital / Maternity Centre inside ${stateName} State immediately!

Hospitals wey dey close:
${topFacilities.map((f) => `\u2022 ${f}`).join("\n")}

Call 112 (National Toll-Free) or ${hotlines} sharp-sharp!`
      } : {
        warning: `\u{1F6A8} DANGER DEY: Wetin you talk (${redFlag.matchedSymptom || "this acute symptom"}) na dangerous red-flag emergency sign!`,
        empathy: `Ayaah! Sorry o, stay calm and rush go hospital now now!`,
        causes: `This kind symptom fit mean say heart, breath, or serious blood condition dey happen wey doctor must check with emergency machine immediately.`,
        home: `NO DO ANY HOUSE TREATMENT! All home remedies cancel. Loosen tight cloth, sit or lie down carefully, and let somebody carry you run go hospital now.`,
        action: `\u{1F6A8} EMERGENCY O! Drop everything, no waste one second for house! Rush sharp-sharp go ${primaryHospital} or nearest General Hospital inside ${stateName} State now now!

Hospitals wey dey close:
${topFacilities.map((f) => `\u2022 ${f}`).join("\n")}

Call 112 (National Toll-Free) or ${hotlines} sharp-sharp!`
      },
      english: isObstetricRedFlag ? {
        warning: `\u{1F6A8} MATERNITY EMERGENCY ALERT: ${redFlag.matchedSymptom || "Obstetric warning sign"} requires immediate Maternity / Emergency Hospital evaluation!`,
        empathy: `Please remain calm and arrange immediate transport to the Maternity or Emergency Unit right now to protect both mother and baby.`,
        causes: `Danger signs in pregnancy\u2014such as vaginal bleeding, severe headache with blurred vision or facial swelling (Pre-eclampsia/high blood pressure in pregnancy), premature water breaking, or reduced/absent baby movement\u2014require urgent specialist obstetric care.`,
        home: `ALL HOME REMEDIES CANCELLED! Do not take unprescribed painkillers, aspirin/ibuprofen, or herbal mixtures ("agbo"). Rest gently on your left side during transport to the hospital.`,
        action: `\u{1F6A8} Bypass home waiting and proceed IMMEDIATELY to the Maternity / Emergency Unit at ${primaryHospital} or the nearest General Hospital in ${stateName} State.

Nearby emergency facilities:
${topFacilities.map((f) => `\u2022 ${f}`).join("\n")}

Call 112 (National Emergency) or ${hotlines} immediately!`
      } : {
        warning: `\u{1F6A8} RED-FLAG EMERGENCY: Your symptoms (${redFlag.matchedSymptom || "acute warning sign"}) require immediate emergency hospital care!`,
        empathy: `Please remain calm and arrange emergency transport to the hospital right now.`,
        causes: `These symptoms can indicate an acute cardiac, respiratory, neurological, or life-threatening emergency that requires urgent medical resuscitation and equipment.`,
        home: `ALL HOME REMEDIES CANCELLED! Do not take herbal mixtures or self-medicate. Loosen tight clothing and have someone take you to the emergency room immediately.`,
        action: `\u{1F6A8} Bypass all home care and proceed IMMEDIATELY to ${primaryHospital} or the nearest Emergency Department in ${stateName} State.

Nearby emergency facilities:
${topFacilities.map((f) => `\u2022 ${f}`).join("\n")}

Call 112 (National Emergency) or ${hotlines} immediately!`
      },
      hausa: isObstetricRedFlag ? {
        warning: `\u{1F6A8} GAGGAWAR HAIHUWA DA CIKI: Alamun da kika ambata a lokacin ciki suna bukatar ganin likitan mata na gaggawa nan take!`,
        empathy: `Sannu uwa! Kwantar da hankalinki kuma a garzaya da ke zuwa sashin haihuwa na asibiti yanzu-yanzu don kare lafiyar ki da ta jariri.`,
        causes: `Zubar jini yayin ciki, ciwon kai mai tsanani da disashewar gani ko kumburin fuska (Pre-eclampsia / hawan jini na ciki), fashewar ruwan mahaifa da wuri, ko daina motsin jariri na bukatar agajin gaggawa a asibiti.`,
        home: `KADA A SHA WANI MAGANIN GIDA KO NA GARGAJIYA! An hana duk wani jiko ko maganin rage zafi ba tare da izinin likita ba. Kwanta a gefen hagu a hankali yayin da ake kaiki asibiti nan take.`,
        action: `\u{1F6A8} Yi maza-maza ki tafi sashin haihuwa na ${primaryHospital} ko Asibitin Gwamnati mafi kusa a jihar ${stateName} yanzu-yanzu!

Asibitoci mafi kusa:
${topFacilities.map((f) => `\u2022 ${f}`).join("\n")}

Kira 112 (kyauta) ko ${hotlines} ba tare da bata lokaci ba!`
      } : {
        warning: `\u{1F6A8} GAGGAWA CE MAI HATSARI: Alamun da ka fada suna nuna matsanancin yanayin gaggawa da ke bukatar likita nan take!`,
        empathy: `Sannu! Kwantar da hankalinka kuma a garzaya da kai asibiti yanzu-yanzu!`,
        causes: `Wadannan alamun suna iya nuna matsalar zuciya, numfashi, jini, ko kwakwalwa da ke bukatar na'urorin gaggawa na asibiti nan take.`,
        home: `KADA A YI WANI MAGANIN GIDA! An soke duk shan magani ko jiko a gida. Sake tufafi masu matsewa kuma wani ya kai ka dakin gaggawa na asibiti yanzu.`,
        action: `\u{1F6A8} Yi maza-maza ka tafi ${primaryHospital} ko Asibitin Gwamnati mafi kusa a jihar ${stateName} yanzu-yanzu!

Asibitoci mafi kusa:
${topFacilities.map((f) => `\u2022 ${f}`).join("\n")}

Kira 112 (layin gaggawa na kasa kyauta) ko ${hotlines} ba tare da bata lokaci ba!`
      },
      yoruba: isObstetricRedFlag ? {
        warning: `\u{1F6A8} P\xC0J\xC1W\xCCR\xCC OY\xDAN & \xCCB\xCDM\u1ECC: \xC0w\u1ECDn \xE0m\xEC ewu n\xEDn\xFA oy\xFAn y\xEC\xED n\xEDl\xF2 \xECt\u1ECD\u0301j\xFA p\xE0j\xE1w\xECr\xEC n\xED \u1EB9\u0300ka \xECb\xEDm\u1ECD il\xE9-\xECw\xF2s\xE0n l\u1EB9\u0301s\u1EB9\u0300k\u1EB9s\u1EB9\u0300!`,
        empathy: `P\u1EB9\u0300l\u1EB9\u0301 \xECy\xE1! \u1EB8 f\u1ECDk\xE0n bal\u1EB9\u0300 k\xED \u1EB9 s\xEC s\xE1r\xE9 l\u1ECD s\xED il\xE9-\xECw\xF2s\xE0n aboy\xFAn b\xE1y\xEC\xED l\xE1ti d\xE1\xE0b\xF2 bo \xECy\xE1 \xE0ti \u1ECDm\u1ECD.`,
        causes: `\u1EB8\u0300j\u1EB9\u0300 y\xEDy\u1ECD n\xEDn\xFA oy\xFAn, or\xED f\xEDf\u1ECD\u0301 l\xEDle p\u1EB9\u0300l\xFA oj\xFA r\xEDr\xED b\xE0\xECb\xE0\xEC t\xE0b\xED w\xEDw\xFA oj\xFA (Pre-eclampsia / \u1EB9\u0300j\u1EB9\u0300 r\xEDru n\xEDn\xFA oy\xFAn), omi oy\xFAn t\xF3 d\xE0 \u1E63\xE1\xE1j\xFA \xE0s\xECk\xF2, t\xE0b\xED \xE0\xECr\xECn \u1ECDm\u1ECD n\xEDn\xFA oy\xFAn j\u1EB9\u0301 \xE0m\xEC p\xE0j\xE1w\xECr\xEC t\xF3 n\xEDl\xF2 d\u1ECD\u0301k\xEDt\xE0 aboy\xFAn k\xED\xE1k\xED\xE1.`,
        home: `\u1EB8 M\xC1 \u1E62E O\xD2G\xD9N IL\xC9 T\xC0B\xCD \xC0GBO KANKAN! A ti fagi l\xE9 gbogbo \xE0gbo t\xE0b\xED o\xF2g\xF9n il\xE9. \u1EB8 d\xF9b\xFAl\u1EB9\u0300 s\xED \u1EB9\u0300gb\u1EB9\u0301 \xF2s\xEC n\xED p\u1EB9\u0300l\u1EB9\u0301 k\xED \u1EB9nik\u1EB9\u0301ni gb\xE9 y\xEDn l\u1ECD s\xED il\xE9-\xECw\xF2s\xE0n l\u1EB9\u0301s\u1EB9\u0300k\u1EB9s\u1EB9\u0300.`,
        action: `\u{1F6A8} \u1EB8 s\xE1r\xE9 l\u1ECD s\xED \u1EB9\u0300ka \xECb\xEDm\u1ECD n\xED ${primaryHospital} t\xE0b\xED Il\xE9-\xECw\xF2s\xE0n \xCCj\u1ECDba t\xF3 s\xFAnm\u1ECD\u0301 y\xEDn n\xED \xCCp\xEDnl\u1EB9\u0300 ${stateName} b\xE1y\xEC\xED!

\xC0w\u1ECDn il\xE9-\xECw\xF2s\xE0n t\xF3 w\xE0 n\xEDt\xF2s\xED:
${topFacilities.map((f) => `\u2022 ${f}`).join("\n")}

\u1EB8 pe 112 (l\u1ECD\u0301f\u1EB9\u0300\u1EB9\u0301) t\xE0b\xED ${hotlines} l\u1EB9\u0301s\u1EB9\u0300k\u1EB9s\u1EB9\u0300!`
      } : {
        warning: `\u{1F6A8} P\xC0J\xC1W\xCCR\xCC EWU: \xC0w\u1ECDn \xE0m\xEC \xE0\xECs\xE0n t\xED \u1EB9 s\u1ECD y\xEC\xED j\u1EB9\u0301 p\xE0j\xE1w\xECr\xEC gidi t\xF3 n\xEDl\xF2 \xECt\u1ECD\u0301j\xFA il\xE9-\xECw\xF2s\xE0n l\u1EB9\u0301s\u1EB9\u0300k\u1EB9s\u1EB9\u0300!`,
        empathy: `\u1EB8 f\u1ECDk\xE0n bal\u1EB9\u0300 k\xED \u1EB9 s\xEC s\xE1r\xE9 l\u1ECD s\xED il\xE9-\xECw\xF2s\xE0n b\xE1y\xEC\xED!`,
        causes: `\xC0w\u1ECDn \xE0m\xEC w\u1ECD\u0300ny\xED l\xE8 t\xFAm\u1ECD\u0300 s\xED \xEC\u1E63\xF2ro l\xEDle n\xED \u1ECDk\xE0n, \xE8\xE9m\xED, t\xE0b\xED \u1EB9\u0300j\u1EB9\u0300 t\xED d\u1ECD\u0301k\xEDt\xE0 gb\u1ECD\u0301d\u1ECD\u0300 fi \u1EB9\u0300r\u1ECD p\xE0j\xE1w\xECr\xEC y\u1EB9\u0300 w\xF2 l\u1EB9\u0301s\u1EB9\u0300k\u1EB9s\u1EB9\u0300.`,
        home: `\u1EB8 M\xC1 \u1E62E O\xD2G\xD9N IL\xC9 KANKAN! A ti fagi l\xE9 gbogbo \xE0gbo t\xE0b\xED o\xF2g\xF9n il\xE9. \u1EB8 t\xFA a\u1E63\u1ECD t\xF3 f\xFAn y\xEDn k\xED \u1EB9nik\u1EB9\u0301ni s\xEC gb\xE9 y\xEDn s\xE1r\xE9 l\u1ECD s\xED il\xE9-\xECw\xF2s\xE0n b\xE1y\xEC\xED.`,
        action: `\u{1F6A8} \u1EB8 s\xE1r\xE9 l\u1ECD s\xED ${primaryHospital} t\xE0b\xED Il\xE9-\xECw\xF2s\xE0n \xCCj\u1ECDba t\xF3 s\xFAnm\u1ECD\u0301 y\xEDn n\xED \xCCp\xEDnl\u1EB9\u0300 ${stateName} l\u1EB9\u0301s\u1EB9\u0300k\u1EB9s\u1EB9\u0300!

\xC0w\u1ECDn il\xE9-\xECw\xF2s\xE0n t\xF3 w\xE0 n\xEDt\xF2s\xED:
${topFacilities.map((f) => `\u2022 ${f}`).join("\n")}

\u1EB8 pe 112 (l\u1ECD\u0301f\u1EB9\u0300\u1EB9\u0301) t\xE0b\xED ${hotlines} b\xE1y\xEC\xED!`
      },
      igbo: isObstetricRedFlag ? {
        warning: `\u{1F6A8} MBEREDE AF\u1ECC IME D\u1ECA EGWU: Mgba\xE0m\xE0 nd\u1ECB a n'oge af\u1ECD ime ch\u1ECDr\u1ECD nlek\u1ECDta ngalaba \u1ECDm\u1EE5m\u1EE5 \u1EE5l\u1ECD \u1ECDgw\u1EE5 ozugbo!`,
        empathy: `Ndo nu nne! Nwee obi ike ma gbaa \u1ECDs\u1ECD gaa ngalaba \u1ECDm\u1EE5m\u1EE5 (Maternity) ugbu a iji chebe nne na nwa.`,
        causes: `\u1ECCbara \u1ECBp\u1EE5 n'oge ime, isi \u1ECDw\u1EE5wa siri ike na anya ghara \u1ECBh\u1EE5 \u1EE5z\u1ECD nke \u1ECDma ma \u1ECD b\u1EE5 ihu f\u1EE5r\u1EE5 af\u1EE5 (Pre-eclampsia / \u1ECDbara mgbali elu n'af\u1ECD ime), mmiri ime \u1ECBgbawa n'oge na-erugh\u1ECB erugh\u1ECB, ma \u1ECD b\u1EE5 nwa \u1ECBkw\u1EE5s\u1ECB imeghar\u1ECB ah\u1EE5 ch\u1ECDr\u1ECD d\u1ECDk\u1ECBta \u1ECDm\u1EE5m\u1EE5 ozugbo.`,
        home: `A\u1E44\u1EE4LA \u1ECCGW\u1EE4 \u1EE4L\u1ECC MA \u1ECC B\u1EE4 AGBO \u1ECC B\u1EE4LA! A kagbuola \u1ECDgw\u1EE5 \u1ECDd\u1ECBnala na \u1ECDgw\u1EE5 mgbu niile. Dina n'ak\u1EE5k\u1EE5 aka ekpe g\u1ECB ka mmad\u1EE5 buru g\u1ECB gaa \u1EE5l\u1ECD \u1ECDgw\u1EE5 ugbu a.`,
        action: `\u{1F6A8} Gbaa \u1ECDs\u1ECD gaa ngalaba \u1ECDm\u1EE5m\u1EE5 nke ${primaryHospital} ma \u1ECD b\u1EE5 General Hospital kacha nso na Steeti ${stateName} ozugbo!

\u1EE4l\u1ECD \u1ECDgw\u1EE5 nd\u1ECB d\u1ECB g\u1ECB nso:
${topFacilities.map((f) => `\u2022 ${f}`).join("\n")}

Kp\u1ECD\u1ECD 112 (n'efu) ma \u1ECD b\u1EE5 ${hotlines} ugbu a!`
      } : {
        warning: `\u{1F6A8} MBEREDE D\u1ECA EGWU: Mgba\xE0m\xE0 nd\u1ECB a \u1ECB k\u1ECDwara b\u1EE5 ihe \u1ECBr\u1ECBba ama mberede d\u1ECB egwu ch\u1ECDr\u1ECD nlek\u1ECDta \u1EE5l\u1ECD \u1ECDgw\u1EE5 ozugbo!`,
        empathy: `Ndo nu! Nwee obi ike ma gbaa \u1ECDs\u1ECD gaa \u1EE5l\u1ECD \u1ECDgw\u1EE5 ugbu a!`,
        causes: `Mgba\xE0m\xE0 nd\u1ECB a nwere ike igosi nsogbu siri ike nke obi, iku ume, \u1ECDbara, ma \u1ECD b\u1EE5 \u1EE5b\u1EE5r\u1EE5 nke ch\u1ECDr\u1ECD ngwa\u1ECDr\u1EE5 mberede \u1EE5l\u1ECD \u1ECDgw\u1EE5 ozugbo.`,
        home: `EMELA \u1ECCGW\u1EE4 \u1EE4L\u1ECC \u1ECC B\u1EE4LA! A kagbuola \u1ECDgw\u1EE5 \u1EE5l\u1ECD niile. T\u1ECDghe uwe siri ike ma mee ka mmad\u1EE5 buru g\u1ECB gbaa \u1ECDs\u1ECD gaa ngalaba mberede \u1EE5l\u1ECD \u1ECDgw\u1EE5 ugbu a.`,
        action: `\u{1F6A8} Gbaa \u1ECDs\u1ECD gaa ${primaryHospital} ma \u1ECD b\u1EE5 General Hospital kacha nso na Steeti ${stateName} ozugbo!

\u1EE4l\u1ECD \u1ECDgw\u1EE5 nd\u1ECB d\u1ECB g\u1ECB nso:
${topFacilities.map((f) => `\u2022 ${f}`).join("\n")}

Kp\u1ECD\u1ECD 112 (n'efu) ma \u1ECD b\u1EE5 ${hotlines} ugbu a!`
      }
    };
    const c2 = emergencyCopy[language];
    return {
      language,
      urgencyLevel: "emergency",
      isRedFlag: true,
      emergencyWarning: c2.warning,
      empathyNote: c2.empathy,
      wetinFitDeyHappen: c2.causes,
      wetinYouFitDoForHouse: c2.home,
      nextStep: c2.action,
      potentialCauses: c2.causes,
      homeManagement: c2.home,
      actionPlan: c2.action,
      recommendedFacilities: topFacilities,
      detectedLocation: stateName,
      clarifyingQuestions: [],
      disclaimer: headers.disclaimer,
      fullFormattedResponse: buildFormattedResponse(language, {
        isRedFlag: true,
        emergencyWarning: c2.warning,
        empathyNote: c2.empathy,
        causes: c2.causes,
        home: c2.home,
        action: c2.action,
        disclaimer: headers.disclaimer
      })
    };
  }
  const category = detectCategory(message);
  const CONTENT = {
    child_fever: {
      pidgin: {
        urgencyLevel: "urgent",
        empathy: "Ayaah, pele for your small pikin o! Children fever and vomiting need sharp care so dem no dry out.",
        causes: "When small pikin body dey hot well-well and e dey vomit, common causes inside Nigeria na severe Malaria, ear/throat infection, or stomach infection.",
        home: "1. Use clean towel dipped in ordinary lukewarm water (NO use ice block, cold water, or methylated spirit!) wipe pikin forehead, armpit, and neck.\n2. Dress pikin in light cotton cloth \u2014 no wrap pikin inside thick blanket.\n3. Give small sips of ORS (Salt-Sugar Solution) or breastmilk every 5 minutes with spoon make pikin no weak.",
        action: `Because pikin refuse to eat or drink and dey vomit, carry am go ${primaryHospital} or nearest General Hospital / Paediatric Clinic today! If pikin weak well-well, eye sink, or convulse, run go emergency immediately.`,
        questions: [
          "How many hours since the pikin last piss (wet diaper)?",
          "The pikin dey weak well-well or find am hard to wake up?"
        ]
      },
      english: {
        urgencyLevel: "urgent",
        empathy: "I am very sorry your little child is unwell. High fever with vomiting in young children requires prompt attention to prevent dehydration.",
        causes: "High fever, vomiting, and poor feeding in a child under 5 in Nigeria are most commonly caused by acute Malaria, viral/bacterial throat or ear infections, or acute gastroenteritis.",
        home: "1. Cool gently with lukewarm tepid sponging (never use cold water, ice, or methylated spirit).\n2. Dress the child in a single light cotton layer; avoid heavy blankets.\n3. Offer frequent small sips (one teaspoon every few minutes) of ORS or breast milk to avoid dehydration.",
        action: `Since the child is vomiting and refusing fluids, take them promptly to ${primaryHospital} or the nearest General Hospital / Children's Emergency today for a rapid malaria test and hydration check. Seek emergency help immediately if drowsiness, sunken eyes, or convulsions occur.`,
        questions: [
          "How long ago did your child last pass urine?",
          "Does your child seem unusually drowsy or difficult to wake?"
        ]
      },
      hausa: {
        urgencyLevel: "urgent",
        empathy: "Sannu! Allah Ya baiwa yaro lafiya. Zazzabi da amai ga kananan yara yana bukatar kulawa cikin gaggawa don kar ruwa ya kare a jikinsu.",
        causes: "Zazzabi mai zafi tare da amai da kin cin abinci a kananan yara a Najeriya yawanci yana zuwa ne daga cutar zazzabin cizon sauro (Malaria), ciwon makogwaro/kunne, ko matsalar ciki.",
        home: "1. Yi amfani da kyallen da aka jika a ruwa mai dumi kadan (kada a yi amfani da ruwan kankara ko spirit!) don goge goshin yaron da hamata.\n2. Sanya wa yaron riga marar nauyi \u2014 kada a lullube shi da bargo mai kauri.\n3. Bashi ruwan ORS (ruwan gishiri da sukari) ko nono cokali-cokali akai-akai don kar jiki ya bushe.",
        action: `Tunda yaron yana amai kuma ya ki cin abinci ko shan ruwa, a dauke shi a kai ${primaryHospital} ko Asibitin Yara mafi kusa yau don gwajin Malaria da duba lafiya. Idan idanu sun zurma ko yaron ya kasa motsi ko ya yi farfadiya, a garzaya dakin gaggawa nan take.`,
        questions: [
          "Yaushe rabon da yaron ya yi fitsari?",
          "Shin yaron yana yawan bacci mai nauyi ko kasa tashi?"
        ]
      },
      yoruba: {
        urgencyLevel: "urgent",
        empathy: "P\u1EB9\u0300l\u1EB9\u0301 o! Ol\xFAwa \xE1 wo \u1ECDm\u1ECD n\xE1\xE0 s\xE0n. Ib\xE0 gb\xEDgb\xF3n\xE1 \xE0ti \xE8\xE9b\xEC l\xE1ra \u1ECDm\u1ECDd\xE9 n\xEDl\xF2 \xECt\u1ECD\u0301j\xFA k\xED\xE1k\xED\xE1 k\xED omi ara r\u1EB9\u0300 m\xE1 ba\xE0 gb\u1EB9.",
        causes: "Ara gb\xEDgb\xF3n\xE1 t\xF3 le p\u1EB9\u0300l\xFA \xE8\xE9b\xEC \xE0ti \xE0\xECf\u1EB9\u0301 j\u1EB9un l\xE1ra \u1ECDm\u1ECD k\xE9ker\xE9 s\xE1b\xE0 m\xE1a \u0144 w\xE1 l\xE1ti ara Ib\xE0 (Malaria), \xE0k\xF3r\xE0n \u1ECD\u0300fun t\xE0b\xED et\xED, t\xE0b\xED \xE0\xECs\xE0n in\xFA.",
        home: "1. Fi a\u1E63\u1ECD t\xFAt\xF9 d\xED\u1EB9\u0300 (omi l\xE1s\xE1n t\xED k\xF2 tut\xF9 ju, k\xEC\xED \u1E63e y\xECny\xEDn t\xE0b\xED spirit) nu iw\xE1j\xFA or\xED \xE0ti ab\u1EB9\u0301 ap\xE1 \u1ECDm\u1ECD.\n2. W\u1ECD a\u1E63\u1ECD f\u1EB9\u0301l\u1EB9\u0301f\u1EB9\u0301l\u1EB9\u0301 f\xFAn \u1ECDm\u1ECD \u2014 \u1EB9 m\xE1 bo \u1ECDm\u1ECD n\xED a\u1E63\u1ECD t\xF3 n\xEDp\u1ECDn.\n3. Fi \u1E63\xEDb\xED f\xFAn un n\xED omi ORS (omi iy\u1ECD\u0300 \xE0ti \u1E63\xFAg\xE0) d\xED\u1EB9\u0300d\xED\u1EB9\u0300 t\xE0b\xED \u1ECDm\xFA n\xED \xEC\u1E63\u1EB9\u0301j\xFA d\xED\u1EB9\u0300d\xED\u1EB9\u0300.",
        action: `N\xEDtor\xED p\xE9 \u1ECDm\u1ECD \u0144 b\xEC k\xF2 s\xEC f\u1EB9\u0301 mu omi, \u1EB9 gb\xE9 e l\u1ECD s\xED ${primaryHospital} t\xE0b\xED Il\xE9-\xECw\xF2s\xE0n \xCCj\u1ECDba l\xF3n\xEC\xED f\xFAn \xE0y\u1EB9\u0300w\xF2 Malaria \xE0ti \xECt\u1ECD\u0301j\xFA. T\xED oj\xFA r\u1EB9\u0300 b\xE1 w\u1ECDl\u1EB9\u0300, t\xF3 r\u1EB9\u0300 p\xFAp\u1ECD\u0300, t\xE0b\xED t\xF3 \u0144 g\xEDri, \u1EB9 s\xE1r\xE9 l\u1ECD s\xED \u1EB9\u0300ka p\xE0j\xE1w\xECr\xEC l\u1EB9\u0301s\u1EB9\u0300k\u1EB9s\u1EB9\u0300.`,
        questions: [
          "\xCCgb\xE0 wo ni \u1ECDm\u1ECD n\xE1\xE0 t\u1ECD\u0300 k\u1EB9\u0301y\xECn?",
          "\u1E62\xE9 \u1ECDm\u1ECD n\xE1\xE0 \u0144 s\xF9n j\xF9 t\xE0b\xED k\xF2 t\xE8t\xE8 j\xED?"
        ]
      },
      igbo: {
        urgencyLevel: "urgent",
        empathy: "Ndo nu! Chineke ga-agw\u1ECD nwatak\u1ECBr\u1ECB ah\u1EE5. Ah\u1EE5 \u1ECDk\u1EE5 na \u1ECBgb\u1ECD agb\u1ECD n'ime \u1EE5m\u1EE5aka ch\u1ECDr\u1ECD nlek\u1ECDta ngwa ngwa ka mmiri ghara \u1ECBgw\u1EE5 ha n'ah\u1EE5.",
        causes: "Ah\u1EE5 \u1ECDk\u1EE5 d\u1ECB elu, \u1ECBgb\u1ECD agb\u1ECD, na \u1ECDj\u1EE5j\u1EE5 nri n'ime nwatak\u1ECBr\u1ECB na Na\u1ECBjir\u1ECBa na-ab\u1EE5kar\u1ECB site na \u1ECAba (Malaria), \u1ECDr\u1ECBa akp\u1ECBr\u1ECB ma \u1ECD b\u1EE5 nt\u1ECB, ma \u1ECD b\u1EE5 nsogbu af\u1ECD.",
        home: "1. Jiri \xE1kw\xE0 d\u1ECB \u1ECDcha e tinyere na mmiri na-ad\u1ECBgh\u1ECB oyi (ejila mmiri oyi ma \u1ECD b\u1EE5 methylated spirit!) hichaa egedege ihu na ab\u1EE5ba nwa.\n2. Yikwas\u1ECB nwa ah\u1EE5 uwe d\u1ECB mfe \u2014 ekpuchila ya blanket d\u1ECB ar\u1ECD.\n3. Na-enye ya obere mmiri ORS (mmiri nnu na shuga) ma \u1ECD b\u1EE5 ara nne n'obere ngaji kwa nkeji ole na ole.",
        action: `Ebe nwa ah\u1EE5 na-agb\u1ECD agb\u1ECD ma j\u1EE5 \u1ECB\u1E45\u1EE5 mmiri, kp\u1ECDga ya ${primaryHospital} ma \u1ECD b\u1EE5 General Hospital kacha nso taa maka nyocha Malaria. \u1ECC b\u1EE5r\u1EE5 na anya nwa ah\u1EE5 dara n'ime ma \u1ECD b\u1EE5 na-ama jijiji, gbaa \u1ECDs\u1ECD gaa ngalaba mberede ozugbo.`,
        questions: [
          "Mgbe ole ka nwa ah\u1EE5 ny\u1EE5r\u1EE5 mam\u1ECBr\u1ECB ikpeaz\u1EE5?",
          "Nwa ah\u1EE5 \u1ECD na-rah\u1EE5 \u1EE5ra nke ukwuu ma \u1ECD b\u1EE5 na-esiri ike \u1ECBkp\u1ECDte?"
        ]
      }
    },
    pregnancy: {
      pidgin: {
        urgencyLevel: "urgent",
        empathy: "Congratulations & pele o, Mama! When woman get belle (pregnant), every symptom need gentle, extra careful attention to protect both you and pikin.",
        causes: "Morning vomiting, weakness, tiredness, or mild fever inside pregnancy fit happen because body hormones dey change, anemia (low blood), urinary infection, or malaria inside pregnancy.",
        home: "1. STRICTLY NO SELF-MEDICATION: No swallow Ibuprofen, Diclofenac, Aspirin, random chemist drugs, or local agbo/herbs without your antenatal doctor permission!\n2. Eat small dry food early morning (crackers, toast) and sip clean water or ORS little by little so you no dry out.\n3. If hot body dey, wipe gently with lukewarm water towel only (no spirit or ice) and rest under treated mosquito net.",
        action: `Book or walk into your Antenatal Clinic (ANC) or Maternity Ward at ${primaryHospital} promptly so nurse/doctor fit check your BP, blood level, and urine/malaria safely. \u{1F6A8} RUSH TO EMERGENCY SHARP-SHARP if you see ANY blood, eye blur, heavy headache, face swelling, water breaking, or pikin no dey kick well.`,
        questions: [
          "How many months or weeks your pregnancy be right now?",
          "Any blood spot, blurred eye, face swelling, or pikin stop kicking?"
        ]
      },
      english: {
        urgencyLevel: "urgent",
        empathy: "Warm congratulations, and sorry you are feeling uncomfortable. Pregnancy requires extra-careful screening to protect both mother and baby.",
        causes: "Weakness, morning nausea/vomiting, or fever during pregnancy can stem from hormonal morning sickness, low blood levels (anaemia), urinary tract infection, or malaria in pregnancy.",
        home: '1. DO NOT SELF-MEDICATE: Avoid unprescribed painkillers (especially Ibuprofen, Diclofenac, Aspirin), chemist antibiotics, or herbal concoctions ("agbo") unless approved by your antenatal doctor.\n2. Eat small dry meals frequently and sip clean water or ORS slowly to prevent dehydration.\n3. For mild fever, use lukewarm tepid sponging only and always sleep under an insecticide-treated mosquito net.',
        action: `Visit your registered Antenatal Clinic (ANC) or Maternal Unit at ${primaryHospital} promptly for blood pressure, blood count, and safe malaria/urine checks. \u{1F6A8} Seek emergency maternity care IMMEDIATELY if you notice ANY vaginal bleeding, severe headache, blurred vision, sudden face/hand swelling, leaking fluid, or reduced baby movement.`,
        questions: [
          "How many weeks or months pregnant are you currently?",
          "Are you having any bleeding, severe headache, blurred vision, face swelling, or reduced baby kicks?"
        ]
      },
      hausa: {
        urgencyLevel: "urgent",
        empathy: "Sannu da kokari, Mama! A lokacin da mace take da juna biyu, duk wani rashin lafiya yana bukatar kulawa ta musamman don kare lafiyar uwa da ta jariri.",
        causes: "Amai na safe, kasala, ko zazzabi a lokacin ciki yakan faru ne saboda canjin jiki na ciki, karancin jini, sanyin mara (UTI), ko zazzabin cizon sauro (Malaria).",
        home: "1. KADA A SHA MAGANI BA TARE DA LIKITA BA: Guji magungunan radadi kamar Ibuprofen/Diclofenac, antibiotics na kasuwa, ko maganin gargajiya/jiko ba tare da izinin likitan asibiti ba.\n2. Ci abinci kadan-kadan kuma a rika kurbar ruwa mai tsabta ko ORS a hankali don kar ruwa ya kare.\n3. Idan akwai zazzabi kadan, a goge jiki da ruwa mai dumi kadan sannan a kwana cikin gidan sauro.",
        action: `A gaggauta zuwa asibitin haihuwa / Antenatal Clinic (ANC) a ${primaryHospital} don auna jini (BP), gwajin jini, da Malaria cikin aminci. \u{1F6A8} A GARZAYA ASIBITI NAN TAKE idan aka ga jini, ciwon kai mai tsanani, disashewar gani, kumburin fuska, fashewar ruwan ciki, ko jariri ya daina motsi.`,
        questions: [
          "Cikin ya kai wata nawa ko mako nawa yanzu?",
          "Shin akwai zubar jini, matsanancin ciwon kai, disashewar gani, kumburin fuska, ko jariri ya daina motsi?"
        ]
      },
      yoruba: {
        urgencyLevel: "urgent",
        empathy: "P\u1EB9\u0300l\u1EB9\u0301 o, \xCCy\xE1 \xCCbej\xEC/Al\xE1boy\xFAn! N\xEDgb\xE0 t\xED ob\xECnrin b\xE1 l\xF3y\xFAn, gbogbo \xE0\xECs\xE0n n\xEDl\xF2 \xE0b\xF3j\xFAt\xF3 \u1E63\u1ECD\u0301ra p\xFAp\u1ECD\u0300 l\xE1ti d\xE1\xE0b\xF2 bo \xECy\xE1 \xE0ti \u1ECDm\u1ECD.",
        causes: "\xC8\xE9b\xEC \xE0\xE1r\u1ECD\u0300, \xE0\xE1r\u1EB9\u0300, t\xE0b\xED ib\xE0 n\xEDgb\xE0 oy\xFAn l\xE8 w\xE1 l\xE1ti ara \xECy\xEDpad\xE0 oy\xFAn, \xE0\xECt\xF3 \u1EB9\u0300j\u1EB9\u0300, \xE0k\xF3r\xE0n il\xE9-\xECt\u1ECD\u0300, t\xE0b\xED Ib\xE0 (Malaria) n\xEDn\xFA oy\xFAn.",
        home: "1. \u1EB8 M\xC1 LO O\xD2G\xD9N F\xDANRA Y\xCDN: Y\u1EB9ra f\xFAn \xE0w\u1ECDn o\xF2g\xF9n \xECrora b\xEDi Ibuprofen/Diclofenac, Aspirin, t\xE0b\xED \xE0gbo \xECb\xEDl\u1EB9\u0300 l\xE1\xEC gba \xE0\u1E63\u1EB9 l\u1ECD\u0301d\u1ECD\u0300 d\u1ECD\u0301k\xEDt\xE0 oy\xFAn (ANC)!\n2. J\u1EB9 o\xFAnj\u1EB9 d\xED\u1EB9\u0300d\xED\u1EB9\u0300 l\xE9ral\xE9ra k\xED o s\xEC mu omi m\xEDm\u1ECD\u0301 t\xE0b\xED ORS d\xED\u1EB9\u0300d\xED\u1EB9\u0300.\n3. T\xED ara b\xE1 gb\xF3n\xE1 d\xED\u1EB9\u0300, nu ara p\u1EB9\u0300l\xFA a\u1E63\u1ECD omi d\xEDd\xF9n l\xE1s\xE1n k\xED o s\xEC s\xF9n l\xE1b\u1EB9\u0301 \xE0w\u1ECD\u0300n \u1EB9\u0300f\u1ECDn.",
        action: `\u1EB8 l\u1ECD s\xED il\xE9-\xECw\xF2s\xE0n \xECt\u1ECD\u0301j\xFA al\xE1boy\xFAn (ANC) n\xED ${primaryHospital} k\xED\xE1k\xED\xE1 f\xFAn \xE0y\u1EB9\u0300w\xF2 \xECf\xFAnp\xE1 \u1EB9\u0300j\u1EB9\u0300 (BP), \u1EB9\u0300j\u1EB9\u0300, \xE0ti Ib\xE0 t\xF3 l\xE1\xE0b\xF2. \u{1F6A8} \u1EB8 S\xC1R\xC9 L\u1ECC S\xCD Y\xC0R\xC1 P\xC0J\xC1W\xCCR\xCC L\u1EB8\u0301S\u1EB8\u0300K\u1EB8S\u1EB8\u0300 t\xED \u1EB9 b\xE1 r\xED \u1EB9\u0300j\u1EB9\u0300, or\xED f\xEDf\u1ECD\u0301 l\xEDle, oj\xFA r\xEDran b\xE0\xECb\xE0\xEC, w\xEDw\xFA oj\xFA/\u1ECDw\u1ECD\u0301, omi oy\xFAn t\xF3 d\xE0 j\xE1de, t\xE0b\xED t\xED \u1ECDm\u1ECD k\xF2 b\xE1 y\xEDpo m\u1ECD\u0301.`,
        questions: [
          "\u1ECC\u0300s\u1EB9\u0300 t\xE0b\xED o\u1E63\xF9 m\xE9l\xF2\xF3 ni oy\xFAn n\xE1\xE0 w\xE0 b\xE1y\xEC\xED?",
          "\u1E62\xE9 \u1EB9 r\xED \u1EB9\u0300j\u1EB9\u0300, or\xED f\xEDf\u1ECD\u0301 l\xEDle, oj\xFA b\xE0\xECb\xE0\xEC, w\xEDw\xFA oj\xFA, t\xE0b\xED \u1ECDm\u1ECD k\xF2 m\xED n\xEDn\xFA m\u1ECD\u0301?"
        ]
      },
      igbo: {
        urgencyLevel: "urgent",
        empathy: "Ndo nu, Mama! Mgbe nwaany\u1ECB d\u1ECB ime, mgba\xE0m\xE0 ah\u1EE5ike \u1ECD b\u1EE5la ch\u1ECDr\u1ECD nlek\u1ECDta p\u1EE5r\u1EE5 iche iji chebe nne na nwa n\u1ECD n'af\u1ECD.",
        causes: "\u1ECAgb\u1ECD agb\u1ECD \u1EE5t\u1EE5t\u1EE5, ike \u1ECDgw\u1EE5gw\u1EE5, ma \u1ECD b\u1EE5 ah\u1EE5 \u1ECDk\u1EE5 n'ime ime nwere ike isite na mgbanwe nke ime, \u1EE5k\u1ECD \u1ECDbara, \u1ECDr\u1ECBa mam\u1ECBr\u1ECB (UTI), ma \u1ECD b\u1EE5 \u1ECAba (Malaria).",
        home: `1. A\u1E44\u1EE4LA \u1ECCGW\u1EE4 N'ONWE G\u1ECA: Zere \u1ECDgw\u1EE5 mgbu d\u1ECBka Ibuprofen/Diclofenac, Aspirin, antibiotics n'echegh\u1ECB d\u1ECDk\u1ECBta, ma \u1ECD b\u1EE5 mgb\u1ECDr\u1ECDgw\u1EE5 ("agbo") ma \u1ECD b\u1EE5r\u1EE5 na d\u1ECDk\u1ECBta ANC ekwegh\u1ECB!
2. Rie obere nri kp\u1ECDr\u1ECD nk\u1EE5 mgbe niile ma na-a\u1E45\u1EE5 mmiri d\u1ECB \u1ECDcha ma \u1ECD b\u1EE5 ORS nway\u1ECD\u1ECD nway\u1ECD\u1ECD.
3. Maka ah\u1EE5 \u1ECDk\u1EE5 d\u1ECB nro, jiri \xE1kw\xE0 mmiri na-ad\u1ECBgh\u1ECB oyi hichaa ah\u1EE5 ma rah\u1EE5 n'okpuru net\u1ECB anw\u1EE5nta.`,
        action: `Gaa \u1EE5l\u1ECD \u1ECDgw\u1EE5 nlek\u1ECDta nd\u1ECB d\u1ECB ime (Antenatal Clinic) na ${primaryHospital} ozugbo maka nlele BP, \u1ECDbara, na Malaria d\u1ECB nchebe. \u{1F6A8} GBAA \u1ECCS\u1ECC GAA NGALABA MBEREDE UGBU A ma \u1ECD b\u1EE5r\u1EE5 na \u1ECB h\u1EE5 \u1ECDbara, isi \u1ECDw\u1EE5wa d\u1ECB egwu, anya \u1ECBh\u1EE5gh\u1ECB nke \u1ECDma, ihu/aka f\u1EE5r\u1EE5 af\u1EE5, mmiri \u1ECBgbawa, ma \u1ECD b\u1EE5 nwa akw\u1EE5s\u1ECB imeghar\u1ECB.`,
        questions: [
          "\u1ECCnwa ma \u1ECD b\u1EE5 izu ole ka ime ah\u1EE5 d\u1ECB ugbu a?",
          "\u1ECA na-ah\u1EE5 \u1ECDbara, isi \u1ECDw\u1EE5wa d\u1ECB egwu, anya \u1ECBh\u1EE5gh\u1ECB \u1EE5z\u1ECD, ihu f\u1EE5r\u1EE5 af\u1EE5, ma \u1ECD b\u1EE5 nwa ad\u1ECBgh\u1ECB emeghar\u1ECB?"
        ]
      }
    },
    purging: {
      pidgin: {
        urgencyLevel: "urgent",
        empathy: "Ayaah, sorry o! When belle dey bite and person dey purge watery stool, e dey sap strength sharp-sharp.",
        causes: "Belle bite and watery purging fit happen when germ enter food or drinking water (gastroenteritis / food poisoning). Inside rainy season, e fit be warning for cholera too.",
        home: "1. Mix Salt-Sugar Solution (Home ORS): Inside 1 litre clean boiled water (two 50cl pure-water sachets), put 1 level small spoon salt + 10 level small spoons sugar (or 5 cubes). Turn am well.\n2. Drink 1 full cup after every time you go purge.\n3. Eat light food like pap (akamu), ripe banana, or soft white rice. Stop roadside food or sugary minerals for now.",
        action: `If purging pass 5 to 6 times inside 1 day, or you see blood inside stool, or eye dey turn you when you stand up, waka go ${primaryHospital} or nearest clinic immediately.`,
        questions: [
          "Any blood dey inside the watery stool?",
          "You fit hold water or ORS for stomach without vomiting am out?"
        ]
      },
      english: {
        urgencyLevel: "urgent",
        empathy: "So sorry you are dealing with stomach cramps and watery stool. Replacing lost fluids quickly is the top priority.",
        causes: "Frequent watery stool (purging) with stomach cramps is usually acute gastroenteritis from contaminated food or water. During heavy rains, it can also require cholera precautions.",
        home: "1. Prepare Oral Rehydration Solution (Salt-Sugar Solution): Mix 1 level teaspoon of salt + 10 level teaspoons of sugar (or 5 sugar cubes) in 1 litre of clean boiled or treated water.\n2. Drink one full cup after every loose stool.\n3. Eat bland foods like pap (akamu), rice, or bananas, and avoid dairy, spicy foods, and sugary sodas.",
        action: `Visit ${primaryHospital} or your nearest clinic promptly if purging exceeds 5 times in 24 hours, if blood appears in the stool, if you have a high fever, or if you feel dizzy when standing.`,
        questions: [
          "Have you noticed any blood or mucus in your stool?",
          "Are you able to keep fluids down without vomiting?"
        ]
      },
      hausa: {
        urgencyLevel: "urgent",
        empathy: "Sannu da jiki! Allah Ya sauwake. Murda ciki da zawo mai ruwa suna sa karfin jiki ya kare da sauri, don haka shan ruwa yana da muhimmanci sosai.",
        causes: "Zawo mai ruwa tare da murda ciki yakan faru ne idan kwayoyin cuta sun shiga ciki ta hanyar abinci marar tsabta ko gurbataccen ruwa. A lokacin damina, yana da kyau a kiyaye cutar kwalara.",
        home: "1. Hada ruwan gishiri da sukari (ORS): A cikin lita daya (1L) ta ruwa mai tsabta (ledar pure water biyu), zuba karamin cokali daya (1) na gishiri da cokula goma (10) na sukari (ko sukari guda 5), a motsa sosai.\n2. Sha kofi daya cike duk lokacin da aka yi zawo.\n3. Ci abinci mai laushi kamar koko (akamu), shinkafa, ko ayaba; ka guji abincin titi da lemun kwalba.",
        action: `Idan zawon ya wuce sau 5 zuwa 6 a rana daya, ko akwai jini a bayan gida, ko kana jin jiri idan ka tashi tsaye, tafi ${primaryHospital} ko cibiyar lafiya mafi kusa nan take.`,
        questions: [
          "Shin akwai jini a cikin zawon?",
          "Kana iya rike ruwan ORS a ciki ba tare da yin amai ba?"
        ]
      },
      yoruba: {
        urgencyLevel: "urgent",
        empathy: "P\u1EB9\u0300l\u1EB9\u0301 o! In\xFA r\xEDrun \xE0ti \xECgb\u1EB9\u0301 gbuuru m\xE1a \u0144 fa agb\xE1ra ara l\u1ECD k\xED\xE1k\xED\xE1, n\xEDtor\xED n\xE1\xE0 r\xEDr\u1ECD\u0301p\xF2 omi ara \u1E63e p\xE0t\xE0k\xEC gan-an.",
        causes: "\xCCgb\u1EB9\u0301 gbuuru ol\xF3mi \xE0ti in\xFA r\xEDrun s\xE1b\xE0 m\xE1a \u0144 j\u1EB9\u0301 \xE0k\xF3r\xE0n in\xFA l\xE1ti ara o\xFAnj\u1EB9 t\xE0b\xED omi t\xED k\xF2 m\u1ECD\u0301. N\xED \xE0s\xECk\xF2 \xF2j\xF2, \xF3 t\xFAn l\xE8 j\u1EB9\u0301 \xECk\xECl\u1ECD\u0300 \xE0r\xF9n k\u1ECD\u0301l\u1EB9\u0301r\xE0 (on\xEDgb\xE1m\xE9j\xEC).",
        home: "1. P\xE8s\xE8 omi iy\u1ECD\u0300 \xE0ti \u1E63\xFAg\xE0 (ORS): N\xEDn\xFA l\xED\xEDt\xE0 omi m\xEDm\u1ECD\u0301 kan (\u1ECD\u0300r\xE1 pure water m\xE9j\xEC), fi \u1E63\xEDb\xED iy\u1ECD\u0300 k\xE9ker\xE9 kan (1) \xE0ti \u1E63\xEDb\xED \u1E63\xFAg\xE0 m\u1EB9\u0301w\xE0\xE1 (10) (t\xE0b\xED on\xEDgun 5) s\xEDn\xFA r\u1EB9\u0300, k\xED o s\xEC r\xF2 \xF3 p\u1ECD\u0300 d\xE1ad\xE1a.\n2. Mu ife kan l\u1EB9\u0301h\xECn \xECgb\u1EB9\u0301 gbuuru k\u1ECD\u0300\u1ECD\u0300kan.\n3. J\u1EB9 o\xFAnj\u1EB9 f\u1EB9\u0301l\u1EB9\u0301f\u1EB9\u0301l\u1EB9\u0301 b\xEDi \xF2g\xEC (akamu), \xECr\u1EB9s\xEC m\xEDm\u1ECD\u0301, t\xE0b\xED \u1ECD\u0300g\u1EB9\u0300d\u1EB9\u0300; y\u1EB9ra f\xFAn o\xFAnj\u1EB9 \xECta \xE0ti ohun m\xEDmu ol\xF3\xF2\xF3r\xF9n.",
        action: `T\xED \xECgb\u1EB9\u0301 gbuuru n\xE1\xE0 b\xE1 ju \xECgb\xE0 m\xE1r\xF9n-\xFAn l\u1ECD l\xF3j\xFAm\u1ECD\u0301 kan, t\xE0b\xED t\xED \u1EB9\u0300j\u1EB9\u0300 b\xE1 w\xE0 n\xEDn\xFA \xECgb\u1EB9\u0301, t\xE0b\xED o\xF2y\xEC b\xE1 \u0144 k\u1ECD\u0301 \u1ECD n\xEDgb\xE0 t\xED o b\xE1 d\xECde, \u1EB9 l\u1ECD s\xED ${primaryHospital} t\xE0b\xED il\xE9-\xECw\xF2s\xE0n t\xF3 s\xFAnm\u1ECD\u0301 y\xEDn l\u1EB9\u0301s\u1EB9\u0300k\u1EB9s\u1EB9\u0300.`,
        questions: [
          "\u1E62\xE9 \u1EB9 r\xED \u1EB9\u0300j\u1EB9\u0300 n\xEDn\xFA \xECgb\u1EB9\u0301 ol\xF3mi n\xE1\xE0?",
          "\u1E62\xE9 \u1EB9 l\xE8 mu omi t\xE0b\xED ORS l\xE1\xEC b\xEC \xED s\xEDta?"
        ]
      },
      igbo: {
        urgencyLevel: "urgent",
        empathy: "Ndo nu! Af\u1ECD mgbu na af\u1ECD \u1ECDs\u1ECBsa mmiri mmiri na-ad\u1ECDp\u1EE5 ike n'ah\u1EE5 \u1ECDs\u1ECBs\u1ECD, ya mere \u1ECB\u1E45\u1EE5 mmiri d\u1ECB \u1ECDcha ugbu a d\u1ECB oke mkpa.",
        causes: "Af\u1ECD mgbu na ns\u1ECB mmiri mmiri (purging) na-esikar\u1ECB n'nje d\u1ECB na nri ma \u1ECD b\u1EE5 mmiri ruru unyi. N'oge udu mmiri, \u1ECD nwekwara ike \u1ECBb\u1EE5 \u1ECBd\u1ECD aka n\xE1 nt\u1ECB maka \u1ECDr\u1ECBa cholera.",
        home: "1. Kwadebe Mmiri Nnu na Shuga (Home ORS): N'ime otu lita mmiri d\u1ECB \u1ECDcha e siri esi (pure water ab\u1EE5\u1ECD), tinye 1 obere ngaji nnu + obere ngaji shuga 10 (ma \u1ECD b\u1EE5 cube shuga 5), gwak\u1ECDta ya nke \u1ECDma.\n2. \u1E44\u1EE5\u1ECD otu iko zuru ezu mgbe \u1ECD b\u1EE5la \u1ECB gara \u1EE5l\u1ECD mposi.\n3. Rie nri d\u1ECB nro d\u1ECBka akamu, unere chara acha, ma \u1ECD b\u1EE5 osikapa d\u1ECB \u1ECDcha; zere nri okporo \u1EE5z\u1ECD na ihe \u1ECD\u1E45\u1EE5\u1E45\u1EE5 nwere shuga.",
        action: `\u1ECC b\u1EE5r\u1EE5 na af\u1ECD \u1ECDs\u1ECBsa ah\u1EE5 agafe ugboro 5 ruo 6 n'otu \u1EE5b\u1ECDch\u1ECB, ma \u1ECD b\u1EE5 \u1ECB h\u1EE5 \u1ECDbara na ns\u1ECB g\u1ECB, ma \u1ECD b\u1EE5 anya na-agba g\u1ECB gburugburu ma i bilie, gaa ${primaryHospital} ma \u1ECD b\u1EE5 \u1EE5l\u1ECD \u1ECDgw\u1EE5 kacha nso ozugbo.`,
        questions: [
          "\u1ECCbara \u1ECD d\u1ECB n'ime ns\u1ECB mmiri mmiri ah\u1EE5?",
          "\u1ECA na-enwe ike \u1ECB\u1E45\u1EE5 mmiri ma \u1ECD b\u1EE5 ORS n'agb\u1ECDgh\u1ECB agb\u1ECD?"
        ]
      }
    },
    fever: {
      pidgin: {
        urgencyLevel: "urgent",
        empathy: "Pele o! This kind hot body, headache, and bitter mouth fit make person weak patapata.",
        causes: "Inside Nigeria, hot body with cold chills, head pain, and bitter taste for mouth na common sign of Malaria (from female Anopheles mosquito bite) or Typhoid fever. E fit still be viral flu.",
        home: "1. Use clean towel dipped in lukewarm water (no use cold water or spirit!) rub forehead, armpit, and neck make hotness drop.\n2. Drink plenty clean water or fresh juice.\n3. Rest well inside cool room under insecticide-treated mosquito net.\n4. Standard Paracetamol fit ease fever and body pain.",
        action: `Abeg go clinic or pharmacy lab run quick Malaria RDT test first before you swallow antimalarial drugs. If hot body pass 2 days, or you dey vomit everything, or piss turn dark brown like Coca-Cola, waka go ${primaryHospital} immediately.`,
        questions: [
          "How many days the hot body and headache don start?",
          "You dey vomit or notice yellow eyes / dark tea-coloured urine?"
        ]
      },
      english: {
        urgencyLevel: "urgent",
        empathy: "So sorry you are feeling feverish and weak. Testing properly before taking medication is the safest step.",
        causes: "High fever with chills, headache, body aches, and a bitter mouth in Nigeria is most often caused by Malaria (transmitted by mosquitoes), Typhoid fever, or a viral infection.",
        home: "1. Cool down safely with lukewarm tepid sponging (never cold water, ice, or methylated spirit).\n2. Stay hydrated with clean drinking water or fresh fluids.\n3. Rest under an insecticide-treated mosquito net.\n4. Paracetamol (following standard label dose) can help reduce fever and pain.",
        action: `Get a rapid diagnostic test (mRDT) for malaria at a nearby clinic or certified laboratory before taking antimalarials. Visit ${primaryHospital} promptly if fever lasts over 48 hours, if you cannot keep fluids down, or if your urine turns dark tea-coloured.`,
        questions: [
          "How many days have you had the fever and chills?",
          "Are you experiencing vomiting, yellowing of the eyes, or dark urine?"
        ]
      },
      hausa: {
        urgencyLevel: "urgent",
        empathy: "Sannu da jiki! Allah Ya ba ka lafiya. Zazzabi tare da ciwon kai da dacin baki suna sa gajiya sosai.",
        causes: "Zazzabi mai zafi da sanyi, ciwon kai, da dacin baki a Najeriya yawanci alamomin zazzabin cizon sauro (Malaria) ne ko zazzabin Typhoid, ko kuma mura.",
        home: "1. Yi amfani da tsaftataccen kyalle da aka jika a ruwa mara sanyi (ba ruwan kankara ko spirit ba!) don goge goshi, hamata, da wuya.\n2. Sha ruwa mai tsabta da yawa.\n3. Huta a wuri mai iska kuma ka kwana cikin gidan sauro mai magani.\n4. Za a iya shan Paracetamol bisa ka'ida don rage ciwon jiki da zazzabi.",
        action: `Je asibiti ko dakin gwaji mafi kusa don yin gwajin Malaria (mRDT) kafin shan maganin zazzabi. Idan zazzabin ya wuce kwanaki biyu, ko kana amai, ko fitsarin ka ya koma ja ko baki kamar shayi, tafi ${primaryHospital} nan take.`,
        questions: [
          "Kwana nawa kenan jiki ke zafi?",
          "Shin kana amai ko idanunka sun yi rawaya ko fitsari ya canza launi?"
        ]
      },
      yoruba: {
        urgencyLevel: "urgent",
        empathy: "P\u1EB9\u0300l\u1EB9\u0301 o! Ara gb\xEDgb\xF3n\xE1, or\xED f\xEDf\u1ECD\u0301, \xE0ti \u1EB9nu k\xEDk\xF2r\xF2 l\xE8 m\xFA k\xED ara r\u1EB9\u0300 p\xE1t\xE1p\xE1t\xE1.",
        causes: "N\xED N\xE0\xECj\xEDr\xED\xE0, ara gb\xEDgb\xF3n\xE1 p\u1EB9\u0300l\xFA \xF2t\xFAt\xF9, or\xED f\xEDf\u1ECD\u0301, ara r\xEDro, \xE0ti \u1EB9nu k\xEDk\xF2r\xF2 s\xE1b\xE0 m\xE1a \u0144 j\u1EB9\u0301 \xE0m\xEC Ib\xE0 (Malaria l\xE1ti ara \u1EB9\u0300f\u1ECDn) t\xE0b\xED Ib\xE0 T\xE0\xEDf\u1ECD\u0301\u1ECD\u0300d\xF9 (Typhoid).",
        home: "1. Fi a\u1E63\u1ECD m\xEDm\u1ECD\u0301 t\xED a r\u1EB9 s\xEDn\xFA omi l\xE1s\xE1n t\xED k\xF2 tut\xF9 ju (k\xEC\xED \u1E63e omi y\xECny\xEDn t\xE0b\xED spirit!) nu iw\xE1j\xFA or\xED, ab\u1EB9\u0301 ap\xE1, \xE0ti \u1ECDr\xF9n.\n2. Mu omi m\xEDm\u1ECD\u0301 p\xFAp\u1ECD\u0300 t\xE0b\xED omi \xF2rom\u0300b\xF3 tuntun.\n3. Sinmi d\xE1ad\xE1a n\xED y\xE0r\xE1 t\xF3 n\xED at\u1EB9\u0301g\xF9n k\xED o s\xEC s\xF9n l\xE1b\u1EB9\u0301 \xE0w\u1ECD\u0300n \u1EB9\u0300f\u1ECDn.\n4. O\xF2g\xF9n Paracetamol (n\xED \xECw\u1ECD\u0300n t\xF3 y\u1EB9) l\xE8 d\xEDn \xECrora ara \xE0ti ib\xE0 k\xF9.",
        action: `L\u1ECD \u1E63e \xE0y\u1EB9\u0300w\xF2 \u1EB9\u0300j\u1EB9\u0300 f\xFAn Ib\xE0 (mRDT) n\xED il\xE9-\xECw\xF2s\xE0n t\xE0b\xED l\xE1\xE0b\xF9 t\xF3 s\xFAnm\u1ECD\u0301 \u1ECD k\xED o t\xF3 lo o\xF2g\xF9n ib\xE0. T\xED ib\xE0 b\xE1 k\u1ECDj\xE1 \u1ECDj\u1ECD\u0301 m\xE9j\xEC, t\xED o b\xE1 \u0144 b\xEC, t\xE0b\xED t\u1ECD\u0300 r\u1EB9 b\xE1 p\u1ECD\u0301n b\xEDi tii, \u1EB9 l\u1ECD s\xED ${primaryHospital} l\u1EB9\u0301s\u1EB9\u0300k\u1EB9s\u1EB9\u0300.`,
        questions: [
          "\u1ECCj\u1ECD\u0301 m\xE9l\xF2\xF3 ni ib\xE0 \xE0ti or\xED f\xEDf\u1ECD\u0301 y\xEC\xED ti b\u1EB9\u0300r\u1EB9\u0300?",
          "\u1E62\xE9 o \u0144 b\xEC t\xE0b\xED oj\xFA r\u1EB9 \u0144 p\u1ECD\u0301n t\xE0b\xED \xECt\u1ECD\u0300 r\u1EB9 \u0144 \u1E63\xF3k\xF9nk\xF9n?"
        ]
      },
      igbo: {
        urgencyLevel: "urgent",
        empathy: "Ndo nu! Ah\u1EE5 \u1ECDk\u1EE5, isi \u1ECDw\u1EE5wa, na \u1ECDn\u1EE5 ilu na-eme ka ike gw\u1EE5 mmad\u1EE5 kpamkpam.",
        causes: "Na Na\u1ECBjir\u1ECBa, ah\u1EE5 \u1ECDk\u1EE5, oyi jijiji, ah\u1EE5 mgbu, na \u1ECDn\u1EE5 ilu na-ab\u1EE5kar\u1ECB ihe \u1ECBr\u1ECBba ama nke \u1ECAba (Malaria site n'\u1ECDta anw\u1EE5nta) ma \u1ECD b\u1EE5 Typhoid fever.",
        home: "1. Jiri \xE1kw\xE0 d\u1ECB \u1ECDcha e tinyere na mmiri na-ekpo \u1ECDk\u1EE5 ntak\u1ECBr\u1ECB (ejila mmiri oyi ma \u1ECD b\u1EE5 methylated spirit!) hichaa egedege ihu, ab\u1EE5ba, na olu.\n2. \u1E44\u1EE5\u1ECD mmiri d\u1ECB \u1ECDcha nke ukwuu.\n3. Zuo ike nke \u1ECDma ma rah\u1EE5 n'okpuru net\u1ECB anw\u1EE5nta.\n4. Paracetamol (d\u1ECBka nt\u1EE5ziaka si d\u1ECB) nwere ike inye aka belata ah\u1EE5 \u1ECDk\u1EE5 na mgbu.",
        action: `Gaa \u1EE5l\u1ECD \u1ECDgw\u1EE5 ma \u1ECD b\u1EE5 \u1EE5l\u1ECD nyocha mee nyocha Malaria (mRDT) tupu \u1ECB \u1E45\u1EE5\u1ECD \u1ECDgw\u1EE5 \u1ECBba. \u1ECC b\u1EE5r\u1EE5 na ah\u1EE5 \u1ECDk\u1EE5 ah\u1EE5 agafe \u1EE5b\u1ECDch\u1ECB ab\u1EE5\u1ECD, ma \u1ECD b\u1EE5 \u1ECB na-agb\u1ECD agb\u1ECD, ma \u1ECD b\u1EE5 mam\u1ECBr\u1ECB g\u1ECB gbanwee agba d\u1ECBka tii ojii, gaa ${primaryHospital} ozugbo.`,
        questions: [
          "\u1EE4b\u1ECDch\u1ECB ole ka ah\u1EE5 \u1ECDk\u1EE5 na isi \u1ECDw\u1EE5wa a malitere?",
          "\u1ECA na-agb\u1ECD agb\u1ECD ma \u1ECD b\u1EE5 h\u1EE5 anya odo ma \u1ECD b\u1EE5 mam\u1ECBr\u1ECB gbara \u1ECDch\u1ECBch\u1ECBr\u1ECB?"
        ]
      }
    },
    cough: {
      pidgin: {
        urgencyLevel: "urgent",
        empathy: "Pele o! Dry cough and slight chest tightness dey tire person chest well-well.",
        causes: "Dry cough with mild hot body and small chest tight fit come from common chest cold, flu, bronchitis, dust/harmattan irritation, or early respiratory infection.",
        home: "1. Drink plenty warm water or warm tea with honey (never give honey to baby under 1 year) to calm throat.\n2. Breathe steam from hot water bowl safely to clear chest.\n3. Stay away from smoke, dust, and strong generator fumes.\n4. Rest well and no buy antibiotics without doctor prescription.",
        action: `Watch your breathing carefully. If cough pass 1 week, or high fever join am, or breath begin seize, or you cough out blood, waka go ${primaryHospital} sharp-sharp.`,
        questions: [
          "How long the dry cough don stay, and phlegm or blood dey come out?",
          "You get difficulty catching your breath when you walk small?"
        ]
      },
      english: {
        urgencyLevel: "urgent",
        empathy: "So sorry you are having a nagging cough and mild chest tightness. Monitoring your breathing closely is important.",
        causes: "A dry cough with mild fever and slight chest tightness is commonly caused by a viral upper respiratory infection, bronchitis, seasonal dust irritation, or early pneumonia.",
        home: "1. Sip warm fluids (water, warm herbal tea, or lemon with honey for adults) to soothe throat irritation.\n2. Inhale gentle steam from warm water and keep your room well ventilated.\n3. Avoid dust, tobacco smoke, and generator exhaust fumes.\n4. Avoid taking unprescribed antibiotics.",
        action: `Seek care at ${primaryHospital} or a nearby clinic if the cough lasts beyond 7 days, if high fever develops, or if you feel short of breath. If you suddenly struggle to breathe or feel sharp chest pain, go to the emergency room immediately.`,
        questions: [
          "How long have you had this cough, and is it bringing up sputum or blood?",
          "Do you feel out of breath during normal movement?"
        ]
      },
      hausa: {
        urgencyLevel: "urgent",
        empathy: "Sannu da jiki! Busasshen tari da dan matsewar kirji suna da wahala, Allah Ya kawo sauki.",
        causes: "Busasshen tari tare da dan matsewar kirji da zazzabi kadan yakan faru ne saboda mura ta kirji, kura ko sanyin hunturu, ko cutar huhu ta farko.",
        home: "1. Sha ruwan dumi ko shayi mai zuma (kada a baiwa jariri kasa da shekara 1 zuma) don kwantar da makogwaro.\n2. Shaki tururin ruwan dumi a hankali don bude kirji.\n3. Nisanci hayaki, kura, da hayakin janareto.\n4. Huta sosai kuma kada a sha maganin antibiotics ba tare da likita ya rubuta ba.",
        action: `Kula da numfashin ka sosai. Idan tarin ya wuce mako daya, ko zazzabi ya karu, ko numfashi ya fara yankewa, tafi ${primaryHospital} ko asibiti mafi kusa nan take.`,
        questions: [
          "Kwana nawa kenan kana wannan tarin, kuma kana tofa kaki ko jini?",
          "Kana jin wahalar numfashi idan ka yi tafiya kadan?"
        ]
      },
      yoruba: {
        urgencyLevel: "urgent",
        empathy: "P\u1EB9\u0300l\u1EB9\u0301 o! Ik\u1ECD\u0301 gb\xEDgb\u1EB9 \xE0ti \xECf\xFAnpa \xE0y\xE0 m\xE1a \u0144 m\xFA k\xED ara m\xE1 bal\u1EB9\u0300.",
        causes: "Ik\u1ECD\u0301 gb\xEDgb\u1EB9 p\u1EB9\u0300l\xFA \xECf\xFAnpa d\xED\u1EB9\u0300 n\xED \xE0y\xE0 \xE0ti ib\xE0 d\xED\u1EB9\u0300 s\xE1b\xE0 m\xE1a \u0144 w\xE1 l\xE1ti ara \xF2t\xFAt\xF9 \xE0y\xE0, eruku t\xE0b\xED \xF2t\xFAt\xF9 \xF2y\u1EB9\u0301, t\xE0b\xED \xE0k\xF3r\xE0n \u1EB9\u0300d\u1ECD\u0300f\xF3r\xF3.",
        home: "1. Mu omi gb\xEDgb\xF3n\xE1 d\xED\u1EB9\u0300 t\xE0b\xED omi tii p\u1EB9\u0300l\xFA oyin (\u1EB9 m\xE1 fi oyin f\xFAn \u1ECDm\u1ECD t\xED k\xF2 t\xED\xEC p\xE9 \u1ECDd\xFAn kan) l\xE1ti r\u1ECD \u1ECD\u0300fun.\n2. Fa \xE8\xE9f\xEDn omi gb\xEDgb\xF3n\xE1 s\xEDn\xFA d\xED\u1EB9\u0300d\xED\u1EB9\u0300 l\xE1ti t\xFA \xE0y\xE0.\n3. J\xECnn\xE0 s\xED \xE8\xE9f\xEDn s\xEDg\xE1, eruku, \xE0ti \xE8\xE9f\xEDn j\u1EB9\u0301n\u1EB9\u0301r\xE9t\u1ECD\u0300.\n4. Sinmi d\xE1ad\xE1a k\xED o m\xE1 s\xEC lo o\xF2g\xF9n apak\xF2k\xF2r\xF2 l\xE1\xEC r\xED d\u1ECD\u0301k\xEDt\xE0.",
        action: `\u1E62\u1ECD\u0301 \xE8\xE9m\xED r\u1EB9 d\xE1ad\xE1a. T\xED ik\u1ECD\u0301 n\xE1\xE0 b\xE1 k\u1ECDj\xE1 \u1ECD\u0300s\u1EB9\u0300 kan, t\xED ib\xE0 l\xEDle b\xE1 b\u1EB9\u0300r\u1EB9\u0300, t\xE0b\xED t\xED \xE8\xE9m\xED b\xE1 \u0144 \u1E63\xF2ro l\xE1ti gb\xE0, l\u1ECD s\xED ${primaryHospital} l\u1EB9\u0301s\u1EB9\u0300k\u1EB9s\u1EB9\u0300.`,
        questions: [
          "\u1ECCj\u1ECD\u0301 m\xE9l\xF2\xF3 ni ik\u1ECD\u0301 y\xEC\xED ti w\xE0, \u1E63\xE9 k\u1EB9\u0300l\u1EB9\u0300b\u1EB9\u0300 t\xE0b\xED \u1EB9\u0300j\u1EB9\u0300 \u0144 j\xE1de?",
          "\u1E62\xE9 \xE8\xE9m\xED \u0144 p\xEDn n\xEDgb\xE0 t\xED o b\xE1 r\xECn d\xED\u1EB9\u0300?"
        ]
      },
      igbo: {
        urgencyLevel: "urgent",
        empathy: "Ndo nu! \u1EE4kwara kp\u1ECDr\u1ECD nk\u1EE5 na obi siri ike ntak\u1ECBr\u1ECB na-eme ka ah\u1EE5 ghara iru mmad\u1EE5 ala.",
        causes: "\u1EE4kwara kp\u1ECDr\u1ECD nk\u1EE5 nwere ah\u1EE5 \u1ECDk\u1EE5 ntak\u1ECBr\u1ECB na obi siri ike ntak\u1ECBr\u1ECB na-esikar\u1ECB n'oyi d\u1ECB n'obi, uzuzu harmattan, ma \u1ECD b\u1EE5 mbido \u1ECDr\u1ECBa iku ume.",
        home: "1. \u1E44\u1EE5\u1ECD mmiri d\u1ECB \u1ECDk\u1EE5 ntak\u1ECBr\u1ECB ma \u1ECD b\u1EE5 tii nwere mman\u1EE5 a\u1E45\u1EE5 (enyela nwa na-erugh\u1ECB otu af\u1ECD mman\u1EE5 a\u1E45\u1EE5) iji mee ka akp\u1ECBr\u1ECB d\u1ECB j\u1EE5\u1EE5.\n2. Kuru uzuoku mmiri \u1ECDk\u1EE5 nway\u1ECD\u1ECD nway\u1ECD\u1ECD iji meghere obi.\n3. Zere anw\u1EE5r\u1EE5 \u1ECDk\u1EE5, uzuzu, na anw\u1EE5r\u1EE5 igwe \u1ECDk\u1EE5 (generator).\n4. Zuo ike ma zere \u1ECB\u1E45\u1EE5 antibiotics n'enwegh\u1ECB nd\u1EE5m\u1ECDd\u1EE5 d\u1ECDk\u1ECBta.",
        action: `Lezien\u1EE5 iku ume g\u1ECB anya. \u1ECC b\u1EE5r\u1EE5 na \u1EE5kwara gafere otu izu, ah\u1EE5 \u1ECDk\u1EE5 ab\u1ECBa, ma \u1ECD b\u1EE5 iku ume esiri g\u1ECB ike, gaa ${primaryHospital} ma \u1ECD b\u1EE5 \u1EE5l\u1ECD \u1ECDgw\u1EE5 kacha nso ngwa ngwa.`,
        questions: [
          "\u1EE4b\u1ECDch\u1ECB ole ka \u1EE5kwara a n\u1ECDr\u1ECDla, \u1ECD na-ewep\u1EE5ta \u1EE5f\u1EE5f\u1EE5 ma \u1ECD b\u1EE5 \u1ECDbara?",
          "Iku ume \u1ECD na-esiri g\u1ECB ike mgbe \u1ECB na-eje ije ntak\u1ECBr\u1ECB?"
        ]
      }
    },
    joint_pain: {
      pidgin: {
        urgencyLevel: "urgent",
        empathy: "Ayaah, sorry well-well! Deep waist, joint, and bone pain dey really trouble person.",
        causes: "Heavy pain for waist, joints, and bone with extreme tiredness fit be Sickle Cell pain crisis (if you get SS/SC genotype), severe viral/malaria body aches, or typhoid/arthritis flare.",
        home: "1. Drink plenty clean water (warm water or ORS) right away so blood flow well.\n2. Keep joints warm with clean blanket \u2014 no put ice block on top bone pain!\n3. Stay warm and rest completely for quiet place.\n4. Paracetamol or prescribed pain relief fit ease pain; avoid strong NSAIDs if you get ulcer.",
        action: `If you get Sickle Cell (SS/SC), or pain no gree calm down, or fever/yellow eyes join am, waka go ${primaryHospital} or Haematology / General Hospital today for proper hydration and pain care.`,
        questions: [
          "You sabi your blood genotype (like AA, AS, or SS/SC)?",
          "Hot body or yellow eyes join the bone pain?"
        ]
      },
      english: {
        urgencyLevel: "urgent",
        empathy: "I am so sorry you are experiencing severe waist, joint, and bone pains. Staying hydrated and warm is essential.",
        causes: "Severe bone, waist, and joint pains with extreme weakness can be triggered by a Sickle Cell vaso-occlusive crisis (in SS/SC individuals), severe malaria/viral illness, or acute inflammatory arthritis.",
        home: "1. Hydrate aggressively with clean water or ORS to support blood circulation.\n2. Keep your body and painful joints warmly wrapped \u2014 never apply ice or cold packs.\n3. Rest completely in a warm, comfortable space.\n4. Use safe pain relief as previously prescribed by your doctor (avoid NSAIDs if you have stomach ulcers or kidney disease).",
        action: `If you have Sickle Cell disease, if the pain continues to escalate, or if accompanied by fever, dark urine, or chest discomfort, go promptly to ${primaryHospital} or your nearest General Hospital for IV fluids and medical pain management.`,
        questions: [
          "Do you know your haemoglobin genotype (AA, AS, SS, SC)?",
          "Are you experiencing any fever, yellowing of the eyes, or chest pain?"
        ]
      },
      hausa: {
        urgencyLevel: "urgent",
        empathy: "Sannu da jiki! Ciwon kugu, gabbai, da kashi mai tsanani yana da zafi sosai, Allah Ya sauwake.",
        causes: "Ciwon kugu, gabbai, da kashi tare da kasala mai tsanani yana iya faruwa saboda ciwon Sickle Cell (masu SS/SC), zazzabin cizon sauro mai karfi, ko ciwon gabbai.",
        home: "1. Sha ruwa mai tsabta da yawa (ruwan dumi ko ORS) nan take don jini ya rika gudu da kyau.\n2. Rufe jiki da gabbai da bargo mai dumi \u2014 kada a dora kankara a kan kashi mai ciwo!\n3. Huta gaba daya a wuri mai dumi.\n4. Sha maganin rage radadi kamar Paracetamol kamar yadda likita ya tsara.",
        action: `Idan kana da ciwon Sickle Cell (SS/SC), ko ciwon ya ki sauki, ko akwai zazzabi da idanun rawaya, tafi ${primaryHospital} yau don samun ruwan asibiti (drip) da taimakon likita.`,
        questions: [
          "Shin ka san nau'in jininka (genotype kamar AA, AS, ko SS)?",
          "Shin akwai zazzabi ko rawayar idanu tare da ciwon kashin?"
        ]
      },
      yoruba: {
        urgencyLevel: "urgent",
        empathy: "P\u1EB9\u0300l\u1EB9\u0301 o! \xCCrora l\xEDle n\xED \xECb\xE0d\xED, or\xEDk\xE8\xE9, \xE0ti egungun m\xE1a \u0144 ni ni l\xE1ra gan-an.",
        causes: "\xCCrora egungun, \xECb\xE0d\xED, \xE0ti or\xEDk\xE8\xE9 p\u1EB9\u0300l\xFA \xE0\xE1r\u1EB9\u0300 gidi l\xE8 w\xE1 l\xE1ti ara \xE0\xECs\xE0n s\u1EB9\u0301\u1EB9\u0300l\xEC (Sickle Cell SS/SC), Ib\xE0 l\xEDle, t\xE0b\xED l\xE0k\xFAr\xE8gb\xE9.",
        home: "1. Mu omi m\xEDm\u1ECD\u0301 p\xFAp\u1ECD\u0300 l\u1EB9\u0301s\u1EB9\u0300k\u1EB9s\u1EB9\u0300 k\xED \u1EB9\u0300j\u1EB9\u0300 l\xE8 \u1E63\xE0n d\xE1ad\xE1a n\xEDn\xFA ara.\n2. J\u1EB9\u0301 k\xED ara \xE0ti \xE0w\u1ECDn or\xEDk\xE8\xE9 gb\xF3n\xE1 d\xED\u1EB9\u0300 \u2014 \u1EB9 m\xE1 fi y\xECny\xEDn s\xED egungun t\xF3 \u0144 ro y\xEDn!\n3. Sinmi d\xE1ad\xE1a n\xED ibi t\xED k\xF2 n\xED \xF2t\xFAt\xF9.\n4. Lo o\xF2g\xF9n \xECrora b\xEDi Paracetamol g\u1EB9\u0301g\u1EB9\u0301 b\xED d\u1ECD\u0301k\xEDt\xE0 \u1E63e k\u1ECD \u1ECD\u0301.",
        action: `T\xED \u1EB9 b\xE1 n\xED Sickle Cell (SS/SC), t\xE0b\xED t\xED \xECrora k\xF2 d\xEDnk\xF9, t\xE0b\xED t\xED ib\xE0 \xE0ti oj\xFA p\xEDp\u1ECD\u0301n b\xE1 w\xE0 p\u1EB9\u0300l\xFA r\u1EB9\u0300, \u1EB9 l\u1ECD s\xED ${primaryHospital} l\xF3n\xEC\xED f\xFAn omi \xEC\u1E63\xE1n\xE1 (drip) \xE0ti \xECt\u1ECD\u0301j\xFA d\u1ECD\u0301k\xEDt\xE0.`,
        questions: [
          "\u1E62\xE9 \u1EB9 m\u1ECD ir\xFA \u1EB9\u0300j\u1EB9\u0300 y\xEDn (genotype b\xEDi AA, AS, SS)?",
          "\u1E62\xE9 ib\xE0 t\xE0b\xED oj\xFA p\xEDp\u1ECD\u0301n w\xE0 p\u1EB9\u0300l\xFA \xECrora egungun n\xE1\xE0?"
        ]
      },
      igbo: {
        urgencyLevel: "urgent",
        empathy: "Ndo nu! Mgbu siri ike n'\xFAkw\xF9, nkwonkwo, na \u1ECDkp\u1EE5kp\u1EE5 na-egbu mgbu nke ukwuu.",
        causes: "Mgbu \u1ECDkp\u1EE5kp\u1EE5, \xFAkw\xF9, na nkwonkwo nwere ike \u1ECDgw\u1EE5gw\u1EE5 d\u1ECB ukwuu nwere ike \u1ECBb\u1EE5 mwakpo Sickle Cell (maka nd\u1ECB nwere SS/SC), \u1ECAba siri ike, ma \u1ECD b\u1EE5 \u1ECDr\u1ECBa nkwonkwo.",
        home: "1. \u1E44\u1EE5\u1ECD mmiri d\u1ECB \u1ECDcha nke ukwuu ozugbo iji nyere \u1ECDbara aka \u1ECBga nke \u1ECDma.\n2. Mee ka ah\u1EE5 na nkwonkwo na-ekpo \u1ECDk\u1EE5 \u2014 etinyela ice block n'ebe \u1ECDkp\u1EE5kp\u1EE5 na-egbu mgbu!\n3. Zuo ike kpamkpam n'ebe d\u1ECB \u1ECDk\u1EE5.\n4. Were \u1ECDgw\u1EE5 mgbu d\u1ECB nchebe d\u1ECBka Paracetamol d\u1ECBka d\u1ECDk\u1ECBta si k\u1EE5zie.",
        action: `\u1ECC b\u1EE5r\u1EE5 na i nwere Sickle Cell (SS/SC), ma \u1ECD b\u1EE5 mgbu ah\u1EE5 akw\u1EE5s\u1ECBgh\u1ECB, ma \u1ECD b\u1EE5 ah\u1EE5 \u1ECDk\u1EE5 na anya odo ab\u1ECBa, gaa ${primaryHospital} taa maka mmiri \u1EE5l\u1ECD \u1ECDgw\u1EE5 (drip) na nlek\u1ECDta d\u1ECDk\u1ECBta.`,
        questions: [
          "\u1ECA maara genotype \u1ECDbara g\u1ECB (d\u1ECBka AA, AS, ma \u1ECD b\u1EE5 SS/SC)?",
          "Ah\u1EE5 \u1ECDk\u1EE5 ma \u1ECD b\u1EE5 anya odo \u1ECD d\u1ECB n'ime mgbu \u1ECDkp\u1EE5kp\u1EE5 ah\u1EE5?"
        ]
      }
    },
    general: {
      pidgin: {
        urgencyLevel: "urgent",
        empathy: "Pele o! Take am easy, make I break down wetin you fit do.",
        causes: "The way your body dey do you fit come from stress, dehydration, early malaria/typhoid infection, or tiredness. Make sure you observe any new sign.",
        home: "1. Rest well-well for airy room.\n2. Drink plenty clean water make your body cool down.\n3. Watch your body well make you see if fever, purging, or pain increase.",
        action: `If the feeling no better after 24 to 48 hours, or e worse, waka go see nurse or doctor for ${primaryHospital} or your nearest General Hospital inside ${stateName}.`,
        questions: [
          "How many days this body problem don start?",
          "Any hot body, purging, or strong pain join am?"
        ]
      },
      english: {
        urgencyLevel: "urgent",
        empathy: "So sorry you are not feeling well. Let us go through some safe steps to monitor your symptoms.",
        causes: "Your symptoms may result from physical stress, mild dehydration, or the early stage of a common infection such as malaria or a viral illness.",
        home: "1. Get plenty of rest in a cool, well-ventilated room.\n2. Drink clean, boiled or bottled water regularly.\n3. Monitor closely for new symptoms like rising fever, vomiting, or severe pain.",
        action: `If your symptoms do not improve within 24 to 48 hours, or if they worsen at any time, please visit ${primaryHospital} or your nearest clinic in ${stateName} for proper examination.`,
        questions: [
          "How many days ago did these symptoms start?",
          "Do you also have a fever, stomach pain, or difficulty sleeping?"
        ]
      },
      hausa: {
        urgencyLevel: "urgent",
        empathy: "Sannu da jiki! Allah Ya sauwake. Ga shawarwari masu sauki da zaka bi a hankali.",
        causes: "Yadda jikinka ke yi maka yana iya fitowa daga gajiya mai yawa, karancin ruwa a jiki, ko farkon zazzabin cizon sauro (Malaria) ko mura.",
        home: "1. Huta sosai a daki mai shigar iska mai kyau.\n2. Sha ruwa mai tsabta da yawa.\n3. Kula da jikinka ka gani ko zazzabi, zawo, ko ciwon kai zai karu.",
        action: `Idan jikin bai yi sauki ba bayan sa'o'i 24 zuwa 48, ko ya kara tsanani, tafi ka ga likita a ${primaryHospital} ko asibitin gwamnati mafi kusa a ${stateName}.`,
        questions: [
          "Yaushe wannan ciwon ko kasalar ya fara?",
          "Shin akwai zazzabi, zawo, ko wani ciwo mai tsanani tare da shi?"
        ]
      },
      yoruba: {
        urgencyLevel: "urgent",
        empathy: "P\u1EB9\u0300l\u1EB9\u0301 o! \u1EB8 j\u1EB9\u0301 k\xE1 b\xF3j\xFAt\xF3 b\xED ara \u1E63e \u0144 \u1E63e y\xEDn p\u1EB9\u0300l\xFA \xE0b\xF3j\xFAt\xF3 t\xF3 r\u1ECDr\xF9n.",
        causes: "B\xED ara \u1E63e \u0144 \u1E63e y\xEDn l\xE8 w\xE1 l\xE1ti ara \xE0\xE1r\u1EB9\u0300 p\xFAp\u1ECD\u0300, \xE0\xECn\xED omi t\xF3 t\xF3 n\xEDn\xFA ara, t\xE0b\xED \xECb\u1EB9\u0300r\u1EB9\u0300 \xE0\xECs\xE0n b\xEDi Ib\xE0 (Malaria) t\xE0b\xED \xF2t\xFAt\xF9.",
        home: "1. Sinmi d\xE1ad\xE1a n\xED y\xE0r\xE1 t\xED at\u1EB9\u0301g\xF9n \u0144 f\u1EB9\u0301 s\xED.\n2. Mu omi m\xEDm\u1ECD\u0301 p\xFAp\u1ECD\u0300 l\xF3jooj\xFAm\u1ECD\u0301.\n3. \u1E62\u1ECD\u0301 ara r\u1EB9 d\xE1ad\xE1a b\xF3y\xE1 ib\xE0, \xECgb\u1EB9\u0301 gbuuru, t\xE0b\xED \xECrora m\xEC\xEDr\xE0n y\xF3\xF2 y\u1ECDj\xFA.",
        action: `T\xED ara k\xF2 b\xE1 y\xE1 l\xE1\xE0\xE1r\xEDn w\xE1k\xE0t\xED m\u1EB9\u0301r\xECnl\xE9l\xF3g\xFAn s\xED m\xE9j\xECd\xEDnl\xE1\xE0\xE1d\u1ECD\u0301ta (24-48 hours), t\xE0b\xED t\xED \xF3 b\xE1 le s\xED i, \u1EB9 l\u1ECD r\xED d\u1ECD\u0301k\xEDt\xE0 n\xED ${primaryHospital} t\xE0b\xED il\xE9-\xECw\xF2s\xE0n t\xF3 s\xFAnm\u1ECD\u0301 y\xEDn n\xED ${stateName}.`,
        questions: [
          "\u1ECCj\u1ECD\u0301 m\xE9l\xF2\xF3 ni \xE0\xECs\xE0n y\xEC\xED ti b\u1EB9\u0300r\u1EB9\u0300?",
          "\u1E62\xE9 ib\xE0 gb\xEDgb\xF3n\xE1, \xECgb\u1EB9\u0301 gbuuru, t\xE0b\xED \xECrora l\xEDle w\xE0 p\u1EB9\u0300l\xFA r\u1EB9\u0300?"
        ]
      },
      igbo: {
        urgencyLevel: "urgent",
        empathy: "Ndo nu! Jiri nway\u1ECD\u1ECD, ka m k\u1ECDwaa ihe i nwere ike ime iji lek\u1ECDta onwe g\u1ECB.",
        causes: "Ka ah\u1EE5 d\u1ECB g\u1ECB nwere ike \u1ECBb\u1EE5 site na ike \u1ECDgw\u1EE5gw\u1EE5, \u1EE5k\u1ECD mmiri n'ah\u1EE5, ma \u1ECD b\u1EE5 mbido \u1ECDr\u1ECBa d\u1ECBka \u1ECAba (Malaria) ma \u1ECD b\u1EE5 oyi.",
        home: "1. Zuo ike nke \u1ECDma n'ime \u1EE5l\u1ECD nwere ikuku d\u1ECB mma.\n2. \u1E44\u1EE5\u1ECD mmiri d\u1ECB \u1ECDcha nke ukwuu.\n3. Lezien\u1EE5 ah\u1EE5 g\u1ECB anya ma ah\u1EE5 \u1ECDk\u1EE5, af\u1ECD \u1ECDs\u1ECBsa, ma \u1ECD b\u1EE5 mgbu ga-abawanye.",
        action: `\u1ECC b\u1EE5r\u1EE5 na ah\u1EE5 ad\u1ECBgh\u1ECB mma mgbe awa 24 ruo 48 gachara, ma \u1ECD b\u1EE5 \u1ECD ka nj\u1ECD, gaa h\u1EE5 n\u1ECD\u1ECDs\u1EE5 ma \u1ECD b\u1EE5 d\u1ECDk\u1ECBta na ${primaryHospital} ma \u1ECD b\u1EE5 General Hospital d\u1ECB na ${stateName}.`,
        questions: [
          "\u1EE4b\u1ECDch\u1ECB ole ka ah\u1EE5 ad\u1ECBgh\u1ECB mma a malitere?",
          "\u1ECC nwere ah\u1EE5 \u1ECDk\u1EE5, af\u1ECD \u1ECDs\u1ECBsa, ma \u1ECD b\u1EE5 mgbu siri ike so ya?"
        ]
      }
    }
  };
  const c = CONTENT[category][language];
  return {
    language,
    urgencyLevel: c.urgencyLevel,
    isRedFlag: false,
    empathyNote: c.empathy,
    wetinFitDeyHappen: c.causes,
    wetinYouFitDoForHouse: c.home,
    nextStep: c.action,
    potentialCauses: c.causes,
    homeManagement: c.home,
    actionPlan: c.action,
    clarifyingQuestions: c.questions,
    recommendedFacilities: topFacilities,
    detectedLocation: stateName,
    disclaimer: headers.disclaimer,
    fullFormattedResponse: buildFormattedResponse(language, {
      isRedFlag: false,
      empathyNote: c.empathy,
      causes: c.causes,
      home: c.home,
      action: c.action,
      disclaimer: headers.disclaimer
    })
  };
}

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(express.json({ limit: "8mb" }));
var ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    apiVersion: "v1beta",
    httpOptions: {
      apiVersion: "v1beta",
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
function getTargetLanguage(lang) {
  if (typeof lang === "string" && ["pidgin", "english", "hausa", "yoruba", "igbo"].includes(lang)) {
    return lang;
  }
  return "pidgin";
}
function detectExplicitNigerianLanguage(text) {
  const lower = text.toLowerCase();
  const hausaMatches = (lower.match(
    /\b(ina|kina|sannu|zazzabi|zazzaɓi|ciwon|ciwo|jikina|jiki|amai|zawo|numfashi|ciki|juna biyu|mai ciki|gaggawa|asibiti|kano|kaduna|sokoto|katsina|da safe|tun jiya|ruwa|gajiya)\b/g
  ) || []).length;
  const yorubaMatches = (lower.match(
    /\b(ara mi|ori mi|orí|ori|gbona|gbóná|iba|ìbà|eebi|èébì|igbe|ìgbẹ́|gbuuru|oyun|oyún|aboyun|aboyún|eje|ẹ̀jẹ̀|inu rirun|irora|ìrora|ile-iwosan|ilé-ìwòsàn|omo|ọmọ|fo mi|n fo|n dun|da mi|laamu)\b/g
  ) || []).length;
  const igboMatches = (lower.match(
    /\b(ahu|ahụ|isi|owuwa|ọwụwa|afo|afọ|osisa|ọsịsa|ime|obara|ọbara|ukwara|ụkwara|oku|ọkụ|ekpo|agwo|gwọ|nnoo|ndo|ulo ogwu|ụlọ ọgwụ|nwa|ike|mgbu|na-egbu|na-ekpo|na-awa|nututu|nụtụtụ|adi m|adị m)\b/g
  ) || []).length;
  const maxIndigenous = Math.max(hausaMatches, yorubaMatches, igboMatches);
  if (maxIndigenous >= 2) {
    if (hausaMatches === maxIndigenous) return "hausa";
    if (yorubaMatches === maxIndigenous) return "yoruba";
    return "igbo";
  }
  const pidginMatches = (lower.match(
    /\b(dey|wetin|pikin|belle|abeg|wahala|sabi|chop|comot|waka|sharp-sharp|no fit|e don|my body|head dey|foot dey|eye dey|throat dey)\b/g
  ) || []).length;
  if (pidginMatches >= 2) return "pidgin";
  return null;
}
function resolveTargetLanguage(requestedLang, text, strictMode = false) {
  const baseLang = getTargetLanguage(requestedLang);
  if (strictMode) return baseLang;
  const inferred = detectExplicitNigerianLanguage(text);
  if (!inferred) return baseLang;
  if (baseLang === "pidgin" || baseLang === "english") {
    return inferred;
  }
  if ((inferred === "hausa" || inferred === "yoruba" || inferred === "igbo") && inferred !== baseLang) {
    return inferred;
  }
  return baseLang;
}
function isGeminiConfigured() {
  return Boolean(ai && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY");
}
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "NaijaHealth AI Medical Triage Service (Multilingual Edition)",
    languages: ["pidgin", "english", "hausa", "yoruba", "igbo"],
    hasApiKey: isGeminiConfigured(),
    timestamp: (/* @__PURE__ */ new Date()).toISOString()
  });
});
app.get("/api/facilities", (req, res) => {
  const state = req.query.state;
  if (state && NIGERIAN_STATES_DATA[state]) {
    return res.json({
      state,
      data: NIGERIAN_STATES_DATA[state]
    });
  }
  return res.json({
    states: Object.keys(NIGERIAN_STATES_DATA),
    nationalHotlines: NATIONAL_EMERGENCY_NUMBERS,
    redFlags: RED_FLAG_SYMPTOMS
  });
});
app.post("/api/triage", async (req, res) => {
  const message = typeof req.body?.message === "string" ? req.body.message.trim() : "";
  const targetLang = resolveTargetLanguage(req.body?.language, message, Boolean(req.body?.languageLocked));
  const privateMode = Boolean(req.body?.privateMode);
  const conversationHistory = privateMode ? [] : Array.isArray(req.body?.conversationHistory) ? req.body.conversationHistory : [];
  const userLocation = req.body?.userLocation;
  if (privateMode) {
    res.setHeader("Cache-Control", "no-store, no-cache, must-revalidate");
    res.setHeader("Pragma", "no-cache");
  }
  if (!message) {
    return res.status(400).json({ error: "Symptom description message is required." });
  }
  const detectedFromMsg = detectStateFromText(message);
  const targetState = userLocation?.state && NIGERIAN_STATES_DATA[userLocation.state] ? userLocation.state : detectedFromMsg || "Lagos";
  const stateData = NIGERIAN_STATES_DATA[targetState] || NIGERIAN_STATES_DATA["Lagos"];
  const facilitiesList = stateData.facilities.map((f) => `${f.name} (${f.city})`).join(", ");
  const headers = getSectionHeaders(targetLang);
  const immediateSafetyCheck = detectLocalRedFlags(message);
  if (immediateSafetyCheck.isRedFlag) {
    console.log(`Immediate red-flag detected (${targetLang}). Dispatching urgent response without waiting.`);
    const emergencyResult = buildFallbackTriage(message, targetState, targetLang);
    return res.json(emergencyResult);
  }
  if (!ai || !isGeminiConfigured()) {
    console.log(`Using multilingual rule-based triage in ${targetLang} (API key unconfigured).`);
    return res.json(buildFallbackTriage(message, targetState, targetLang));
  }
  const languageSpecs = {
    pidgin: 'Write EVERY SINGLE JSON STRING strictly in fluent, warm Nigerian Pidgin English (e.g. "Ayaah", "Pele o", "Sorry o", "hot body", "purging"). Never switch into formal textbook English. Use [Wetin Fit Dey Happen], [Wetin You Fit Do For House], [Next Step].',
    english: "Write EVERY SINGLE JSON STRING strictly in simple, warm, everyday Nigerian English free of heavy clinical jargon. Use [Potential Causes], [Home Management], [Action Plan].",
    hausa: 'Write EVERY SINGLE JSON STRING strictly and completely in natural, everyday Hausa (Harshen Hausa), e.g., "Sannu da jiki", "Allah Ya sauwake". DO NOT reply in English or Pidgin! Even if the user message contained English words, your entire response MUST be 100% Hausa (you may keep medical terms like ORS, Malaria, Typhoid, and Nigerian hospital names).',
    yoruba: 'Write EVERY SINGLE JSON STRING strictly and completely in natural, everyday Yoruba (\xC8d\xE8 Yor\xF9b\xE1) with clear tone marks/diacritics, e.g., "P\u1EB9\u0300l\u1EB9\u0301 o", "\u1EB8 m\xE1 b\xEDn\xFA". DO NOT reply in English or Pidgin! Even if the user message contained English words, your entire response MUST be 100% Yoruba (you may keep terms like ORS, Malaria, Typhoid, and Nigerian hospital names).',
    igbo: 'Write EVERY SINGLE JSON STRING strictly and completely in natural, everyday Igbo (As\u1EE5s\u1EE5 Igbo) with clear diacritics, e.g., "Ndo nu", "Ndewo". DO NOT reply in English or Pidgin! Even if the user message contained English words, your entire response MUST be 100% Igbo (you may keep terms like ORS, Malaria, Typhoid, and Nigerian hospital names).'
  };
  const systemInstruction = `You are "NaijaHealth AI", an empathetic, culturally grounded medical triage assistant supporting communities across Nigeria.
TARGET LANGUAGE: ${targetLang.toUpperCase()}
LANGUAGE REQUIREMENT: ${languageSpecs[targetLang]}

PRIVATE CARE MODE (SENSITIVE HEALTH):
The user may be asking about HIV, sexual health, or a medication they take daily. They may NEVER name their condition, and you must not require them to.
- Work from indirect language ("the drugs I take every night", "my condition", "I had a risk last week") without asking them to confirm a diagnosis or status.
- NEVER diagnose HIV or any condition. NEVER say a test result is negative or positive \u2014 a negative test inside the window period does not mean negative; say the window period and advise a repeat test.
- NEVER tell anyone to start, stop, skip, switch or halve ARV/ART medication, and never give ARV doses. Adherence support and referral only.
- If exposure to HIV is possible and less than 72 hours have passed, treat it as time-critical: say PEP must start within 72 hours, and send them to a public hospital PEP/ART unit today.
- U=U (undetectable = untransmittable) may be mentioned ONLY when the person says a clinician confirmed their viral load is suppressed.
- Side effects that need same-day care: spreading rash with fever or peeling skin, yellow eyes/dark urine, severe abdominal pain, difficulty breathing, confusion, fainting.
- If a clinic has no stock, advise an emergency refill or transfer slip at a public ART site, calling ahead to confirm stock. NEVER advise buying ART from an unverified seller, and remind them a genuine pack carries a NAFDAC number.
- Never claim any cure, including herbal mixtures or "agbo". Never suggest stopping treatment for spiritual reasons.
- Confidentiality: never ask for a name, phone number, address or any identifying detail. Remind them, when relevant, that clinics are legally required to keep their status confidential in Nigeria (HIV/AIDS Anti-Discrimination Act 2014).
- If they mention being threatened, assaulted, or in danger because of their status, prioritise their physical safety and 112 over disclosure advice.
- An empathic, non-judgemental tone is mandatory. No blame, no moralising.

CLINICAL & CULTURAL GUIDANCE:
- Avoid complex medical terminology; explain gently in plain everyday language so anyone in a Nigerian market can understand.
- Include local Nigerian health context where appropriate: Malaria / Typhoid awareness (advise mRDT malaria testing before medication), purging/cholera awareness, and Sickle Cell precautions for severe joint/bone crisis.
- PREGNANCY & MATERNAL CARE PROTOCOL:
  * If the user is pregnant (expectant mother / "get belle" / "mai ciki" / "oy\xFAn" / "d\u1ECB ime"): FIRST screen for obstetric danger signs (vaginal bleeding/spotting, severe headache, blurred vision, sudden face or hand swelling [pre-eclampsia], convulsions, leaking fluid/water breaking early, decreased or absent baby kicks/movement, severe abdominal pain, high fever).
  * If ANY obstetric danger sign is present -> IMMEDIATELY set "isRedFlag": true and "urgencyLevel": "emergency", forbid ALL herbs/home drugs, and urge immediate travel to a General/Teaching Hospital Maternity Emergency Ward in ${targetState} or call 112.
  * For non-emergency pregnancy complaints (morning sickness, mild fatigue, mild fever, mild backache, urinary discomfort): warn explicitly NEVER to take unprescribed painkillers (especially NSAIDs like Ibuprofen, Diclofenac, Aspirin), unprescribed antibiotics/antimalarials, or local herbal mixtures ("agbo"), give safe hydration/rest guidance, and advise prompt Antenatal Clinic (ANC) doctor/midwife review.
- For purging/dehydration, give the exact safe Salt-Sugar Solution (Home ORS) ratio: 1 level small teaspoon of salt + 10 level small teaspoons of sugar (or 5 sugar cubes) dissolved in 1 litre (two 50cl pure water sachets) of clean boiled/cooled water.
- For high fever, advise lukewarm tepid sponging (explicitly warn NEVER to use cold water, ice, or methylated spirit).
- Warn gently against unprescribed antibiotics or unsafe herbal concoctions.
- Always route physical care to ${targetState} State hospitals: ${facilitiesList} (Emergency hotlines: 112, NCDC 6232, ${stateData.emergencyHotlines.join(", ")}).

CRITICAL SAFETY PROTOCOL:
- If ANY red-flag symptom is described (sharp/crushing chest pain, severe breathing difficulty, sudden half-body weakness / stroke FAST signs, heavy uncontrolled bleeding, unconsciousness/seizure, neck stiffness with fever, OR pregnancy danger signs such as bleeding in pregnancy, pre-eclampsia headache/vision/face swelling, early water breaking, or absent baby movement):
  * Set "isRedFlag": true and "urgencyLevel": "emergency".
  * Set "wetinYouFitDoForHouse" to a brief warning in ${targetLang} saying ALL home remedies are cancelled \u2014 go immediately to emergency care!
  * Direct them urgently to the nearest emergency hospital in ${targetState} and to call 112.
- Keep responses concise, empathetic, and structured clearly.`;
  const promptText = `Patient State/City: ${targetState}, Nigeria (City note: ${userLocation?.city || "not specified"}).
Target Output Language: ${targetLang.toUpperCase()}.
Recent Conversation:
${conversationHistory.slice(-6).map((m) => `${m.role === "user" ? "Patient" : "NaijaHealth AI"}: ${m.parts?.[0]?.text || m.text || ""}`).join("\n")}

Patient Message:
"${message}"

Respond in JSON with every narrative string written in ${targetLang.toUpperCase()}.`;
  const startedAt = Date.now();
  const baseSchema = {
    type: Type.OBJECT,
    properties: {
      isRedFlag: {
        type: Type.BOOLEAN,
        description: "True only if dangerous red flags are present (severe chest pain, inability to breathe, stroke weakness, heavy bleeding, unconsciousness/seizure)."
      },
      urgencyLevel: {
        type: Type.STRING,
        enum: ["emergency", "urgent", "routine"],
        description: "Clinical triage priority level"
      },
      empathyNote: {
        type: Type.STRING,
        description: `Short warm comforting greeting strictly in ${targetLang}`
      },
      emergencyWarning: {
        type: Type.STRING,
        description: `Urgent warning strictly in ${targetLang} if isRedFlag is true, otherwise empty string`
      },
      wetinFitDeyHappen: {
        type: Type.STRING,
        description: `Part 1 (${headers.causes}): Simple, non-jargon explanation strictly in ${targetLang}`
      },
      wetinYouFitDoForHouse: {
        type: Type.STRING,
        description: `Part 2 (${headers.home}): Safe first-aid and home care strictly in ${targetLang}. Say home remedies cancelled if isRedFlag is true.`
      },
      nextStep: {
        type: Type.STRING,
        description: `Part 3 (${headers.action}): Clear timeline & hospital guidance inside ${targetState} strictly in ${targetLang}`
      },
      clarifyingQuestions: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: `1 to 2 short helpful follow-up questions strictly in ${targetLang}`
      },
      recommendedFacilities: {
        type: Type.ARRAY,
        items: { type: Type.STRING },
        description: `2 to 3 recommended hospitals in ${targetState} State`
      },
      detectedLocation: {
        type: Type.STRING,
        description: "Nigerian state name"
      },
      disclaimer: {
        type: Type.STRING,
        description: `Brief AI medical disclaimer strictly in ${targetLang}`
      }
    },
    required: [
      "isRedFlag",
      "urgencyLevel",
      "empathyNote",
      "wetinFitDeyHappen",
      "wetinYouFitDoForHouse",
      "nextStep",
      "disclaimer"
    ]
  };
  const effectiveInstruction = privateMode ? `${systemInstruction}

PRIVACY: This is a private session. Do not ask for identifying details and do not request history.` : systemInstruction;
  async function callTriageModel(modelName, thinkingLevel) {
    const genPromise = ai.models.generateContent({
      model: modelName,
      contents: promptText,
      config: {
        systemInstruction: effectiveInstruction,
        thinkingConfig: { thinkingLevel },
        responseMimeType: "application/json",
        responseSchema: baseSchema
      }
    });
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error(`${modelName} timed out after 7s`)), 7e3);
    });
    return Promise.race([genPromise, timeoutPromise]);
  }
  try {
    let response;
    let usedModel = "gemini-3.8-flash";
    try {
      response = await callTriageModel("gemini-3.8-flash", ThinkingLevel.LOW);
    } catch (primaryErr) {
      console.warn(
        `Primary model gemini-3.8-flash error (${primaryErr?.status || primaryErr?.message}), trying gemini-3.1-flash-lite...`
      );
      usedModel = "gemini-3.1-flash-lite";
      response = await callTriageModel("gemini-3.1-flash-lite", ThinkingLevel.MINIMAL);
    }
    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from Gemini.");
    }
    const parsedData = JSON.parse(responseText);
    const normalizedLocation = parsedData.detectedLocation && NIGERIAN_STATES_DATA[parsedData.detectedLocation] ? parsedData.detectedLocation : targetState;
    const causes = parsedData.wetinFitDeyHappen || "";
    let home = parsedData.wetinYouFitDoForHouse || "";
    const action = parsedData.nextStep || "";
    const disclaimer = parsedData.disclaimer || headers.disclaimer;
    if (immediateSafetyCheck.isRedFlag) {
      parsedData.isRedFlag = true;
      parsedData.urgencyLevel = "emergency";
      home = buildFallbackTriage(message, normalizedLocation, targetLang).wetinYouFitDoForHouse;
    }
    const recommendedFacilities = Array.isArray(parsedData.recommendedFacilities) && parsedData.recommendedFacilities.length > 0 ? parsedData.recommendedFacilities : stateData.facilities.map((f) => `${f.name} (${f.city})`).slice(0, 3);
    const finalPayload = {
      ...parsedData,
      language: targetLang,
      detectedLocation: normalizedLocation,
      recommendedFacilities,
      wetinFitDeyHappen: causes,
      wetinYouFitDoForHouse: home,
      nextStep: action,
      potentialCauses: causes,
      homeManagement: home,
      actionPlan: action,
      disclaimer,
      fullFormattedResponse: buildFormattedResponse(targetLang, {
        isRedFlag: Boolean(parsedData.isRedFlag),
        empathyNote: parsedData.empathyNote,
        emergencyWarning: parsedData.emergencyWarning,
        causes,
        home,
        action,
        disclaimer
      })
    };
    console.log(`Triage (${targetLang}) completed via ${usedModel} in ${Date.now() - startedAt}ms`);
    return res.json(finalPayload);
  } catch (error) {
    console.error(`Triage (${targetLang}) AI error after ${Date.now() - startedAt}ms:`, error?.message || error);
    const fallbackResult = buildFallbackTriage(message, targetState, targetLang);
    return res.json(fallbackResult);
  }
});
var STOCKOUT_TTL_MS = 30 * 24 * 60 * 60 * 1e3;
var stockoutReports = /* @__PURE__ */ new Map();
function pruneStockouts() {
  const cutoff = Date.now() - STOCKOUT_TTL_MS;
  for (const [key, value] of stockoutReports) {
    if (value.lastReportedAt < cutoff) stockoutReports.delete(key);
  }
}
app.post("/api/stockout-report", (req, res) => {
  const siteId = typeof req.body?.siteId === "string" ? req.body.siteId.slice(0, 120) : "";
  const state = typeof req.body?.state === "string" ? req.body.state.slice(0, 60) : "";
  if (!siteId || !state) {
    return res.status(400).json({ error: "siteId and state are required." });
  }
  pruneStockouts();
  const key = siteId;
  const existing = stockoutReports.get(key);
  const next = {
    state,
    count: (existing?.count || 0) + 1,
    lastReportedAt: Date.now()
  };
  stockoutReports.set(key, next);
  res.setHeader("Cache-Control", "no-store");
  return res.json({ ok: true, siteId: key, count: next.count });
});
app.get("/api/stockout-report", (req, res) => {
  pruneStockouts();
  const state = typeof req.query.state === "string" ? req.query.state : "";
  const reports = {};
  for (const [siteId, value] of stockoutReports) {
    if (state && value.state !== state) continue;
    reports[siteId] = {
      count: value.count,
      lastReportedAt: new Date(value.lastReportedAt).toISOString()
    };
  }
  res.setHeader("Cache-Control", "no-store");
  return res.json({ state: state || "all", reports });
});
var FACILITY_REPORT_TTL_MS = 90 * 24 * 60 * 60 * 1e3;
var VALID_ISSUES = /* @__PURE__ */ new Set([
  "wrong-details",
  "closed",
  "no-staff",
  "phone-changed",
  "wrong-lga",
  "cannot-find"
]);
var facilityReports = /* @__PURE__ */ new Map();
function pruneFacilityReports() {
  const cutoff = Date.now() - FACILITY_REPORT_TTL_MS;
  for (const [key, value] of facilityReports) {
    if (value.lastReportedAt < cutoff) facilityReports.delete(key);
  }
}
app.post("/api/facility-report", (req, res) => {
  const facilityId = typeof req.body?.facilityId === "string" ? req.body.facilityId.slice(0, 160) : "";
  const state = typeof req.body?.state === "string" ? req.body.state.slice(0, 60) : "";
  const issue = typeof req.body?.issue === "string" ? req.body.issue : "";
  if (!facilityId || !state || !VALID_ISSUES.has(issue)) {
    return res.status(400).json({ error: "facilityId, state and a valid issue are required." });
  }
  pruneFacilityReports();
  const existing = facilityReports.get(facilityId);
  const issues = { ...existing?.issues || {} };
  issues[issue] = (issues[issue] || 0) + 1;
  const next = {
    state,
    count: (existing?.count || 0) + 1,
    issues,
    lastReportedAt: Date.now()
  };
  facilityReports.set(facilityId, next);
  res.setHeader("Cache-Control", "no-store");
  return res.json({ ok: true, facilityId, count: next.count });
});
app.get("/api/facility-report", (req, res) => {
  pruneFacilityReports();
  const state = typeof req.query.state === "string" ? req.query.state : "";
  const reports = {};
  for (const [facilityId, value] of facilityReports) {
    if (state && value.state !== state) continue;
    reports[facilityId] = {
      count: value.count,
      issues: value.issues,
      lastReportedAt: new Date(value.lastReportedAt).toISOString()
    };
  }
  res.setHeader("Cache-Control", "no-store");
  return res.json({ state: state || "all", reports });
});
app.post("/api/tts", async (req, res) => {
  const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
  const targetLang = getTargetLanguage(req.body?.language);
  if (!text) {
    return res.status(400).json({ error: "Text is required for speech synthesis." });
  }
  if (!ai || !isGeminiConfigured()) {
    return res.status(503).json({ error: "Server TTS unavailable without API key." });
  }
  const cleanText = text.replace(/[*_`#🚨💚⚠️❌🟡🟢\[\]]/g, " ").replace(/\s+/g, " ").trim().slice(0, 2e3);
  const langLabels = {
    pidgin: "Nigerian Pidgin English",
    english: "Nigerian English",
    hausa: "Hausa",
    yoruba: "Yoruba",
    igbo: "Igbo"
  };
  try {
    const ttsPromise = ai.models.generateContent({
      model: "gemini-3.8-flash-lite-tts",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `Read aloud warmly and clearly in ${langLabels[targetLang]}: ${cleanText}`
            }
          ]
        }
      ],
      config: {
        responseModalities: ["AUDIO"],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: "Kore" }
          }
        }
      }
    });
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("TTS generation timed out")), 9e3);
    });
    const response = await Promise.race([ttsPromise, timeoutPromise]);
    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) {
      return res.status(502).json({ error: "No audio generated." });
    }
    return res.json({
      audioBase64: base64Audio,
      mimeType: "audio/wav"
    });
  } catch (error) {
    console.error(`TTS error (${targetLang}):`, error?.message || error);
    return res.status(503).json({ error: "TTS failed, please use browser speech fallback." });
  }
});
app.post("/api/transcribe", async (req, res) => {
  const audioBase64 = typeof req.body?.audioBase64 === "string" ? req.body.audioBase64 : "";
  const mimeType = typeof req.body?.mimeType === "string" ? req.body.mimeType : "audio/webm";
  const hintLang = getTargetLanguage(req.body?.language);
  if (!audioBase64) {
    return res.status(400).json({ error: "Audio data is required." });
  }
  if (!ai || !isGeminiConfigured()) {
    return res.status(503).json({ error: "Server voice transcription unavailable without API key." });
  }
  const cleanMimeType = mimeType.split(";")[0] || "audio/webm";
  const audioPart = {
    inlineData: {
      mimeType: cleanMimeType,
      data: audioBase64
    }
  };
  let transcribedText = "";
  let detectedLanguage = hintLang;
  let attempt1ErrMsg = "";
  try {
    const transcribePromise = ai.models.generateContent({
      model: "gemini-3.5-transcribe",
      contents: [
        {
          role: "user",
          parts: [
            audioPart,
            {
              text: "Transcribe this audio verbatim."
            }
          ]
        }
      ]
    });
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("gemini-3.5-transcribe timed out")), 1e4);
    });
    const response = await Promise.race([transcribePromise, timeoutPromise]);
    transcribedText = (response.text || "").trim();
    if (!transcribedText) {
      attempt1ErrMsg = `empty_text candidates=${JSON.stringify(response.candidates?.[0]?.finishReason || "none")}`;
    }
  } catch (err) {
    attempt1ErrMsg = `${err?.status || ""} ${err?.message || err}`.trim();
    console.warn(`gemini-3.5-transcribe fallback trigger (${hintLang}):`, attempt1ErrMsg);
  }
  if (!transcribedText) {
    try {
      const flashPromise = ai.models.generateContent({
        model: "gemini-3.8-flash",
        contents: [
          {
            role: "user",
            parts: [
              audioPart,
              {
                text: `Listen carefully to this patient voice recording from Nigeria (UI hint language: ${hintLang}). Transcribe verbatim what the speaker said in its original spoken language (do NOT translate to English if they spoke Hausa, Yoruba, Igbo, or Pidgin), and identify which supported language they spoke: "pidgin", "english", "hausa", "yoruba", or "igbo".`
              }
            ]
          }
        ],
        config: {
          thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              text: {
                type: Type.STRING,
                description: "Verbatim transcription in the exact spoken language."
              },
              detectedLanguage: {
                type: Type.STRING,
                enum: ["pidgin", "english", "hausa", "yoruba", "igbo"],
                description: "The language spoken in the recording."
              }
            },
            required: ["text", "detectedLanguage"]
          }
        }
      });
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error("gemini-3.8-flash transcribe timed out")), 14e3);
      });
      const flashRes = await Promise.race([flashPromise, timeoutPromise]);
      const parsed = JSON.parse((flashRes.text || "{}").trim());
      if (typeof parsed.text === "string") {
        transcribedText = parsed.text.trim();
      }
      if (parsed.detectedLanguage) {
        detectedLanguage = getTargetLanguage(parsed.detectedLanguage);
      }
    } catch (fallbackErr) {
      const attempt2Msg = `${fallbackErr?.status || ""} ${fallbackErr?.message || fallbackErr}`.trim();
      console.warn(
        `gemini-3.8-flash transcribe fallback trigger (${hintLang}) | attempt1=${attempt1ErrMsg} | attempt2=${attempt2Msg}`
      );
      try {
        const litePromise = ai.models.generateContent({
          model: "gemini-3.1-flash-lite",
          contents: [
            {
              role: "user",
              parts: [
                audioPart,
                {
                  text: `Transcribe this Nigerian healthcare voice recording verbatim in its spoken language and detect the language as one of ["pidgin", "english", "hausa", "yoruba", "igbo"].`
                }
              ]
            }
          ],
          config: {
            thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
            responseMimeType: "application/json",
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING },
                detectedLanguage: {
                  type: Type.STRING,
                  enum: ["pidgin", "english", "hausa", "yoruba", "igbo"]
                }
              },
              required: ["text", "detectedLanguage"]
            }
          }
        });
        const liteRes = await Promise.race([
          litePromise,
          new Promise((_, reject) => setTimeout(() => reject(new Error("flash-lite timeout")), 1e4))
        ]);
        const parsedLite = JSON.parse((liteRes.text || "{}").trim());
        if (typeof parsedLite.text === "string") {
          transcribedText = parsedLite.text.trim();
        }
        if (parsedLite.detectedLanguage) {
          detectedLanguage = getTargetLanguage(parsedLite.detectedLanguage);
        }
      } catch (liteErr) {
        console.error(
          `All transcription attempts failed (${hintLang}):`,
          liteErr?.message || liteErr
        );
        return res.status(502).json({ error: "Voice transcription failed." });
      }
    }
  } else {
    const ruleLang = detectExplicitNigerianLanguage(transcribedText);
    if (ruleLang) {
      detectedLanguage = ruleLang;
    } else if (transcribedText.length >= 4) {
      try {
        const langCheck = await Promise.race([
          ai.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: `Classify the language of this Nigerian healthcare message strictly as one of [pidgin, english, hausa, yoruba, igbo] (if standard English with no Pidgin grammar, choose "english"; UI hint was "${hintLang}"):
"${transcribedText}"`,
            config: {
              thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL },
              responseMimeType: "application/json",
              responseSchema: {
                type: Type.OBJECT,
                properties: {
                  detectedLanguage: {
                    type: Type.STRING,
                    enum: ["pidgin", "english", "hausa", "yoruba", "igbo"]
                  }
                },
                required: ["detectedLanguage"]
              }
            }
          }),
          new Promise((_, reject) => setTimeout(() => reject(new Error("lang detect timeout")), 2500))
        ]);
        const parsedLang = JSON.parse((langCheck.text || "{}").trim());
        if (parsedLang.detectedLanguage) {
          detectedLanguage = getTargetLanguage(parsedLang.detectedLanguage);
        }
      } catch {
        detectedLanguage = resolveTargetLanguage(hintLang, transcribedText);
      }
    }
  }
  if (!transcribedText) {
    return res.status(422).json({ error: "Could not detect clear speech." });
  }
  return res.json({
    text: transcribedText,
    detectedLanguage
  });
});
async function startServer() {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (_req, res) => {
      res.sendFile(path.resolve(__dirname, "dist", "index.html"));
    });
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, host: "0.0.0.0", port: PORT },
      appType: "spa"
    });
    app.use(vite.middlewares);
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`NaijaHealth AI server (Multilingual Edition) running at http://0.0.0.0:${PORT}`);
  });
}
startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
