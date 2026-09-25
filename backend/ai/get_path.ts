import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { TavilySearch } from "@langchain/tavily";
import { z } from "zod";
import Opportunity from "../models/opportunity_model";

const matchSchema = z.object({
  matches: z.array(
    z.object({
      opportunity_id: z.string().optional(),
      title: z.string(),
      source: z.enum(["DATABASE", "LIVE_SEARCH"]),
      eligibility_status: z.enum(["ELIGIBLE", "WORKABLE", "NOT_ELIGIBLE"]),
      fit_score: z.number().min(0).max(100),
      reasoning: z.string(),
      program_overview: z.string(),
      application_strategy: z.string(),
      gaps: z.array(
        z.object({
          criterion: z.string(),
          is_fixable: z.boolean(),
          how_to_close: z.string().optional(),
        }),
      ),
      application_url: z.string().optional(),
      deadline: z.string().optional(),
    }),
  ),
});

const model = new ChatGoogleGenerativeAI({
  model: "gemini-3.6-flash",
  temperature: 0.3,
}).withStructuredOutput(matchSchema);

const typeMap: Record<string, string> = {
  SCHOLARSHIP: "SCHOLARSHIP",
  INTERNSHIP: "INTERNSHIP",
  JOB: "JOB",
  GRADUATE_SCHOOL: "FELLOWSHIP",
  ADMISSION_ABROAD: "ADMISSION",
};

const goalTerms: Record<string, string> = {
  SCHOLARSHIP: "scholarships",
  INTERNSHIP: "internship programs",
  JOB: "graduate trainee programs",
  GRADUATE_SCHOOL: "masters/PhD funded programs",
  ADMISSION_ABROAD: "university admission requirements and open applications",
};

const MATCHING_SYSTEM_PROMPT = `You are a career and scholarship guidance assistant.

You will score each opportunity for this user and classify it as:
- ELIGIBLE: user already meets all required criteria
- WORKABLE: user does not fully meet criteria yet, but the gap is realistically closeable
  (e.g. experience, certifications, leadership roles, or a CGPA slightly below cutoff that
  can sometimes be offset by strong experience)
- NOT_ELIGIBLE: user fails a hard, unchangeable requirement
  (e.g. age above max_age, wrong country/citizenship, degree level mismatch)

Gaps are not limited to eligibility criteria (grades, experience, age) — they also include
required PROCESS steps mentioned in the opportunity's description or search content, such as
needing to secure a supervisor's agreement, contact an admissions office, or obtain a
recommendation letter from a specific person. Treat these as fixable gaps with a concrete
action (e.g. "Email the program coordinator to request supervisor approval before applying"),
not as reasons to mark someone NOT_ELIGIBLE.

For every ELIGIBLE or WORKABLE match, list specific gaps in the "gaps" array, mark whether
each gap is fixable, and if fixable, give one concrete action the user can take.

Only include NOT_ELIGIBLE opportunities if they are very close to qualifying — otherwise
exclude them entirely rather than showing the user a hopeless case.

For every match, also provide:
- "program_overview": 2-3 sentences explaining what this program actually is, its mission,
  and what qualities or values it looks for in candidates.
- "application_strategy": specific, actionable advice for THIS user's application, tied to
  what the program values (e.g. which of their experiences to foreground and why).

Mark database opportunities as source "DATABASE" and web results as "LIVE_SEARCH".
For LIVE_SEARCH items, extract application_url and deadline from the content if visible.

If a field does not apply or is unknown (opportunity_id for a live-search result,
application_url or deadline you cannot find, how_to_close for a gap that is not fixable),
OMIT that field entirely from your response rather than setting it to null.

Do not invent opportunities that are not present in the provided data.`;

function normalize(matches: any[]) {
  return matches
    .map((m) => ({
      ...m,
      opportunity_id: m.opportunity_id ?? null,
      application_url: m.application_url ?? null,
      deadline: m.deadline ?? null,
      gaps: m.gaps.map((g: any) => ({
        ...g,
        how_to_close: g.how_to_close ?? null,
      })),
    }))
    .sort((a, b) => b.fit_score - a.fit_score);
}

