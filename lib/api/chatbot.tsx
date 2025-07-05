/**
 * ADHD Support Chatbot with Perplexity Sonar API Integration
 * 
 * SETUP INSTRUCTIONS:
 * 1. Get your Perplexity API key from https://www.perplexity.ai/settings/api
 * 2. Set PERPLEXITY_API_KEY in your environment variables or replace the placeholder below
 * 3. Install required dependencies (already included in package.json): none needed, uses native fetch
 * 
 * USAGE EXAMPLE:
 * ```typescript
 * import { ADHDChatbot } from './lib/api/chatbot';
 * 
 * const chatbot = new ADHDChatbot();
 * const response = await chatbot.sendMessage("I can't focus", context);
 * console.log(response.reply); // "That's okay — let's pick one small step. What's the easiest thing you can do now?"
 * ```
 * 
 * TESTING:
 * Run a test conversation by calling ADHDChatbot.runTestConversation()
 */

import {
    ADHDIntent,
    ChatbotResponse,
    ChatContext,
    ChatMessage,
    IntentDetectionResult
} from '../../types';

// Configuration - Uses environment variable for API key
const PERPLEXITY_CONFIG = {
  apiKey: process.env.PERPLEXITY_API_KEY || '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',
  baseUrl: 'https://api.perplexity.ai/chat/completions',
  model: 'sonar' // Correct Perplexity model name
};

/**
 * Intent detection helper - analyzes user input to determine appropriate response strategy
 */
export function detectIntent(userInput: string, context?: ChatContext): IntentDetectionResult {
  const input = userInput.toLowerCase();
  
  // PRIORITY: Check for follow-up selections first - these need detailed guidance, not more options
  if (input.includes('i chose:') || input.includes('chose:') || input.includes('please provide detailed') || input.includes('step-by-step guidance')) {
    // Extract the chosen option to determine specific guidance type
    if (input.includes('focus') || input.includes('sprint') || input.includes('environment') || input.includes('breathing')) {
      return { intent: 'focus_session', confidence: 0.95, keywords: ['follow-up', 'focus'] };
    }
    if (input.includes('steps') || input.includes('break') || input.includes('5 minutes') || input.includes('brain dump')) {
      return { intent: 'task_breakdown', confidence: 0.95, keywords: ['follow-up', 'tasks'] };
    }
    if (input.includes('deep breathing') || input.includes('grounding') || input.includes('calming') || input.includes('break')) {
      return { intent: 'stress_management', confidence: 0.95, keywords: ['follow-up', 'stress'] };
    }
    // Generic follow-up - provide guidance based on previous context
    return { intent: 'general_support', confidence: 0.9, keywords: ['follow-up'] };
  }
  
  // Define intent patterns with keywords and confidence scoring
  const intentPatterns: Record<ADHDIntent, { keywords: string[]; urgency: number }> = {
    task_breakdown: {
      keywords: ['overwhelming', 'too much', 'big task', 'break down', 'steps', 'procrastinating', 'stuck'],
      urgency: 3
    },
    focus_session: {
      keywords: ['focus', 'concentrate', 'distracted', 'pomodoro', 'work session', 'can\'t focus'],
      urgency: 2
    },
    stress_management: {
      keywords: ['stressed', 'anxious', 'panic', 'overwhelmed', 'calm', 'breathing', 'relax'],
      urgency: 4
    },
    mood_checkin: {
      keywords: ['feeling', 'mood', 'how am i', 'emotional', 'check in', 'today'],
      urgency: 1
    },
    learning_tip: {
      keywords: ['tip', 'help', 'advice', 'learn', 'strategy', 'how to', 'teach me'],
      urgency: 1
    },
    distress_escalation: {
      keywords: ['crisis', 'emergency', 'hurt myself', 'give up', 'hopeless', 'can\'t cope'],
      urgency: 5
    },
    general_support: {
      keywords: ['hello', 'hi', 'support', 'talk', 'listen', 'understand'],
      urgency: 1
    },
    unknown: { keywords: [], urgency: 0 }
  };

  let bestMatch: ADHDIntent = 'unknown';
  let maxScore = 0;
  let matchedKeywords: string[] = [];

  // Score each intent based on keyword matches
  for (const [intent, pattern] of Object.entries(intentPatterns)) {
    const matches = pattern.keywords.filter(keyword => input.includes(keyword));
    const score = matches.length * pattern.urgency;
    
    if (score > maxScore) {
      maxScore = score;
      bestMatch = intent as ADHDIntent;
      matchedKeywords = matches;
    }
  }

  // Confidence calculation (0-1 scale)
  const confidence = Math.min(maxScore / 10, 1);
  
  return {
    intent: bestMatch,
    confidence,
    keywords: matchedKeywords
  };
}

