import { PrismaClient } from "@prisma/client";
import { RedisClientType } from "redis";
import { JsonObject } from "@prisma/client/runtime/library";
import { parser } from "../utils/parser";
import {
  availableScraperId,
  availableModelId,
  availableGoogleDocsId,
  QUEUE_NAME,
} from "../config";
import ScraperService from "../services/scraper.service";
import ModelService from "../services/model.service";
import GoogleDocsService from "../services/docs.service";

export async function processTemplateMessage(
  client: PrismaClient,
  redisClient: RedisClientType,
  templateId: string,
  stage: number
) {
  const templateResultData = await client.templateResult.findFirst({
    where: {
      id: templateId,
    },
    include: {
      template: {
        include: {
          actions: {
            include: {
              type: true,
            },
          },
        },
      },
    },
  });

  const currentAction = templateResultData?.template.actions.find(
    (action) => action.sortingOrder === stage
  );
  const metadata = templateResultData?.metadata || {};

  try {
    // scraper action
    if (currentAction?.type.id === availableScraperId) {
      await processScraperAction(
        client,
        currentAction,
        templateResultData,
        metadata,
        stage
      );
    }

    // llm model action
    if (currentAction?.type.id === availableModelId) {
      await processModelAction(
        client,
        currentAction,
        templateResultData,
        metadata,
        stage
      );
    }

    // google docs action
    if (currentAction?.type.id === availableGoogleDocsId) {
      await processDocsAction(
        client,
        currentAction,
        templateResultData,
        metadata,
        stage
      );
    }
  } catch (error) {
    await client.templateResult.update({
      where: { id: templateResultData?.id },
      data: {
        status: "failed",
      },
    });

    throw error;
  }

  const lastStage = (templateResultData?.template.actions.length || 1) - 1;

  if (lastStage !== stage) {
    const nextMessage = JSON.stringify({
      stage: stage + 1,
      templateResultId: templateId,
    });
    console.log("Redis data: ", QUEUE_NAME, nextMessage);

    const res = await redisClient.lPush(QUEUE_NAME, nextMessage);

    console.log(res);
  }

  console.log("Template actions processing completed");
}

async function processScraperAction(
  client: PrismaClient,
  currentAction: any,
  templateResultData: any,
  metadata: any,
  stage: number
) {
  const templateMetadata = templateResultData?.metadata;
  const url = parser(
    (currentAction.metadata as JsonObject)?.url as string,
    templateMetadata
  );
  const scraperService = new ScraperService(url);
  const actionResult = await scraperService.scraperAction();

  if (actionResult) {
    await client.$transaction(async (tx) => {
      await tx.templateResult.update({
        where: {
          id: templateResultData?.id,
        },
        data: {
          metadata: {
            ...(metadata as object),
            [`${currentAction.type.name.toLowerCase().trim()}_result`]:
              actionResult,
          },
          status:
            stage === (templateResultData?.template.actions.length || 1) - 1
              ? "completed"
              : "running",
        },
      });

      // here the metadata of the next step i.e ai-model is updated and scraper_result is added
      await tx.templateAction.update({
        where: {
          actionId: availableModelId,
        },
        data: {
          metadata: {
            ...(metadata as object),
            [`${currentAction.type.name.toLowerCase().trim()}_result`]:
              actionResult,
          },
        },
      });
    });
  }
}

async function processModelAction(
  client: PrismaClient,
  currentAction: any,
  templateResultData: any,
  metadata: any,
  stage: number
) {
  const templateMetadata = templateResultData?.metadata;
  const scraperResult = (currentAction.metadata as JsonObject)
    ?.scraper_result as JsonObject;
  const url = parser(scraperResult?.url as string, templateMetadata);
  const title = parser(scraperResult?.title as string, templateMetadata);
  const content = parser(scraperResult?.content as string, templateMetadata);
  const system = parser(
    (currentAction.metadata as JsonObject).system as string,
    templateMetadata
  );
  const model = parser(
    (currentAction.metadata as JsonObject).model as string,
    templateMetadata
  );

  const modelService = new ModelService(url, title, content, system, model);

  const actionResult = await modelService.llmAction();
  if (actionResult) {
    await client.$transaction(async (tx) => {
      await tx.templateResult.update({
        where: {
          id: templateResultData?.id,
        },
        data: {
          metadata: {
            ...(metadata as object),
            [`llmmodel_result`]: actionResult,
          },
          status:
            stage === (templateResultData?.template.actions.length || 1) - 1
              ? "completed"
              : "running",
        },
      });

      // here the metadata of the next step i.e google docs is updated and llm_result is added
      await tx.templateAction.update({
        where: {
          actionId: availableGoogleDocsId,
        },
        data: {
          metadata: {
            ...(metadata as object),
            [`llmmodel_result`]: actionResult,
            ["scraper_result"]: scraperResult,
          },
        },
      });
    });
  }
}

async function processDocsAction(
  client: PrismaClient,
  currentAction: any,
  templateResultData: any,
  metadata: any,
  stage: number
) {
  const templateMetadata = templateResultData?.metadata;
  const scraperResult = (currentAction?.metadata as JsonObject)
    ?.scraper_result as JsonObject;
  const url = parser(scraperResult.url as string, templateMetadata);
  const title = parser(scraperResult.title as string, templateMetadata);
  const modelResult = (currentAction?.metadata as JsonObject)
    ?.llmmodel_result as JsonObject;
  const result = parser(modelResult.result as string, templateMetadata);
  const model = parser(modelResult.model as string, templateMetadata);
  const googleDocsId = parser(
    (currentAction?.metadata as JsonObject)?.googleDocsId as string,
    templateMetadata
  );

  const docsService = new GoogleDocsService(
    url,
    title,
    result,
    model,
    googleDocsId
  );

  const actionResult = await docsService.googleDocsAction();
  if (actionResult) {
    await client.templateResult.update({
      where: {
        id: templateResultData?.id,
      },
      data: {
        metadata: {
          ...(metadata as object),
          [`google_docs_result`]: actionResult,
        },
        status:
          stage === (templateResultData?.template.actions.length || 1) - 1
            ? "completed"
            : "running",
      },
    });
  }
}
