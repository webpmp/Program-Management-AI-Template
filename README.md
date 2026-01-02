<img src="https://github.com/webpmp/webpmp.github.io/blob/master/hero-pgm-ai-template.png" alt="Program Management AI Template" style="max-width: 90%;">

# Program Management AI Template

A streamlined, single-page executive dashboard designed for Program Managers to track multiple projects, resources, and deliverables with an integrated AI agent.

## 🚀 Key Features

- **AI Program Assistant**: A persistent sidebar agent that answers natural language questions about project statuses, resource allocations, and deliverable links.
- **Smart Executive Summary**: Generates a high-level summary of selected projects, including an "Overall Program Health" assessment and "Path to Green" recovery plans for at-risk items.
- **Interactive Program Timeline**: A Gantt-style visualization of project durations and milestones with built-in filtering capabilities.
- **Dynamic Data Tables**: Spreadsheet-style interfaces for managing Projects (P##), Resources (Role Codes), Milestones (M##), and Deliverables (D##).
- **Inline Editing**: All data can be updated directly within the UI, with automatic Role Code generation for new resources.
- **Theming & Configuration**: Fully customizable status lists, role types, icons, and brand colors via the Program Settings page.

## 🛠 Technical Stack

- **Framework**: React 19 (ESM via esm.sh)
- **Styling**: Tailwind CSS (Typography plugin)
- **Icons**: FontAwesome 6
- **AI Integration**: `@google/genai` (Gemini 3 Flash/Pro)
- **Markdown Rendering**: `marked`

## 📋 How to Use

### 1. Initial Setup
The application initializes with data from `constants.ts`. You can modify this file to set your starting program state.

### 2. Updating Projects
- Add rows to the **Projects** table to define new initiatives.
- Use the **Status Details** field to provide context; the AI uses this to determine if a "Path to Green" is needed.

### 3. Resource Allocation
- Assign resources to projects using the multi-select project code dropdown.
- Role codes (e.g., `UXD01`, `PM02`) are automatically generated based on the selected role to ensure consistency.

### 4. Generating Reports
- Click **Generate with AI** in the Executive Summary section.
- Select the specific projects you want to include in the report.
- If projects are "At Risk", the system will prompt you for a "Path to Green" before finalizing the summary.

### 5. Customization
- Scroll to the footer and click **Program Settings**.
- Modify project statuses, add new resource roles, or change the primary theme colors to match your brand.

## 🤖 AI Agent Examples
You can ask the sidebar agent questions like:
- "Who is working on [Project P01]?"
- "What is the status of the High-Fidelity Mocks deliverable?"
- "Which projects are currently At Risk?"
- "Give me a list of all deliverables due in December."

## 📄 License
This template is designed for internal program management and executive reporting.
