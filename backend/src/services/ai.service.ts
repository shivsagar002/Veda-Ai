import dotenv from 'dotenv';
import { IGeneratedPaper, IQuestion, ISection, IQuestionTypeConfig } from '../models/Assignment';

dotenv.config();

// Typed shape of the Gemini API response to avoid 'resData is of type unknown'
interface GeminiCandidate {
  content: {
    parts: Array<{ text: string }>;
  };
}
interface GeminiResponse {
  candidates?: GeminiCandidate[];
  error?: { message: string; code: number };
}

// Standard Physics/Electricity curriculum library for stunning out-of-the-box mock generation
const MOCK_QUESTION_BANK: Record<string, Omit<IQuestion, 'marks' | 'type'>[]> = {
  'Multiple Choice Questions': [
    {
      text: 'Which of the following is the correct unit of electric current?',
      options: ['Ampere (A)', 'Volt (V)', 'Ohm (Ω)', 'Watt (W)'],
      correctAnswer: 'Ampere (A)',
      difficulty: 'Easy',
    },
    {
      text: 'What happens to the resistance of a metallic conductor when its temperature is increased?',
      options: ['It increases', 'It decreases', 'It remains constant', 'It becomes zero'],
      correctAnswer: 'It increases',
      difficulty: 'Moderate',
    },
    {
      text: 'Three resistors of 3Ω each are connected in parallel. What is the equivalent resistance of the circuit?',
      options: ['1Ω', '3Ω', '9Ω', '0.33Ω'],
      correctAnswer: '1Ω',
      difficulty: 'Easy',
    },
    {
      text: 'The mathematical expression of Ohm\'s Law is:',
      options: ['V = IR', 'I = VR', 'R = VI', 'P = VI'],
      correctAnswer: 'V = IR',
      difficulty: 'Easy',
    },
    {
      text: 'Which device is used to measure potential difference in an electrical circuit?',
      options: ['Voltmeter', 'Ammeter', 'Galvanometer', 'Rheostat'],
      correctAnswer: 'Voltmeter',
      difficulty: 'Easy',
    },
    {
      text: 'A material that does not allow electricity to pass through it is called an:',
      options: ['Insulator', 'Conductor', 'Semiconductor', 'Superconductor'],
      correctAnswer: 'Insulator',
      difficulty: 'Easy',
    },
    {
      text: 'The rate of work done or energy consumed per unit time in an electric circuit is known as:',
      options: ['Electric Power', 'Electric Potential', 'Resistance', 'Current'],
      correctAnswer: 'Electric Power',
      difficulty: 'Moderate',
    },
    {
      text: 'If the length of a wire is doubled, its resistance will:',
      options: ['Double', 'Become half', 'Quadruple', 'Remain unchanged'],
      correctAnswer: 'Double',
      difficulty: 'Hard',
    },
  ],
  'Short Questions': [
    {
      text: 'State Ohm\'s Law. Mention the conditions under which it holds true.',
      difficulty: 'Moderate',
    },
    {
      text: 'Define electric potential and potential difference. Write their SI units.',
      difficulty: 'Easy',
    },
    {
      text: 'Why are electrical heating elements (like in bread toasters or hair dryers) made of an alloy rather than a pure metal?',
      difficulty: 'Moderate',
    },
    {
      text: 'Explain the difference between series and parallel combinations of resistors. Include a simple mathematical summary.',
      difficulty: 'Moderate',
    },
    {
      text: 'What is electric power? Derive an expression for electric power in terms of current and resistance.',
      difficulty: 'Hard',
    },
    {
      text: 'Define 1 Ampere. How is it related to the charge passing through a conductor per second?',
      difficulty: 'Easy',
    },
    {
      text: 'What is electrical resistivity? How does it differ from electrical resistance?',
      difficulty: 'Hard',
    },
  ],
  'Diagram/Graph-Based Questions': [
    {
      text: 'Draw a circuit diagram representing three resistors in parallel connected to a 12V battery, an ammeter, a voltmeter across one resistor, and a closed key.',
      difficulty: 'Moderate',
    },
    {
      text: 'Below is a V-I graph plotted for two different metallic wires, A and B. Wire A is steeper than wire B. Which of the wires has higher resistance? Justify your answer.',
      difficulty: 'Hard',
    },
    {
      text: 'Identify and draw the standard symbols for: (a) A rheostat, (b) A plug key open, (c) A wire crossing without joining, (d) A light emitting diode (LED).',
      difficulty: 'Easy',
    },
    {
      text: 'Draw the V-I characteristic curve for a non-ohmic conductor (like a vacuum diode or semiconductor diode) and explain why it does not follow a straight line.',
      difficulty: 'Hard',
    },
  ],
  'Numerical Problems': [
    {
      text: 'An electric bulb is connected to a 220V generator. If the current drawn by the bulb is 0.50A, calculate the power of the bulb and its resistance.',
      difficulty: 'Moderate',
    },
    {
      text: 'An electric iron consumes energy at a rate of 840W when heating is at the maximum rate. The voltage is 220V. Calculate the current and the resistance.',
      difficulty: 'Moderate',
    },
    {
      text: 'A 100W electric bulb is lighted for 8 hours daily. Calculate the energy consumed in kilowatt-hours (kWh) by the bulb in a month of 30 days.',
      difficulty: 'Moderate',
    },
    {
      text: 'Find the equivalent resistance when two resistors of 10Ω and 40Ω are connected in parallel, and this combination is further connected in series with a 12Ω resistor.',
      difficulty: 'Hard',
    },
    {
      text: 'A charge of 120 Coulombs flows through a bulb in 2 minutes. Find the magnitude of electric current passing through the circuit.',
      difficulty: 'Easy',
    },
  ],
};

