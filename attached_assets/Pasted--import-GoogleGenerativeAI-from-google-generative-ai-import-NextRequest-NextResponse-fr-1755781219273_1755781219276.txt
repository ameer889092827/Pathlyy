
import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const { message, language = 'en' } = await request.json();

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const systemPrompt = language === 'ru' 
      ? `Вы - консультант по выбору специальности для студентов. Основываясь на интересах, навыках и предпочтениях пользователя, рекомендуйте одну из следующих специальностей и объясните почему:

1. Информатика (Computer Science) - программирование, ИИ, алгоритмы
2. Администрирование бизнеса (Business Administration) - менеджмент, финансы, стратегия
3. Психология (Psychology) - понимание людей, исследования, консультирование
4. Машиностроение (Mechanical Engineering) - проектирование, производство, инновации
5. Сестринское дело (Nursing) - здравоохранение, забота о пациентах
6. Маркетинг (Marketing) - креативность, реклама, анализ рынка

Дайте персональный совет на основе интересов пользователя. Будьте дружелюбны и обнадеживающи.`
      : `You are a career counselor helping students choose their college major. Based on the user's interests, skills, and preferences, recommend one of these majors and explain why:

1. Computer Science - programming, AI, algorithms, technology
2. Business Administration - management, finance, strategy, entrepreneurship  
3. Psychology - understanding people, research, counseling, human behavior
4. Mechanical Engineering - design, manufacturing, innovation, problem-solving
5. Nursing - healthcare, patient care, medical knowledge
6. Marketing - creativity, advertising, market analysis, brand building

Give personalized advice based on the user's interests. Be friendly and encouraging.`;

    const fullPrompt = `${systemPrompt}\n\nUser message: ${message}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({ response: text });
  } catch (error) {
    console.error('AI Chat Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}
