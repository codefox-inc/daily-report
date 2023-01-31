declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NOTION_TOKEN: string;
      NOTION_DB_ID: string;
      SLACK_TOKEN: string;
    }
  }
}

export {};
