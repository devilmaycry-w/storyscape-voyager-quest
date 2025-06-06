
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { location, user_id } = await req.json();

    if (!openAIApiKey) {
      console.error('OpenAI API key not configured');
      return new Response(JSON.stringify({
        error: 'OpenAI API key not configured. Please contact support.'
      }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    console.log('Generating story for location:', location, 'user:', user_id);

    // Check token limits
    const { data: tokenData, error: tokenError } = await supabase.rpc('check_and_update_tokens', {
      user_id_param: user_id
    });

    if (tokenError) {
      console.error('Token check error:', tokenError);
      throw new Error('Failed to check token limits');
    }

    if (!tokenData.can_generate) {
      return new Response(JSON.stringify({
        error: 'Token limit exceeded',
        message: 'You have reached your daily limit of 5 stories. Please try again tomorrow.',
        tokens_used: tokenData.tokens_used,
        next_reset: tokenData.next_reset
      }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Optimized prompt for cost efficiency
    const prompt = `Create a short interactive story set in ${location}. Format as JSON with:
- title: Engaging story title
- segments: Array with 2-3 segments, each having:
  - id: number
  - text: narrative (80-120 words max)
  - choices: 2 choices with id, text, nextSegment
- culturalInsights: Array of 2-3 brief cultural facts

Keep it mystical but concise.`;

    console.log('Calling OpenAI API...');
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'You create short, engaging interactive stories. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      }),
    });

    console.log('OpenAI API response status:', openAIResponse.status);

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error details:', errorText);
      
      if (openAIResponse.status === 429) {
        return new Response(JSON.stringify({
          error: 'Rate limit exceeded',
          message: 'OpenAI API rate limit exceeded. Please try again in a few minutes.'
        }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (openAIResponse.status === 401) {
        return new Response(JSON.stringify({
          error: 'API key invalid',
          message: 'OpenAI API key is invalid. Please contact support.'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else if (openAIResponse.status === 402) {
        return new Response(JSON.stringify({
          error: 'Quota exceeded',
          message: 'OpenAI API quota exceeded. Please contact support.'
        }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } else {
        throw new Error(`OpenAI API error: ${openAIResponse.status} - ${errorText}`);
      }
    }

    const openAIData = await openAIResponse.json();
    console.log('OpenAI response received successfully');
    
    let storyData;
    
    try {
      storyData = JSON.parse(openAIData.choices[0].message.content);
    } catch (parseError) {
      console.error('Failed to parse OpenAI response:', parseError);
      console.error('Raw response:', openAIData.choices[0].message.content);
      throw new Error('Failed to generate story content');
    }

    // Generate images for story segments using a simple placeholder approach
    const imageUrls = storyData.segments.map((_, index) => 
      `https://images.unsplash.com/photo-1470813740244-df37b8c1edcb?w=400&h=300&fit=crop&q=80&sig=${index}`
    );

    // Add images to segments
    storyData.segments.forEach((segment, index) => {
      segment.image = imageUrls[index] || imageUrls[0];
    });

    // Increment user tokens
    const { error: incrementError } = await supabase.rpc('increment_tokens', {
      user_id_param: user_id
    });

    if (incrementError) {
      console.error('Failed to increment tokens:', incrementError);
    }

    // Save story to database
    const { data: savedStory, error: saveError } = await supabase
      .from('stories')
      .insert({
        user_id: user_id,
        title: storyData.title,
        location: location,
        content: storyData,
        cultural_insights: storyData.culturalInsights,
        image_urls: imageUrls,
        generation_prompt: prompt,
        is_public: true,
        tokens_used: 1
      })
      .select()
      .single();

    if (saveError) {
      console.error('Failed to save story:', saveError);
      throw new Error('Failed to save story');
    }

    console.log('Story generated and saved successfully:', savedStory.id);

    return new Response(JSON.stringify({
      story: {
        id: savedStory.id,
        ...storyData
      },
      tokens_remaining: tokenData.tokens_remaining - 1
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error generating story:', error);
    return new Response(JSON.stringify({ 
      error: error.message || 'Failed to generate story',
      message: 'An unexpected error occurred. Please try again later.'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
