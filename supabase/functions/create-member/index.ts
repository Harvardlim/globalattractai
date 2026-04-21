import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;

    // Verify caller is admin
    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await callerClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const callerId = claimsData.claims.sub as string;
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const { data: adminRole } = await adminClient
      .from("user_roles")
      .select("user_id")
      .eq("user_id", callerId)
      .in("role", ["admin", "superadmin"])
      .maybeSingle();

    if (!adminRole) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { email, display_name, member_tier, duration, source, referral_code } = await req.json();

    if (!email) {
      return new Response(JSON.stringify({ error: "email is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Resolve referral code to referrer id
    let referrerId: string | null = null;
    if (referral_code && referral_code.trim()) {
      const { data: referrerProfile } = await adminClient
        .from("profiles")
        .select("id")
        .eq("referral_code", referral_code.trim().toUpperCase())
        .maybeSingle();
      if (referrerProfile) {
        referrerId = referrerProfile.id;
      }
    }

    const defaultPassword = "Globalattract123@";

    // Build user metadata
    const userMetadata: Record<string, string> = {
      display_name: display_name || email.split("@")[0],
      source: source || "全球发愿",
    };
    // Pass referral_code in metadata so handle_new_user trigger can use it
    if (referral_code && referral_code.trim()) {
      userMetadata.referral_code = referral_code.trim().toUpperCase();
    }

    // Create user with auto-confirm
    const { data: userData, error: createError } =
      await adminClient.auth.admin.createUser({
        email,
        password: defaultPassword,
        email_confirm: true,
        user_metadata: userMetadata,
      });

    if (createError) {
      return new Response(JSON.stringify({ error: createError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = userData.user.id;

    // Set must_change_password flag + referred_by if resolved
    const profileUpdate: Record<string, any> = { must_change_password: true };
    if (referrerId) {
      profileUpdate.referred_by = referrerId;
    }
    await adminClient
      .from("profiles")
      .update(profileUpdate)
      .eq("id", userId);

    // Set member tier and duration if subscriber
    if (member_tier && member_tier !== "normal") {
      let expiresAt: string | null = null;
      if (duration && duration !== "permanent") {
        const now = new Date();
        if (duration === "1d") {
          now.setDate(now.getDate() + 1);
          expiresAt = now.toISOString();
        } else if (duration === "14d") {
          now.setDate(now.getDate() + 14);
          expiresAt = now.toISOString();
        } else {
          const months = parseInt(duration);
          if (!isNaN(months)) {
            now.setMonth(now.getMonth() + months);
            expiresAt = now.toISOString();
          }
        }
      }

      await adminClient
        .from("profiles")
        .update({
          member_tier,
          membership_expires_at: expiresAt,
        })
        .eq("id", userId);
    }

    return new Response(
      JSON.stringify({ success: true, user_id: userId }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
