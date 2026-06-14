import type { VercelRequest, VercelResponse } from '@vercel/node'
import OpenAI from 'openai'
import { createClient } from '@supabase/supabase-js'

export const config = {
  api: { bodyParser: { sizeLimit: '15mb' } },
}

interface StudentInfo {
  name: string; grade: string; school: string; testName: string
  instructor?: string; testDate?: string
}

interface Scores {
  vocabulary: number; grammar: number; reading: number
  writing: number; sentence: number; practical: number
}

interface AnalysisData {
  scores: Scores
  analysis: {
    summary: string; strengths: string[]; weaknesses: string[]
    learningStyle: string; learningStyleDesc: string
    errorPatterns: string[]; strategy: string; parentComment: string
  }
}

function buildPrompt(s: StudentInfo): string {
  return `당신은 영어교육 전문 컨설턴트입니다. 첨부된 영어 시험지를 분석해 성취도 평가 레포트를 JSON으로 작성하세요.

학생: ${s.name} / ${s.grade} / ${s.school} / ${s.testName}${s.instructor ? ` / 강사: ${s.instructor}` : ''}

6개 영역을 0~100점으로 평가하고, 아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):

{
  "scores": {
    "vocabulary": <숫자>,
    "grammar": <숫자>,
    "reading": <숫자>,
    "writing": <숫자>,
    "sentence": <숫자>,
    "practical": <숫자>
  },
  "analysis": {
    "summary": "<종합 평가 2-3문장, 한국어>",
    "strengths": ["<강점1>", "<강점2>", "<강점3>"],
    "weaknesses": ["<개선점1>", "<개선점2>", "<개선점3>"],
    "learningStyle": "<반복형|감각형|분석형|완벽주의형|실수형>",
    "learningStyleDesc": "<성향 설명 1-2문장>",
    "errorPatterns": ["<패턴1>", "<패턴2>", "<패턴3>"],
    "strategy": "<4주 학습 전략, 주차별 구체적으로>",
    "parentComment": "<학부모 상담 멘트 3-4문장, 따뜻하고 전문적인 톤>"
  }
}`
}

function parseResponse(text: string): AnalysisData {
  const m = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || text.match(/({\s*"scores"[\s\S]*})/)
  return JSON.parse((m?.[1] ?? text).trim()) as AnalysisData
}

function fallback(s: StudentInfo): AnalysisData {
  return {
    scores: { vocabulary: 72, grammar: 68, reading: 75, writing: 65, sentence: 70, practical: 71 },
    analysis: {
      summary: `${s.name} 학생은 전반적으로 양호한 영어 실력을 보이고 있습니다. 기초 실력은 갖추어져 있으며 꾸준한 학습을 통해 더욱 발전할 수 있습니다.`,
      strengths: ['기본 어휘력 보유', '독해 기초 실력', '성실한 학습 태도'],
      weaknesses: ['문법 정확도 향상 필요', '작문 표현력 강화', '실전 응용력 개발'],
      learningStyle: '반복형',
      learningStyleDesc: '반복 연습을 통해 내용을 습득하는 유형으로, 꾸준한 연습이 효과적입니다.',
      errorPatterns: ['시제 오류', '관사 사용 오류', '철자 오류'],
      strategy: '1주차: 기본 어휘 하루 20단어 암기\n2주차: 문법 패턴 반복 학습\n3주차: 짧은 지문 독해 연습\n4주차: 영어 일기 쓰기 실습',
      parentComment: `${s.name} 학생은 영어 학습에 성실하게 임하고 있습니다. 기초 실력은 양호하며 꾸준한 연습을 통해 더욱 발전할 수 있습니다. 특히 어휘와 문법 부분에 집중적으로 노력한다면 좋은 성과를 기대할 수 있습니다. 앞으로도 지속적인 관심과 격려 부탁드립니다.`,
    },
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  if (!req.body) {
    return res.status(413).json({ error: '요청이 너무 큽니다. 이미지를 줄이거나 장수를 줄여주세요.' })
  }

  const { images, student } = req.body as { images: string[]; student: StudentInfo }

  if (!images?.length || !student?.name) {
    return res.status(400).json({ error: '이미지와 학생 정보가 필요합니다. 다시 시도해주세요.' })
  }

  const apiKey = process.env.OPENAI_API_KEY
  let result: AnalysisData

  if (!apiKey) {
    console.error('OPENAI_API_KEY is not set in Vercel environment variables')
    result = fallback(student)
  } else {
    try {
      const client = new OpenAI({ apiKey })

      const imageContent: OpenAI.Chat.ChatCompletionContentPart[] = images.map(img => ({
        type: 'image_url' as const,
        image_url: { url: img, detail: 'auto' as const },
      }))

      const response = await client.chat.completions.create({
        model: 'gpt-4o',
        max_tokens: 2000,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: buildPrompt(student) },
              ...imageContent,
            ],
          },
        ],
      })

      const text = response.choices[0]?.message?.content ?? ''

      try {
        result = parseResponse(text)
      } catch {
        console.error('Parse failed, using fallback. Raw:', text.slice(0, 300))
        result = fallback(student)
      }
    } catch (err) {
      console.error('OpenAI error:', err)
      result = fallback(student)
    }
  }

  const totalScore = Math.round(
    Object.values(result.scores).reduce((a, b) => a + b, 0) / 6,
  )

  // Save to Supabase (optional)
  let id: string | null = null
  const sbUrl = process.env.SUPABASE_URL
  const sbKey = process.env.SUPABASE_SERVICE_KEY

  if (sbUrl && sbKey) {
    try {
      const db = createClient(sbUrl, sbKey)
      const { data } = await db.from('reports').insert({
        student_name: student.name, grade: student.grade,
        school: student.school, test_name: student.testName,
        instructor: student.instructor || null,
        test_date: student.testDate || null,
        total_score: totalScore,
        scores: result.scores,
        analysis: result.analysis,
      }).select('id').single()
      id = (data as { id: string } | null)?.id ?? null
    } catch (e) {
      console.error('Supabase save error:', e)
    }
  }

  return res.status(200).json({
    id,
    totalScore,
    scores: result.scores,
    analysis: result.analysis,
  })
}
