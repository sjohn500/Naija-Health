import { StateHealthInfo } from '../types/triage';

export const NATIONAL_EMERGENCY_NUMBERS = [
  { label: 'National Emergency Toll-Free', number: '112', description: 'Federal emergency response (Police, Ambulance, Fire)' },
  { label: 'NCDC Toll-Free Helpline', number: '6232', description: 'Nigeria Centre for Disease Control & Prevention' },
  { label: 'Lagos State Emergency', number: '767', description: 'Lagos State Emergency Management (LASEMA)' },
  { label: 'Nigerian Red Cross Society', number: '0803 123 0315', description: 'First aid, disaster & casualty response' },
  { label: 'National Blood Service Agency', number: '0907 888 8802', description: 'Emergency blood donation & access' }
];

export const RED_FLAG_SYMPTOMS = [
  {
    title: 'Severe / Sharp Chest Pain',
    description: 'Crushing sensation, pain radiating to left arm/jaw, sweating, or collapsing.',
    action: 'Suspected heart event. Rush to nearest Emergency Room immediately.'
  },
  {
    title: 'Severe Difficulty Breathing',
    description: 'Gasping, blue lips/fingertips, unable to speak in full sentences, chest retractions.',
    action: 'Critical oxygen deficit. Seek emergency medical care immediately.'
  },
  {
    title: 'Sudden Half-Body Weakness or Facial Droop',
    description: 'Arm weakness, slurred speech, sudden confusion, or loss of balance (FAST signs).',
    action: 'Suspected stroke. Every minute counts — get to a tertiary/general hospital NOW.'
  },
  {
    title: 'Heavy Uncontrolled Bleeding',
    description: 'Pumping/spurting blood, deep wounds not stopping after 10 minutes of direct pressure.',
    action: 'Risk of hypovolemic shock. Apply firm direct pressure with clean cloth and rush to hospital.'
  },
  {
    title: 'Loss of Consciousness / Unresponsiveness',
    description: 'Cannot be woken up, repeated convulsions/seizures, or severe lethargy in baby.',
    action: 'Emergency. Place in recovery position if breathing; rush to nearest hospital.'
  },
  {
    title: 'Severe Dehydration with Purging & Vomiting',
    description: 'Sunken eyes, no urine for hours, extreme thirst, wrinkly skin tenting (Cholera alert).',
    action: 'Emergency dehydration. Give ORS immediately while transporting to health facility.'
  },
  {
    title: 'Pregnancy Danger Signs (Bleeding, Severe Headache, Blurred Vision)',
    description: 'Vaginal bleeding, water breaking early, face/hand swelling with headache/blurry vision, convulsions, or baby stopped moving.',
    action: 'Obstetric emergency. Do NOT take herbs or home painkillers — go straight to Maternity Emergency Ward.'
  }
];

