import { FC, useState } from "react";
import { observer } from "mobx-react";
import useSWR from "swr";
import { Inbox, PanelLeft } from "lucide-react";
// components
import { EmptyState } from "@/components/empty-state";
import { InboxSidebar, InboxContentRoot } from "@/components/inbox";
import { InboxLayoutLoader } from "@/components/ui";
// constants
import { EmptyStateType } from "@/constants/empty-state";
// helpers
import { cn } from "@/helpers/common.helper";
// hooks
import { useProjectInbox } from "@/hooks/store";

type TInboxIssueRoot = {
  workspaceSlug: string;
  projectId: string;
  inboxIssueId: string | undefined;
  inboxAccessible: boolean;
};

export const InboxIssueRoot: FC<TInboxIssueRoot> = observer((props) => {
  const { workspaceSlug, projectId, inboxIssueId, inboxAccessible } = props;
  // states
  const [toggleMobileSidebar, setToggleMobileSidebar] = useState(false);
  // hooks
  const { loader, error, fetchInboxIssues } = useProjectInbox();

  useSWR(
    inboxAccessible && workspaceSlug && projectId ? `PROJECT_INBOX_ISSUES_${workspaceSlug}_${projectId}` : null,
    async () => {
      inboxAccessible &&
        workspaceSlug &&
        projectId &&
        (await fetchInboxIssues(workspaceSlug.toString(), projectId.toString()));
    },
    { revalidateOnFocus: false, revalidateIfStale: false }
  );

  // loader
  if (loader === "init-loading")
    return (
      <div className="relative flex w-full h-full flex-col">
        <InboxLayoutLoader />
      </div>
    );

  // error
  if (error && error?.status === "init-error")
    return (
      <div className="relative w-full h-full flex flex-col gap-3 justify-center items-center">
        <Inbox size={60} strokeWidth={1.5} />
        <div className="text-custom-text-200">{error?.message}</div>
      </div>
    );

  return (
    <>
      {!inboxIssueId && (
        <div className="flex lg:hidden items-center px-4 w-full h-12 border-b border-custom-border-200">
          <PanelLeft
            onClick={() => setToggleMobileSidebar(!toggleMobileSidebar)}
            className={cn("w-4 h-4 ", toggleMobileSidebar ? "text-custom-primary-100" : " text-custom-text-200")}
          />
        </div>
      )}
      <div className="w-full h-full flex overflow-hidden bg-custom-background-100">
        <div
          className={cn(
            "absolute z-10 top-[50px] lg:!top-0 lg:!relative bg-custom-background-100 flex-shrink-0 w-full lg:w-2/6 bottom-0 transition-all",
            toggleMobileSidebar ? "translate-x-0" : "-translate-x-full lg:!translate-x-0",
          )}
        >
          <InboxSidebar
            setToggleMobileSidebar={setToggleMobileSidebar}
            workspaceSlug={workspaceSlug.toString()}
            projectId={projectId.toString()}
          />
        </div>

        {inboxIssueId ? (
          <InboxContentRoot
            setToggleMobileSidebar={setToggleMobileSidebar}
            toggleMobileSidebar={toggleMobileSidebar}
            workspaceSlug={workspaceSlug.toString()}
            projectId={projectId.toString()}
            inboxIssueId={inboxIssueId.toString()}
          />
        ) : (
          <div className="w-full h-full relative flex justify-center items-center">
            <EmptyState type={EmptyStateType.INBOX_DETAIL_EMPTY_STATE} layout="screen-simple" />
          </div>
        )}
      </div>
    </>
  );
});
