import "server-only";
import { createTransport } from "nodemailer";
import { z } from "zod";
import type { Inquiry } from "@/features/contact/model";
import { INQUIRY_RECIPIENT, inquiryText } from "./inquiry";
const zohoHosts =
  /^(smtp|smtppro)\.zoho\.(com|eu|in|com\.au|jp|ca|com\.cn|sa)$/;
const mailSchema = z.object({
  host: z.string().regex(zohoHosts),
  user: z.string().email(),
  password: z.string().min(8).max(512),
});
export async function deliverInquiry(data: Inquiry) {
  const result = mailSchema.safeParse({
    host: process.env.CONTACT_SMTP_HOST,
    user: process.env.CONTACT_SMTP_USER,
    password: process.env.CONTACT_SMTP_PASSWORD,
  });
  if (!result.success) {
    console.error({
      event: "inquiry_mail_configuration_unavailable",
      fields: result.error.issues.map((issue) => issue.path.join(".")),
    });
    throw Error("Mail delivery unavailable");
  }
  const config = result.data;
  const transport = createTransport({
    host: config.host,
    port: 465,
    secure: true,
    auth: { user: config.user, pass: config.password },
    tls: {
      rejectUnauthorized: true,
      minVersion: "TLSv1.2",
      servername: config.host,
    },
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 15000,
    disableFileAccess: true,
    disableUrlAccess: true,
    logger: false,
    debug: false,
  });
  try {
    const info = await transport.sendMail({
      from: { name: "Syncrate website", address: config.user },
      to: INQUIRY_RECIPIENT,
      replyTo: { name: data.name, address: data.email },
      subject: "sySGLD business inquiry",
      text: inquiryText(data),
      disableFileAccess: true,
      disableUrlAccess: true,
    });
    if (
      !info.accepted.some(
        (address) => String(address).toLowerCase() === INQUIRY_RECIPIENT,
      ) ||
      info.rejected.length
    )
      throw Error("Mail not accepted");
  } catch (error) {
    const code =
      error && typeof error === "object" && "code" in error
        ? error.code
        : undefined;
    console.error({
      event: "inquiry_mail_delivery_failed",
      category:
        code === "EAUTH"
          ? "authentication"
          : code === "ETIMEDOUT"
            ? "timeout"
            : "delivery",
    });
    throw Error("Mail delivery unavailable");
  } finally {
    transport.close();
  }
}
