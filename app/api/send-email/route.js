import { NextResponse } from "next/server";
import { Resend } from "resend";
import { auth, currentUser } from "@clerk/nextjs/server";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const clerkUser = await currentUser();
    const recruiterName = clerkUser?.firstName
      ? `${clerkUser.firstName}${clerkUser.lastName ? " " + clerkUser.lastName : ""}`
      : "The Hiring Team";

    const { candidate_email, candidate_name, role_title, company_name, interview_id } =
      await req.json();

    if (!candidate_email || !role_title) {
      return NextResponse.json(
        { error: "candidate_email and role_title are required" },
        { status: 400 }
      );
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev";
    const companyLabel = company_name || "our company";

    const hostUrl = process.env.NEXT_PUBLIC_HOST_URL || "http://localhost:3000/interview";
    // HOST_URL already ends with /interview, so just append the id
    const interviewLink = interview_id ? `${hostUrl}/${interview_id}` : null;

    const ctaBlock = interviewLink
      ? `
        <tr>
          <td style="padding:0 40px 32px;text-align:center;">
            <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.7;">
              Click the button below to begin your interview at your convenience.
            </p>
            <a href="${interviewLink}"
               style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;letter-spacing:0.2px;">
              Start Your Interview
            </a>
            <p style="margin:12px 0 0;color:#9ca3af;font-size:12px;">
              Or copy this link: <a href="${interviewLink}" style="color:#6366f1;">${interviewLink}</a>
            </p>
          </td>
        </tr>`
      : `
        <tr>
          <td style="padding:0 40px 32px;text-align:center;">
            <a href="mailto:${fromEmail}?subject=Interview%20for%20${encodeURIComponent(role_title)}"
               style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#fff;text-decoration:none;padding:14px 32px;border-radius:10px;font-size:15px;font-weight:600;letter-spacing:0.2px;">
              Reply to Schedule Interview
            </a>
          </td>
        </tr>`;

    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: [candidate_email],
      subject: `Interview Invitation — ${role_title} at ${companyLabel}`,
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Interview Invitation</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f5;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);padding:36px 40px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:26px;font-weight:700;letter-spacing:-0.5px;">HireEva</h1>
              <p style="margin:8px 0 0;color:rgba(255,255,255,0.85);font-size:14px;">AI-Powered Recruitment</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 40px 24px;">
              <h2 style="margin:0 0 12px;color:#1e1b4b;font-size:22px;font-weight:700;">
                Hi ${candidate_name || "there"}, you've been selected! 🎉
              </h2>
              <p style="margin:0 0 16px;color:#4b5563;font-size:15px;line-height:1.7;">
                We've reviewed your profile and would like to invite you to interview for the
                <strong>${role_title}</strong> position at <strong>${companyLabel}</strong>.
              </p>
              <p style="margin:0;color:#4b5563;font-size:15px;line-height:1.7;">
                The interview is conducted by our AI interviewer, <strong>Eva</strong>, and takes
                place entirely online — you can complete it whenever you're ready.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          ${ctaBlock}

          <!-- Footer -->
          <tr>
            <td style="background:#f9fafb;padding:20px 40px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;color:#9ca3af;font-size:12px;line-height:1.6;">
                This invitation was sent by ${recruiterName} via HireEva.<br/>
                If you believe you received this in error, please disregard this message.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
      `.trim(),
    });

    if (error) {
      console.error("Resend error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: data?.id }, { status: 200 });
  } catch (err) {
    console.error("send-email error:", err);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