// Pulls from YOUR OWN Opportunity collection only — fast, free, no external calls.
export const getCandidatesFromDB = async (user: any) => {
  const query: any = {
    is_active: true,
    // allow opportunities with no deadline set yet, alongside ones that haven't passed
    $or: [
      { deadline: { $exists: false } },
      { deadline: null },
      { deadline: { $gte: new Date() } },
    ],
    "eligibility.status": user.status,
    type: { $in: user.goals.map((g: string) => typeMap[g]) },
  };

  if (user.course_of_study) {
    query.$and = [
      {
        $or: [
          { "eligibility.course_keywords": { $exists: false } },
          { "eligibility.course_keywords": { $size: 0 } },
          {
            "eligibility.course_keywords": {
              $elemMatch: { $regex: user.course_of_study, $options: "i" },
            },
          },
        ],
      },
    ];
  }

  return Opportunity.find(query).limit(30);
};

// Goes OUT to the web via Tavily — slower, costs money per call.
// Only ever called by the daily cron job, never on a live dashboard request.
async function getLiveCandidates(user: any, existingTitles: Set<string>) {
  const searchTool = new TavilySearch({
    maxResults: 15,
    tavilyApiKey: process.env.TAVILY_API_KEY,
  });

  const countries = user.preferred_countries?.length
    ? user.preferred_countries.join(", ")
    : "worldwide";

  const searches = user.goals.map((goal: string) => {
    const query = `${goalTerms[goal]} for ${user.status.toLowerCase()} in ${
      user.course_of_study || "any field"
    }, CGPA ${user.current_grade ?? "not specified"}, ${countries}, 2026 deadlines`;
    return searchTool.invoke({ query });
  });

  const resultsPerGoal = await Promise.all(searches);
  const allResults = resultsPerGoal.flat();

  return allResults.filter((r: any) => {
    const normalizedTitle = r.title?.toLowerCase().trim();
    return normalizedTitle && !existingTitles.has(normalizedTitle);
  });
}

// USED BY: the on-demand dashboard request (recommend_path), and as a
// fallback for a brand-new user who hasn't had a cron run yet.
// Only scores against your OWN database — no Tavily call, no web search.
export const fetch_opportunities = async (user: any) => {
  const dbCandidates = await getCandidatesFromDB(user);

  const response = await model.invoke([
    { role: "system", content: MATCHING_SYSTEM_PROMPT },
    {
      role: "user",
      content: JSON.stringify({
        profile: {
          age: user.age,
          status: user.status,
          course: user.course_of_study,
          grade: user.current_grade,
          skills: user.skill,
          goals: user.goals,
          preferred_countries: user.preferred_countries,
          work_experience: user.work_experience,
          leadership_experience: user.leadership_experience,
          certifications: user.certifications,
        },
        database_opportunities: dbCandidates.map((o: any) => ({
          id: o._id,
          title: o.title,
          description: o.description,
          eligibility: o.eligibility,
          required_skills: o.required_skills,
          required_certifications: o.required_certifications,
          deadline: o.deadline,
          application_url: o.application_url,
        })),
        live_search_results: [], // none — this path never does live search
      }),
    },
  ]);

  return normalize(response.matches);
};

// USED ONLY BY: the daily cron job. Does the full expensive pipeline —
// your database AND a live web search — then returns matches so the cron
// can decide which live-search finds are worth permanently saving.
export const discover_new_opportunities = async (user: any) => {
  const dbCandidates = await getCandidatesFromDB(user);
  const existingTitles = new Set(
    dbCandidates.map((o: any) => o.title.toLowerCase().trim()),
  );
  const liveResults = await getLiveCandidates(user, existingTitles);

  const response = await model.invoke([
    { role: "system", content: MATCHING_SYSTEM_PROMPT },
    {
      role: "user",
      content: JSON.stringify({
        profile: {
          age: user.age,
          status: user.status,
          course: user.course_of_study,
          grade: user.current_grade,
          skills: user.skill,
          goals: user.goals,
          preferred_countries: user.preferred_countries,
          work_experience: user.work_experience,
          leadership_experience: user.leadership_experience,
          certifications: user.certifications,
        },
        database_opportunities: dbCandidates.map((o: any) => ({
          id: o._id,
          title: o.title,
          description: o.description,
          eligibility: o.eligibility,
          required_skills: o.required_skills,
          required_certifications: o.required_certifications,
          deadline: o.deadline,
          application_url: o.application_url,
        })),
        live_search_results: liveResults,
      }),
    },
  ]);

  return normalize(response.matches);
};
