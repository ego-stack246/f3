import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;

const hasValidFormatKey = apiKey && apiKey.startsWith('AIzaSy');

export const ai = new GoogleGenAI({ apiKey: hasValidFormatKey ? apiKey : 'dummy_key' });

/**
 * MET values table for popular exercises
 */
const MET_TABLE: Record<string, number> = {
  'running': 9.8,
  'cycling': 7.5,
  'jump rope': 11.0,
  'swimming': 8.0,
  'rowing machine': 7.0,
  'elliptical': 6.5,
  'barbell squat': 6.0,
  'deadlift': 6.0,
  'barbell bench press': 5.0,
  'push-up': 4.0,
  'pull-up': 5.0,
  'lunges': 5.0,
  'plank': 3.5,
  'crunches': 3.5,
  'yoga': 3.0,
  'pilates': 3.5,
  'stretching': 2.5,
  'standing calf raise': 3.5,
  'seated calf raise': 3.0,
  'donkey calf raise': 3.5,
  'bosu ball balance': 3.0,
};

/**
 * Smart Fallback Generator for FitBot and Calorie Calculator
 */
export async function safeGenerateContent(params: {
  model: string;
  contents: any;
  config?: any;
}) {
  if (hasValidFormatKey) {
    try {
      const response = await ai.models.generateContent(params);
      if (response && response.text) return response;
    } catch (err) {
      console.warn('Live Gemini API call failed, using built-in smart AI fallback:', err);
    }
  }

  // --- LOCAL SMART AI FALLBACK ---
  const systemInstStr = typeof params.config?.systemInstruction === 'string'
    ? params.config.systemInstruction
    : JSON.stringify(params.config?.systemInstruction || '');

  const promptText = typeof params.contents === 'string' 
    ? params.contents 
    : JSON.stringify(params.contents);

  // Check if this is Calorie Calculator JSON request
  if (systemInstStr.includes('EXACTLY this JSON format') || promptText.includes('Calculate the calorie burn')) {
    const exerciseMatch = promptText.match(/Exercise:\s*([^\n,]+)/i);
    const durationMatch = promptText.match(/Duration:\s*(\d+)/i);
    const weightMatch = promptText.match(/Weight:\_*\s*(\d+)/i) || promptText.match(/(\d+)\s*kg/i);
    const intensityMatch = promptText.match(/Intensity:\s*([^\n,]+)/i);

    const exerciseName = exerciseMatch ? exerciseMatch[1].trim() : 'Workout';
    const duration = durationMatch ? parseInt(durationMatch[1]) : 30;
    const weight = weightMatch ? parseInt(weightMatch[1]) : 70;
    const intensity = intensityMatch ? intensityMatch[1].trim().toLowerCase() : 'medium';

    let baseMet = 5.0;
    const lowerEx = exerciseName.toLowerCase();
    for (const [key, metVal] of Object.entries(MET_TABLE)) {
      if (lowerEx.includes(key)) {
        baseMet = metVal;
        break;
      }
    }

    const intensityMultiplier = intensity === 'high' ? 1.25 : intensity === 'low' ? 0.8 : 1.0;
    const finalMet = Math.round(baseMet * intensityMultiplier * 10) / 10;
    
    // Formula: Calories = MET * 3.5 * weight / 200 * duration
    const burned = Math.round(finalMet * 3.5 * (weight / 200) * duration);

    const jsonResult = {
      calories: burned,
      met: finalMet,
      breakdown: `Burned ~${burned} kcal performing ${exerciseName} for ${duration} mins at ${intensity} intensity (${weight} kg bodyweight).`,
      tips: [
        `Maintain proper posture and steady controlled breathing throughout every repetition of ${exerciseName}.`,
        `Engage your core to maintain stability and prevent unnecessary strain on lower back or joints.`,
        `Adjust duration or tempo gradually to apply progressive overload safely over time.`
      ],
      diet_suggestion: `Replenish with a balanced 3:1 carb-to-protein post-workout snack like Greek yogurt with berries or a lean chicken salad within 45 minutes.`
    };

    return { text: JSON.stringify(jsonResult) };
  }

  // Otherwise treat as FitBot conversation
  const userQuery = extractLastUserQuery(params.contents).toLowerCase();

  let text = "I am currently running in **Offline/Fallback Mode** because the Gemini API key in your `.env` file is invalid. A real Gemini API key starts with `AIzaSy`.\n\nTo unlock my full AI brain, please:\n1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)\n2. Create a free API key\n3. Paste it into your `.env` file as `VITE_GEMINI_API_KEY=AIzaSy...`\n\nFor now, here is a detailed response from my built-in knowledge base:\n\n";

  if (userQuery.includes('meal plan') || userQuery.includes('diet') || userQuery.includes('weight loss')) {
    text += "🥗 **Personalized Healthy Diet Plan Strategy**:\n\n" +
      "1. **Breakfast**: Oatmeal topped with chia seeds, banana slices, and 1 scoop protein powder (~400 kcal). This provides complex carbs and protein to start your day.\n" +
      "2. **Lunch**: Grilled chicken breast (or paneer/tofu) salad with quinoa, avocado & olive oil dressing (~500 kcal). Packed with healthy fats and lean protein.\n" +
      "3. **Snack**: Handful of almonds & an apple (~200 kcal). Good for sustained energy.\n" +
      "4. **Dinner**: Baked salmon / tofu with steamed broccoli & sweet potato (~450 kcal).\n\n" +
      "💡 *Tip: To lose weight safely, you should aim for a calorie deficit of 300-500 calories below your maintenance level. Focus on high-volume, low-calorie foods (like vegetables) to stay full!*";
  } else if (userQuery.includes('workout') || userQuery.includes('exercise') || userQuery.includes('home') || userQuery.includes('beginner')) {
    text += "🏋️ **Effective Home Workout Routine (No Equipment Needed)**:\n\n" +
      "This routine targets all major muscle groups and requires zero equipment:\n\n" +
      "• **Push-Ups**: 3 sets × 10-15 reps (Targets: Chest, Shoulders, Triceps)\n" +
      "• **Bodyweight Squats**: 4 sets × 15-20 reps (Targets: Quads, Glutes, Hamstrings)\n" +
      "• **Plank Hold**: 3 sets × 45-60 seconds (Targets: Core stability)\n" +
      "• **Lunges**: 3 sets × 12 reps per leg (Targets: Leg balance and coordination)\n" +
      "• **Mountain Climbers**: 3 sets × 30 seconds (Cardio burn & core)\n\n" +
      "⏱️ **Instructions**: Rest for 60 seconds between each set. Perform this routine 3 to 4 times a week, ensuring you take rest days for muscle recovery.";
  } else if (userQuery.includes('calorie') || userQuery.includes('burn')) {
    text += "🔥 **Understanding Calories & Fat Loss**:\n\n" +
      "Calories are just a unit of energy. To lose body fat, you need to burn more calories than you consume. \n" +
      "• An average adult burns 1800-2500 calories per day just existing (this is your BMR).\n" +
      "• 1 hour of intense weightlifting burns ~250-400 calories.\n" +
      "• 30 minutes of running burns ~300-450 calories.\n\n" +
      "Remember: You cannot out-train a bad diet! Focus on nutrition first.";
  } else if (userQuery.includes('muscle') || userQuery.includes('gain') || userQuery.includes('bulk')) {
    text += "💪 **How to Build Muscle (Hypertrophy)**:\n\n" +
      "Building muscle requires three main ingredients:\n" +
      "1. **Progressive Overload**: You must lift slightly heavier weights or do more reps over time.\n" +
      "2. **Caloric Surplus**: Eat 200-300 calories above your maintenance level.\n" +
      "3. **Protein Intake**: Consume roughly 1.6g to 2.2g of protein per kg of bodyweight daily.\n" +
      "4. **Recovery**: Muscles grow while you sleep! Aim for 7-8 hours a night.";
  } else {
    text += "Hello! 👋 I am currently in Offline Mode.\n\n" +
      "I noticed your `VITE_GEMINI_API_KEY` in the `.env` file is invalid. To unlock my full conversational abilities where I can answer ANY question dynamically, please get a free Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey) and put it in your `.env` file.\n\n" +
      "In the meantime, you can ask me about:\n" +
      "- **Meal plans** and diets\n" +
      "- **Home workouts**\n" +
      "- **Building muscle**\n" +
      "- **Calories**";
  }

  return { text };
}

function extractLastUserQuery(contents: any): string {
  if (typeof contents === 'string') return contents;
  if (Array.isArray(contents)) {
    const lastMsg = contents[contents.length - 1];
    if (lastMsg?.parts?.[0]?.text) return lastMsg.parts[0].text;
  }
  return '';
}

export const FITBOT_SYSTEM_INSTRUCTION = `You are FitBot, a friendly and knowledgeable AI fitness assistant...`;
export const CALORIE_SYSTEM_INSTRUCTION = `You are an expert exercise physiologist and nutritionist AI...`;

