import { prisma } from "./db";

export async function notifyUser(input: {
  userId: string;
  type: string;
  title: string;
  body: string;
  href?: string;
}) {
  await prisma.notification.create({ data: input });
}
