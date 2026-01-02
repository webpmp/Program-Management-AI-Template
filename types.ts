
export type ProjectStatus = string;

export interface Project {
  id: string;
  name: string;
  code: string; // P##
  description: string;
  completionDate: string;
  status: ProjectStatus;
  statusDetails: string;
}

export interface Resource {
  id: string;
  name: string;
  role: string; // Descriptive role
  roleCode: string; // UXD##, VXD##, etc.
  allocation: string; // % allocation (e.g. 100%)
  projectAssignments: string[]; // Array of P## codes
}

export interface Deliverable {
  id: string;
  name: string;
  code: string; // D##
  projectCode: string; // P##
  links: string[]; // Changed from link: string to support multiple
  dueDate: string;
  status: string;
}

export interface Milestone {
  id: string;
  name: string;
  code: string; // M##
  projectCode: string; // P##
  dueDate: string;
  status: string;
  statusDetails: string;
}

export interface ThemeConfig {
  primary: string;
  onPrimary: string;
  code: string;
  boldText: string;
  ganttBar: string;
  ganttMilestone: string;
  ganttGoal: string;
  statusNotStarted: string;
  statusPlanning: string;
  statusOnTrack: string;
  statusAtRisk: string;
  statusBlocked: string;
  statusCompleted: string;
  statusCancelled: string;
}

export interface ProgramConfig {
  projectStatuses: string[];
  resourceRoles: string[];
  milestoneStatuses: string[];
  deliverableStatuses: string[];
  headerIcons: string[];
  theme: ThemeConfig;
}

export interface ProgramData {
  programName: string;
  projects: Project[];
  resources: Resource[];
  deliverables: Deliverable[];
  milestones: Milestone[];
  config: ProgramConfig;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}
