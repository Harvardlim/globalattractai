import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify caller is admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Create anon client to verify caller
    const anonClient = createClient(supabaseUrl, anonKey, {
      auth: { persistSession: false },
      global: { headers: { Authorization: authHeader } },
    });

    const {
      data: { user: caller },
    } = await anonClient.auth.getUser();
    if (!caller) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await anonClient
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Admin only" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, displayName, action, source } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Create admin client
    const adminClient = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

    if (action === "resend") {
      // Resend invite: generate a recovery link (password reset)
      const { data, error } = await adminClient.auth.admin.generateLink({
        type: "recovery",
        email,
        options: {
          redirectTo: `${req.headers.get("origin") || "https://globalattract.lovable.app"}/reset-password`,
        },
      });

      if (error) throw error;

      // Use the Supabase built-in email by calling resetPasswordForEmail
      const { error: resetError } = await adminClient.auth.resetPasswordForEmail(email, {
        redirectTo: `${req.headers.get("origin") || "https://globalattract.lovable.app"}/reset-password`,
      });

      if (resetError) throw resetError;

      return new Response(
        JSON.stringify({ success: true, message: "Resend successful" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Invite new user
    const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email, {
      data: {
        display_name: displayName || email.split("@")[0],
        source: source || 'public',
      },
      redirectTo: `${req.headers.get("origin") || "https://globalattract.lovable.app"}/reset-password`,
    });

    if (error) {
      // If user already exists, send a password reset instead
      if (error.message?.includes('already been registered') || (error as any).code === 'email_exists') {
        const { error: resetError } = await adminClient.auth.resetPasswordForEmail(email, {
          redirectTo: `${req.headers.get("origin") || "https://globalattract.lovable.app"}/reset-password`,
        });
        if (resetError) throw resetError;
        return new Response(
          JSON.stringify({ success: true, message: "User exists, password reset email sent" }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      throw error;
    }

    return new Response(
      JSON.stringify({ success: true, user: { id: data.user.id, email: data.user.email } }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err: any) {
    console.error("invite-user error:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Internal error" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
