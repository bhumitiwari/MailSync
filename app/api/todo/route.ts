import { getServerSession } from "next-auth/next";
import { authOptions } from "../../../lib/auth";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

const DB_NAME = "MailSyncDB";
const COLLECTION_NAME = "todos";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db(DB_NAME);
    const todos = await db
      .collection(COLLECTION_NAME)
      .find({ userEmail: session.user.email, isDone: false })
      .sort({ createdAt: -1 })
      .toArray();

    console.log(
      `[GET /api/todo] Found ${todos.length} items for ${session.user.email}`
    );
    return NextResponse.json(todos);
  } catch (error) {
    console.error("[GET /api/todo] Failed to fetch todos:", error);
    return NextResponse.json(
      { error: "Failed to fetch to-do items." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { items }: { items: { text: string; sender: string }[] } =
      await request.json();
    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "No items to add." }, { status: 400 });
    }

    console.log(
      `[POST /api/todo] Attempting to add ${items.length} items for ${session.user.email}`
    );

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const newTodos = items.map((item) => ({
      userEmail: session.user.email,
      text: item.text,
      sender: item.sender,
      isDone: false,
      createdAt: new Date(),
    }));

    const result = await db.collection(COLLECTION_NAME).insertMany(newTodos);
    console.log(
      `[POST /api/todo] Successfully inserted ${result.insertedCount} items.`
    );
    return NextResponse.json({
      success: true,
      insertedCount: result.insertedCount,
    });
  } catch (error) {
    console.error("[POST /api/todo] Failed to add todos:", error);
    return NextResponse.json(
      { error: "Failed to add to-do items." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json(
        { error: "To-do ID is required." },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(DB_NAME);

    const result = await db
      .collection(COLLECTION_NAME)
      .updateOne(
        { _id: new ObjectId(id), userEmail: session.user.email },
        { $set: { isDone: true } }
      );

    if (result.matchedCount === 0) {
      return NextResponse.json(
        { error: "To-do item not found or you do not have permission." },
        { status: 404 }
      );
    }

    console.log(`[PATCH /api/todo] Marked item ${id} as done.`);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/todo] Failed to update todo:", error);
    return NextResponse.json(
      { error: "Failed to update to-do item." },
      { status: 500 }
    );
  }
}
