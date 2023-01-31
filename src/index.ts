import * as dotenv from 'dotenv';
import { DateTime } from 'luxon';
import {
  createNotionClient,
  getrawDailyReport,
} from './utils/notion';
import type { HttpFunction } from '@google-cloud/functions-framework';

import { createDailyReportBlocks, createSlackclient } from './utils/slack';

dotenv.config();

export type DailyReport = { [user: string]: { hours: number; text: string }[] };

export const exec: HttpFunction = async (req: any, res: any)  => {
  // 対象日の算出（昨日）
  const yesterday = DateTime.now()
    .setZone('Asia/Tokyo')
    .plus({days: -1})
    .toISODate();
  const yesterdayStart = yesterday + 'T00:00:00+09:00';
  const yesterdayEnd = yesterday + 'T23:59:59+09:00';

  const notionClient = createNotionClient(process.env.NOTION_TOKEN);

  // notionから日報データを取得
  const rawDailyReport = await getrawDailyReport(
    notionClient,
    process.env.NOTION_DB_ID,
    yesterdayStart,
    yesterdayEnd
  );

  // 空のレポートハッシュを用意し、rawDailyReport.resultsから整形
  const dailyReport: DailyReport = {};

  // 日報データを1行ずつ取得
  for (const result of rawDailyReport) {
    // Slackに表示するデータを保持
    const data = {
      hours: result.properties['時間数'].number,
      text: result.properties['やること'].title[0]?.plain_text,
    };

    // 日報データがもつユーザーごとに、表示データを追加
    for (const user of result.properties['ユーザー'].people) {
      if (dailyReport[user.name]) {
        dailyReport[user.name].push(data);
      } else {
        dailyReport[user.name] = [data];
      }
    }
  }

  //slackClientを生成し、日報があった日のみcreateDailyReportBlocksで作ったメッセージを発信
  if (rawDailyReport.length > 0) {
    const slackClient = createSlackclient(process.env.SLACK_TOKEN);
    const blocks = await createDailyReportBlocks(dailyReport, yesterday);
    const response = await slackClient.chat.postMessage({
      channel: 'n_日報',
      text: '昨日の日報をお届けします。',
      blocks: blocks,
    });
  }else{  
  };

  res.send('Success!');
};
