type QueryResult<T = unknown> = {
  data: T | null;
  error: { message: string } | null;
};

type ReportQuery = PromiseLike<QueryResult> & {
  eq(column: string, value: string): ReportQuery;
  limit(count: number): ReportQuery;
  order(column: string, options?: { ascending?: boolean }): ReportQuery;
  select(columns: string): ReportQuery;
  single(): Promise<QueryResult>;
};

export type ReportDatabaseClient = {
  from(table: string): ReportQuery;
};

export function asReportDatabaseClient(client: unknown): ReportDatabaseClient {
  return client as ReportDatabaseClient;
}
