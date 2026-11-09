// server.ts
import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

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

// server.ts
dotenv.config();
var __filename = fileURLToPath(import.meta.url);
var __dirname = path.dirname(__filename);
var app = express();
var PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3e3;
app.use(express.json({ limit: "2mb" }));
var ai = null;
if (process.env.GEMINI_API_KEY) {
  ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build"
      }
    }
  });
}
function detectLocalRedFlags(text) {
  const lower = text.toLowerCase();
  const redFlagPatterns = [
    { pattern: /(sharp|crushing|severe|tight|pressure|heavy).*(chest|heart)/i, name: "Heavy Chest Pain / Heart Trouble" },
    { pattern: /(chest pain|pain in my chest|chest dey pain|chest dey tight|chest dey press|ciwon kirji|aya kirji|inu riro)/i, name: "Heavy Chest Pain" },
    { pattern: /(cannot breathe|severe difficulty breathing|shortness of breath|gasping for air|struggling to breathe|blue lips|breath seize|breath hang|breath dey seize|suffocat|kasa numfashi|kasa hema|kukuru eemi)/i, name: "Severe Breath Seize / Inability to Breathe" },
    { pattern: /(face droop|half body|one side.*(weak|paralyz)|slurred speech|sudden numbness|hand and leg no fit move|shanyewar jiki|apa kan ro)/i, name: "Sudden Half-Body Weakness / Stroke Signs" },
    { pattern: /(heavy bleeding|uncontrolled bleeding|bleeding continuously|spurting blood|coughing.*blood|vomiting.*blood|heavy blood|blood dey rush|zubar jini|eje pupo)/i, name: "Heavy Blood dey Rush / Uncontrolled Bleeding" },
    { pattern: /(convuls|seizure|fit|passed out|unconscious|fainted and not waking|coma|person faint|eye turn collapse|farfadiya|dandana|daku)/i, name: "Loss of Consciousness / Person Faint" },
    { pattern: /(stiff neck.*fever|cannot bend neck|high fever.*hallucinat|neck strong.*hot body|tashin hankali)/i, name: "Meningitis / Brain Infection Danger" }
  ];
  for (const item of redFlagPatterns) {
    if (item.pattern.test(lower)) {
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
  if (lower.includes("abuja") || lower.includes("fct")) return "FCT - Abuja";
  if (lower.includes("lag") || lower.includes("ikeja") || lower.includes("yaba") || lower.includes("lekki") || lower.includes("surulere") || lower.includes("ikorodu")) return "Lagos";
  if (lower.includes("ph") || lower.includes("port harcourt") || lower.includes("pitakwa")) return "Rivers";
  if (lower.includes("ibadan")) return "Oyo";
  if (lower.includes("onitsha") || lower.includes("awka") || lower.includes("nnewi")) return "Anambra";
  if (lower.includes("benin") || lower.includes("irrua")) return "Edo";
  if (lower.includes("zaria") || lower.includes("kaduna")) return "Kaduna";
  if (lower.includes("warri") || lower.includes("asaba")) return "Delta";
  if (lower.includes("aba") || lower.includes("umuahia")) return "Abia";
  if (lower.includes("jos")) return "Plateau";
  if (lower.includes("kano")) return "Kano";
  return void 0;
}
function buildFallbackTriage(message, stateName = "Lagos", language = "pidgin") {
  const redFlag = detectLocalRedFlags(message);
  const stateData = NIGERIAN_STATES_DATA[stateName] || NIGERIAN_STATES_DATA["Lagos"];
  const topFacilities = stateData.facilities.map((f) => `${f.name} (${f.city})`).slice(0, 3);
  let disclaimer = "\u26A0\uFE0F Abeg remember: I be NaijaHealth AI assistant o, I no be real medical doctor. If body no do you well or the matter tight, go meet doctor for hospital or call 112 sharp-sharp.";
  if (language === "english") {
    disclaimer = "\u26A0\uFE0F Medical Disclaimer: NaijaHealth AI is an informational triage support tool and does not provide formal medical diagnoses or prescriptions. In emergencies, visit the nearest hospital or call 112 immediately.";
  } else if (language === "hausa") {
    disclaimer = "\u26A0\uFE0F Tunatarwa: Ni mataimakin AI ne (NaijaHealth AI), ba likita na gaskiya ba. Idan jiki yayi tsanani, tafi asibiti kusa da kai ko kira 112.";
  } else if (language === "yoruba") {
    disclaimer = "\u26A0\uFE0F \xCCk\xECl\u1ECD\u0300: \xC8mi j\u1EB9\u0301 ol\xF9r\xE0nl\u1ECD\u0301w\u1ECD\u0301 AI, mi k\xEC\xED \u1E63e d\u1ECD\u0301k\xEDt\xE0 gidi. T\xED ara b\xE1 le koko, \u1EB9 l\u1ECD s\xED il\xE9-\xECw\xF2s\xE0n t\xE0b\xED k\xED \u1EB9 pe 112 l\u1EB9\u0301s\u1EB9\u0300k\u1EB9s\u1EB9\u0300.";
  } else if (language === "igbo") {
    disclaimer = "\u26A0\uFE0F R\u1ECBba ama: Ab\u1EE5 m onye inyeaka AI, ab\u1EE5gh\u1ECB m ezigbo d\u1ECDk\u1ECBta. \u1ECC b\u1EE5r\u1EE5 na ah\u1EE5 ad\u1ECBgh\u1ECB g\u1ECB mma nke ukwuu, gaa \u1EE5l\u1ECD \u1ECDgw\u1EE5 ma \u1ECD b\u1EE5 kp\u1ECD\u1ECD 112 ugbu a.";
  }
  if (redFlag.isRedFlag) {
    let actionPlan = `\u{1F6A8} EMERGENCY O! Abeg drop everything, no waste one second for house! Rush sharp-sharp go the nearest General Hospital or Emergency Trauma Centre for ${stateName} State now now!
Hospitals wey dey close to you:
` + topFacilities.map((f) => `\u2022 ${f}`).join("\n") + `

Call 112 (National Toll-Free line) or ${stateData.emergencyHotlines.join(", ")} sharp-sharp! No drink any medicine or concoction for house, hospital be the only answer now!`;
    if (language === "english") {
      actionPlan = `\u{1F6A8} RED-FLAG EMERGENCY: Please bypass all home remedies and go IMMEDIATELY to the nearest General Hospital or Emergency Department in ${stateName}.
Nearby health centres:
` + topFacilities.map((f) => `\u2022 ${f}`).join("\n") + `

Call 112 (National Emergency) or ${stateData.emergencyHotlines.join(", ")} immediately!`;
    } else if (language === "hausa") {
      actionPlan = `\u{1F6A8} GAGGAWA CE: Kada ka tsaya maganin gida! Yi maza-maza ka tafi Asibitin Gwamnati mafi kusa a jihar ${stateName} yanzu-yanzu!
Asibitocin da ke kusa da kai:
` + topFacilities.map((f) => `\u2022 ${f}`).join("\n") + `

Kira 112 (layin gaggawa na kasa) ba tare da bata lokaci ba!`;
    } else if (language === "yoruba") {
      actionPlan = `\u{1F6A8} P\xC0J\xC1W\xCCR\xCC: \u1EB8 m\xE1 \u1E63e o\xF2g\xF9n il\xE9 kankan! \u1EB8 y\xE1ra s\xE1r\xE9 l\u1ECD s\xED Il\xE9-\xECw\xF2s\xE0n \xCCj\u1ECDba t\xF3 s\xFAnm\u1ECD\u0301 y\xEDn j\xF9l\u1ECD n\xED \xCCp\xEDnl\u1EB9\u0300 ${stateName} l\u1EB9\u0301s\u1EB9\u0300k\u1EB9s\u1EB9\u0300!
\xC0w\u1ECDn Il\xE9-\xECw\xF2s\xE0n t\xF3 w\xE0 n\xEDt\xF2s\xED:
` + topFacilities.map((f) => `\u2022 ${f}`).join("\n") + `

\u1EB8 pe 112 l\u1EB9\u0301s\u1EB9\u0300k\u1EB9s\u1EB9\u0300!`;
    } else if (language === "igbo") {
      actionPlan = `\u{1F6A8} MBEREDE: Emela \u1ECDgw\u1EE5 \u1EE5l\u1ECD \u1ECD b\u1EE5la! Gbaa \u1ECDs\u1ECD gaa na General Hospital kacha nso na steeti ${stateName} ugbu a!
\u1EE4l\u1ECD \u1ECDgw\u1EE5 nd\u1ECB d\u1ECB g\u1ECB nso:
` + topFacilities.map((f) => `\u2022 ${f}`).join("\n") + `

Kp\u1ECD\u1ECD 112 ozugbo!`;
    }
    return {
      language,
      urgencyLevel: "emergency",
      isRedFlag: true,
      emergencyWarning: `\u{1F6A8} DANGER DEY: Wetin you talk (${redFlag.matchedSymptom || "this acute symptom"}) na dangerous red-flag emergency sign!`,
      empathyNote: `Ayaah! Sorry o, stay calm and rush go hospital now now!`,
      wetinFitDeyHappen: `This kind symptom fit mean say heart, breath, or serious blood condition dey happen wey doctor must check with machine immediately.`,
      wetinYouFitDoForHouse: `NO DO ANY HOUSE TREATMENT! All home remedies cancel. Loosen tight cloth, sit down calmly, and let somebody carry you run go hospital now.`,
      nextStep: actionPlan,
      potentialCauses: `Severe acute emergency requiring urgent hospital evaluation.`,
      homeManagement: `Bypassed for emergency. Rush to hospital.`,
      actionPlan,
      recommendedFacilities: topFacilities,
      detectedLocation: stateName,
      clarifyingQuestions: [],
      fullFormattedResponse: `\u{1F6A8} EMERGENCY ALERT!

**[Wetin Fit Dey Happen]**
Acute red-flag emergency requiring hospital resuscitation and monitoring.

**[Wetin You Fit Do For House]**
CANCELLED. Rush to emergency unit.

**[Next Step]**
${actionPlan}

${disclaimer}`,
      disclaimer
    };
  }
  const lower = message.toLowerCase();
  let wetinFitDeyHappen = "";
  let wetinYouFitDoForHouse = "";
  let nextStep = "";
  let clarifyingQuestions = [];
  if (lower.includes("fever") || lower.includes("hot body") || lower.includes("chills") || lower.includes("bitter") || lower.includes("zazzabi") || lower.includes("iba")) {
    if (language === "english") {
      wetinFitDeyHappen = `High fever with body pain and bitter taste is commonly caused in Nigeria by Malaria (transmitted by female Anopheles mosquitoes) or Typhoid fever. It can also be viral flu.`;
      wetinYouFitDoForHouse = `1. Tepid sponging with lukewarm water (never cold water or alcohol/spirit) to bring fever down.
2. Drink plenty of clean boiled water or fresh juice.
3. Sleep under an insecticide-treated mosquito net.
4. Paracetamol can be taken according to package directions for relief.`;
      nextStep = `Get a rapid malaria test (mRDT) or typhoid test at a nearby certified medical laboratory or clinic before taking antimalarials. Visit ${topFacilities[0]} if fever persists past 48 hours or vomiting occurs.`;
      clarifyingQuestions = [
        "How many days have you had this fever?",
        "Are you experiencing any vomiting or tea-coloured urine?"
      ];
    } else if (language === "hausa") {
      wetinFitDeyHappen = `Sannu! Zazzabi mai zafi tare da ciwon jiki yawanci alamomin cutar zazzabin cizon sauro (Malaria) ne ko Typhoid daga ruwa ko abinci maras tsabta.`;
      wetinYouFitDoForHouse = `1. Yi amfani da kyallen da aka jika a ruwa mara sanyi don goge goshi da jiki.
2. Sha ruwa mai tsabta sosai.
3. Kwana a cikin gidan sauro mai magani.`;
      nextStep = `Je cibiyar lafiya mafi kusa don gwajin Malaria (mRDT) kafin shan magani. Idan zazzabi ya wuce kwanaki biyu, tafi ${topFacilities[0]} nan take.`;
      clarifyingQuestions = ["Kwana nawa jiki ke zafi?", "Akwai amai ko canjin launin fitsari?"];
    } else if (language === "yoruba") {
      wetinFitDeyHappen = `P\u1EB9l\u1EB9 o! \xCCb\xE0 gb\xEDgb\xF3n\xE1 p\u1EB9\u0300l\xFA ara r\xEDro s\xE1b\xE0 m\xE1a \u0144 j\u1EB9\u0301 \xE0m\xEC Iba (Malaria) l\xE1ti ara \u1EB9\u0300f\u1ECDn t\xE0b\xED Iba T\xE0\xEDf\u1ECD\u0301\u1ECD\u0300d\xF9.`;
      wetinYouFitDoForHouse = `1. Fi a\u1E63\u1ECD t\xFAt\xF9 (omi l\xE1s\xE1n, k\xEC\xED \u1E63e omi y\xECny\xEDn) nu iwaju ati ara lati dinku igbona ara.
2. Mu omi mim\u1ECD ti a b\u1ECD daradara.
3. Sun lab\u1EB9 \xE0w\u1ECD\u0300n \u1EB9\u0300f\u1ECDn.`;
      nextStep = `L\u1ECD \u1E63e \xE0y\u1EB9\u0300w\xF2 \u1EB9\u0300j\u1EB9\u0300 fun iba (RDT) ni ile-iwosan to wa nitosi. Ti iba ba k\u1ECDja \u1ECDj\u1ECD meji, l\u1ECD si ${topFacilities[0]} l\u1EB9s\u1EB9k\u1EB9s\u1EB9.`;
      clarifyingQuestions = ["\u1ECCj\u1ECD\u0301 m\xE9l\xF2\xF3 ni ara ti \u0144 gb\xF3n\xE1?", "\u1E62\xE9 o \u0144 b\xEC t\xE0b\xED t\u1ECD\u0301 y\xED pad\xE0 s\xED \xE0w\u1ECD\u0300 tii?"];
    } else {
      wetinFitDeyHappen = `Pele o! This kind hot body, body pain, and mouth wey dey bitter na normal sign of Malaria (from female Anopheles mosquito bite) or Typhoid fever (from dirty water or food). E fit still be common flu.`;
      wetinYouFitDoForHouse = `1. Use clean towel and ordinary lukewarm water (no use cold water or spirit) clean the forehead, armpit, and neck make hotness come down.
2. Drink plenty clean boiled water or fresh orange juice.
3. Sleep under insecticide-treated mosquito net.
4. Paracetamol fit calm the body pain.`;
      nextStep = `Waka go do Malaria RDT test for nearby clinic before you buy malaria medicine. If the fever pass 2 days, or you dey vomit everything, waka go ${topFacilities[0]} sharp-sharp.`;
      clarifyingQuestions = [
        "Pele, how many days the hot body and body pain don dey do you?",
        "You dey vomit or your urine dey yellow/brown like tea?"
      ];
    }
  } else if (lower.includes("purg") || lower.includes("stool") || lower.includes("watery") || lower.includes("belly") || lower.includes("zawo") || lower.includes("igbe")) {
    if (language === "english") {
      wetinFitDeyHappen = `Stomach cramping and watery stool (purging) indicates acute gastroenteritis, often caused by contaminated food, bacteria, or seasonal cholera.`;
      wetinYouFitDoForHouse = `1. Prepare Oral Rehydration Salt (ORS / Salt-Sugar Solution): Mix 1 level teaspoon salt + 10 level teaspoons sugar (or 5 cubes) in 1 litre clean boiled water.
2. Drink one cup after every loose stool.
3. Eat light bland foods like rice, pap (akamu), or bananas.
4. Avoid raw vegetables, street food, and sugary soda.`;
      nextStep = `Visit ${topFacilities[0]} or your nearest clinic if purging exceeds 5 times in 24 hours, if there is blood in stool, or if you feel dizzy upon standing.`;
      clarifyingQuestions = ["Is there any blood in the stool?", "Can you hold fluids without vomiting?"];
    } else if (language === "hausa") {
      wetinFitDeyHappen = `Zawo da ciwon ciki na faruwa ne idan kwayoyin cuta sun shiga ciki ta hanyar abinci ko ruwa maras tsabta.`;
      wetinYouFitDoForHouse = `1. Hada ruwan gishiri da sukari (ORS): Karamin cokali daya na gishiri da cokula goma na sukari a cikin lita daya ta ruwa mai tsabta.
2. Sha kofi daya a duk lokacin da aka yi zawo.
3. Ci abinci mai laushi kamar koko.`;
      nextStep = `Idan zawo ya wuce sau 5 a rana daya ko akwai jini a bayan gida, tafi ${topFacilities[0]} ba tare da bata lokaci ba.`;
      clarifyingQuestions = ["Akwai jini a cikin zawon?", "Kana iya rike ruwa a ciki ba tare da amai ba?"];
    } else if (language === "yoruba") {
      wetinFitDeyHappen = `\xC0r\xF9n gbuuru (\xECgb\u1EB9\u0301 gbuuru) ati inu r\xEDrun s\xE1b\xE0 m\xE1a \u0144 w\xE1 l\xE1ti ara o\xFAnj\u1EB9 t\xE0b\xED omi t\xED k\xF2 m\u1ECD\u0301.`;
      wetinYouFitDoForHouse = `1. Mu omi iy\u1ECD ati suga (ORS): Sibi iy\u1ECD kekere 1 ati sibi suga 10 sinu lita omi mim\u1ECD kan.
2. Mu ife kan l\u1EB9hin igb\u1EB9 k\u1ECD\u1ECDkan.
3. J\u1EB9 ounj\u1EB9 f\u1EB9l\u1EB9f\u1EB9l\u1EB9 bii \xE8k\u1ECD (\xF2g\xEC).`;
      nextStep = `T\xED \xECgb\u1EB9\u0301 gbuuru b\xE1 ju \u1EB9\u0300\u1EB9\u0300m\u1EB9\u0301f\xE0 l\u1ECD l\xF3j\xFAm\u1ECD\u0301 kan t\xE0b\xED \u1EB9\u0300j\u1EB9\u0300 w\xE0 n\xEDn\xFA r\u1EB9\u0300, \u1EB9 l\u1ECD s\xED ${topFacilities[0]} k\xED\xE1.`;
      clarifyingQuestions = ["\u1E62\xE9 \u1EB9\u0300j\u1EB9\u0300 w\xE0 n\xEDn\xFA \xECgb\u1EB9\u0301 n\xE1\xE0?", "\u1E62\xE9 o l\xE8 mu omi l\xE1\xEC b\xEC?"];
    } else {
      wetinFitDeyHappen = `Ayaah, sorry o! When belle dey bite and person dey purge watery stool, e fit be say dirty germ, bad food, or contaminated water don enter belly (gastroenteritis). During rainy season, e fit even be cholera warning.`;
      wetinYouFitDoForHouse = `1. Mix Salt-Sugar Solution (Home ORS): Measure 1 clean bottle of water (or 2 pure water sachets), put 1 level small spoon of salt plus 10 level small spoon of sugar (or 5 cubes). Turn am well make e melt.
2. Drink one full cup every time you go toilet purge.
3. Eat soft pap (akamu) or boiled rice in small quantity.
4. Avoid soft drinks or roadside food now.`;
      nextStep = `If the purging pass 5 to 6 times inside one day, or you see blood inside the stool, move go ${topFacilities[0]} or any clinic close to you immediately.`;
      clarifyingQuestions = [
        "Ehya, blood dey inside the watery stool?",
        "You fit hold water or ORS for stomach, abi you dey vomit am out?"
      ];
    }
  } else {
    wetinFitDeyHappen = `Ehya, pele o! The way your body dey do you fit be from heavy stress, body tiredness, or early sign say infection or malaria dey try enter body.`;
    wetinYouFitDoForHouse = `1. Rest well-well for room wey breeze dey blow.
2. Drink plenty clean water make your system cool down.
3. Watch your body make you see if hot body or headache go join am.`;
    nextStep = `If the body pain or weakness no gree stop after 24 to 48 hours, waka go see nurse or doctor for ${topFacilities[0]} or your nearest General Hospital.`;
    clarifyingQuestions = [
      "How long this body weakness or pain don start?",
      "You get any condition before, like blood pressure, ulcer, or sickle cell?"
    ];
  }
  return {
    language,
    urgencyLevel: "urgent",
    isRedFlag: false,
    empathyNote: language === "hausa" ? "Sannu! Allah Ya sauwake." : language === "yoruba" ? "P\u1EB9l\u1EB9 o! \u1EB8 j\u1EB9\u0301 k'\xE1 b\xF3j\xFAt\xF3 e." : language === "english" ? "So sorry to hear about this." : "Pele o! Take am easy, make I break down wetin you fit do.",
    wetinFitDeyHappen,
    wetinYouFitDoForHouse,
    nextStep,
    potentialCauses: wetinFitDeyHappen,
    homeManagement: wetinYouFitDoForHouse,
    actionPlan: nextStep,
    clarifyingQuestions,
    recommendedFacilities: topFacilities,
    detectedLocation: stateName,
    fullFormattedResponse: `\u{1F49A}

**[Wetin Fit Dey Happen]**
${wetinFitDeyHappen}

**[Wetin You Fit Do For House]**
${wetinYouFitDoForHouse}

**[Next Step]**
${nextStep}

${disclaimer}`,
    disclaimer
  };
}
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    service: "NaijaHealth AI Medical Triage Service (Multilingual Edition)",
    hasApiKey: !!process.env.GEMINI_API_KEY,
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
  try {
    const { message, conversationHistory = [], userLocation, language = "pidgin" } = req.body;
    if (!message || typeof message !== "string" || !message.trim()) {
      return res.status(400).json({ error: "Symptom description message is required." });
    }
    const targetLang = ["pidgin", "english", "hausa", "yoruba", "igbo"].includes(language) ? language : "pidgin";
    const immediateSafetyCheck = detectLocalRedFlags(message);
    const detectedFromMsg = detectStateFromText(message);
    const targetState = userLocation?.state || detectedFromMsg || "Lagos";
    const stateData = NIGERIAN_STATES_DATA[targetState] || NIGERIAN_STATES_DATA["Lagos"];
    const facilitiesList = stateData.facilities.map((f) => `${f.name} inside ${f.city}`).join(", ");
    if (immediateSafetyCheck.isRedFlag) {
      console.log("Immediate red-flag detected. Dispatching emergency triage without waiting.");
      const emergencyResult = buildFallbackTriage(message, targetState, targetLang);
      return res.json(emergencyResult);
    }
    const isApiKeyValid = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== "MY_GEMINI_API_KEY";
    if (!ai || !isApiKeyValid) {
      console.log(`Using rule-based triage fallback in ${targetLang} (API key unconfigured).`);
      const fallbackResult = buildFallbackTriage(message, targetState, targetLang);
      return res.json(fallbackResult);
    }
    let langInstruction = `You MUST reply strictly and entirely in fluent, natural Nigerian Pidgin English. Use comforting words like "Ayaah", "Pele", "Sorry o". Section titles: [Wetin Fit Dey Happen], [Wetin You Fit Do For House], [Next Step].`;
    if (targetLang === "english") {
      langInstruction = `You MUST reply in simple, clear, empathetic everyday English. Avoid complex medical jargon so ordinary people easily understand. Section titles: [Potential Causes], [Home Management], [Action Plan].`;
    } else if (targetLang === "hausa") {
      langInstruction = `You MUST reply strictly and entirely in natural, everyday Hausa (Harshen Hausa). Use comforting words like "Sannu", "Allah Ya sauwake". Section titles: [Abubuwan Da Ka Iya Kawo Shi], [Maganin Gida / Abinda Zaka Iya Yi A Gida], [Mataki Na Gaba / Asibiti].`;
    } else if (targetLang === "yoruba") {
      langInstruction = `You MUST reply strictly and entirely in natural, everyday Yoruba (\xC8d\xE8 Yor\xF9b\xE1). Use comforting words like "P\u1EB9l\u1EB9 o", "\u1EB8 m\xE1 binu". Section titles: [Kini O Le Fa E], [Ohun Ti O Le Se Ni Ile], [Igbese To Kan / Ile Iwosan].`;
    } else if (targetLang === "igbo") {
      langInstruction = `You MUST reply strictly and entirely in natural, everyday Igbo (As\u1EE5s\u1EE5 Igbo). Use comforting words like "Ndo", "Ndewo". Section titles: [Ihe Nwere Ike Na-ebute Ya], [Ihe I Nwere Ike Ime n'Ulo], [Ihe I Ga-eme Na-eson\u1EE5 / Hospital].`;
    }
    const systemInstruction = `You are "NaijaHealth AI", an empathetic medical triage assistant inside WhatsApp and conversational chat, made specially to support communities across Nigeria.
Selected Language: ${targetLang.toUpperCase()}.
${langInstruction}

HOW YOU GO DEY TALK:
- Clear your mind of big big medical grammar and medical English jargon. Explain everything break-down style make ordinary person for market understand easily.
- Show serious empathy and bedside warmth.
- If watery stool or diarrhea, mention "purging".
- If fever, explain hot body and malaria (mosquito bites) / typhoid awareness.
- If dehydration, give exact Salt-Sugar Solution (ORS) ratio: 1 level small tea-spoon salt + 10 level small tea-spoon sugar (or 5 sugar cubes) in 1 clean bottle or 2 pure water sachets (1 litre).

YOUR STRICT RESPONSE STRUCTURE:
1. [Wetin Fit Dey Happen] / [Potential Causes]: Explain symptoms softly.
2. [Wetin You Fit Do For House] / [Home Management]: Safe first-aid and home steps. Warn against unprescribed antibiotics or toxic concoctions.
3. [Next Step] / [Action Plan]: Exact conditions and facilities to visit in their state (${targetState}) such as: ${facilitiesList}.

SAFETY RULES (NO DEY JOKE WITH THIS ONE):
- Continuous reminder say you be AI assistant, not a real doctor.
- IF RED-FLAG EMERGENCY (heavy chest pain, breath seize/hang, sudden stroke signs, heavy blood rush, person faint/unconscious):
  * DROP ALL HOME REMEDY TALK COMPLETELY!
  * Instruct them aggressively to rush to the nearest emergency ward in ${targetState} immediately!
  * Set isRedFlag to true and urgencyLevel to "emergency".
  * Mention National 112, NCDC 6232, and state hotlines.`;
    const promptText = `User Location Context: Patient is in ${targetState} State, Nigeria. Language requested: ${targetLang}.
Previous Chat History:
${conversationHistory.map((m) => `${m.role === "user" ? "Patient" : "NaijaHealth AI"}: ${m.parts?.[0]?.text || m.text || ""}`).join("\n")}

Patient Symptoms:
"${message}"

Evaluate this patient's symptoms thoroughly in ${targetLang} following the 3-part triage structure.`;
    const generatePromise = ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: promptText,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isRedFlag: {
              type: Type.BOOLEAN,
              description: "True if symptoms describe dangerous red flags like chest pain, breath seize, sudden stroke weakness, heavy bleeding, or unconsciousness."
            },
            urgencyLevel: {
              type: Type.STRING,
              enum: ["emergency", "urgent", "routine"],
              description: "Triage priority level"
            },
            empathyNote: {
              type: Type.STRING,
              description: "Warm comforting opening in chosen language"
            },
            emergencyWarning: {
              type: Type.STRING,
              description: "Direct aggressive alert in chosen language if red-flag is triggered, else empty"
            },
            wetinFitDeyHappen: {
              type: Type.STRING,
              description: "Part 1: Simple breakdown in chosen language without big medical grammar"
            },
            wetinYouFitDoForHouse: {
              type: Type.STRING,
              description: "Part 2: Safe first-aid and home steps in chosen language. MUST be empty or say home remedy cancelled if isRedFlag is true."
            },
            nextStep: {
              type: Type.STRING,
              description: "Part 3: When and which hospital to visit inside their state in chosen language"
            },
            clarifyingQuestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "1 to 2 short clarifying questions in chosen language if details are missing"
            },
            recommendedFacilities: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Names of recommended hospitals in their state"
            },
            detectedLocation: {
              type: Type.STRING,
              description: "State or city inside Nigeria"
            },
            fullFormattedResponse: {
              type: Type.STRING,
              description: "Complete formatted response strictly in the chosen language with the 3 parts and disclaimer"
            },
            disclaimer: {
              type: Type.STRING,
              description: "Disclaimer in the chosen language"
            }
          },
          required: ["isRedFlag", "urgencyLevel", "wetinFitDeyHappen", "wetinYouFitDoForHouse", "nextStep", "fullFormattedResponse", "disclaimer"]
        }
      }
    });
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error("AI response timed out")), 7e3);
    });
    const response = await Promise.race([generatePromise, timeoutPromise]);
    const responseText = response.text;
    if (!responseText) {
      throw new Error("Empty response received from Gemini.");
    }
    const parsedData = JSON.parse(responseText);
    parsedData.language = targetLang;
    parsedData.potentialCauses = parsedData.wetinFitDeyHappen;
    parsedData.homeManagement = parsedData.wetinYouFitDoForHouse;
    parsedData.actionPlan = parsedData.nextStep;
    if (immediateSafetyCheck.isRedFlag) {
      parsedData.isRedFlag = true;
      parsedData.urgencyLevel = "emergency";
      parsedData.wetinYouFitDoForHouse = "All house remedies cancelled! Rush sharp-sharp go emergency unit for hospital.";
      parsedData.homeManagement = parsedData.wetinYouFitDoForHouse;
    }
    if (!parsedData.detectedLocation) {
      parsedData.detectedLocation = targetState;
    }
    return res.json(parsedData);
  } catch (error) {
    console.error("Error during triage processing:", error);
    const fallbackResult = buildFallbackTriage(req.body.message || "", req.body.userLocation?.state || "Lagos", req.body.language || "pidgin");
    return res.json(fallbackResult);
  }
});
async function startServer() {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.resolve(__dirname, "dist")));
    app.get("*", (req, res) => {
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
