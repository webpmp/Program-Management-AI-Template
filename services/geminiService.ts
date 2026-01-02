
import { GoogleGenAI, Type } from "@google/genai";
import { ProgramData, Project } from "../types";

export const askAgent = async (question: string, data: ProgramData) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const systemInstruction = `
    You are an expert Program Management AI Assistant. 
    Below is the current state of a Program consisting of Projects, Resources, Milestones, and Deliverables.
    
    PROJECTS:
    ${JSON.stringify(data.projects, null, 2)}
    
    RESOURCES:
    ${JSON.stringify(data.resources, null, 2)}
    
    MILESTONES (Important Events):
    ${JSON.stringify(data.milestones, null, 2)}
    
    DELIVERABLES:
    ${JSON.stringify(data.deliverables, null, 2)}
    
    Answer user questions based ONLY on the provided data. 
    Use the following relationships:
    - Projects are identified by P## (e.g., P01).
    - Deliverables are identified by D## and relate to a project via projectCode.
    - Milestones are identified by M## and relate to a project via projectCode.
    - Resources are assigned to projects via projectAssignments (list of P##).
    
    CRITICAL: ALWAYS format all dates as MM/DD/YY (e.g., 12/25/26). Do not use any other date format.
    
    Be concise, helpful, and professional. If you don't know the answer, say you don't have enough data.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: question,
      config: {
        systemInstruction,
        temperature: 0.1,
      },
    });

    return response.text || "I'm sorry, I couldn't process that question.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error communicating with the AI agent.";
  }
};

/**
 * Analyzes AT RISK or BLOCKED projects from a specific subset to see if they have an obvious Path to Green.
 * Returns a list of project codes that need user input.
 */
export const identifyMissingPTG = async (data: ProgramData, selectedProjectIds?: string[]): Promise<string[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  let problematicProjects = data.projects.filter(p => p.status === 'AT RISK' || p.status === 'BLOCKED');
  if (selectedProjectIds && selectedProjectIds.length > 0) {
    problematicProjects = problematicProjects.filter(p => selectedProjectIds.includes(p.id));
  }
  
  if (problematicProjects.length === 0) return [];

  const prompt = `
    Analyze the following projects that are currently AT RISK or BLOCKED. 
    Determine if the "statusDetails" provides a clear, actionable "Path to Green" (a plan to get back on track).
    If a clear recovery plan is NOT obvious, list the Project Code.
    
    PROJECTS TO ANALYZE:
    ${JSON.stringify(problematicProjects.map(p => ({ code: p.code, name: p.name, details: p.statusDetails })), null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            needsPTG: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Array of Project Codes (e.g. P01) that lack an obvious recovery plan."
            }
          },
          required: ["needsPTG"]
        }
      },
    });

    const parsed = JSON.parse(response.text || '{"needsPTG":[]}');
    return parsed.needsPTG || [];
  } catch (error) {
    console.error("PTG Analysis Error:", error);
    return [];
  }
};

export const generateProgramSummary = async (data: ProgramData, ptgContext?: Record<string, string>, selectedProjectIds?: string[]) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  // Filter data based on selection if provided
  const filteredProjects = selectedProjectIds && selectedProjectIds.length > 0 
    ? data.projects.filter(p => selectedProjectIds.includes(p.id))
    : data.projects;
    
  const projectCodes = filteredProjects.map(p => p.code);
  
  const filteredMilestones = data.milestones.filter(m => projectCodes.includes(m.projectCode));
  const filteredDeliverables = data.deliverables.filter(d => projectCodes.includes(d.projectCode));
  
  // Only include resources assigned to at least one of the selected projects
  const filteredResources = data.resources.filter(r => 
    r.projectAssignments.some(code => projectCodes.includes(code))
  );

  let ptgString = "";
  if (ptgContext && Object.keys(ptgContext).length > 0) {
    ptgString = "\n\nADDITIONAL PATH TO GREEN CONTEXT PROVIDED BY USER:\n" + 
      Object.entries(ptgContext).map(([code, ptg]) => {
        const project = data.projects.find(p => p.code === code);
        return `- ${project?.name || code}: ${ptg}`;
      }).join("\n");
  }

  const prompt = `
    Based on the following data, generate a high-level "Executive Summary" in rich Markdown format.
    
    STRICT SCOPE REQUIREMENT:
    You are generating a summary ONLY for the specific projects listed in the "PROJECTS TO SUMMARIZE" section. 
    1. The "OVERALL PROGRAM HEALTH" section MUST be calculated and described based solely on the statuses, risks, and health of these specific projects. If all selected projects are on track, the program health is healthy, regardless of other projects in the database.
    2. DO NOT include, mention, or count any projects that are not in the "PROJECTS TO SUMMARIZE" list.
    3. The summary must be a self-contained report as if the rest of the program doesn't exist.

    IMPORTANT FORMATTING RULES:
    - Do NOT include a top-level title or header. Start directly with the content.
    - DO NOT use the ">" sign for blockquotes or indentation.
    - CRITICAL: Use FULL NAMES for Projects (e.g., "Mobile App Redesign" instead of "P01").
    - CRITICAL: Use FULL NAMES for Resources followed by their ROLE CODE in parentheses. 
      Example: "Alice Johnson (UXD01)".
    - CRITICAL: ALWAYS format all dates as MM/DD/YY (e.g., 12/25/26).
    - STYLE: Every time you mention the phrase "Path to Green", you MUST wrap it in a span with green color, like this: <span style="color: #16a34a; font-weight: bold;">Path to Green</span>.
    
    Structure the response with:
    1. Overall Program Health bolded (reflecting only the selected subset).
    2. Summary of progress per project.
    3. Major upcoming deliverables and MILESTONES (important events like reviews or handoffs).
    4. Risks/Blockers with the <span style="color: #16a34a; font-weight: bold;">Path to Green</span>.
    
    Keep it professional and concise (max 250 words).
    
    PROJECTS TO SUMMARIZE (Strictly limit to these):
    ${JSON.stringify(filteredProjects.map(p => ({ code: p.code, name: p.name, status: p.status, details: p.statusDetails })), null, 2)}
    
    RESOURCES (Filtered to those on selected projects):
    ${JSON.stringify(filteredResources.map(r => ({ name: r.name, roleCode: r.roleCode, projects: r.projectAssignments.filter(c => projectCodes.includes(c)) })), null, 2)}

    MILESTONES (filtered):
    ${JSON.stringify(filteredMilestones, null, 2)}

    DELIVERABLES (filtered):
    ${JSON.stringify(filteredDeliverables, null, 2)}
    ${ptgString}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        temperature: 0.3,
      },
    });

    return response.text || "Unable to generate summary.";
  } catch (error) {
    console.error("Gemini Summary Error:", error);
    return "Error generating summary. Please check your data or API key.";
  }
};