const DEFAULT_QUESTIONS: Omit<IQuestion, 'marks' | 'type'>[] = [
  {
    text: 'Explain the fundamental concepts behind this topic, giving real-world examples and practical applications.',
    difficulty: 'Moderate',
  },
  {
    text: 'Briefly define the core terms associated with this subject matter and discuss their relevance.',
    difficulty: 'Easy',
  },
  {
    text: 'Discuss the historical context and major scientific developments leading to our current understanding of this topic.',
    difficulty: 'Hard',
  },
];

export const generateAssessmentAI = async (
  subject: string,
  className: string,
  questionConfigs: IQuestionTypeConfig[],
  additionalInstructions: string = '',
  fileBase64?: string,
  fileMimeType?: string
): Promise<IGeneratedPaper> => {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (GEMINI_API_KEY) {
    try {
      console.log(`[AI] ==================== AI GENERATION START ====================`);
      console.log(`[AI] Subject: "${subject}"`);
      console.log(`[AI] Class: "${className}"`);
      console.log(`[AI] Has reference file: ${!!fileBase64} (Mime: ${fileMimeType || 'none'})`);
      console.log(`[AI] Instructions: "${additionalInstructions}"`);
      
      const url = `https://generativelanguage.googleapis.com/v1/models/gemini-3.5-flash:generateContent?key=${GEMINI_API_KEY}`;
      
      const totalMarks = questionConfigs.reduce((acc, q) => acc + q.count * q.marks, 0);

      // Natural-language additions from user inputs
      const teacherNotes = additionalInstructions?.trim()
        ? `\nThe teacher has given these additional instructions: "${additionalInstructions.trim()}". Follow them carefully while setting the paper.`
        : '';

      const fileNote = fileBase64
        ? `\nThe teacher has uploaded a reference document (image/PDF). You MUST carefully study this uploaded material and base ALL questions on the content, topics, diagrams, and examples found within it. Do not generate questions outside of this material.`
        : '';

      const questionBreakdown = questionConfigs
        .map((qc, i) => {
          const section = String.fromCharCode(65 + i); // A, B, C...
          const typeNote =
            qc.type === 'Multiple Choice Questions' || qc.type.toLowerCase().includes('mcq')
              ? '(Each MCQ must have exactly 4 options labelled a, b, c, d. Mark the correct option clearly in correctAnswer.)'
              : qc.type.toLowerCase().includes('numerical')
              ? '(Each numerical must show formula, substitution, and final answer with units in correctAnswer.)'
              : qc.type.toLowerCase().includes('short')
              ? '(Each short answer in correctAnswer should be 2-4 sentences with key points.)'
              : qc.type.toLowerCase().includes('long')
              ? '(Each long answer in correctAnswer must be detailed with headings/steps where needed.)'
              : '(Provide a complete model answer in correctAnswer.)';
          return `  Section ${section} — ${qc.type}: Write EXACTLY ${qc.count} question${qc.count > 1 ? 's' : ''}, each carrying ${qc.marks} mark${qc.marks > 1 ? 's' : ''}. ${typeNote}`;
        })
        .join('\n');

      const subjectLine = subject + (className ? ` for ${className}` : '');
      const titleExample = `${subject} — ${className || 'Annual'} Examination`;

      const prompt = [
        `You are a highly experienced school teacher and expert question paper setter for ${subjectLine} (Grade/Class: ${className || 'General'}).`,
        `Your task is to design a high-quality, professional, and curriculum-aligned examination paper based on the following criteria:`,
        `- Subject: ${subject}`,
        `- Class/Grade: ${className || 'Unspecified'}`,
        `- Total Marks: ${totalMarks}`,
        teacherNotes ? `- Special Instructions from the Teacher: "${teacherNotes}"` : '',
        fileNote ? `- Reference Document: You must analyze the attached document (image/PDF) and create questions directly based on its content, theories, diagrams, or examples.` : '',
        ``,
        `The question paper MUST contain the following sections with the exact specified number of questions and marks:`,
        questionBreakdown,
        ``,
        `Strict Rules for Question Construction:`,
        `1. DO NOT use generic or static question templates. Create highly dynamic, subject-specific, and curriculum-appropriate questions for ${subjectLine}.`,
        `2. If the subject is Mathematics, Science, or Computer Science, include realistic numerical values, formulas, or code snippets where applicable.`,
        `3. If the subject is English, History, or Social Sciences, write high-quality comprehension passages, critical analysis prompts, or context-based questions.`,
        `4. For Multiple Choice Questions (MCQs), provide 4 distinct, plausible options (a, b, c, d). Avoid lazy options like "All of the above" or "None of the above" unless highly relevant.`,
        `5. Every single question must have a complete, accurate, and detailed model answer in the "correctAnswer" field. Never leave it blank, and do not use placeholders like "Write answer here".`,
        `6. Symmetrically distribute question difficulties: 35% Easy, 50% Moderate, 15% Hard.`,
        `7. Ensure the title is elegant and clearly formatted (e.g., "${titleExample}").`,
        ``,
        `Return the response ONLY as a raw, pretty-printed JSON object conforming to the schema below. Do not wrap the JSON in markdown code blocks or code fences (\`\`\`json).`,
        `JSON Schema:`,
        `{`,
        `  "title": "String (e.g., '${titleExample}')",`,
        `  "subject": "${subject}",`,
        `  "totalMarks": ${totalMarks},`,
        `  "duration": "String (e.g., '2 Hours' or '3 Hours')",`,
        `  "instructions": [`,
        `    "All questions are compulsory.",`,
        `    "Read all instructions carefully before writing.",`,
        `    "Marks are indicated next to each question."`,
        `  ],`,
        `  "sections": [`,
        `    {`,
        `      "id": "String (e.g., 'A', 'B', 'C')",`,
        `      "title": "String (e.g., 'Section A — Multiple Choice Questions')",`,
        `      "instruction": "String (e.g., 'Select the most appropriate option.')",`,
        `      "questions": [`,
        `        {`,
        `          "text": "String (The actual subject-specific exam question)",`,
        `          "type": "String ('MCQ' | 'Short' | 'Long' | 'Numerical' | 'Diagram')",`,
        `          "options": ["a", "b", "c", "d"] (Only include this array if type is 'MCQ', otherwise omit or set to undefined),`,
        `          "correctAnswer": "String (The full detailed correct answer key or option text)",`,
        `          "difficulty": "String ('Easy' | 'Moderate' | 'Hard')",`,
        `          "marks": Number (Marks allocated to this question)`,
        `        }`,
        `      ]`,
        `    }`,
        `  ]`,
        `}`
      ].join('\n');

      // Build Gemini request parts — prepend file if uploaded (only if base64 is non-empty)
      const parts: any[] = [{ text: prompt }];
      if (fileBase64 && fileBase64.trim() && fileMimeType) {
        parts.unshift({
          inlineData: {
            mimeType: fileMimeType,
            data: fileBase64,
          },
        });
      }

      console.log(`[AI] Dispatching request to Gemini API...`);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts }],
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        console.error(`[AI] 🔴 Gemini API request failed with status ${response.status}. Error body:`, errBody);
        throw new Error(`Gemini API ${response.status}: ${errBody}`);
      }

      console.log(`[AI] Received HTTP 200 response. Parsing JSON...`);
      const resData = await response.json() as GeminiResponse;
      
      if (resData.error) {
        console.error('[AI] 🔴 Gemini response contains error payload:', resData.error);
        throw new Error(`Gemini API error payload: ${resData.error.message}`);
      }

      const rawText = resData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!rawText) {
        console.error('[AI] 🔴 Gemini response missing candidates or parts:', JSON.stringify(resData));
        throw new Error('Gemini API returned an empty or invalid candidate content structure.');
      }

      console.log(`[AI] Successfully read candidate content (length: ${rawText.length} chars). Validating schema...`);
      
      // Resilient extraction of JSON block from markdown code blocks if present
      let cleanJSON = rawText.trim();
      const codeBlockMatch = cleanJSON.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (codeBlockMatch) {
        cleanJSON = codeBlockMatch[1].trim();
      }
      
      try {
        const parsedJSON = JSON.parse(cleanJSON) as IGeneratedPaper;
        console.log('[AI] ✅ AI assessment question paper generated and validated successfully!');
        console.log(`[AI] ==================== AI GENERATION SUCCESS ====================`);
        return parsedJSON;
      } catch (jsonErr: any) {
        console.error('[AI] 🔴 JSON Syntax Error parsing Gemini response text:', cleanJSON);
        throw jsonErr;
      }

    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error('[AI] ⚠️  Gemini API generation FAILED. Reason:', errMsg);
      throw new Error(`Gemini API Error: ${errMsg}`);
    }
  } else {
    console.error('[AI] 🔴 No GEMINI_API_KEY found in environment.');
    throw new Error('AI generation failed: GEMINI_API_KEY is missing from server configuration.');
  }

  // Elegant fallback local generator
  console.log('Executing premium local assessment generator...');
  
  const sections: ISection[] = [];
  let sectionCharCode = 65; // A, B, C, ...
  let currentTotalMarks = 0;

  for (const config of questionConfigs) {
    if (config.count <= 0) continue;

    const sectionId = String.fromCharCode(sectionCharCode++);
    const questions: IQuestion[] = [];
    
    // Fetch appropriate bank or use fallback
    const bank = MOCK_QUESTION_BANK[config.type] || DEFAULT_QUESTIONS;
    
    for (let i = 0; i < config.count; i++) {
      // Pick a question cyclically to handle any count requested
      const bankItem = bank[i % bank.length];
      
      const newQuestion: IQuestion = {
        text: bankItem.text,
        type: config.type === 'Multiple Choice Questions' ? 'MCQ' : config.type,
        options: bankItem.options ? [...bankItem.options] : undefined,
        correctAnswer: bankItem.correctAnswer,
        difficulty: bankItem.difficulty as 'Easy' | 'Moderate' | 'Hard',
        marks: config.marks,
      };
      
      questions.push(newQuestion);
    }

    sections.push({
      id: sectionId,
      title: `SECTION ${sectionId} - ${config.type.toUpperCase()}`,
      instruction: `Attempt all questions. Each question carries ${config.marks} mark(s).`,
      questions,
    });

    currentTotalMarks += config.count * config.marks;
  }

  console.warn(`[AI] Serving STATIC fallback questions for subject="${subject}" — these are NOT AI-generated.`);
  return {
    title: `${subject} – ${className ? className + ' ' : ''}Unit Assessment`,
    subject,
    totalMarks: currentTotalMarks,
    duration: '2 Hours',
    instructions: [
      'Write your name, roll number, and section clearly in the provided space.',
      'All questions are compulsory.',
      'Use of calculators is permitted where necessary.',
      'Review all answers before final submission.'
    ],
    sections,
  };
};
