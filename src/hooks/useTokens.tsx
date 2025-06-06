
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export const useTokens = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tokenData, isLoading } = useQuery({
    queryKey: ['user-tokens', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      const { data, error } = await supabase.rpc('check_and_update_tokens', {
        user_id_param: user.id
      });
      
      if (error) {
        console.error('Error fetching tokens:', error);
        throw error;
      }
      
      return data;
    },
    enabled: !!user
  });

  const refreshTokens = () => {
    queryClient.invalidateQueries({ queryKey: ['user-tokens', user?.id] });
  };

  return {
    tokenData,
    isLoading,
    refreshTokens,
    tokensUsed: tokenData?.tokens_used || 0,
    tokensRemaining: tokenData?.tokens_remaining || 5,
    canGenerate: tokenData?.can_generate ?? true,
    nextReset: tokenData?.next_reset
  };
};