/**
 * Main ADHD Support Chatbot Class
 */
export class ADHDChatbot {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor(config?: Partial<typeof PERPLEXITY_CONFIG>) {
    this.apiKey = config?.apiKey || PERPLEXITY_CONFIG.apiKey;
    this.baseUrl = config?.baseUrl || PERPLEXITY_CONFIG.baseUrl;
    this.model = config?.model || PERPLEXITY_CONFIG.model;
  }

  /**
   * Main chatbot function - processes user input and returns empathetic, structured response
   */
  async sendMessage(userInput: string, context: ChatContext = { messages: [] }): Promise<ChatbotResponse> {
    try {
      // Detect user intent
      const intentResult = detectIntent(userInput, context);
      
      // Build system prompt based on intent
      const systemPrompt = this.buildSystemPrompt(intentResult.intent, context);
      
      // Call Perplexity Sonar API with message history
      const apiResponse = await this.callPerplexityAPI(systemPrompt, context.messages, userInput);
      
      // Parse and structure the response
      const structuredResponse = this.structureResponse(apiResponse, intentResult);
      
      return structuredResponse;
      
    } catch (error) {
      console.error('Chatbot error:', error);
      return this.getErrorResponse();
    }
  }

  /**
   * Builds context-aware system prompt based on detected intent
   */
  private buildSystemPrompt(intent: ADHDIntent, context: ChatContext): string {
    const basePrompt = `You are an empathetic AI assistant specializing in supporting people with ADHD and similar cognitive challenges. 

CORE PRINCIPLES:
- Always be supportive, non-judgmental, and understanding
- Provide interactive follow-up questions with multiple choice options
- Break complex ideas into simple steps
- Acknowledge the user's feelings before offering solutions
- Use encouraging, positive language

CRITICAL FORMATTING REQUIREMENTS:
1. ALWAYS respond with ONLY a valid JSON object - no other text before or after
2. For initial responses: Keep concise (under 100 words)
3. For detailed guidance: Can be comprehensive (up to 250 words) with step-by-step instructions
4. Make the "reply" conversational and human-readable, NOT JSON-looking
5. Required JSON structure:
   - "reply": Your empathetic response text (clear, human-readable)
   - "followUpOptions": Array of 3-4 follow-up options with emoji numbers (for initial responses only)
   - "actions": Array of practical actions (optional)

RESPONSE FORMAT: 
- FIRST TIME (initial help): Include "followUpOptions" array with 2-3 options
- FOLLOW-UP (after user chose): OMIT "followUpOptions" - provide guidance only

Example for FIRST TIME:
{
  "reply": "I hear you — trouble focusing is totally normal for ADHD brains. What would help you most right now?",
  "followUpOptions": [
    {"id": "focus_sprint", "text": "Try a 5-minute focus sprint", "emoji": "1️⃣"},
    {"id": "environment", "text": "Set up my environment", "emoji": "2️⃣"}
  ]
}

Example for FOLLOW-UP (after user chose):
{
  "reply": "Perfect! Here's how to do a 5-minute focus sprint: 1️⃣ Set a timer for 5 minutes ✅ 2️⃣ Pick ONE small task ✅ 3️⃣ Work on it without distractions ✅ 4️⃣ Take a 2-minute break when done ✅"
}

INTERACTION STYLE:
- FIRST TIME: When user requests help, provide 2-3 short follow-up questions as multiple choice options
- FOLLOW-UP: When user says "I chose: [option]", provide detailed step-by-step guidance for that specific option
- Use emojis like 1️⃣ 2️⃣ 3️⃣ for initial options ONLY
- For guidance: Use numbered lists, checkboxes ✅, and encouraging language
- NO MORE OPTIONS after they've chosen - give actual steps to follow
- Be specific and actionable in your guidance

USER CONTEXT: ${context.userProfile?.name ? `User's name is ${context.userProfile.name}. ` : ''}${context.sessionData?.focusSessionActive ? 'User is currently in a focus session. ' : ''}${context.userProfile?.currentMood ? `User's recent mood: ${context.userProfile.currentMood}. ` : ''}`;

    const intentSpecificPrompts: Record<ADHDIntent, string> = {
      task_breakdown: `
CURRENT INTENT: Help break down overwhelming tasks into manageable steps.
${context.messages.some(m => m.content.includes('chose:')) ? 
  `- User has selected a follow-up option. Provide DETAILED step-by-step guidance (3-4 clear steps)
  - Use numbered lists with ✅ checkboxes 
  - Be specific and actionable
  - NO MORE OPTIONS - give actual steps to follow` :
  `- Acknowledge their feeling of being overwhelmed
  - Provide 2-3 options like: "Break it into smaller steps", "Start with just 5 minutes", "Write it all down first"`}
- Use encouraging language and celebrate small wins`,

      focus_session: `
CURRENT INTENT: Guide focus sessions and concentration techniques.
${context.messages.some(m => m.content.includes('chose:')) ? 
  `- User has selected a follow-up option. Provide DETAILED step-by-step guidance (3-4 clear steps)
  - Use numbered lists with ✅ checkboxes
  - Be specific and actionable  
  - NO MORE OPTIONS - give actual steps to follow` :
  `- Acknowledge their focus difficulties
  - Offer options like: "Try a 5-minute focus sprint", "Set up your environment", "Use a simple breathing technique"`}
- Include visual elements like ✅ checkboxes and numbered steps`,

      stress_management: `
CURRENT INTENT: Provide calming and stress-reduction support.
${context.messages.some(m => m.content.includes('chose:')) ? 
  `- User has selected a follow-up option. Provide DETAILED step-by-step guidance (3-4 clear steps)
  - Use numbered lists with ✅ checkboxes
  - Be specific and actionable
  - NO MORE OPTIONS - give actual steps to follow` :
  `- Acknowledge their stress with empathy
  - Offer immediate options: "Try deep breathing", "Do a quick grounding exercise", "Take a calming break"`}
- Use calming emojis and clear numbered steps`,

      mood_checkin: `
CURRENT INTENT: Facilitate mood awareness and emotional check-ins.
- Ask gentle, specific questions about their current state
- Help them identify and name emotions
- Suggest mood tracking or journaling
- Offer appropriate support based on their mood`,

      learning_tip: `
CURRENT_INTENT: Share ADHD-friendly tips and strategies.
- Provide one specific, actionable tip
- Explain why it works for ADHD brains
- Keep it simple and easy to implement
- Encourage experimentation without pressure`,

      distress_escalation: `
CURRENT INTENT: URGENT - Provide crisis support and professional resource guidance.
- Acknowledge their courage in reaching out
- Provide immediate grounding techniques
- Suggest professional crisis resources
- Emphasize that they deserve support and help is available`,

      general_support: `
CURRENT INTENT: Provide general emotional support and encouragement.
${context.messages.some(m => m.content.includes('chose:')) ? 
  `- User has selected a follow-up option. Provide DETAILED step-by-step guidance (3-4 clear steps)
  - Use numbered lists with ✅ checkboxes
  - Be specific and actionable
  - NO MORE OPTIONS - give actual steps to follow` :
  `- Show genuine care and understanding
  - Ask how you can best support them today
  - Validate their experiences
  - Offer hope and encouragement`}`,

      unknown: `
CURRENT INTENT: Clarify user needs with gentle inquiry.
- Ask clarifying questions to understand their needs
- Offer general support while gathering more information
- Suggest common areas where you can help
- Maintain warm, supportive tone`
    };

    return basePrompt + intentSpecificPrompts[intent];
  }

