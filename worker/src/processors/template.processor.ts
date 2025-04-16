import { PrismaClient } from "@prisma/client";
import { RedisClientType } from "redis";
import { JsonObject } from "@prisma/client/runtime/library";
import { parser } from "../utils/parser";
import { QUEUE_NAME } from "../config";
import ScraperService from "../services/scraper.service";
import ModelService from "../services/model.service";
import GoogleDocsService from "../services/docs.service";

const ACTION_TYPE_CONFIG = {
  scraper: {
    types: ["Blog Scraper", "Linkedin Scraper"],
    processor: processScraperAction,
    resultKey: "scraper_result",
  },
  model: {
    types: ["LLM Model"],
    processor: processModelAction,
    resultKey: "llmmodel_result",
  },
  docs: {
    types: ["Google Docs"],
    processor: processDocsAction,
    resultKey: "google_docs_result",
  },
};

const ACTION_TYPE_MAP = Object.entries(ACTION_TYPE_CONFIG).reduce(
  (map, [key, config]) => {
    config.types.forEach((type) => {
      map[type] = { ...config, category: key };
    });
    return map;
  },
  {} as Record<string, any>
);

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

  if (!templateResultData) {
    throw new Error("Template result not found");
  }

  const currentAction = templateResultData.template.actions.find(
    (action) => action.sortingOrder === stage
  );

  if (!currentAction) {
    throw new Error(`No action found for stage ${stage}`);
  }

  const metadata = templateResultData?.metadata || {};
  const actionTypeName = currentAction.type.name;
  const actionConfig = ACTION_TYPE_MAP[actionTypeName];

  try {
    if (actionConfig) {
      await actionConfig.processor(
        client,
        currentAction,
        templateResultData,
        metadata,
        stage
      );
    } else {
      console.warn(`No processor found for action type: ${actionTypeName}`);
    }
  } catch (error) {
    await client.templateResult.update({
      where: { id: templateResultData.id },
      data: {
        status: "FAILED",
      },
    });
    throw error;
  }

  const lastStage = (templateResultData.template.actions.length || 1) - 1;

  if (lastStage !== stage) {
    const nextMessage = JSON.stringify({
      stage: stage + 1,
      templateResultId: templateId,
    });
    await redisClient.lPush(QUEUE_NAME, nextMessage);
  }

  console.log("Template action processing completed");
}

// Process scraper actions (Blog Scraper, LinkedIn Scraper, etc.)
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

  const actionConfig = ACTION_TYPE_MAP[currentAction.type.name];

  if (!actionResult) return;

  const nextActionType = findNextActionType(
    templateResultData.template.actions,
    currentAction
  );

  await client.$transaction(async (tx) => {
    // Update template result with new metadata
    await tx.templateResult.update({
      where: {
        id: templateResultData?.id,
      },
      data: {
        metadata: {
          ...(metadata as object),
          [actionConfig.resultKey]: actionResult,
        },
        status: isLastStage(templateResultData, stage)
          ? "COMPLETED"
          : "RUNNING",
      },
    });

    if (nextActionType) {
      await tx.templateAction.update({
        where: {
          actionId: nextActionType.id,
        },
        data: {
          metadata: {
            ...(metadata as object),
            [actionConfig.resultKey]: actionResult,
          },
        },
      });
    }
  });
}

// Process model actions (AI Model, LinkedIn Model, etc.)
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

  if (!scraperResult) {
    throw new Error("Missing scraper result in model action metadata");
  }

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

  if (!actionResult) return;

  const nextActionType = findNextActionType(
    templateResultData.template.actions,
    currentAction
  );

  await client.$transaction(async (tx) => {
    await tx.templateResult.update({
      where: {
        id: templateResultData?.id,
      },
      data: {
        metadata: {
          ...(metadata as object),
          llmmodel_result: actionResult,
        },
        status: isLastStage(templateResultData, stage)
          ? "COMPLETED"
          : "RUNNING",
      },
    });

    // If there's a next action, update its metadata
    if (nextActionType) {
      await tx.templateAction.update({
        where: {
          actionId: nextActionType.id,
        },
        data: {
          metadata: {
            ...(metadata as object),
            llmmodel_result: actionResult,
            scraper_result: scraperResult,
          },
        },
      });
    }
  });
}

// Process Google Docs actions
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

  if (!scraperResult) {
    throw new Error("Missing scraper result in docs action metadata");
  }

  const url = parser(scraperResult.url as string, templateMetadata);
  const title = parser(scraperResult.title as string, templateMetadata);
  const modelResult = (currentAction?.metadata as JsonObject)
    ?.llmmodel_result as JsonObject;

  if (!modelResult) {
    throw new Error("Missing model result in docs action metadata");
  }

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
          google_docs_result: actionResult,
        },
        status: isLastStage(templateResultData, stage)
          ? "COMPLETED"
          : "RUNNING",
      },
    });
  }
}

function isLastStage(templateResultData: any, stage: number): boolean {
  return stage === (templateResultData?.template.actions.length || 1) - 1;
}

function findNextActionType(actions: any[], currentAction: any): any {
  const currentIndex = actions.findIndex(
    (action) => action.id === currentAction.id
  );
  if (currentIndex === -1 || currentIndex === actions.length - 1) return null;

  return actions[currentIndex + 1].type;
}
