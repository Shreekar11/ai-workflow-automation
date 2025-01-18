import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.availableTrigger.create({
    data: {
      id: "a04b24cf-7ee5-4959-bc40-ae1bb86488c9",
      name: "Webhook",
      image:
        "https://mailparser.io/wp-content/uploads/2018/08/what-is-a-webhook-1024x536.jpeg",
    },
  });

  await prisma.availableAction.create({
    data: {
      id: "2c50cd8c-0fa6-4265-b0ba-0e895da73606",
      name: "Email",
      image:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT0XvFduY7sDBknSh_lJd80OzsdZ_LaHL2w-g&s",
    },
  });
}

main();
