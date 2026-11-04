// Supabase Edge Function: Secure Payment Webhook Receiver (Paymob / Kashier / Fawry)
// Deploy with: supabase functions deploy payment-webhook --no-verify-jwt
// Set secrets with: supabase secrets set PAYMOB_HMAC_SECRET="your_secret"

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, hmac",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json();
    const provider = req.headers.get("x-provider") || "paymob";

    // 1. Paymob Webhook Verification
    if (provider === "paymob") {
      const hmacSecret = Deno.env.get("PAYMOB_HMAC_SECRET");
      if (!hmacSecret) {
        return new Response(JSON.stringify({ error: "HMAC Secret not configured" }), { status: 500 });
      }

      const obj = body.obj;
      if (!obj) {
        return new Response(JSON.stringify({ error: "Invalid payload" }), { status: 400 });
      }

      // Concatenate fields according to Paymob HMAC specification
      const concatenated = [
        obj.amount_cents,
        obj.created_at,
        obj.currency,
        obj.error_occured,
        obj.has_parent_transaction,
        obj.id,
        obj.integration_id,
        obj.is_3d_secure,
        obj.is_auth,
        obj.is_capture,
        obj.is_refunded,
        obj.is_standalone_payment,
        obj.is_voided,
        obj.order?.id,
        obj.owner,
        obj.pending,
        obj.source_data?.pan,
        obj.source_data?.sub_type,
        obj.source_data?.type,
        obj.success
      ].join("");

      // Calculate HMAC SHA512
      const encoder = new TextEncoder();
      const keyData = encoder.encode(hmacSecret);
      const cryptoKey = await crypto.subtle.importKey(
        "raw", keyData, { name: "HMAC", hash: "SHA-512" }, false, ["sign"]
      );
      const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(concatenated));
      const hashArray = Array.from(new Uint8Array(signature));
      const calculatedHmac = hashArray.map(b => b.toString(16).padStart(2, "0")).join("");

      const receivedHmac = new URL(req.url).searchParams.get("hmac") || req.headers.get("hmac");
      if (calculatedHmac !== receivedHmac) {
        return new Response(JSON.stringify({ error: "HMAC signature mismatch" }), { status: 401 });
      }

      const orderId = obj.order?.merchant_order_id;
      const isSuccess = obj.success === true;

      if (orderId && isSuccess) {
        // Update order status in Supabase securely with service_role key
        await supabase
          .from("orders")
          .update({
            payment_status: "paid",
            gateway_provider: "paymob",
            gateway_transaction_id: String(obj.id),
            updated_at: new Date().toISOString()
          })
          .eq("id", orderId);
      }

      return new Response(JSON.stringify({ received: true }), { headers: corsHeaders });
    }

    return new Response(JSON.stringify({ message: "Unsupported provider" }), { status: 400 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: corsHeaders });
  }
});
