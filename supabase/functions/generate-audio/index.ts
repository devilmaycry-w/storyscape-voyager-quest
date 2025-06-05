import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Voice ID mapping from friendly names to ElevenLabs voice IDs
const VOICE_MAPPING = {
  'Alice': '21m00Tcm4TlvDq8ikWAM',  // Rachel voice
  'Brian': 'AZnzlk1XvdvUeBnXmlld',  // Domi voice
  'Charlie': 'IKne3meq5aSn9XLyUdCD', // Adam voice
  'Dorothy': 'EXAVITQu4vr4xnSDxMaL'  // Bella voice
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseKey);

serve(async (req) => {
  // Add Content-Type to CORS headers for preflight requests
  const headers = {
    ...corsHeaders,
    'Content-Type': 'application/json',
  };

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers });
  }

  try {
    // Validate request body
    const body = await req.json().catch(() => {
      throw new Error('Invalid JSON in request body');
    });

    const { text, voiceId } = body;
    const apiKey = Deno.env.get('ELEVENLABS_API_KEY');

    // Validate required fields
    if (!apiKey) {
      throw new Error('ElevenLabs API key not configured');
    }

    if (!text) {
      throw new Error('Text is required');
    }

    if (!voiceId) {
      throw new Error('VoiceId is required');
    }

    // Get the actual ElevenLabs voice ID from the mapping
    const elevenLabsVoiceId = VOICE_MAPPING[voiceId];
    if (!elevenLabsVoiceId) {
      throw new Error(`Invalid voice ID: ${voiceId}`);
    }

    // Test the API key with a simple request first
    const testResponse = await fetch('https://api.elevenlabs.io/v1/voices', {
      headers: {
        'xi-api-key': apiKey,
      },
    });

    if (!testResponse.ok) {
      throw new Error(`ElevenLabs API key validation failed: ${testResponse.status}`);
    }

    // Make the text-to-speech request
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${elevenLabsVoiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': apiKey,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.75,
          },
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`ElevenLabs API error: ${response.status} - ${errorText}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Upload to Supabase Storage
    const fileName = `${crypto.randomUUID()}.mp3`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('story-audio')
      .upload(fileName, audioBuffer, {
        contentType: 'audio/mpeg',
        cacheControl: '3600',
      });

    if (uploadError) {
      throw new Error(`Storage upload error: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('story-audio')
      .getPublicUrl(fileName);

    return new Response(
      JSON.stringify({ 
        success: true,
        audioUrl: publicUrl 
      }),
      { headers }
    );

  } catch (error) {
    console.error('Error generating audio:', error);
    
    // Ensure we always return a proper error response
    const errorResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'An unexpected error occurred',
      details: error instanceof Error ? error.stack : String(error)
    };
    
    return new Response(
      JSON.stringify(errorResponse),
      {
        headers,
        status: 500,
      }
    );
  }
});