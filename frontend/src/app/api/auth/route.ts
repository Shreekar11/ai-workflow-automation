import axios from "axios";
import { Webhook } from "svix";
import { headers } from "next/headers";
import { WebhookEvent } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { createUserAction } from "@/lib/actions/user.action";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error(
      "Please add WEBHOOK_SECRET from Clerk Dashboard to .env or .env.local"
    );
  }

  // Get the headers
  const headerPayload = headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your secret.
  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;

    const userData = {
      clerkUserId: id,
      email: email_addresses[0]?.email_address,
      firstName: first_name || "",
      lastName: last_name || "",
    };

    try {
      const response = await createUserAction(userData);
      if (!response.status) {
        throw new Error("Failed to save user");
      }
      return NextResponse.json(
        {
          status: true,
          message: "User created successfully!",
          data: response.data,
        },
        { status: 201 }
      );
    } catch (error) {
      return NextResponse.json(
        {
          status: false,
          message: "Failed to save user",
          error:
            error instanceof Error
              ? error.message
              : "Error occurred saving user",
        },
        { status: 500 }
      );
    }
  }

  // Respond with a 200 OK for unhandled event types
  return NextResponse.json(
    {
      message: "Event type not handled",
    },
    { status: 200 }
  );
}
