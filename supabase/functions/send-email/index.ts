import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { booking_id, email_type } = await req.json();

    if (!booking_id || !email_type) {
      throw new Error("Missing required fields: booking_id and email_type");
    }

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get booking details with related room/activity info
    const { data: booking, error: bookingError } = await supabaseClient
      .from("bookings")
      .select(`
        *,
        rooms:room_id(*),
        activities:activity_id(*)
      `)
      .eq("id", booking_id)
      .single();

    if (bookingError) {
      throw new Error(`Booking not found: ${bookingError.message}`);
    }

    let subject = "";
    let htmlContent = "";

    const formatPrice = (cents: number) => {
      return `N$${(cents / 100).toFixed(2)}`;
    };

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('en-NA', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    switch (email_type) {
      case "booking_confirmation":
        subject = `Booking Confirmation - ${booking.booking_type === 'room' ? booking.rooms?.name : booking.activities?.name}`;
        
        const itemName = booking.booking_type === 'room' ? booking.rooms?.name : booking.activities?.name;
        const itemDetails = booking.booking_type === 'room' 
          ? `Check-in: ${formatDate(booking.check_in_date)}<br>Check-out: ${formatDate(booking.check_out_date)}`
          : `Activity Date: ${formatDate(booking.activity_date)}<br>Duration: ${booking.activities?.duration}`;
        
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FFD700; text-align: center;">Booking Confirmation</h1>
            <p>Dear ${booking.guest_name},</p>
            
            <p>Thank you for your booking! We're excited to welcome you to our luxury guesthouse.</p>
            
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #333; margin-top: 0;">Booking Details</h2>
              <p><strong>Booking Reference:</strong> ${booking.id.slice(0, 8).toUpperCase()}</p>
              <p><strong>${booking.booking_type === 'room' ? 'Room' : 'Activity'}:</strong> ${itemName}</p>
              <p><strong>Guest Name:</strong> ${booking.guest_name}</p>
              <p><strong>Number of Guests:</strong> ${booking.number_of_guests}</p>
              <p>${itemDetails}</p>
              <p><strong>Total Amount:</strong> ${formatPrice(booking.total_amount_nad)}</p>
              <p><strong>Payment Status:</strong> ${booking.payment_status}</p>
              ${booking.special_requests ? `<p><strong>Special Requests:</strong> ${booking.special_requests}</p>` : ''}
            </div>
            
            <p>We look forward to providing you with an exceptional experience. If you have any questions, please don't hesitate to contact us.</p>
            
            <p>Best regards,<br>
            The Guesthouse Team<br>
            Phone: +264 66 267 800<br>
            cell: +264 81 233 391 5
            Email: beautfortguests@gmail.com</p>
          </div>
        `;
        break;

      case "payment_confirmation":
        subject = "Payment Confirmed - Thank You!";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #28a745; text-align: center;">Payment Confirmed</h1>
            <p>Dear ${booking.guest_name},</p>
            
            <p>Your payment has been successfully processed!</p>
            
            <div style="background-color: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #c3e6cb;">
              <h2 style="color: #155724; margin-top: 0;">Payment Details</h2>
              <p><strong>Booking Reference:</strong> ${booking.id.slice(0, 8).toUpperCase()}</p>
              <p><strong>Amount Paid:</strong> ${formatPrice(booking.total_amount_nad)}</p>
              <p><strong>Payment Status:</strong> Confirmed</p>
            </div>
            
            <p>Your booking is now confirmed and we're preparing for your arrival. You'll receive additional information closer to your visit date.</p>
            
            <p>Best regards,<br>
            The Guesthouse Team</p>
          </div>
        `;
        break;

      case "reminder":
        subject = "Upcoming Visit Reminder";
        const reminderDate = booking.booking_type === 'room' ? booking.check_in_date : booking.activity_date;
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #FFD700; text-align: center;">Upcoming Visit Reminder</h1>
            <p>Dear ${booking.guest_name},</p>
            
            <p>This is a friendly reminder about your upcoming ${booking.booking_type === 'room' ? 'stay' : 'activity'} with us!</p>
            
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #ffeaa7;">
              <h2 style="color: #856404; margin-top: 0;">Visit Details</h2>
              <p><strong>Date:</strong> ${formatDate(reminderDate)}</p>
              <p><strong>Booking Reference:</strong> ${booking.id.slice(0, 8).toUpperCase()}</p>
            </div>
            
            <p>We're looking forward to welcoming you! If you need to make any changes or have questions, please contact us as soon as possible.</p>
            
            <p>Best regards,<br>
            The Guesthouse Team</p>
          </div>
        `;
        break;

      case "cancellation":
        subject = "Booking Cancellation Confirmation";
        htmlContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #dc3545; text-align: center;">Booking Cancelled</h1>
            <p>Dear ${booking.guest_name},</p>
            
            <p>We've processed your cancellation request for booking reference ${booking.id.slice(0, 8).toUpperCase()}.</p>
            
            <p>We're sorry to see you go and hope to welcome you in the future. If you have any questions about refunds or need assistance with a new booking, please contact us.</p>
            
            <p>Best regards,<br>
            The Guesthouse Team</p>
          </div>
        `;
        break;

      default:
        throw new Error(`Unknown email type: ${email_type}`);
    }

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Namibian Guesthouse <bookings@resend.dev>",
      to: [booking.guest_email],
      subject: subject,
      html: htmlContent,
    });

    // Log email notification
    const { error: logError } = await supabaseClient
      .from("email_notifications")
      .insert({
        booking_id: booking_id,
        email_type: email_type,
        recipient_email: booking.guest_email,
        subject: subject,
        status: emailResponse.error ? 'failed' : 'sent',
        sent_at: emailResponse.error ? null : new Date().toISOString(),
        error_message: emailResponse.error?.message || null,
      });

    if (logError) {
      console.error("Error logging email notification:", logError);
    }

    return new Response(JSON.stringify({
      success: true,
      email_id: emailResponse.data?.id,
      message: "Email sent successfully"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("Error sending email:", error);
    return new Response(JSON.stringify({ 
      error: error.message || "Failed to send email"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});