  /**
   * Formats conversation history for API context
   */
  private formatConversationHistory(messages: ChatMessage[]): string {
    const recentMessages = messages.slice(-6); // Keep last 6 messages for context
    
    return recentMessages
      .map(msg => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');
  }

  /**
   * Calls Perplexity Sonar API with proper formatting
   */
  private async callPerplexityAPI(systemPrompt: string, conversationHistory: ChatMessage[], userInput: string): Promise<string> {
    const messages = [
      { role: 'system', content: systemPrompt },
    ];

    // Add conversation history as alternating user/assistant messages
    if (conversationHistory && conversationHistory.length > 0) {
      // Filter out welcome messages and take the last few messages for context
      const recentMessages = conversationHistory
        .filter(msg => msg.id !== 'welcome') // Remove welcome message
        .slice(-4); // Last 4 messages for context
      
      // Ensure proper alternation by tracking the last role added
      let lastRole: string | null = null;
      
      for (const msg of recentMessages) {
        const role = msg.sender === 'user' ? 'user' : 'assistant';
        
        // Skip if this would create consecutive same roles
        if (lastRole && lastRole === role) {
          continue;
        }
        
        messages.push({
          role: role,
          content: msg.content
        });
        
        lastRole = role;
      }
    }

    messages.push({ role: 'user', content: userInput });

    const requestBody = {
      model: this.model,
      messages,
      max_tokens: 300,
      temperature: 0.7,
    };

    console.log('📤 Perplexity API Request:', JSON.stringify(requestBody, null, 2));
    
    // Debug: Check message alternation
    const roles = requestBody.messages.map(m => m.role);
    console.log('🔗 Message roles sequence:', roles);
    
    // Check for consecutive same roles
    for (let i = 1; i < roles.length; i++) {
      if (roles[i] === roles[i-1] && roles[i] !== 'system') {
        console.error(`❌ Found consecutive ${roles[i]} messages at positions ${i-1} and ${i}`);
      }
    }

    console.log('🌐 Making API call to:', this.baseUrl);
    console.log('🔑 Using API key:', this.apiKey ? `${this.apiKey.substring(0, 10)}...` : 'NO API KEY');

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'accept': 'application/json',
          'content-type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

    if (!response.ok) {
      // Get the full error details from the API
      let errorDetails = '';
      console.error('🚨 API RESPONSE ERROR:');
      console.error('Status:', response.status);
      console.error('Status Text:', response.statusText);
      console.error('Headers:', Object.fromEntries(response.headers.entries()));
      
      try {
        const errorData = await response.json();
        errorDetails = JSON.stringify(errorData, null, 2);
        console.error('📄 Error Response Body (JSON):', errorDetails);
      } catch (e) {
        try {
          errorDetails = await response.text();
          console.error('📄 Error Response Body (Text):', errorDetails);
        } catch (textError) {
          errorDetails = 'Could not read response body';
          console.error('❌ Failed to read response body:', textError);
        }
      }
      
      throw new Error(`Perplexity API error: ${response.status} ${response.statusText}\nDetails: ${errorDetails}`);
    }

    const data = await response.json();
    console.log('Perplexity API Response:', JSON.stringify(data, null, 2));
    return data.choices[0]?.message?.content || '';
    } catch (networkError) {
      console.error('🚨 NETWORK ERROR:');
      console.error('Error type:', typeof networkError);
      console.error('Error message:', networkError instanceof Error ? networkError.message : String(networkError));
      console.error('Stack trace:', networkError instanceof Error ? networkError.stack : 'No stack trace');
      
      // Re-throw with more context
      throw new Error(`Network error when calling Perplexity API: ${networkError instanceof Error ? networkError.message : String(networkError)}`);
    }
  }

