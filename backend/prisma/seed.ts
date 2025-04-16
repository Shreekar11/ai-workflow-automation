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
      id: "2656ecd9-a9b1-45ef-9886-9a22a0ae292c",
      name: "Google Sheets",
      image:
        "https://d3njjcbhbojbot.cloudfront.net/api/utilities/v1/imageproxy/https://coursera-course-photos.s3.amazonaws.com/a8/b4bac6e9614670b5a201b62293c489/logo_sheets_2020q4_color_1x_web_512dp.png",
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

  await prisma.preTemplate.create({
    data: {
      id: "0245e465-8329-4765-8a72-1058cf8af9f8",
      name: "Blog Scraper Template",
      description:
        "This template scraps the blog page details and uses a LLM model GPT or Claude to provide the transcript and write it to Google Doc or your email",
    },
  });

  await prisma.availableTemplateAction.create({
    data: {
      id: "1174ec54-91a4-4b0e-bd60-7bc438b2e3b4",
      preTemplateId: "0245e465-8329-4765-8a72-1058cf8af9f8",
      name: "Blog Scraper",
      image: "https://img.icons8.com/?size=512&id=ITIhejPZQD5g&format=png",
    },
  });

  await prisma.availableTemplateAction.create({
    data: {
      id: "de560ec9-eba5-4aaf-a30b-863817dfedc4",
      preTemplateId: "0245e465-8329-4765-8a72-1058cf8af9f8",
      name: "LLM model",
      image:
        "https://static.vecteezy.com/system/resources/previews/021/059/827/non_2x/chatgpt-logo-chat-gpt-icon-on-white-background-free-vector.jpg",
    },
  });

  await prisma.availableTemplateAction.create({
    data: {
      id: "c4d9b5b5-21bc-4321-b19b-a78cb06ae731",
      preTemplateId: "0245e465-8329-4765-8a72-1058cf8af9f8",
      name: "Google Docs",
      image:
        "https://static.vecteezy.com/system/resources/previews/027/179/392/non_2x/google-docs-icon-logo-symbol-free-png.png",
    },
  });

  await prisma.availableTemplateAction.create({
    data: {
      id: "5062cee8-df60-43d8-ae68-669bff73c41a",
      preTemplateId: "6db1ed1f-107e-477f-a69b-1e2c4098b1d8",
      name: "Linkedin Scraper",
      image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTqRT_v4ZAz8Dycy-qPy_EUGo-5afRiZZ4o_w&s",
    },
  });

  await prisma.availableTemplateAction.create({
    data: {
      id: "ce056d42-4ed2-43ca-9ef2-e9e6063228d2",
      preTemplateId: "6db1ed1f-107e-477f-a69b-1e2c4098b1d8",
      name: "LLM model",
      image:
        "https://static.vecteezy.com/system/resources/previews/021/059/827/non_2x/chatgpt-logo-chat-gpt-icon-on-white-background-free-vector.jpg",
    },
  });
}

main();
