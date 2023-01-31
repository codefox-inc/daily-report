import {WebClient} from '@slack/web-api';
import type {DailyReport} from '..';

export const createSlackclient = (token: string) => {
  return new WebClient(token);
};

export const createDailyReportBlocks = async (
  dailyReport: DailyReport,
  yesterday: string
) => {
  const blocks: any = [];
  blocks.push({
    type: 'header',
    text: {
      type: 'plain_text',
      text: `:通知fox:(${yesterday})の日報をお届けします`,
      emoji: true,
    },
  });
  for (const [user, tasks] of Object.entries(dailyReport)) {
    const text = tasks
      .map(task => `:white_check_mark:${task.text} (${task.hours}時間)\n`)
      .join('');
    blocks.push(
      {
        type: 'header',
        text: {
          type: 'plain_text',
          text: `:fox_face:${user}さんの日報:fox_face:`,
          emoji: true,
        },
      },
      {
        type: 'section',
        text: {
          type: 'mrkdwn',
          text: text,
        },
      },
      {
        type: 'divider',
      }
    );
  }
  return blocks;
};