export const NIGERIAN_STATES_DATA: Record<string, StateHealthInfo> = {
  'Abia': {
    name: 'Abia',
    capital: 'Umuahia',
    emergencyHotlines: ['112', '0803 543 5432'],
    facilities: [
      { name: 'Federal Medical Centre (FMC) Umuahia', type: 'Federal Medical Centre', city: 'Umuahia', state: 'Abia', address: 'Bende Road, Umuahia' },
      { name: 'Abia State University Teaching Hospital (ABSUTH)', type: 'Teaching Hospital', city: 'Aba', state: 'Abia', address: 'Aba-Owerri Road, Aba' },
      { name: 'General Hospital Aba', type: 'General Hospital', city: 'Aba', state: 'Abia' }
    ]
  },
  'Adamawa': {
    name: 'Adamawa',
    capital: 'Yola',
    emergencyHotlines: ['112', '0808 967 5333'],
    facilities: [
      { name: 'Modibbo Adama University Teaching Hospital (MAUTH)', type: 'Teaching Hospital', city: 'Yola', state: 'Adamawa' },
      { name: 'Specialist Hospital Yola', type: 'Specialist Hospital', city: 'Yola', state: 'Adamawa' },
      { name: 'General Hospital Mubi', type: 'General Hospital', city: 'Mubi', state: 'Adamawa' }
    ]
  },
  'Akwa Ibom': {
    name: 'Akwa Ibom',
    capital: 'Uyo',
    emergencyHotlines: ['112', '0803 899 4299'],
    facilities: [
      { name: 'University of Uyo Teaching Hospital (UUTH)', type: 'Teaching Hospital', city: 'Uyo', state: 'Akwa Ibom', address: 'Abak Road, Uyo' },
      { name: 'General Hospital Ikot Ekpene', type: 'General Hospital', city: 'Ikot Ekpene', state: 'Akwa Ibom' },
      { name: 'Immanuel General Hospital Eket', type: 'General Hospital', city: 'Eket', state: 'Akwa Ibom' }
    ]
  },
  'Anambra': {
    name: 'Anambra',
    capital: 'Awka',
    emergencyHotlines: ['112', '0703 989 6443'],
    facilities: [
      { name: 'Nnamdi Azikiwe University Teaching Hospital (NAUTH)', type: 'Teaching Hospital', city: 'Nnewi', state: 'Anambra' },
      { name: 'Chukwuemeka Odumegwu Ojukwu University Teaching Hospital (COOUTH)', type: 'Teaching Hospital', city: 'Awka', state: 'Anambra', address: 'Amaku, Awka' },
      { name: 'General Hospital Onitsha', type: 'General Hospital', city: 'Onitsha', state: 'Anambra' }
    ]
  },
  'Bauchi': {
    name: 'Bauchi',
    capital: 'Bauchi',
    emergencyHotlines: ['112', '0803 836 2926'],
    facilities: [
      { name: 'Abubakar Tafawa Balewa University Teaching Hospital (ATBUTH)', type: 'Teaching Hospital', city: 'Bauchi', state: 'Bauchi', address: 'Hospital Road, Bauchi' },
      { name: 'Specialist Hospital Bauchi', type: 'Specialist Hospital', city: 'Bauchi', state: 'Bauchi' },
      { name: 'General Hospital Azare', type: 'General Hospital', city: 'Azare', state: 'Bauchi' }
    ]
  },
  'Bayelsa': {
    name: 'Bayelsa',
    capital: 'Yenagoa',
    emergencyHotlines: ['112', '0803 921 3998'],
    facilities: [
      { name: 'Federal Medical Centre (FMC) Yenagoa', type: 'Federal Medical Centre', city: 'Yenagoa', state: 'Bayelsa' },
      { name: 'Niger Delta University Teaching Hospital (NDUTH)', type: 'Teaching Hospital', city: 'Okolobiri', state: 'Bayelsa' },
      { name: 'Dieteko Koki Memorial Hospital', type: 'General Hospital', city: 'Yenagoa', state: 'Bayelsa' }
    ]
  },
  'Benue': {
    name: 'Benue',
    capital: 'Makurdi',
    emergencyHotlines: ['112', '0803 389 4212'],
    facilities: [
      { name: 'Benue State University Teaching Hospital (BSUTH)', type: 'Teaching Hospital', city: 'Makurdi', state: 'Benue' },
      { name: 'Federal Medical Centre (FMC) Makurdi', type: 'Federal Medical Centre', city: 'Makurdi', state: 'Benue' },
      { name: 'General Hospital Gboko', type: 'General Hospital', city: 'Gboko', state: 'Benue' }
    ]
  },
  'Borno': {
    name: 'Borno',
    capital: 'Maiduguri',
    emergencyHotlines: ['112', '0806 840 4281'],
    facilities: [
      { name: 'University of Maiduguri Teaching Hospital (UMTH)', type: 'Teaching Hospital', city: 'Maiduguri', state: 'Borno', address: 'Bama Road, Maiduguri' },
      { name: 'State Specialist Hospital Maiduguri', type: 'Specialist Hospital', city: 'Maiduguri', state: 'Borno' },
      { name: 'General Hospital Biu', type: 'General Hospital', city: 'Biu', state: 'Borno' }
    ]
  },
  'Cross River': {
    name: 'Cross River',
    capital: 'Calabar',
    emergencyHotlines: ['112', '0803 869 4140'],
    facilities: [
      { name: 'University of Calabar Teaching Hospital (UCTH)', type: 'Teaching Hospital', city: 'Calabar', state: 'Cross River' },
      { name: 'General Hospital Calabar (Mary Slessor)', type: 'General Hospital', city: 'Calabar', state: 'Cross River' },
      { name: 'General Hospital Ogoja', type: 'General Hospital', city: 'Ogoja', state: 'Cross River' }
    ]
  },
  'Delta': {
    name: 'Delta',
    capital: 'Asaba',
    emergencyHotlines: ['112', '0803 123 7890'],
    facilities: [
      { name: 'Federal Medical Centre (FMC) Asaba', type: 'Federal Medical Centre', city: 'Asaba', state: 'Delta' },
      { name: 'Delta State University Teaching Hospital (DELSUTH)', type: 'Teaching Hospital', city: 'Oghara', state: 'Delta' },
      { name: 'Central Hospital Warri', type: 'General Hospital', city: 'Warri', state: 'Delta' }
    ]
  },
  'Ebonyi': {
    name: 'Ebonyi',
    capital: 'Abakaliki',
    emergencyHotlines: ['112', '0803 762 1089'],
    facilities: [
      { name: 'Alex Ekwueme Federal University Teaching Hospital (AE-FUTHA)', type: 'Teaching Hospital', city: 'Abakaliki', state: 'Ebonyi' },
      { name: 'National Obstetric Fistula Centre', type: 'Specialist Hospital', city: 'Abakaliki', state: 'Ebonyi' },
      { name: 'General Hospital Afikpo', type: 'General Hospital', city: 'Afikpo', state: 'Ebonyi' }
    ]
  },
  'Edo': {
    name: 'Edo',
    capital: 'Benin City',
    emergencyHotlines: ['112', '0803 333 4567'],
    facilities: [
      { name: 'University of Benin Teaching Hospital (UBTH)', type: 'Teaching Hospital', city: 'Benin City', state: 'Edo', address: 'Ugbowo, Benin City' },
      { name: 'Irrua Specialist Teaching Hospital (ISTH - Lassa Fever Centre)', type: 'Specialist Hospital', city: 'Irrua', state: 'Edo' },
      { name: 'Central Hospital Benin City', type: 'General Hospital', city: 'Benin City', state: 'Edo' }
    ]
  },
  'Ekiti': {
    name: 'Ekiti',
    capital: 'Ado-Ekiti',
    emergencyHotlines: ['112', '0802 345 6789'],
    facilities: [
      { name: 'Ekiti State University Teaching Hospital (EKSUTH)', type: 'Teaching Hospital', city: 'Ado-Ekiti', state: 'Ekiti' },
      { name: 'Federal Teaching Hospital Ido-Ekiti (FTHI)', type: 'Teaching Hospital', city: 'Ido-Ekiti', state: 'Ekiti' },
      { name: 'State Specialist Hospital Ikole-Ekiti', type: 'Specialist Hospital', city: 'Ikole-Ekiti', state: 'Ekiti' }
    ]
  },
  'Enugu': {
    name: 'Enugu',
    capital: 'Enugu',
    emergencyHotlines: ['112', '0803 123 4567'],
    facilities: [
      { name: 'University of Nigeria Teaching Hospital (UNTH)', type: 'Teaching Hospital', city: 'Ituku-Ozalla / Enugu', state: 'Enugu' },
      { name: 'Enugu State University Teaching Hospital (ESUT Parklane)', type: 'Teaching Hospital', city: 'Enugu', state: 'Enugu', address: 'Parklane, GRA, Enugu' },
      { name: 'National Orthopaedic Hospital Enugu', type: 'Specialist Hospital', city: 'Enugu', state: 'Enugu', address: 'Abakaliki Road, Enugu' },
      { name: 'District Hospital Nsukka', type: 'General Hospital', city: 'Nsukka', state: 'Enugu' }
    ]
  },
  'FCT - Abuja': {
    name: 'FCT - Abuja',
    capital: 'Abuja',
    emergencyHotlines: ['112', '0809 993 6312', '6232'],
    facilities: [
      { name: 'National Hospital Abuja', type: 'Specialist Hospital', city: 'Central Area, Abuja', state: 'FCT - Abuja', address: 'Plot 132 Central District, Abuja' },
      { name: 'University of Abuja Teaching Hospital (UATH)', type: 'Teaching Hospital', city: 'Gwagwalada', state: 'FCT - Abuja' },
      { name: 'Maitama District Hospital', type: 'General Hospital', city: 'Maitama, Abuja', state: 'FCT - Abuja', address: 'Aguiyi Ironsi Way, Maitama' },
      { name: 'Asokoro District Hospital', type: 'General Hospital', city: 'Asokoro, Abuja', state: 'FCT - Abuja' },
      { name: 'Wuse District Hospital', type: 'General Hospital', city: 'Wuse Zone 3, Abuja', state: 'FCT - Abuja' },
      { name: 'Kubwa General Hospital', type: 'General Hospital', city: 'Kubwa, Abuja', state: 'FCT - Abuja' }
    ]
  },
  'Gombe': {
    name: 'Gombe',
    capital: 'Gombe',
    emergencyHotlines: ['112', '0803 971 6390'],
    facilities: [
      { name: 'Federal Teaching Hospital Gombe (FTHG)', type: 'Teaching Hospital', city: 'Gombe', state: 'Gombe' },
      { name: 'State Specialist Hospital Gombe', type: 'Specialist Hospital', city: 'Gombe', state: 'Gombe' },
      { name: 'General Hospital Kaltungo', type: 'General Hospital', city: 'Kaltungo', state: 'Gombe' }
    ]
  },
  'Imo': {
    name: 'Imo',
    capital: 'Owerri',
    emergencyHotlines: ['112', '0803 478 9012'],
    facilities: [
      { name: 'Federal University Teaching Hospital Owerri (FUTHO / formerly FMC)', type: 'Teaching Hospital', city: 'Owerri', state: 'Imo' },
      { name: 'Imo State University Teaching Hospital (IMSUTH)', type: 'Teaching Hospital', city: 'Orlu', state: 'Imo' },
      { name: 'General Hospital Umuguma', type: 'General Hospital', city: 'Owerri', state: 'Imo' }
    ]
  },
  'Jigawa': {
    name: 'Jigawa',
    capital: 'Dutse',
    emergencyHotlines: ['112', '0803 897 1234'],
    facilities: [
      { name: 'Federal University Teaching Hospital Dutse', type: 'Teaching Hospital', city: 'Dutse', state: 'Jigawa' },
      { name: 'Rasheed Shekoni Specialist Hospital', type: 'Specialist Hospital', city: 'Dutse', state: 'Jigawa' },
      { name: 'General Hospital Hadejia', type: 'General Hospital', city: 'Hadejia', state: 'Jigawa' }
    ]
  },
  'Kaduna': {
    name: 'Kaduna',
    capital: 'Kaduna',
    emergencyHotlines: ['112', '0803 587 1662'],
    facilities: [
      { name: 'Ahmadu Bello University Teaching Hospital (ABUTH)', type: 'Teaching Hospital', city: 'Zaria', state: 'Kaduna', address: 'Shika, Zaria' },
      { name: 'Barau Dikko Teaching Hospital (KASUTH)', type: 'Teaching Hospital', city: 'Kaduna', state: 'Kaduna', address: 'Lafia Road, Kaduna' },
      { name: 'National Eye Centre Kaduna', type: 'Specialist Hospital', city: 'Kaduna', state: 'Kaduna' },
      { name: 'General Hospital Kafanchan', type: 'General Hospital', city: 'Kafanchan', state: 'Kaduna' }
    ]
  },
  'Kano': {
    name: 'Kano',
    capital: 'Kano',
    emergencyHotlines: ['112', '0803 978 4567'],
    facilities: [
      { name: 'Aminu Kano Teaching Hospital (AKTH)', type: 'Teaching Hospital', city: 'Kano', state: 'Kano', address: 'Zaria Road, Kano' },
      { name: 'Murtala Muhammad Specialist Hospital', type: 'Specialist Hospital', city: 'Kano City', state: 'Kano' },
      { name: 'Muhammad Abdullahi Wase Teaching Hospital (Nassarawa Hospital)', type: 'Teaching Hospital', city: 'Kano', state: 'Kano' },
      { name: 'General Hospital Bichi', type: 'General Hospital', city: 'Bichi', state: 'Kano' }
    ]
  },
  'Katsina': {
    name: 'Katsina',
    capital: 'Katsina',
    emergencyHotlines: ['112', '0803 214 5678'],
    facilities: [
      { name: 'Federal Teaching Hospital Katsina (formerly FMC)', type: 'Teaching Hospital', city: 'Katsina', state: 'Katsina' },
      { name: 'General Hospital Katsina', type: 'General Hospital', city: 'Katsina', state: 'Katsina' },
      { name: 'General Hospital Funtua', type: 'General Hospital', city: 'Funtua', state: 'Katsina' }
    ]
  },
  'Kebbi': {
    name: 'Kebbi',
    capital: 'Birnin Kebbi',
    emergencyHotlines: ['112', '0803 456 7891'],
    facilities: [
      { name: 'Federal Medical Centre (FMC) Birnin Kebbi', type: 'Federal Medical Centre', city: 'Birnin Kebbi', state: 'Kebbi' },
      { name: 'Sir Yahaya Memorial Hospital', type: 'General Hospital', city: 'Birnin Kebbi', state: 'Kebbi' }
    ]
  },
  'Kogi': {
    name: 'Kogi',
    capital: 'Lokoja',
    emergencyHotlines: ['112', '0803 678 9012'],
    facilities: [
      { name: 'Federal Teaching Hospital Lokoja (formerly FMC Lokoja)', type: 'Teaching Hospital', city: 'Lokoja', state: 'Kogi' },
      { name: 'Kogi State Specialist Hospital', type: 'Specialist Hospital', city: 'Lokoja', state: 'Kogi' },
      { name: 'General Hospital Okene', type: 'General Hospital', city: 'Okene', state: 'Kogi' }
    ]
  },
  'Kwara': {
    name: 'Kwara',
    capital: 'Ilorin',
    emergencyHotlines: ['112', '0803 789 0123'],
    facilities: [
      { name: 'University of Ilorin Teaching Hospital (UITH)', type: 'Teaching Hospital', city: 'Ilorin', state: 'Kwara', address: 'Old Jebba Road, Oke-Ose, Ilorin' },
      { name: 'General Hospital Ilorin', type: 'General Hospital', city: 'Ilorin', state: 'Kwara' },
      { name: 'General Hospital Offa', type: 'General Hospital', city: 'Offa', state: 'Kwara' }
    ]
  },
  'Lagos': {
    name: 'Lagos',
    capital: 'Ikeja',
    emergencyHotlines: ['112', '767', '0800 000 5246'],
    facilities: [
      { name: 'Lagos University Teaching Hospital (LUTH)', type: 'Teaching Hospital', city: 'Idi-Araba, Surulere', state: 'Lagos', address: 'Ishaga Road, Idi-Araba, Lagos' },
      { name: 'Lagos State University Teaching Hospital (LASUTH)', type: 'Teaching Hospital', city: 'Ikeja', state: 'Lagos', address: '1-5 Oba Akinjobi Way, GRA, Ikeja' },
      { name: 'Federal Medical Centre (FMC) Ebute Metta', type: 'Federal Medical Centre', city: 'Ebute Metta', state: 'Lagos' },
      { name: 'General Hospital Lagos Island (Broad Street)', type: 'General Hospital', city: 'Lagos Island', state: 'Lagos', address: '1-3 Broad Street, Lagos Island' },
      { name: 'General Hospital Gbagada', type: 'General Hospital', city: 'Gbagada', state: 'Lagos', address: 'Hospital Road, Gbagada' },
      { name: 'General Hospital Ikorodu', type: 'General Hospital', city: 'Ikorodu', state: 'Lagos' },
      { name: 'General Hospital Alimosho (Igando)', type: 'General Hospital', city: 'Igando, Alimosho', state: 'Lagos' }
    ]
  },
  'Nasarawa': {
    name: 'Nasarawa',
    capital: 'Lafia',
    emergencyHotlines: ['112', '0803 890 1234'],
    facilities: [
      { name: 'Dalhatu Araf Specialist Hospital (DASH)', type: 'Specialist Hospital', city: 'Lafia', state: 'Nasarawa' },
      { name: 'Federal Medical Centre (FMC) Keffi', type: 'Federal Medical Centre', city: 'Keffi', state: 'Nasarawa' },
      { name: 'General Hospital Mararaba', type: 'General Hospital', city: 'Karu / Mararaba', state: 'Nasarawa' }
    ]
  },
  'Niger': {
    name: 'Niger',
    capital: 'Minna',
    emergencyHotlines: ['112', '0803 901 2345'],
    facilities: [
      { name: 'Federal Medical Centre (FMC) Bida', type: 'Federal Medical Centre', city: 'Bida', state: 'Niger' },
      { name: 'General Hospital Minna', type: 'General Hospital', city: 'Minna', state: 'Niger' },
      { name: 'General Hospital Suleja', type: 'General Hospital', city: 'Suleja', state: 'Niger' }
    ]
  },
  'Ogun': {
    name: 'Ogun',
    capital: 'Abeokuta',
    emergencyHotlines: ['112', '0803 012 3456'],
    facilities: [
      { name: 'Federal Medical Centre (FMC) Abeokuta', type: 'Federal Medical Centre', city: 'Abeokuta', state: 'Ogun', address: 'Bisi Onabanjo Way, Idi-Aba, Abeokuta' },
      { name: 'Olabisi Onabanjo University Teaching Hospital (OOUTH)', type: 'Teaching Hospital', city: 'Sagamu', state: 'Ogun' },
      { name: 'State Hospital Ijebu-Ode', type: 'General Hospital', city: 'Ijebu-Ode', state: 'Ogun' },
      { name: 'State Hospital Ota', type: 'General Hospital', city: 'Ota', state: 'Ogun' }
    ]
  },
  'Ondo': {
    name: 'Ondo',
    capital: 'Akure',
    emergencyHotlines: ['112', '0803 123 4568'],
    facilities: [
      { name: 'University of Medical Sciences Teaching Hospital (UNIMEDTH)', type: 'Teaching Hospital', city: 'Ondo Town / Akure', state: 'Ondo' },
      { name: 'Federal Medical Centre (FMC) Owo', type: 'Federal Medical Centre', city: 'Owo', state: 'Ondo' },
      { name: 'State Specialist Hospital Akure', type: 'Specialist Hospital', city: 'Akure', state: 'Ondo' }
    ]
  },
  'Osun': {
    name: 'Osun',
    capital: 'Osogbo',
    emergencyHotlines: ['112', '0803 234 5679'],
    facilities: [
      { name: 'Obafemi Awolowo University Teaching Hospitals Complex (OAUTHC)', type: 'Teaching Hospital', city: 'Ile-Ife', state: 'Osun' },
      { name: 'Osun State University Teaching Hospital (UNIOSUNTH)', type: 'Teaching Hospital', city: 'Osogbo', state: 'Osun' },
      { name: 'State Hospital Asubiaro', type: 'General Hospital', city: 'Osogbo', state: 'Osun' }
    ]
  },
  'Oyo': {
    name: 'Oyo',
    capital: 'Ibadan',
    emergencyHotlines: ['112', '615', '0803 345 6780'],
    facilities: [
      { name: 'University College Hospital (UCH)', type: 'Teaching Hospital', city: 'Ibadan', state: 'Oyo', address: 'Queen Elizabeth Road, Oritamefa, Ibadan' },
      { name: 'Adeoyo Maternity Teaching Hospital', type: 'Teaching Hospital', city: 'Yemetu, Ibadan', state: 'Oyo' },
      { name: 'State Hospital Ring Road', type: 'General Hospital', city: 'Ibadan', state: 'Oyo' },
      { name: 'General Hospital Ogbomoso', type: 'General Hospital', city: 'Ogbomoso', state: 'Oyo' }
    ]
  },
  'Plateau': {
    name: 'Plateau',
    capital: 'Jos',
    emergencyHotlines: ['112', '0803 456 7892'],
    facilities: [
      { name: 'Jos University Teaching Hospital (JUTH)', type: 'Teaching Hospital', city: 'Jos', state: 'Plateau', address: 'Lamingo, Jos' },
      { name: 'Plateau State Specialist Hospital', type: 'Specialist Hospital', city: 'Jos', state: 'Plateau' },
      { name: 'General Hospital Pankshin', type: 'General Hospital', city: 'Pankshin', state: 'Plateau' }
    ]
  },
  'Rivers': {
    name: 'Rivers',
    capital: 'Port Harcourt',
    emergencyHotlines: ['112', '0803 567 8903'],
    facilities: [
      { name: 'University of Port Harcourt Teaching Hospital (UPTH)', type: 'Teaching Hospital', city: 'Port Harcourt', state: 'Rivers', address: 'East-West Road, Alakahia, Port Harcourt' },
      { name: 'Rivers State University Teaching Hospital (RSUTH / Braithwaite BMH)', type: 'Teaching Hospital', city: 'Port Harcourt', state: 'Rivers', address: 'Harley Street, Old GRA, Port Harcourt' },
      { name: 'General Hospital Ahoada', type: 'General Hospital', city: 'Ahoada', state: 'Rivers' }
    ]
  },
  'Sokoto': {
    name: 'Sokoto',
    capital: 'Sokoto',
    emergencyHotlines: ['112', '0803 678 9014'],
    facilities: [
      { name: 'Usmanu Danfodiyo University Teaching Hospital (UDUTH)', type: 'Teaching Hospital', city: 'Sokoto', state: 'Sokoto' },
      { name: 'Specialist Hospital Sokoto', type: 'Specialist Hospital', city: 'Sokoto', state: 'Sokoto' },
      { name: 'Noma Children Hospital', type: 'Specialist Hospital', city: 'Sokoto', state: 'Sokoto' }
    ]
  },
  'Taraba': {
    name: 'Taraba',
    capital: 'Jalingo',
    emergencyHotlines: ['112', '0803 789 0125'],
    facilities: [
      { name: 'Federal Medical Centre (FMC) Jalingo', type: 'Federal Medical Centre', city: 'Jalingo', state: 'Taraba' },
      { name: 'Taraba State Specialist Hospital', type: 'Specialist Hospital', city: 'Jalingo', state: 'Taraba' },
      { name: 'General Hospital Wukari', type: 'General Hospital', city: 'Wukari', state: 'Taraba' }
    ]
  },
  'Yobe': {
    name: 'Yobe',
    capital: 'Damaturu',
    emergencyHotlines: ['112', '0803 890 1236'],
    facilities: [
      { name: 'Yobe State University Teaching Hospital (YSUTH)', type: 'Teaching Hospital', city: 'Damaturu', state: 'Yobe' },
      { name: 'Federal Medical Centre (FMC) Nguru', type: 'Federal Medical Centre', city: 'Nguru', state: 'Yobe' },
      { name: 'General Hospital Potiskum', type: 'General Hospital', city: 'Potiskum', state: 'Yobe' }
    ]
  },
  'Zamfara': {
    name: 'Zamfara',
    capital: 'Gusau',
    emergencyHotlines: ['112', '0803 901 2347'],
    facilities: [
      { name: 'Federal Medical Centre (FMC) Gusau', type: 'Federal Medical Centre', city: 'Gusau', state: 'Zamfara' },
      { name: 'Ahmad Sani Yariman Bakura Specialist Hospital', type: 'Specialist Hospital', city: 'Gusau', state: 'Zamfara' }
    ]
  }
};

