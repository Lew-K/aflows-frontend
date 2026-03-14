import { supabase } from "@/lib/supabase";

export const isSuperAdmin = async () => {
  const { data: userData } = await supabase.auth.getUser();

  if (!userData.user) return false;

  const { data } = await supabase
    .from("super_admins")
    .select("id")
    .eq("email", userData.user.email)
    .single();

  return !!data;
};
