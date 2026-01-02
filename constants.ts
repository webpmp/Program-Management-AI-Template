
import { ProgramData } from './types';

export const INITIAL_DATA: ProgramData = {
  programName: 'Program Name',
  projects: [
    {
      id: '1',
      name: 'Mobile App Redesign',
      code: 'P01',
      description: 'Overhauling the primary customer mobile experience.',
      completionDate: '2026-12-15',
      status: 'ON TRACK',
      statusDetails: 'Design phase complete. Entering development sprint 3.'
    },
    {
      id: '2',
      name: 'Cloud Migration',
      code: 'P02',
      description: 'Moving legacy infrastructure to GCP.',
      completionDate: '2026-03-20',
      status: 'AT RISK',
      statusDetails: 'Latency issues detected in test environment. Resource UXPM01 investigating.'
    }
  ],
  resources: [
    {
      id: 'r1',
      name: 'Alice Johnson',
      role: 'UX Designer',
      roleCode: 'UXD01',
      allocation: '100%',
      projectAssignments: ['P01', 'P02']
    },
    {
      id: 'r2',
      name: 'Bob Smith',
      role: 'Lead',
      roleCode: 'PM01',
      allocation: '50%',
      projectAssignments: ['P01']
    },
    {
      id: 'r3',
      name: 'Charlie Davis',
      role: 'UX Program Manager',
      roleCode: 'UXPM01',
      allocation: '100%',
      projectAssignments: ['P02']
    }
  ],
  deliverables: [
    {
      id: 'd1',
      name: 'High-Fidelity Mocks',
      code: 'D01',
      projectCode: 'P01',
      links: ['https://figma.com/design/P01'],
      dueDate: '2026-11-01',
      status: 'Completed'
    },
    {
      id: 'd2',
      name: 'Technical Spec Doc',
      code: 'D02',
      projectCode: 'P01',
      links: ['https://docs.google.com/D02', 'https://github.com/spec/D02'],
      dueDate: '2026-11-15',
      status: 'In Progress'
    },
    {
      id: 'd3',
      name: 'Infrastructure Plan',
      code: 'D03',
      projectCode: 'P02',
      links: [],
      dueDate: '2026-12-01',
      status: 'Not Started'
    }
  ],
  milestones: [
    {
      id: 'm1',
      name: 'Director Review',
      code: 'M01',
      projectCode: 'P01',
      dueDate: '2026-10-25',
      status: 'Completed',
      statusDetails: 'Approved by Director. All feedback addressed.'
    },
    {
      id: 'm2',
      name: 'Handoff to Engg',
      code: 'M02',
      projectCode: 'P01',
      dueDate: '2026-11-20',
      status: 'Scheduled',
      statusDetails: 'Meeting invitation sent to engineering leads.'
    },
    {
      id: 'm3',
      name: 'Leadership Review',
      code: 'M03',
      projectCode: 'P02',
      dueDate: '2026-02-15',
      status: 'TBD',
      statusDetails: 'Pending final migration scope confirmation.'
    }
  ],
  config: {
    projectStatuses: ['NOT STARTED', 'PLANNING', 'ON TRACK', 'AT RISK', 'BLOCKED', 'CANCELLED', 'COMPLETED'],
    resourceRoles: ['UX Program Manager', 'UX Designer', 'Visual Designer', 'Motion Designer', 'Engineer', 'Design Manager', 'Lead', 'QA', 'Contractor', 'Agency'],
    milestoneStatuses: ['TBD', 'Scheduled', 'Completed'],
    deliverableStatuses: ['Not Started', 'In Progress', 'On Hold', 'Review', 'Completed'],
    headerIcons: [
      'fa-layer-group',
      'fa-ship',
      'fa-anchor',
      'fa-compass',
      'fa-map',
      'fa-shield-alt',
      'fa-briefcase',
      'fa-chart-line',
      'fa-rocket',
      'fa-gem'
    ],
    theme: {
      primary: '#4f46e5',
      onPrimary: '#ffffff',
      code: '#4338ca',
      boldText: '#1e293b',
      ganttBar: '#e0e7ff',
      ganttMilestone: '#4f46e5',
      ganttGoal: '#f43f5e',
      statusNotStarted: '#94a3b8',
      statusPlanning: '#0ea5e9',
      statusOnTrack: '#10b981',
      statusAtRisk: '#f59e0b',
      statusBlocked: '#e11d48',
      statusCompleted: '#3b82f6',
      statusCancelled: '#64748b'
    }
  }
};
