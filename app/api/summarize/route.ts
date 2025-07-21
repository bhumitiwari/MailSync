import { getServerSession, Session } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

interface GmailPayload {
  body?: { data?: string };
  parts?: GmailPart[];
}

interface GmailPart {
  mimeType: string;
  body: { data?: string };
  parts?: GmailPart[];
}

interface CustomSession extends Session {
  accessToken?: string;
}

function base64UrlDecode(str: string): string {
  if (!str) return "";
  str = str.replace(/-/g, "+").replace(/_/g, "/");
  while (str.length % 4) {
    str += "=";
  }
  return Buffer.from(str, "base64").toString("utf-8");
}

function getEmailBody(payload: GmailPayload): string {
  if (payload.body?.data) {
    return base64UrlDecode(payload.body.data);
  }
  const parts = payload.parts || [];
  const plainTextPart = parts.find((part) => part.mimeType === "text/plain");
  if (plainTextPart) {
    return base64UrlDecode(plainTextPart.body.data);
  }
  for (const part of parts) {
    if (part.parts) {
      const foundBody = getEmailBody(part);
      if (foundBody) return foundBody;
    }
  }
  return "";
}

async function processSingleEmail(
  emailData: { from: string; subject: string; body: string },
  existingTodos: string[],
  apiKey: string
) {
  const { from, subject, body } = emailData;
  const prompt = `Analyze the following email from "${from}" with the subject "${subject}".
Provide a response as a single, valid JSON object with three keys:
1. "sender": The name of the sender.
2. "summary": A very brief, one-sentence summary of the email.
3. "action": A string containing the single most important actionable item. Carefully check if an action that is semantically identical to this one already exists in the list of existing to-do items below. You must consider minor variations in wording (e.g., "Reply to John" is the same as "Send a reply to John"). If a semantically identical match is found, you MUST set the value to null. Otherwise, provide the action text.

Existing to-do items: ${JSON.stringify(existingTodos)}

Email Content:
${body}`;

  const geminiApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
  try {
    const response = await fetch(geminiApiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] }),
    });
    if (!response.ok) return null;
    const data = await response.json();
    const rawResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!rawResponse) return null;
    const jsonResponse = rawResponse
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();
    return JSON.parse(jsonResponse);
  } catch (e) {
    console.error("Error processing single email:", e);
    return null;
  }
}

export async function POST() {
  const session: CustomSession | null = await getServerSession(authOptions);
  if (!session?.accessToken)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accessToken = session.accessToken;
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey)
    return NextResponse.json(
      { error: "Gemini API key is not configured" },
      { status: 500 }
    );

  try {
    const client = await clientPromise;
    const db = client.db("inboxIntelDB");
    const allTodos = await db
      .collection("todos")
      .find({ userEmail: session.user?.email })
      .toArray();
    const existingTodoTexts = allTodos.map((todo) => todo.text);

    const now = new Date();
    const startOfPeriod = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() - 1,
      0,
      0,
      0
    );
    const endOfPeriod = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59
    );

    const startTimestamp = Math.floor(startOfPeriod.getTime() / 1000);
    const endTimestamp = Math.floor(endOfPeriod.getTime() / 1000);

    const gmailQuery = `category:primary after:${startTimestamp} before:${endTimestamp}`;

    const messagesResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(
        gmailQuery
      )}`,
      {
        headers: { Authorization: `Bearer ${accessToken}` },
      }
    );

    if (!messagesResponse.ok) {
      const errorData = await messagesResponse.json();
      console.error("Gmail API Error:", errorData);
      throw new Error("Failed to fetch messages from Gmail.");
    }

    const messagesData = await messagesResponse.json();
    if (!messagesData.messages || messagesData.messages.length === 0) {
      return NextResponse.json({ results: [] });
    }

    const emailPromises = messagesData.messages.map(
      async (message: { id: string }) => {
        const emailDetailsResponse = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${message.id}?format=full`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (!emailDetailsResponse.ok) return null;
        const emailDetails = await emailDetailsResponse.json();

        const fromHeader =
          emailDetails.payload.headers.find(
            (h: { name: string }) => h.name === "From"
          )?.value || "Unknown Sender";
        const subjectHeader =
          emailDetails.payload.headers.find(
            (h: { name: string }) => h.name === "Subject"
          )?.value || "No Subject";

        const body = getEmailBody(emailDetails.payload);

        if (!body) return null;

        return processSingleEmail(
          { from: fromHeader, subject: subjectHeader, body },
          existingTodoTexts,
          apiKey
        );
      }
    );

    const results = (await Promise.all(emailPromises)).filter(
      (r) => r !== null
    );
    return NextResponse.json({ results });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Error in /api/summarize:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