export interface SymptomPromptItem {
  label: string;
  text: string;
  iconName: 'thermometer' | 'droplet' | 'zap' | 'wind' | 'heart' | 'alert' | 'activity';
  bgColor: string;
  textColor: string;
  borderColor: string;
  hoverColor: string;
  dotColor: string;
}

export const COMMON_SYMPTOM_PROMPTS: SymptomPromptItem[] = [
  { 
    label: 'Hot body & body pain', 
    text: 'My body dey hot well-well and body dey pain me for 3 days, mouth dey bitter',
    iconName: 'thermometer',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-900',
    borderColor: 'border-amber-200',
    hoverColor: 'hover:bg-amber-100/90 hover:border-amber-300',
    dotColor: 'bg-amber-500'
  },
  { 
    label: 'Belle bite & purging', 
    text: 'My belle dey bite me and I dey purge watery stool since yesterday morning',
    iconName: 'droplet',
    bgColor: 'bg-sky-50',
    textColor: 'text-sky-900',
    borderColor: 'border-sky-200',
    hoverColor: 'hover:bg-sky-100/90 hover:border-sky-300',
    dotColor: 'bg-sky-500'
  },
  { 
    label: 'Cold chills & headache', 
    text: 'Cold and shaking chills dey catch me, my head dey hammer, and body weak patapata',
    iconName: 'zap',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-900',
    borderColor: 'border-purple-200',
    hoverColor: 'hover:bg-purple-100/90 hover:border-purple-300',
    dotColor: 'bg-purple-500'
  },
  { 
    label: 'Cough & chest tight', 
    text: 'I get dry cough and my chest dey tight small with slight hot body',
    iconName: 'wind',
    bgColor: 'bg-teal-50',
    textColor: 'text-teal-900',
    borderColor: 'border-teal-200',
    hoverColor: 'hover:bg-teal-100/90 hover:border-teal-300',
    dotColor: 'bg-teal-600'
  },
  { 
    label: 'Pikin hot body & vomit', 
    text: 'My 3-year-old pikin body dey hot like fire, e don vomit twice and refuse to eat or drink',
    iconName: 'heart',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-900',
    borderColor: 'border-rose-200',
    hoverColor: 'hover:bg-rose-100/90 hover:border-rose-300',
    dotColor: 'bg-rose-500'
  },
  { 
    label: 'Joint pains & bone crisis', 
    text: 'I have severe waist, joint, and bone pains with extreme weakness',
    iconName: 'activity',
    bgColor: 'bg-indigo-50',
    textColor: 'text-indigo-900',
    borderColor: 'border-indigo-200',
    hoverColor: 'hover:bg-indigo-100/90 hover:border-indigo-300',
    dotColor: 'bg-indigo-500'
  },
  { 
    label: 'Heavy chest pain & breath seize', 
    text: 'Sudden heavy chest pain dey hold me and my breath dey seize',
    iconName: 'alert',
    bgColor: 'bg-red-50',
    textColor: 'text-red-900',
    borderColor: 'border-red-300',
    hoverColor: 'hover:bg-red-100 hover:border-red-400 ring-1 ring-red-400/30',
    dotColor: 'bg-red-600'
  }
];

