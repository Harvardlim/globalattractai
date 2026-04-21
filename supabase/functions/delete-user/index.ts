import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  try {
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify caller is admin (or service role)
    const authHeader = req.headers.get("Authorization");
    const apikey = req.headers.get("apikey") || "";
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const isServiceRole =
      apikey === serviceRoleKey ||
      (authHeader && authHeader.replace("Bearer ", "") === serviceRoleKey);

    let callerId: string | null = null;

    if (!isServiceRole) {
      if (!authHeader) return json({ error: "Unauthorized" }, 401);

      const token = authHeader.replace("Bearer ", "");
      const { data: { user: caller }, error: authError } = await supabaseAdmin.auth.getUser(token);
      if (authError || !caller) return json({ error: "Unauthorized" }, 401);

      const { data: roleData } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", caller.id)
        .in("role", ["admin", "superadmin"])
        .maybeSingle();

      if (!roleData) return json({ error: "Forbidden" }, 403);
      callerId = caller.id;
    }

    const { user_id: rawUserId, email } = await req.json();
    let user_id = rawUserId;

    // Look up by email if no user_id provided
    if (!user_id && email) {
      const { data: usersData, error: listError } = await supabaseAdmin.auth.admin.listUsers();
      if (listError) return json({ error: listError.message }, 500);
      const found = usersData.users.find((u) => u.email === email);
      if (!found) return json({ error: "User not found" }, 404);
      user_id = found.id;
    }

    if (!user_id) return json({ error: "user_id or email required" }, 400);

    // Prevent deleting yourself
    if (callerId && user_id === callerId) {
      return json({ error: "Cannot delete yourself" }, 400);
    }

    // Prevent deleting other admins
    const { data: targetRole } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", user_id)
      .eq("role", "admin")
      .maybeSingle();

    if (targetRole) return json({ error: "Cannot delete admin users" }, 400);

    // ====== STEP 1: Delete auth user FIRST (this is the critical step) ======
    console.log(`[delete-user] Deleting auth user: ${user_id}`);
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user_id);
    if (deleteError) {
      console.error("[delete-user] FAILED to delete auth user:", deleteError);
      return json({ error: `Failed to delete auth user: ${deleteError.message}` }, 500);
    }
    console.log(`[delete-user] Auth user deleted successfully: ${user_id}`);

    // ====== STEP 2: Verify auth user is gone ======
    const { data: { users: remainingUsers } } = await supabaseAdmin.auth.admin.listUsers();
    const stillExists = remainingUsers?.find((u) => u.id === user_id);
    if (stillExists) {
      console.error("[delete-user] Auth user still exists after deletion, retrying...");
      const { error: retryError } = await supabaseAdmin.auth.admin.deleteUser(user_id);
      if (retryError) {
        console.error("[delete-user] Retry FAILED:", retryError);
        return json({ error: `Auth user could not be deleted after retry: ${retryError.message}` }, 500);
      }
    }

    // ====== STEP 3: Clean up related data (profile should cascade, but force-clean) ======
    const cleanupErrors: string[] = [];

    const { error: profileError } = await supabaseAdmin.from("profiles").delete().eq("id", user_id);
    if (profileError) {
      console.error("[delete-user] Profile cleanup error:", profileError);
      cleanupErrors.push(`profile: ${profileError.message}`);
    }

    const { error: roleError } = await supabaseAdmin.from("user_roles").delete().eq("user_id", user_id);
    if (roleError) {
      console.error("[delete-user] Role cleanup error:", roleError);
      cleanupErrors.push(`roles: ${roleError.message}`);
    }

    const { error: whitelistError } = await supabaseAdmin.from("feature_whitelist").delete().eq("user_id", user_id);
    if (whitelistError) {
      console.error("[delete-user] Whitelist cleanup error:", whitelistError);
      cleanupErrors.push(`whitelist: ${whitelistError.message}`);
    }

    // ====== STEP 4: Final verification ======
    const { data: remainingProfile } = await supabaseAdmin.from("profiles").select("id").eq("id", user_id).maybeSingle();
    if (remainingProfile) {
      console.error("[delete-user] Profile STILL exists, force deleting...");
      await supabaseAdmin.from("profiles").delete().eq("id", user_id);
    }

    console.log(`[delete-user] Deletion complete for ${user_id}. Cleanup issues: ${cleanupErrors.length > 0 ? cleanupErrors.join("; ") : "none"}`);

    return json({
      success: true,
      deleted_user_id: user_id,
      cleanup_warnings: cleanupErrors.length > 0 ? cleanupErrors : undefined,
    });
  } catch (err) {
    console.error("[delete-user] Unexpected error:", err);
    return json({ error: err instanceof Error ? err.message : 'Unknown error' }, 500);
  }
});
