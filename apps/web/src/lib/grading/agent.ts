// Vision-LLM grading agent. Sends the card image(s) to Claude with the serialized
// PSA rubric baked into a cached system prompt, and forces a structured verdict via
// tool use so we never regex-parse free text. The guardrail (mapping.ts) owns the
// final reconciled `overall`/`notes`; this agent only proposes.
import Anthropic from '@anthropic-ai/sdk'
import { AgentOutputSchema, type GradeRequest, type AgentOutput } from './schema'
import { loadRubric, serializeRubricForPrompt } from './rubric'

const client = new Anthropic()

// BGS is unsupported for now — every submission is graded against the PSA rubric.
const MODEL = 'claude-sonnet-5'

// JSON Schema mirror of AgentOutput (minus `notes`, which the guardrail derives).
// This is the contract the model must satisfy when it calls `submit_grade`.
const SUBMIT_GRADE_TOOL: Anthropic.Tool = {
  name: 'submit_grade',
  description:
    'Submit the final grading verdict for the card. Call this exactly once with your ' +
    'centering, corners, edges, and surface assessments plus an overall grade.',
  input_schema: {
    type: 'object',
    properties: {
      house: { type: 'string', enum: ['PSA', 'BGS'] },
      overall: { type: 'number', description: 'Overall grade on the PSA 1–10 scale (half-grades allowed, no 9.5).' },
      overallRange: {
        type: 'array',
        items: { type: 'number' },
        minItems: 2,
        maxItems: 2,
        description: 'Plausible [low, high] range for the overall grade.',
      },
      confidence: { type: 'string', enum: ['high', 'medium', 'low'] },
      photoQuality: { type: 'string', enum: ['good', 'marginal', 'poor'] },
      factors: {
        type: 'array',
        minItems: 4,
        maxItems: 4,
        description: 'Exactly four factors: centering, corners, edges, surface.',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string', enum: ['centering', 'corners', 'edges', 'surface'] },
            score: { type: 'number', description: 'Factor grade on the PSA 1–10 scale (half-grades allowed, no 9.5).' },
            range: {
              type: 'array',
              items: { type: 'number' },
              minItems: 2,
              maxItems: 2,
              description: 'Plausible [low, high] range for this factor.',
            },
            reasoning: { type: 'string', description: 'Specific visual evidence for the score.' },
          },
          required: ['name', 'score', 'range', 'reasoning'],
        },
      },
      summary: { type: 'string', description: 'One short paragraph summarizing the verdict for the user.' },
    },
    required: ['house', 'overall', 'overallRange', 'confidence', 'photoQuality', 'factors', 'summary'],
  },
}

// Detect media_type from a data-url prefix (png vs jpeg); default to jpeg. Then
// strip the prefix so we send raw base64 — mirrors the quality-check route.
function toImageBlock(image: string): Anthropic.ImageBlockParam {
  const mediaType: 'image/png' | 'image/jpeg' = /^data:image\/png;base64,/i.test(image)
    ? 'image/png'
    : 'image/jpeg'
  const data = image.replace(/^data:image\/\w+;base64,/, '')
  return { type: 'image', source: { type: 'base64', media_type: mediaType, data } }
}

function buildSystemPrompt(request: GradeRequest): string {
  // Always PSA for now — BGS routing collapses to the PSA rubric.
  const rubric = serializeRubricForPrompt(loadRubric(request.house === 'BGS' ? 'PSA' : 'PSA'))

  return [
    'You are a meticulous, veteran PSA card grader. You assess four factors — centering, ' +
      'corners, edges, and surface — each on the PSA 1–10 scale, then assign an overall grade. ' +
      'Half-grades are allowed EXCEPT 9.5 (there is no PSA 9.5). Be conservative and honest: ' +
      'when the evidence is ambiguous, grade down and widen your range rather than guessing high. ' +
      'Never invent flaws you cannot see, and never assume perfection you cannot verify.',
    'PSA RUBRIC:\n' + rubric,
    // Surface ceiling: flat/even light hides scratches, print lines, and gloss breaks.
    'SURFACE CEILING RULE (critical): Obey the rubric\'s surfaceCeiling constraint. Under flat or ' +
      'even light you CANNOT reliably see fine scratches, print lines, or gloss defects, so you must ' +
      'NOT claim a clean surface you cannot verify. When only flat-light frames are available, cap the ' +
      'surface score accordingly and lower its confidence — say so in the surface reasoning. A raking-light ' +
      `frame is required to justify a high surface grade. Input lighting for this submission: "${request.lighting}". ` +
      (request.lighting === 'raking'
        ? 'A raking-light photo was provided, so surface defects should be more visible — grade surface accordingly.'
        : request.lighting === 'even'
          ? 'Only even/flat light was provided, so treat any high surface grade with caution and keep surface confidence lower.'
          : 'Lighting is unknown, so do not assume raking light — be cautious with surface.'),
    'OUTPUT CONTRACT: Do not reply with prose. Call the `submit_grade` tool exactly once with your ' +
      'full verdict: house, overall, overallRange, confidence, photoQuality, exactly four factors ' +
      '(centering, corners, edges, surface) each with score/range/reasoning, and a short summary. ' +
      'Scores and ranges must sit on the PSA 1–10 scale.',
  ].join('\n\n')
}

export async function gradeCard(request: GradeRequest): Promise<AgentOutput> {
  const content: Anthropic.ContentBlockParam[] = [toImageBlock(request.front)]
  if (request.back) content.push(toImageBlock(request.back))
  content.push({
    type: 'text',
    text:
      'Grade this card. The first image is the front' +
      (request.back ? ' and the second is the back' : ' (no back image was provided)') +
      '. Assess centering, corners, edges, and surface, then call `submit_grade`.',
  })

  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1500,
    temperature: 0,
    system: [
      { type: 'text', text: buildSystemPrompt(request), cache_control: { type: 'ephemeral' } },
    ],
    tools: [SUBMIT_GRADE_TOOL],
    tool_choice: { type: 'tool', name: 'submit_grade' },
    messages: [{ role: 'user', content }],
  })

  const toolUse = message.content.find((b) => b.type === 'tool_use')
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('Grading agent did not return a submit_grade tool call')
  }

  const parsed = AgentOutputSchema.parse(toolUse.input)
  // BGS is unsupported — force PSA regardless of what the model emitted.
  return { ...parsed, house: 'PSA' }
}
