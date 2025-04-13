import Pagination from "@/app/components/Pagination";
import prisma from "@/prisma/client";
import { Status } from "@prisma/client";
import IssueActions from "./IssueActions";
import IssueTable, { ColumnNames, IssueQuery, columnNames } from "./IssueTable";
import { Flex } from "@radix-ui/themes";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Issue Tracker - Issue List",
  description: "View all project issues",
};

interface Props {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

const IssuesPage = async ({ searchParams }: Props) => {
  const params = await searchParams;

  const statusParam = Array.isArray(params.status)
    ? params.status[0]
    : params.status;

  const orderByParam = Array.isArray(params.orderBy)
    ? params.orderBy[0]
    : params.orderBy;

  const pageParam = Array.isArray(params.page) ? params.page[0] : params.page;

  const statuses = Object.values(Status);
  const status = statuses.includes(statusParam as Status)
    ? (statusParam as Status)
    : undefined;

  const orderBy = columnNames.includes(orderByParam as ColumnNames)
    ? { [orderByParam as keyof typeof columnNames]: "asc" }
    : undefined;

  const page = parseInt(pageParam || "1", 10) || 1;
  const pageSize = 10;

  const where = { status };

  const issues = await prisma.issue.findMany({
    where,
    orderBy,
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  const issueCount = await prisma.issue.count({ where });

  return (
    <Flex direction="column" gap="3">
      <IssueActions />
      <IssueTable
        searchParams={{
          status: status ?? "",
          orderBy: orderByParam ?? "",
          page: page.toString(),
        }}
        issues={issues}
      />
      <Pagination
        pageSize={pageSize}
        currentPage={page}
        itemCount={issueCount}
      />
    </Flex>
  );
};

export default IssuesPage;
