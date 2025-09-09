import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.21.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { booking_id, amount_nad, currency = "NAD", description } = await req.json();

    if (!booking_id || !amount_nad) {
      throw new Error("Missing required fields: booking_id and amount_nad");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2023-10-16",
    });

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get booking details
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select("*")
      .eq("id", booking_id)
      .single();

    if (bookingError) {
      throw new Error(`Booking not found: ${bookingError.message}`);
    }

    // Check if customer exists
    const customers = await stripe.customers.list({ 
      email: booking.guest_email,
      limit: 1 
    });

    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
    } else {
      const customer = await stripe.customers.create({
        email: booking.guest_email,
        name: booking.guest_name,
        phone: booking.guest_phone || undefined,
      });
      customerId = customer.id;
    }

    // Create checkout session for NAD currency
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price_data: {
            currency: currency.toLowerCase(),
            product_data: {
              name: description || `Booking payment for ${booking.guest_name}`,
            },
            unit_amount: Math.round(amount_nad), // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${Deno.env.get("SUPABASE_URL")?.replace('//', '//').split('//')[1] ? 'https://' + Deno.env.get("SUPABASE_URL")?.replace('//', '//').split('//')[1].split('.')[0] + '.lovable.app' : 'http://localhost:3000'}/rooms?payment=success`,
      cancel_url: `${Deno.env.get("SUPABASE_URL")?.replace('//', '//').split('//')[1] ? 'https://' + Deno.env.get("SUPABASE_URL")?.replace('//', '//').split('//')[1].split('.')[0] + '.lovable.app' : 'http://localhost:3000'}/rooms?payment=cancelled`,
      metadata: {
        booking_id: booking_id,
        booking_type: booking.booking_type,
        guest_email: booking.guest_email,
      },
    });

    // Update booking with session ID
    const { error: updateError } = await supabaseClient
      .from("bookings")
      .update({ 
        stripe_payment_intent_id: session.id,
        payment_status: 'pending'
      })
      .eq("id", booking_id);

    if (updateError) {
      console.error("Error updating booking:", updateError);
    }

    return new Response(JSON.stringify({
      url: session.url,
      session_id: session.id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error creating payment:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to create payment"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});