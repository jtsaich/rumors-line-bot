import { t } from 'ttag';
import choosingArticle from './handlers/choosingArticle';
import choosingReply from './handlers/choosingReply';
import askingArticleSubmissionConsent from './handlers/askingArticleSubmissionConsent';
import askingArticleSource from './handlers/askingArticleSource';
import defaultState from './handlers/defaultState';
import { ManipulationError } from './handlers/utils';
import tutorial from './handlers/tutorial';
import {
  ChatbotPostbackHandlerParams,
  ChatbotStateHandlerReturnType,
  Context,
  PostbackActionData,
} from 'src/types/chatbotState';

/**
 * Given input event and context, outputs the new context and the reply to emit.
 *
 * @param context The current context of the bot
 * @param postbackData The input postback data extracted from event
 * @param event The input event
 * @param userId LINE user ID that does the input
 */
export default async function handlePostback(
  data: Context,
  postbackData: PostbackActionData<unknown>,
  userId: string
) {
  const params: ChatbotPostbackHandlerParams = {
    data,
    postbackData,
    userId,
  };

  let result: ChatbotStateHandlerReturnType;

  // Sets data and replies
  //
  try {
    switch (params.postbackData.state) {
      case 'CHOOSING_ARTICLE': {
        result = await choosingArticle(params);
        break;
      }
      case 'CHOOSING_REPLY': {
        result = await choosingReply(params);
        break;
      }
      case 'TUTORIAL': {
        result = tutorial(params);
        break;
      }
      case 'ASKING_ARTICLE_SOURCE': {
        result = await askingArticleSource(params);
        break;
      }
      case 'ASKING_ARTICLE_SUBMISSION_CONSENT': {
        result = await askingArticleSubmissionConsent(params);
        break;
      }
      default: {
        result = defaultState(params);
        break;
      }
    }
  } catch (e) {
    if (e instanceof ManipulationError) {
      result = {
        ...params,
        replies: [
          {
            type: 'flex',
            altText: e.toString(),
            contents: {
              type: 'bubble',
              header: {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: `⚠️ ${t`Wrong usage`}`,
                    color: '#ffb600',
                    weight: 'bold',
                  },
                ],
              },
              body: {
                type: 'box',
                layout: 'vertical',
                contents: [
                  {
                    type: 'text',
                    text: e.message,
                    wrap: true,
                  },
                ],
              },
              styles: {
                body: {
                  separator: true,
                },
              },
            },
          },
        ],
      };
    } else {
      throw e;
    }
  }

  return {
    context: { data: result.data },
    replies: result.replies,
  };
}