export const FIRST_AID_GUIDES = [
  {
    id: 'ors',
    title: 'Salt-Sugar Solution (SSS / Home ORS)',
    summary: 'Lifesaving rehydration for purging, vomiting, and diarrhea in both adults and children.',
    steps: [
      'Wash your hands thoroughly with soap and clean running water.',
      'Measure exactly 1 litre (about 5 standard milk-cups or two 50cl pure-water/bottles) of boiled and cooled or clean drinking water into a clean container.',
      'Add 1 level teaspoon of salt (about 3g). Do not add more salt than this.',
      'Add 10 level teaspoons of granulated sugar (or 5 sugar cubes).',
      'Stir well until all the salt and sugar completely dissolve.',
      'Give frequently in small sips (a cup after every loose stool for adults; teaspoons/sips every few minutes for children).',
      'Prepare a fresh mixture every 24 hours. If purging persists or blood appears, seek clinic care immediately.'
    ]
  },
  {
    id: 'tepid-sponging',
    title: 'Tepid Sponging for High Fever (Children & Adults)',
    summary: 'Safe cooling when someone has a burning hot body, before reaching health facility.',
    steps: [
      'Use lukewarm (tepid) tap water — NEVER cold water, ice, or methylated spirit (spirit can cause alcohol poisoning in children).',
      'Dip a clean towel or sponge into lukewarm water, squeeze out excess moisture.',
      'Gently wipe the forehead, armpits, groin, back of neck, and limbs where major blood vessels run.',
      'Do not sponge aggressively or let the person shiver. If shivering begins, stop immediately.',
      'Dress the patient in light, breathable cotton clothes. Never bundle a feverish child in thick blankets.',
      'Encourage regular fluids (water, breast milk, or ORS) to prevent dehydration.'
    ]
  },
  {
    id: 'choking',
    title: 'Choking First Aid (Conscious Adult & Child > 1yr)',
    summary: 'Emergency response when airway is blocked.',
    steps: [
      'Encourage them to cough forcefully if they can still make sounds or breathe.',
      'If unable to speak, breathe, or cough: Stand slightly behind them and support their chest with one hand.',
      'Lean the person forward and give up to 5 sharp back blows between the shoulder blades with the heel of your hand.',
      'If back blows fail, give up to 5 abdominal thrusts (Heimlich): place a fist just above the navel, grasp with other hand, pull inward and upward sharply.',
      'Alternate 5 back blows and 5 abdominal thrusts until object clears or help arrives. Call 112 immediately if they lose consciousness.'
    ]
  },
  {
    id: 'bleeding',
    title: 'Severe Bleeding First Aid',
    summary: 'Stopping heavy hemorrhage before professional medical arrival.',
    steps: [
      'Ensure safety and put on gloves or plastic wrap if available.',
      'Apply direct, continuous firm pressure over the bleeding site using a clean cloth, gauze, or towel.',
      'Do not remove soaked cloth; add more clean layers on top and continue pressing firmly.',
      'If possible and no bone fracture is suspected, elevate the bleeding limb above heart level.',
      'Have the patient lie down quietly to maintain blood flow to vital organs.',
      'Transport immediately to the nearest General Hospital or Emergency Trauma Centre.'
    ]
  },
  {
    id: 'pregnancy',
    title: 'Pregnancy & Antenatal Safety Guide',
    summary: 'Protecting mother and baby: safe relief during pregnancy and obstetric danger signs that require urgent hospital care.',
    steps: [
      'NEVER self-medicate during pregnancy: avoid unprescribed painkillers (especially Ibuprofen, Diclofenac, Aspirin), random chemist drugs, or herbal mixes ("agbo") unless approved by your antenatal doctor.',
      'For morning sickness or mild nausea: eat small dry meals early, sip clean water or ginger tea slowly, and rest in fresh air.',
      'Sleep under an insecticide-treated mosquito net every night and keep every Antenatal Clinic (ANC) appointment for blood pressure, iron/folic acid, and malaria prevention checks.',
      'If you notice mild fever: sponge gently with lukewarm water and visit your antenatal clinic promptly for a safe Malaria test.',
      'RUSH TO THE MATERNITY HOSPITAL IMMEDIATELY if pregnancy is accompanied by: ANY vaginal bleeding, severe headache or blurry vision, sudden face/hand swelling, sharp abdominal pain, water breaking early, high fever, or decreased baby kicks.'
    ]
  }
];
