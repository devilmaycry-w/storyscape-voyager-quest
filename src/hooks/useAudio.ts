import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAudio = () => {
  const [isGenerating, setIsGenerating] = useState(false);

  const generateAudio = async (text: string, voiceId: string) => {
    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-audio', {
        body: { text, voiceId },
      });

      if (error) throw error;
      return data.audioUrl;
    } catch (error) {
      console.error('Error generating audio:', error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    generateAudio,
    isGenerating,
  };
};