  /**
   * Structures API response into our required format
   */
  private structureResponse(apiResponse: string, intentResult: IntentDetectionResult): ChatbotResponse {
    try {
      // Try to parse JSON response from API
      const parsed = JSON.parse(apiResponse);
      
      if (parsed.reply) {
        return {
          reply: parsed.reply,
          actions: parsed.actions || this.getDefaultActionsForIntent(intentResult.intent),
          followUpOptions: parsed.followUpOptions || undefined,
          intent: intentResult.intent,
          confidence: intentResult.confidence
        };
      }
    } catch (error) {
      // If JSON parsing fails, try to extract from text response
      console.warn('Failed to parse JSON response, extracting manually:', error);
      const extractedResponse = this.extractFromTextResponse(apiResponse, intentResult);
      if (extractedResponse) {
        return extractedResponse;
      }
    }

    // Fallback: create structured response
    const defaultActions = this.getDefaultActionsForIntent(intentResult.intent);
    
    return {
      reply: this.sanitizeResponse(apiResponse),
      actions: defaultActions,
      intent: intentResult.intent,
      confidence: intentResult.confidence
    };
  }

  /**
   * Extract structured response from text that might contain JSON-like content
   */
  private extractFromTextResponse(response: string, intentResult: IntentDetectionResult): ChatbotResponse | null {
    // First, try to extract from nested API response structure
    try {
      const apiResponse = JSON.parse(response);
      if (apiResponse.choices && apiResponse.choices[0] && apiResponse.choices[0].message && apiResponse.choices[0].message.content) {
        const content = apiResponse.choices[0].message.content;
        return this.parseContentAsResponse(content, intentResult);
      }
    } catch (e) {
      console.warn('Not a nested API response structure:', e);
    }

    // Look for JSON-like structure in the response
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.reply) {
          return {
            reply: parsed.reply,
            actions: parsed.actions || this.getDefaultActionsForIntent(intentResult.intent),
            followUpOptions: parsed.followUpOptions || undefined,
            intent: intentResult.intent,
            confidence: intentResult.confidence
          };
        }
      } catch (e) {
        console.warn('Failed to parse extracted JSON:', e);
      }
    }

    // If still no valid JSON, create a helpful response based on intent
    return this.createFallbackResponse(intentResult);
  }

  /**
   * Parse content string as a chatbot response
   */
  private parseContentAsResponse(content: string, intentResult: IntentDetectionResult): ChatbotResponse {
    // Try to parse as JSON first
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        if (parsed.reply) {
          return {
            reply: parsed.reply,
            actions: parsed.actions || this.getDefaultActionsForIntent(intentResult.intent),
            followUpOptions: parsed.followUpOptions || undefined,
            intent: intentResult.intent,
            confidence: intentResult.confidence
          };
        }
      }
    } catch (e) {
      console.warn('Content is not valid JSON, treating as plain text:', e);
    }

    // If not JSON, treat as plain text response and create structured response
    return {
      reply: this.sanitizeResponse(content),
      actions: this.getDefaultActionsForIntent(intentResult.intent),
      intent: intentResult.intent,
      confidence: intentResult.confidence
    };
  }

  /**
   * Create a helpful fallback response when API response is not parseable
   */
  private createFallbackResponse(intentResult: IntentDetectionResult): ChatbotResponse {
    // Check if this is a follow-up selection - if so, provide guidance instead of more options
    const isFollowUp = intentResult.keywords?.includes('follow-up');
    
    if (isFollowUp) {
      // Provide detailed guidance with comprehensive step-by-step instructions
      const guidanceResponses: Record<ADHDIntent, string> = {
        focus_session: "🎯 **5-Minute Focus Sprint Guide**\n\n1️⃣ **Prepare Your Space** ✅\n   • Clear your desk/workspace\n   • Put away distractions (phone, etc.)\n   • Get water nearby\n\n2️⃣ **Set Your Timer** ✅\n   • Set timer for exactly 5 minutes\n   • Choose ONE specific task\n   • Tell yourself 'just 5 minutes'\n\n3️⃣ **Sprint Time** ✅\n   • Work ONLY on that task\n   • Ignore other thoughts\n   • Push through resistance\n\n4️⃣ **Reward & Rest** ✅\n   • Celebrate completing the sprint! 🎉\n   • Take a 2-3 minute break\n   • Decide if you want another sprint\n\n💡 **Pro Tip**: Even 5 minutes builds momentum!",
        
        task_breakdown: "📋 **Task Breakdown Method**\n\n1️⃣ **Brain Dump** ✅\n   • Write down EVERYTHING related to the task\n   • Don't worry about order yet\n   • Include even tiny details\n\n2️⃣ **Categorize & Prioritize** ✅\n   • Group similar items together\n   • Mark: Must Do, Should Do, Could Do\n   • Number them 1-2-3 by importance\n\n3️⃣ **Make It Tiny** ✅\n   • Break each step into 15-minute chunks\n   • If it takes longer, break it smaller\n   • Each step should feel manageable\n\n4️⃣ **Start Small** ✅\n   • Pick the easiest #1 priority item\n   • Set timer for 15 minutes\n   • Just focus on that one piece\n\n5️⃣ **Track Progress** ✅\n   • Check off completed items\n   • Celebrate each small win! 🎉\n\n💪 **Remember**: Progress > Perfection!",
        
        stress_management: "🧘‍♀️ **Stress Relief Technique**\n\n1️⃣ **Immediate Relief (2 minutes)** ✅\n   • Take 5 deep belly breaths\n   • Count: in for 4, hold for 4, out for 6\n   • Let your shoulders drop\n\n2️⃣ **Grounding Exercise** ✅\n   • Name 5 things you can see\n   • Name 4 things you can touch\n   • Name 3 things you can hear\n   • Name 2 things you can smell\n   • Name 1 thing you can taste\n\n3️⃣ **Body Check** ✅\n   • Notice where you feel tension\n   • Gently stretch those areas\n   • Massage your temples/neck\n\n4️⃣ **Positive Self-Talk** ✅\n   • Say: 'This feeling will pass'\n   • 'I am safe right now'\n   • 'I can handle this step by step'\n\n5️⃣ **Next Steps** ✅\n   • Drink some water\n   • Take a short walk if possible\n   • Plan one small next action\n\n🌟 **You've got this!**",
        
        general_support: "💝 **Self-Support Action Plan**\n\n1️⃣ **Acknowledge Your Efforts** ✅\n   • You reached out for help - that's brave!\n   • Recognize you're trying your best\n   • ADHD brains work differently, not wrong\n\n2️⃣ **Ground Yourself** ✅\n   • Take 3 slow, deep breaths\n   • Feel your feet on the ground\n   • Notice you're safe in this moment\n\n3️⃣ **Choose Your Focus** ✅\n   • Pick ONE thing you can control\n   • Make it something small and doable\n   • Ignore everything else for now\n\n4️⃣ **Take Action** ✅\n   • Set a timer for 10 minutes\n   • Work on just that one thing\n   • Give yourself permission to start imperfectly\n\n5️⃣ **Practice Self-Compassion** ✅\n   • Talk to yourself like a good friend\n   • Remember: progress isn't linear\n   • You deserve kindness from yourself\n\n🤗 **You're not alone in this journey!**",
        
        mood_checkin: "🌈 **Emotional Check-In Guide**\n\n1️⃣ **Body Awareness** ✅\n   • Take a deep breath\n   • Scan your body from head to toe\n   • Notice areas of tension or comfort\n\n2️⃣ **Name Your Emotions** ✅\n   • What's the main feeling right now?\n   • Is there a secondary emotion?\n   • Rate intensity 1-10\n\n3️⃣ **Validate Your Experience** ✅\n   • All feelings are valid and temporary\n   • You're allowed to feel however you feel\n   • Emotions give us important information\n\n4️⃣ **Gentle Self-Care** ✅\n   • What does your emotional self need?\n   • Rest? Movement? Connection? Comfort?\n   • Choose one small act of kindness for yourself\n\n5️⃣ **Moving Forward** ✅\n   • Set an intention for the next hour\n   • Remember: you don't have to fix everything\n   • Small steps count\n\n💚 **Your feelings matter and so do you!**",
        
        learning_tip: "📚 **ADHD-Friendly Learning Strategy**\n\n1️⃣ **Set Up for Success** ✅\n   • Choose a quiet, organized space\n   • Remove visual distractions\n   • Have water and snacks ready\n\n2️⃣ **Break It Down** ✅\n   • Divide material into 15-20 minute chunks\n   • Use timers for focused study periods\n   • Plan 5-minute breaks between chunks\n\n3️⃣ **Engage Multiple Senses** ✅\n   • Read aloud or use text-to-speech\n   • Use highlighters or colorful notes\n   • Draw diagrams or mind maps\n   • Walk while reviewing\n\n4️⃣ **Active Learning Techniques** ✅\n   • Summarize in your own words\n   • Teach the concept to someone else\n   • Create acronyms or memory tricks\n   • Connect new info to what you know\n\n5️⃣ **Review & Reward** ✅\n   • Review within 24 hours\n   • Celebrate your learning progress! 🎉\n   • Track what methods work best for you\n\n🧠 **Your ADHD brain is creative and capable!**",
        
        distress_escalation: "🆘 **Crisis Support Plan**\n\n1️⃣ **Immediate Safety** ✅\n   • You are not alone\n   • Take slow, deep breaths\n   • Ground yourself: feet on floor, hands on surface\n\n2️⃣ **Reach Out Now** ✅\n   • Call someone you trust\n   • Crisis Text Line: Text HOME to 741741\n   • National Suicide Prevention: 988\n   • Emergency services: 911 if in immediate danger\n\n3️⃣ **Grounding Technique** ✅\n   • Count 5 things you can see\n   • 4 things you can touch\n   • 3 things you can hear\n   • Focus on the present moment\n\n4️⃣ **Professional Help** ✅\n   • Contact your therapist/counselor\n   • Call your doctor\n   • Go to nearest emergency room if needed\n   • Consider crisis intervention services\n\n5️⃣ **Build Your Support** ✅\n   • Create a list of trusted contacts\n   • Identify warning signs for future\n   • Plan coping strategies\n   • Remember: seeking help is strength\n\n💪 **You matter. Your life has value. Help is available.**",
        
        unknown: "🌟 **General Wellness Check**\n\n1️⃣ **Pause & Breathe** ✅\n   • Take a moment to stop what you're doing\n   • Take 3 slow, intentional breaths\n   • Center yourself in this moment\n\n2️⃣ **Check Your Needs** ✅\n   • Are you hungry, thirsty, or tired?\n   • Do you need movement or rest?\n   • What does your body need right now?\n\n3️⃣ **Identify Your Goal** ✅\n   • What would help you most right now?\n   • Focus? Stress relief? Task help? Connection?\n   • Choose ONE thing to focus on\n\n4️⃣ **Take One Small Step** ✅\n   • Pick the smallest possible action\n   • Set a timer if needed\n   • Give yourself permission to start imperfectly\n\n5️⃣ **Practice Self-Compassion** ✅\n   • Remember: you're doing your best\n   • Progress doesn't have to be perfect\n   • You deserve patience and kindness\n\n🤗 **Every small step forward counts!**"
      };
      
      return {
        reply: guidanceResponses[intentResult.intent] || guidanceResponses.unknown,
        actions: this.getDefaultActionsForIntent(intentResult.intent),
        intent: intentResult.intent,
        confidence: intentResult.confidence
      };
    }
    
    // Initial response - provide options for first-time interactions
    const initialResponses: Record<ADHDIntent, { reply: string; followUpOptions: any[] }> = {
      focus_session: {
        reply: "I hear you — trouble focusing is totally normal. What would help you most right now?",
        followUpOptions: [
          { id: "focus_sprint", text: "Try a 5-minute focus sprint", emoji: "1️⃣" },
          { id: "environment", text: "Set up my environment", emoji: "2️⃣" },
          { id: "breathing", text: "Use a calming technique", emoji: "3️⃣" },
          { id: "break_task", text: "Break task into tiny steps", emoji: "4️⃣" }
        ]
      },
      task_breakdown: {
        reply: "Feeling overwhelmed is completely understandable. Let's make this manageable together.",
        followUpOptions: [
          { id: "break_steps", text: "Break it into smaller steps", emoji: "1️⃣" },
          { id: "five_minutes", text: "Start with just 5 minutes", emoji: "2️⃣" },
          { id: "brain_dump", text: "Write everything down first", emoji: "3️⃣" },
          { id: "priority_method", text: "Use priority method", emoji: "4️⃣" }
        ]
      },
      stress_management: {
        reply: "I can hear that you're feeling stressed. That's okay — let's find something that helps.",
        followUpOptions: [
          { id: "deep_breathing", text: "Try deep breathing", emoji: "1️⃣" },
          { id: "grounding", text: "Do a grounding exercise", emoji: "2️⃣" },
          { id: "quick_break", text: "Take a calming break", emoji: "3️⃣" },
          { id: "body_scan", text: "Body tension release", emoji: "4️⃣" }
        ]
      },
      general_support: {
        reply: "I'm here to support you. What kind of help would be most useful right now?",
        followUpOptions: [
          { id: "focus_help", text: "Help me focus", emoji: "1️⃣" },
          { id: "task_help", text: "Break down a task", emoji: "2️⃣" },
          { id: "stress_help", text: "Manage stress", emoji: "3️⃣" },
          { id: "motivation_help", text: "Get motivated", emoji: "4️⃣" }
        ]
      },
      mood_checkin: {
        reply: "Thanks for checking in with yourself. How are you feeling right now?",
        followUpOptions: [
          { id: "feeling_good", text: "Pretty good today", emoji: "1️⃣" },
          { id: "feeling_okay", text: "Okay, could be better", emoji: "2️⃣" },
          { id: "feeling_tough", text: "Having a tough time", emoji: "3️⃣" },
          { id: "feeling_mixed", text: "Mixed emotions", emoji: "4️⃣" }
        ]
      },
      learning_tip: {
        reply: "Great that you're looking to learn! What area would you like tips for?",
        followUpOptions: [
          { id: "study_tips", text: "Study techniques", emoji: "1️⃣" },
          { id: "time_management", text: "Time management", emoji: "2️⃣" },
          { id: "organization", text: "Getting organized", emoji: "3️⃣" },
          { id: "memory_techniques", text: "Memory techniques", emoji: "4️⃣" }
        ]
      },
      distress_escalation: {
        reply: "I hear you, and I want you to know that reaching out takes courage. You deserve support.",
        followUpOptions: [
          { id: "crisis_resources", text: "Find crisis resources", emoji: "1️⃣" },
          { id: "grounding_now", text: "Grounding technique now", emoji: "2️⃣" },
          { id: "professional_help", text: "Talk to someone professional", emoji: "3️⃣" },
          { id: "safety_plan", text: "Create a safety plan", emoji: "4️⃣" }
        ]
      },
      unknown: {
        reply: "I'm here to help! What's on your mind today?",
        followUpOptions: [
          { id: "focus_issues", text: "Having trouble focusing", emoji: "1️⃣" },
          { id: "overwhelmed", text: "Feeling overwhelmed", emoji: "2️⃣" },
          { id: "general_support", text: "Just need someone to talk to", emoji: "3️⃣" },
          { id: "daily_struggles", text: "Daily ADHD struggles", emoji: "4️⃣" }
        ]
      }
    };

    const response = initialResponses[intentResult.intent] || initialResponses.unknown;
    
    return {
      reply: response.reply,
      actions: this.getDefaultActionsForIntent(intentResult.intent),
      followUpOptions: response.followUpOptions,
      intent: intentResult.intent,
      confidence: intentResult.confidence
    };
  }

  /**
   * Provides default actions based on intent when API doesn't return structured format
   */
  private getDefaultActionsForIntent(intent: ADHDIntent): string[] {
    // Simplified actions - we don't use these in the UI, just for API consistency
    return [];
  }

  /**
   * Sanitizes and formats response text
   */
  private sanitizeResponse(response: string): string {
    // Remove any JSON formatting if present
    let cleaned = response.replace(/```json|```/g, '').trim();
    
    // If it looks like a JSON object, try to extract just the reply
    if (cleaned.startsWith('{')) {
      try {
        const parsed = JSON.parse(cleaned);
        return parsed.reply || cleaned;
      } catch {
        // Try to extract text from malformed JSON
        const replyMatch = cleaned.match(/"reply":\s*"([^"]+)"/);
        if (replyMatch) {
          cleaned = replyMatch[1];
        }
      }
    }
    
    // Clean up common JSON artifacts
    cleaned = cleaned
      .replace(/\\n/g, ' ')
      .replace(/\\"/g, '"')
      .replace(/^\s*"/, '')
      .replace(/"\s*$/, '')
      .trim();
    
    // If response seems truncated (ends abruptly), add helpful ending
    if (cleaned.length > 50 && !cleaned.match(/[.!?]$/)) {
      cleaned += "... Let me know if you'd like me to continue or if you have questions!";
    }
    
    // Ensure response is conversational and supportive
    if (cleaned.length > 200) {
      return cleaned.substring(0, 200) + '...';
    }
    
    return cleaned || "I'm here to support you. Can you tell me more about what you're experiencing?";
  }

  /**
   * Error response for when the API call fails
   */
  private getErrorResponse(): ChatbotResponse {
    return {
      reply: "I'm having trouble connecting right now, but I'm here for you. Can you try again in a moment?",
      actions: ['retry_connection', 'offline_support'],
      intent: 'general_support',
      confidence: 1.0
    };
  }


}

// Export the main chatbot function for direct use
export async function chatbot(userInput: string, context?: ChatContext): Promise<ChatbotResponse> {
  const bot = new ADHDChatbot();
  return await bot.sendMessage(userInput, context);
} 