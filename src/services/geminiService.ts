import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from "../types";

const API_KEY = "AIzaSyD_N_2KAoGF__U18o7KFJzWRu6QQ2e-s2I";

const createAnalysisPrompt = (
  task: string,
  submission: string,
  major: string,
  specialization: string,
  grade: string,
): string => {
  return `You are an expert academic evaluator specializing in ${major} - ${specialization} for Grade ${grade} students.

ASSIGNMENT TASK: "${task}"

STUDENT SUBMISSION:
"${submission}"

Please provide a comprehensive evaluation in JSON format.

Evaluation Guidelines:
1. For CODE submissions: Check syntax, logic, best practices, comments, functionality.
2. For ESSAYS: Evaluate structure, argument quality, evidence, writing clarity, topic adherence.
3. For MATH: Verify calculations, problem-solving approach, work shown, final answers.
4. For PROJECTS: Assess planning, execution, documentation, innovation, results.
5. For RESEARCH: Check sources, methodology, analysis, conclusions, presentation.

Consider the student's grade level (${grade}) and provide age-appropriate feedback that encourages learning while maintaining academic standards. Provide constructive, specific, and actionable feedback. Be encouraging but honest about areas needing improvement.
`;
};

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    score: { type: Type.INTEGER, description: "Overall score from 0 to 100." },
    strengths: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 3 strengths observed in the submission.",
    },
    feedback: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of 2 areas for improvement.",
    },
    suggestions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        "List of 3 specific, actionable suggestions for the student.",
    },
    criteriaScores: {
      type: Type.OBJECT,
      properties: {
        content_quality: {
          type: Type.INTEGER,
          description: "Score from 0-100 for content quality.",
        },
        technical_accuracy: {
          type: Type.INTEGER,
          description: "Score from 0-100 for technical accuracy.",
        },
        presentation: {
          type: Type.INTEGER,
          description: "Score from 0-100 for presentation and clarity.",
        },
        completeness: {
          type: Type.INTEGER,
          description: "Score from 0-100 for task completeness.",
        },
        innovation: {
          type: Type.INTEGER,
          description: "Score from 0-100 for innovation and creativity.",
        },
      },
      required: [
        "content_quality",
        "technical_accuracy",
        "presentation",
        "completeness",
        "innovation",
      ],
    },
    detailedAnalysis: {
      type: Type.STRING,
      description:
        "A detailed paragraph explaining the overall assessment and rationale for the score.",
    },
    gradeLevelFeedback: {
      type: Type.STRING,
      description:
        "A brief comment on how well the submission matches the expectations for the specified grade level.",
    },
  },
  required: [
    "score",
    "strengths",
    "feedback",
    "suggestions",
    "criteriaScores",
    "detailedAnalysis",
    "gradeLevelFeedback",
  ],
};

const getFallbackAnalysis = (submission: string): AnalysisResult => {
  const wordCount = submission.split(/\s+/).length;
  let baseScore = 70;

  if (wordCount > 500) baseScore += 15;
  if (wordCount > 1000) baseScore += 10;
  if (submission.includes("def ") || submission.includes("function "))
    baseScore += 10;
  if (wordCount > 300) baseScore += 10;

  const finalScore = Math.min(baseScore, 100);

  return {
    score: finalScore,
    strengths: [
      "Submission completed",
      "Good effort shown",
      "Appropriate length",
    ],
    feedback: [
      "AI service temporarily unavailable",
      "This is a basic, automated review.",
      "Manual review by an instructor is recommended.",
    ],
    suggestions: [
      "Continue working on the assignment",
      "Review requirements carefully",
      "Seek feedback from your instructor",
    ],
    criteriaScores: {
      content_quality: finalScore,
      technical_accuracy: Math.max(finalScore - 10, 0),
      presentation: Math.max(finalScore - 5, 0),
      completeness: finalScore,
      innovation: Math.max(finalScore - 15, 0),
    },
    detailedAnalysis:
      "Fallback analysis due to an API error. The AI service was temporarily unavailable. Basic metrics like word count and keywords were evaluated to provide a provisional score. Please try again later for a full AI-powered analysis.",
    gradeLevelFeedback:
      "Standard evaluation applied due to service unavailability.",
  };
};

export const analyzeSubmission = async (
  task: string,
  submission: string,
  major: string,
  specialization: string,
  grade: string,
): Promise<AnalysisResult> => {
  try {
    const prompt = createAnalysisPrompt(
      task,
      submission,
      major,
      specialization,
      grade,
    );

    const response = await API_KEY.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
      },
    });

    const aiResponseText = response.text.trim();
    const parsedResponse = JSON.parse(aiResponseText);

    return {
      score: parsedResponse.score || 70,
      strengths: parsedResponse.strengths || ["Good effort."],
      feedback: parsedResponse.feedback || ["Continue to practice."],
      suggestions: parsedResponse.suggestions || ["Review course materials."],
      criteriaScores: parsedResponse.criteriaScores || {
        content_quality: 70,
        technical_accuracy: 70,
        presentation: 70,
        completeness: 70,
        innovation: 70,
      },
      detailedAnalysis:
        parsedResponse.detailedAnalysis || "AI analysis completed.",
      gradeLevelFeedback:
        parsedResponse.gradeLevelFeedback ||
        "Submission is appropriate for the grade level.",
    };
  } catch (error) {
    console.error("Gemini AI Error:", error);
    return getFallbackAnalysis(submission);
  }
};
