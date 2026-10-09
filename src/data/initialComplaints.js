export const INITIAL_COMPLAINTS = [
  {
    id: 'CMP-2026-001245',
    title: 'Severe Deep Potholes on 4th Main Junction',
    category: 'roads',
    categoryName: 'Roads & Potholes',
    description: 'Multiple crater-like potholes opened up after yesterday torrential rain right in front of Metro Pillar 42. Two two-wheelers skidded today morning. Needs urgent asphalt hot-mix patch resurfacing.',
    priority: 'High',
    status: 'IN PROGRESS', // Lifecycle status
    citizenId: 'usr-cit-1', // Aarav Patel
    submittedBy: {
      id: 'usr-cit-1',
      name: 'Aarav Patel',
      email: 'aarav.patel@example.com',
      phone: '+91 98765 43210',
      address: 'Flat 402, Green Meadows, 4th Main Road'
    },
    departmentId: 'dept-roads',
    departmentName: 'Road Infrastructure & Maintenance',
    assignedOfficer: 'Eng. Rajesh Sharma (Exec. Engineer)',
    assignedWorkerId: 'wrk-01', // Ramesh Kumar (Worker 01)
    assignedWorker: {
      id: 'wrk-01',
      name: 'Ramesh Kumar',
      phone: '+91 98201 34120',
      role: 'Paving & Asphalt Crew Lead'
    },
    officerInstructions: 'Deploy bitumen hot-mix unit. Coordinate with traffic police to cordon off lane 1 during roller compaction.',
    location: {
      address: '4th Main Road, Opposite Metro Pillar #42, Indiranagar',
      landmark: 'Near City Central Bakery',
      ward: 'Ward 82 - East Zone',
      lat: 12.9784,
      lng: 77.6408
    },
    images: [
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1584463699043-4cebeecf5d94?w=800&auto=format&fit=crop&q=80'
    ],
    resolutionDetails: null,
    verification: null,
    // INTERNAL NOTES: Strictly visible only to Officers & Admins, NEVER exposed to Citizens
    internalNotes: [
      {
        id: 'in-1',
        author: 'Eng. Rajesh Sharma',
        role: 'Officer',
        timestamp: '2026-09-28 10:35 AM',
        message: 'Contractor asphalt supply truck delay noted. Advised Worker #W101 (Ramesh) to complete base compaction by 1 PM.'
      },
      {
        id: 'in-2',
        author: 'Eng. Rajesh Sharma',
        role: 'Officer',
        timestamp: '2026-09-29 09:15 AM',
        message: 'Budget head: Ward 82 Emergency Monsoon Maintenance Fund #WM-402.'
      }
    ],
    // PUBLIC UPDATES: Visible to Citizen on the portal
    publicUpdates: [
      {
        id: 'pu-1',
        timestamp: '2026-09-28 10:30 AM',
        message: 'Your complaint has been verified and assigned to the Roads Department.'
      },
      {
        id: 'pu-2',
        timestamp: '2026-09-28 11:45 AM',
        message: 'Road maintenance crew has been dispatched to site with equipment.'
      },
      {
        id: 'pu-3',
        timestamp: '2026-09-29 02:00 PM',
        message: 'Physical road repair and bitumen compaction is in progress.'
      }
    ],
    timeline: [
      { step: 1, title: 'Complaint Submitted', timestamp: '2026-09-28 09:15 AM', author: 'Aarav Patel (Citizen)', note: 'Grievance submitted with geocoded photos.', completed: true },
      { step: 2, title: 'Under Review', timestamp: '2026-09-28 10:30 AM', author: 'Eng. Rajesh Sharma (Officer)', note: 'Verified on-site severity. Priority set to High.', completed: true },
      { step: 3, title: 'Department & Worker Assigned', timestamp: '2026-09-28 11:45 AM', author: 'Roads & Infrastructure', note: 'Assigned to Worker #W101 (Ramesh Kumar).', completed: true },
      { step: 4, title: 'Work In Progress', timestamp: '2026-09-29 02:00 PM', author: 'Ramesh Kumar (Worker)', note: 'Asphalt truck on site. Compaction underway.', completed: true, current: true },
      { step: 5, title: 'Resolution Submitted', timestamp: 'Pending Crew Completion', author: 'Field Crew', note: 'Awaiting repair evidence submission.', completed: false },
      { step: 6, title: 'Officer Resolution Approval', timestamp: 'Pending', author: 'Municipal Officer', note: 'Officer will audit photo evidence.', completed: false },
      { step: 7, title: 'Citizen Verification', timestamp: 'Pending', author: 'Aarav Patel', note: 'Citizen verification required to close.', completed: false },
      { step: 8, title: 'Closed', timestamp: 'Pending', author: 'System', note: 'Ticket archived after citizen satisfaction.', completed: false }
    ],
    createdAt: '2026-09-28T09:15:00.000Z',
    updatedAt: '2026-09-29T14:15:00.000Z',
    slaDeadline: '2026-09-30T09:15:00.000Z'
  },
  {
    id: 'CMP-2026-001246',
    title: 'Severe Garbage Dump Overflow & Stray Animal Menace',
    category: 'garbage',
    categoryName: 'Garbage & Sanitation',
    description: 'Community garbage dumpster on 7th Cross has not been cleared for 4 days. Waste is spilling across the road, causing unbearable stench and attracting stray cattle and dogs.',
    priority: 'Urgent',
    status: 'RESOLVED', // Worker completed & Officer approved -> Ready for Citizen B verification!
    citizenId: 'usr-cit-2', // Pooja Sharma (Citizen B)
    submittedBy: {
      id: 'usr-cit-2',
      name: 'Pooja Sharma',
      email: 'pooja.sharma@example.com',
      phone: '+91 99887 66554',
      address: 'House #12, 7th Cross, Jayanagar'
    },
    departmentId: 'dept-sanitation',
    departmentName: 'Public Health & Solid Waste Management',
    assignedOfficer: 'Dr. Anita Roy (Chief Sanitation Officer)',
    assignedWorkerId: 'wrk-02', // Santosh Yadav (Worker 02)
    assignedWorker: {
      id: 'wrk-02',
      name: 'Santosh Yadav',
      phone: '+91 98450 78219',
      role: 'Sanitation Field Supervisor'
    },
    officerInstructions: 'Deploy compactor vehicle KA-05-3211. Ensure bleaching powder spray to eradicate odor.',
    location: {
      address: '7th Cross, Behind Municipal Secondary School, Jayanagar',
      landmark: 'Next to Community Water Filter Plant',
      ward: 'Ward 54 - South Zone',
      lat: 12.9299,
      lng: 77.5824
    },
    images: [
      'https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1530587191325-3db32d826c18?w=800&auto=format&fit=crop&q=80'
    ],
    resolutionDetails: {
      completedAt: '2026-09-29 11:30 AM',
      description: 'Compactor vehicle deploy #KA-05-3211. Cleared 2.4 tons of solid wet and dry waste. Disinfected the entire area with lime powder and phenyl solution.',
      afterImages: [
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop&q=80'
      ],
      workerNotes: 'All trash cleared, perimeter treated with calcium hypochlorite.'
    },
    officerApproval: {
      approved: true,
      officerName: 'Dr. Anita Roy',
      timestamp: '2026-09-29 12:00 PM',
      note: 'Field photographic evidence reviewed and approved. Forwarded for citizen sign-off.'
    },
    verification: null, // Ready for Citizen B (Pooja Sharma) to verify!
    internalNotes: [
      {
        id: 'in-3',
        author: 'Dr. Anita Roy',
        role: 'Officer',
        timestamp: '2026-09-27 09:20 AM',
        message: 'Contractor M/s GreenClean penalised ₹5,000 for skipping scheduled morning route.'
      }
    ],
    publicUpdates: [
      { id: 'pu-4', timestamp: '2026-09-27 09:10 AM', message: 'Your complaint was accepted under rapid sanitation response protocol.' },
      { id: 'pu-5', timestamp: '2026-09-27 10:00 AM', message: 'Assigned to Sanitation Field Crew Supervisor Santosh Yadav.' },
      { id: 'pu-6', timestamp: '2026-09-29 12:05 PM', message: 'Work completed and verified by department. Please verify the resolution on your portal.' }
    ],
    timeline: [
      { step: 1, title: 'Complaint Submitted', timestamp: '2026-09-27 08:30 AM', author: 'Pooja Sharma (Citizen)', note: 'Reported garbage overflow.', completed: true },
      { step: 2, title: 'Under Review', timestamp: '2026-09-27 09:10 AM', author: 'Dr. Anita Roy', note: 'Priority escalated to Urgent.', completed: true },
      { step: 3, title: 'Department & Worker Assigned', timestamp: '2026-09-27 10:00 AM', author: 'Public Health Dept', note: 'Assigned to Santosh Yadav.', completed: true },
      { step: 4, title: 'Work In Progress', timestamp: '2026-09-28 07:00 AM', author: 'Santosh Yadav', note: 'Waste lifting underway.', completed: true },
      { step: 5, title: 'Resolution Submitted', timestamp: '2026-09-29 11:30 AM', author: 'Santosh Yadav (Worker)', note: 'Uploaded after-repair photographs.', completed: true },
      { step: 6, title: 'Officer Resolution Approved', timestamp: '2026-09-29 12:00 PM', author: 'Dr. Anita Roy (Officer)', note: 'Officer approved remediation proof. Routed to citizen.', completed: true },
      { step: 7, title: 'Citizen Verification Pending', timestamp: 'Awaiting Citizen Response', author: 'Pooja Sharma', note: 'Citizen verification required.', completed: false, current: true },
      { step: 8, title: 'Closed', timestamp: 'Pending Verification', author: 'System', note: 'Final closure post citizen confirmation.', completed: false }
    ],
    createdAt: '2026-09-27T08:30:00.000Z',
    updatedAt: '2026-09-29T12:05:00.000Z',
    slaDeadline: '2026-09-28T08:30:00.000Z'
  },
  {
    id: 'CMP-2026-001247',
    title: 'Cluster of 5 Street Lights Broken on Ring Road Service Lane',
    category: 'streetlights',
    categoryName: 'Street Lights',
    description: 'Five consecutive LED street lights along the Outer Ring Road service road have been dark for 3 nights. Pedestrians and women returning from IT parks feel unsafe in pitch darkness.',
    priority: 'High',
    status: 'SUBMITTED', // Newly submitted, awaiting Officer review
    citizenId: 'usr-cit-2', // Pooja Sharma (Citizen B)
    submittedBy: {
      id: 'usr-cit-2',
      name: 'Pooja Sharma',
      email: 'pooja.sharma@example.com',
      phone: '+91 99887 66554',
      address: 'House #12, 7th Cross, Jayanagar'
    },
    departmentId: 'dept-electrical',
    departmentName: 'Electrical & Public Lighting',
    assignedOfficer: 'Pending Officer Assignment',
    assignedWorkerId: null,
    assignedWorker: null,
    officerInstructions: '',
    location: {
      address: 'Outer Ring Road Service Lane, Bellandur stretch',
      landmark: 'Near Ecospace Footbridge',
      ward: 'Ward 150 - South-East Zone',
      lat: 12.9260,
      lng: 77.6835
    },
    images: [
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800&auto=format&fit=crop&q=80'
    ],
    resolutionDetails: null,
    verification: null,
    internalNotes: [],
    publicUpdates: [
      { id: 'pu-7', timestamp: '2026-09-29 08:10 AM', message: 'Grievance submitted via portal. Queued for Officer review.' }
    ],
    timeline: [
      { step: 1, title: 'Complaint Submitted', timestamp: '2026-09-29 08:10 AM', author: 'Pooja Sharma (Citizen)', note: 'Registered via web portal.', completed: true, current: true },
      { step: 2, title: 'Under Review', timestamp: 'Pending Review', author: 'Electrical & Public Lighting Dept', note: 'Awaiting ward engineer inspection.', completed: false }
    ],
    createdAt: '2026-09-29T08:10:00.000Z',
    updatedAt: '2026-09-29T08:10:00.000Z',
    slaDeadline: '2026-09-30T08:10:00.000Z'
  },
  {
    id: 'CMP-2026-001248',
    title: 'Drinking Water Pipeline Burst & Clean Water Gushing Onto Road',
    category: 'water',
    categoryName: 'Water Supply',
    description: 'Underground potable water supply pipe ruptured near house #44. Huge volume of drinking water is flooding the street and basement ramps. Thousands of liters wasted per hour.',
    priority: 'Urgent',
    status: 'ASSIGNED', // Officer approved & assigned worker, awaiting worker start
    citizenId: 'usr-cit-1', // Aarav Patel (Citizen A)
    submittedBy: {
      id: 'usr-cit-1',
      name: 'Aarav Patel',
      email: 'aarav.patel@example.com',
      phone: '+91 98765 43210',
      address: 'Flat 402, Green Meadows, 4th Main Road'
    },
    departmentId: 'dept-water',
    departmentName: 'Water Supply & Sewerage Board',
    assignedOfficer: 'Suresh Patil (Superintending Engineer)',
    assignedWorkerId: 'wrk-04',
    assignedWorker: {
      id: 'wrk-04',
      name: 'Mohammad Tariq',
      phone: '+91 98199 44321',
      role: 'Pipeline Hydro Engineer Tech'
    },
    officerInstructions: 'Isolate feeder valve #9B before commencing hydraulic excavation.',
    location: {
      address: 'House #44, 2nd Cross, Malleshwaram 8th Main',
      landmark: 'Behind Canara Bank ATM',
      ward: 'Ward 35 - West Zone',
      lat: 13.0031,
      lng: 77.5685
    },
    images: [
      'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80'
    ],
    resolutionDetails: null,
    verification: null,
    internalNotes: [
      { id: 'in-4', author: 'Suresh Patil', role: 'Officer', timestamp: '2026-09-29 08:05 AM', message: 'Main sluice valve isolated at sub-station to reduce head loss.' }
    ],
    publicUpdates: [
      { id: 'pu-8', timestamp: '2026-09-29 08:00 AM', message: 'Emergency review completed by Water Board engineer.' },
      { id: 'pu-9', timestamp: '2026-09-29 08:30 AM', message: 'Hydro crew assigned. ETA on site 30 minutes.' }
    ],
    timeline: [
      { step: 1, title: 'Complaint Submitted', timestamp: '2026-09-29 07:45 AM', author: 'Aarav Patel', note: 'Emergency water leak reported.', completed: true },
      { step: 2, title: 'Under Review', timestamp: '2026-09-29 08:00 AM', author: 'Suresh Patil', note: 'Sluice valve shut-off ordered.', completed: true },
      { step: 3, title: 'Department & Worker Assigned', timestamp: '2026-09-29 08:30 AM', author: 'Water Board', note: 'Assigned to Mohammad Tariq (Hydro Unit).', completed: true, current: true },
      { step: 4, title: 'Work In Progress', timestamp: 'Pending', author: 'Worker', note: 'Excavation pending crew arrival.', completed: false }
    ],
    createdAt: '2026-09-29T07:45:00.000Z',
    updatedAt: '2026-09-29T08:30:00.000Z',
    slaDeadline: '2026-09-30T07:45:00.000Z'
  },
  {
    id: 'CMP-2026-001249',
    title: 'Severe Storm Drain Blockage Causing Wastewater Reverse Flow',
    category: 'drainage',
    categoryName: 'Drainage & Sewers',
    description: 'Stormwater culvert heavily clogged with solid silt and plastic bottles. Backflow is entering residents ground-floor driveways and septic tanks. Strong foul odor.',
    priority: 'Urgent',
    status: 'ESCALATED', // Overdue SLA -> Escalated to Commissioner
    citizenId: 'usr-cit-3', // Divya Nambiar (Citizen C)
    submittedBy: {
      id: 'usr-cit-3',
      name: 'Divya Nambiar',
      email: 'divya.n@example.com',
      phone: '+91 99123 77889',
      address: 'B-24, Lakeside Enclave, BTM Layout'
    },
    departmentId: 'dept-water',
    departmentName: 'Water Supply & Sewerage Board',
    assignedOfficer: 'Suresh Patil (Superintending Engineer)',
    assignedWorkerId: 'wrk-04',
    assignedWorker: {
      id: 'wrk-04',
      name: 'Mohammad Tariq',
      phone: '+91 98199 44321',
      role: 'Pipeline Hydro Engineer Tech'
    },
    officerInstructions: 'Priority suction machine required from Central Depot.',
    location: {
      address: '14th Cross, 1st Stage BTM Layout',
      landmark: 'Near Lake bund culvert #3',
      ward: 'Ward 65 - South Zone',
      lat: 12.9166,
      lng: 77.6101
    },
    images: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?w=800&auto=format&fit=crop&q=80'
    ],
    resolutionDetails: null,
    verification: null,
    internalNotes: [
      { id: 'in-5', author: 'System SLA Watcher', role: 'System', timestamp: '2026-09-29 09:00 AM', message: 'SLA elapsed 48h without resolution. Auto-escalated to Deputy Commissioner Grievance Desk.' }
    ],
    publicUpdates: [
      { id: 'pu-10', timestamp: '2026-09-29 09:05 AM', message: 'Grievance SLA deadline lapsed. Priority elevated to Urgent under Commissioner supervision.' }
    ],
    timeline: [
      { step: 1, title: 'Complaint Submitted', timestamp: '2026-09-26 10:00 AM', author: 'Divya Nambiar', note: 'Grievance submitted.', completed: true },
      { step: 2, title: 'Under Review', timestamp: '2026-09-26 12:00 PM', author: 'Suresh Patil', note: 'Desilting machine requested.', completed: true },
      { step: 3, title: 'Department Assigned', timestamp: '2026-09-26 01:00 PM', author: 'Water Board', note: 'Assigned to Sewerage Unit.', completed: true },
      { step: 4, title: 'SLA Lapsed & Escalated', timestamp: '2026-09-29 09:00 AM', author: 'Commissioner Grievance Desk', note: 'Auto-escalated for immediate action.', completed: true, current: true }
    ],
    createdAt: '2026-09-26T10:00:00.000Z',
    updatedAt: '2026-09-29T10:15:00.000Z',
    slaDeadline: '2026-09-27T10:00:00.000Z'
  },
  {
    id: 'CMP-2026-001250',
    title: 'Fallen Tree Branch Crushing Park Pathway',
    category: 'parks',
    categoryName: 'Public Parks & Trees',
    description: 'Heavy Gulmohar tree limb snapped during high winds, completely blocking the senior citizen walking track in Mahatma Gandhi Park.',
    priority: 'Medium',
    status: 'CLOSED', // Verified by Citizen -> Closed
    citizenId: 'usr-cit-4', // K. S. Narayanan
    submittedBy: {
      id: 'usr-cit-4',
      name: 'K. S. Narayanan',
      email: 'ks.narayanan@example.com',
      phone: '+91 98440 12345',
      address: '22, 5th Block, Koramangala'
    },
    departmentId: 'dept-horticulture',
    departmentName: 'Parks, Gardens & Horticulture',
    assignedOfficer: 'Meenakshi Iyer (Landscape Officer)',
    assignedWorkerId: 'wrk-05',
    assignedWorker: {
      id: 'wrk-05',
      name: 'Dinesh Solanki',
      phone: '+91 98334 11099',
      role: 'Urban Arborist & Tree Care Lead'
    },
    officerInstructions: 'Section logs and transport to composting center.',
    location: {
      address: 'Mahatma Gandhi Municipal Park, Sector 4, Koramangala',
      landmark: 'Near Gazebo & Jogging Track',
      ward: 'Ward 68 - South-East Zone',
      lat: 12.9352,
      lng: 77.6245
    },
    images: [
      'https://images.unsplash.com/photo-1502082553048-f009c37129b9?w=800&auto=format&fit=crop&q=80'
    ],
    resolutionDetails: {
      completedAt: '2026-09-28 04:30 PM',
      description: 'Arborist crew sectioned fallen bough with chainsaw, removed wood logs to recycling compost yard, cleared walkway thoroughly.',
      afterImages: [
        'https://images.unsplash.com/photo-1448375240586-882707db888b?w=800&auto=format&fit=crop&q=80'
      ],
      workerNotes: 'Path unobstructed and swept clean.'
    },
    verification: {
      verified: true,
      rating: 5,
      feedback: 'Very quick action by the horticulture department! Walking track was completely cleared within hours.',
      verifiedAt: '2026-09-28 06:15 PM'
    },
    internalNotes: [
      { id: 'in-6', author: 'Meenakshi Iyer', role: 'Officer', timestamp: '2026-09-28 10:20 AM', message: 'Tree limb salvaged for municipal botanical nursery mulching.' }
    ],
    publicUpdates: [
      { id: 'pu-11', timestamp: '2026-09-28 06:15 PM', message: 'Citizen confirmed satisfaction. Grievance closed.' }
    ],
    timeline: [
      { step: 1, title: 'Complaint Submitted', timestamp: '2026-09-28 09:00 AM', author: 'K. S. Narayanan', completed: true },
      { step: 2, title: 'Under Review', timestamp: '2026-09-28 10:15 AM', author: 'Meenakshi Iyer', completed: true },
      { step: 3, title: 'Department Assigned', timestamp: '2026-09-28 11:00 AM', author: 'Horticulture Dept', completed: true },
      { step: 4, title: 'Work In Progress', timestamp: '2026-09-28 02:00 PM', author: 'Dinesh Solanki', completed: true },
      { step: 5, title: 'Resolution Submitted', timestamp: '2026-09-28 04:30 PM', author: 'Dinesh Solanki', completed: true },
      { step: 6, title: 'Officer Resolution Approved', timestamp: '2026-09-28 05:00 PM', author: 'Meenakshi Iyer', completed: true },
      { step: 7, title: 'Citizen Verified (5/5 Stars)', timestamp: '2026-09-28 06:15 PM', author: 'K. S. Narayanan', completed: true },
      { step: 8, title: 'Closed', timestamp: '2026-09-28 06:20 PM', author: 'System', completed: true }
    ],
    createdAt: '2026-09-28T09:00:00.000Z',
    updatedAt: '2026-09-28T18:20:00.000Z',
    slaDeadline: '2026-10-01T09:00:00.000Z'
  }
];
