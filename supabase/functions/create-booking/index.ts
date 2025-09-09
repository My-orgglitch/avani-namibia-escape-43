import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
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
    const bookingData = await req.json();

    const {
      booking_type,
      room_id,
      activity_id,
      guest_name,
      guest_email,
      guest_phone,
      check_in_date,
      check_out_date,
      activity_date,
      number_of_guests,
      special_requests,
      user_id,
      payment_on_arrival
    } = bookingData;

    // Validate required fields
    if (!booking_type || !guest_name || !guest_email || !number_of_guests) {
      throw new Error("Missing required fields");
    }

    if (booking_type === 'room' && (!room_id || !check_in_date || !check_out_date)) {
      throw new Error("Room bookings require room_id, check_in_date, and check_out_date");
    }

    if (booking_type === 'activity' && (!activity_id || !activity_date)) {
      throw new Error("Activity bookings require activity_id and activity_date");
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Calculate total amount based on booking type
    let total_amount_nad = 0;
    let itemName = "";

    if (booking_type === 'room') {
      const { data: room, error: roomError } = await supabaseClient
        .from("rooms")
        .select("name, price_nad")
        .eq("id", room_id)
        .single();

      if (roomError) {
        throw new Error(`Room not found: ${roomError.message}`);
      }

      // Calculate number of nights
      const checkIn = new Date(check_in_date);
      const checkOut = new Date(check_out_date);
      const nights = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
      
      total_amount_nad = room.price_nad * nights;
      itemName = room.name;
    } else {
      const { data: activity, error: activityError } = await supabaseClient
        .from("activities")
        .select("name, price_nad")
        .eq("id", activity_id)
        .single();

      if (activityError) {
        throw new Error(`Activity not found: ${activityError.message}`);
      }

      total_amount_nad = activity.price_nad * number_of_guests;
      itemName = activity.name;
    }

    // Create booking
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .insert({
        user_id: user_id || null,
        booking_type,
        room_id: booking_type === 'room' ? room_id : null,
        activity_id: booking_type === 'activity' ? activity_id : null,
        guest_name,
        guest_email,
        guest_phone,
        check_in_date: booking_type === 'room' ? check_in_date : null,
        check_out_date: booking_type === 'room' ? check_out_date : null,
        activity_date: booking_type === 'activity' ? activity_date : null,
        number_of_guests,
        total_amount_nad,
        special_requests,
        payment_status: payment_on_arrival ? 'pending_arrival' : 'pending'
      })
      .select()
      .single();

    if (bookingError) {
      throw new Error(`Failed to create booking: ${bookingError.message}`);
    }

    // Send booking confirmation email
    try {
      const emailResponse = await fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/send-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${Deno.env.get("SUPABASE_ANON_KEY")}`,
        },
        body: JSON.stringify({
          booking_id: booking.id,
          email_type: "booking_confirmation"
        }),
      });

      if (!emailResponse.ok) {
        console.error("Failed to send booking confirmation email");
      }
    } catch (emailError) {
      console.error("Error sending booking confirmation email:", emailError);
    }

    return new Response(JSON.stringify({
      booking_id: booking.id,
      total_amount_nad,
      item_name: itemName,
      message: "Booking created successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error creating booking:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to create booking"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});