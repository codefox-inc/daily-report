import { Client } from '@notionhq/client';
import type { DailyReport } from '..';

export const createNotionClient = (token: string) => {
  return new Client({ auth: token });
};

export const getrawDailyReport = async (
  notion: Client,
  db_id: string,
  after: string,
  before: string
): Promise<any> => {
  let results: any = [];
  let has_more = true;
  let next_cursor: string | null = null;

  while (has_more) {
    const response: any = await notion.databases.query({
      start_cursor: next_cursor || undefined,
      database_id: db_id,
      filter: {
        and: [
          {
            property: '日付',
            date: {
              on_or_before: before,
            },
          },
          {
            property: '日付',
            date: {
              on_or_after: after,
            },
          },
        ],
      },
      sorts: [
        {
          property: 'ユーザー',
          direction: 'ascending',
        },
        {
          property: '作成日時',
          direction: 'descending',
        },
      ],
    });

    results = results.concat(response.results);
    has_more = response.has_more;
    next_cursor = response.next_cursor;
  }
  return results;
};