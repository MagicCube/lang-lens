"use client";

import { Github } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useMemo } from "react";

import { cn } from "@/lib/utils";

import { GithubIcon } from "./github-icon";
import { Tooltip } from "./tooltip";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";

export function WorkspaceContainer({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div className={cn("flex h-screen w-full flex-col", className)} {...props}>
      {children}
    </div>
  );
}

export function WorkspaceHeader({
  className,
  children,
  ...props
}: React.ComponentProps<"header">) {
  const pathname = usePathname();
  const segments = useMemo(() => {
    const parts = pathname?.split("/") || [];
    if (parts.length > 0) {
      return parts.slice(1, 3);
    }
  }, [pathname]);
  return (
    <header
      className={cn(
        "top-0 right-0 left-0 z-20 flex h-16 shrink-0 items-center justify-between gap-2 border-b backdrop-blur-sm transition-[width,height] ease-out group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
        className,
      )}
      {...props}
    >
      <div className="flex items-center gap-2 px-4">
        <Breadcrumb>
          <BreadcrumbList>
            {segments?.[0] && (
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink asChild>
                  <Link href={`/${segments[0]}`}>
                    {nameOfSegment(segments[0])}
                  </Link>
                </BreadcrumbLink>
              </BreadcrumbItem>
            )}
            {segments?.[1] && (
              <>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  {segments.length >= 2 ? (
                    <BreadcrumbLink asChild>
                      <Link href={`/${segments[0]}/${segments[1]}`}>
                        {nameOfSegment(segments[1])}
                      </Link>
                    </BreadcrumbLink>
                  ) : (
                    <BreadcrumbPage>
                      {nameOfSegment(segments[1])}
                    </BreadcrumbPage>
                  )}
                </BreadcrumbItem>
              </>
            )}
            {children && (
              <>
                <BreadcrumbSeparator />
                {children}
              </>
            )}
          </BreadcrumbList>
        </Breadcrumb>
      </div>
      <div className="pr-4">
        <Tooltip content="LangLens on Github">
          <a
            href="https://github.com/magiccube/lang-lens"
            target="_blank"
            rel="noopener noreferrer"
            className="opacity-75 transition hover:opacity-100"
          >
            <GithubIcon className="size-6" />
          </a>
        </Tooltip>
      </div>
    </header>
  );
}

export function WorkspaceContent({
  className,
  children,
  ...props
}: React.ComponentProps<"main">) {
  return (
    <main
      className={cn(
        "relative flex min-h-0 w-full flex-1 flex-col items-center",
        className,
      )}
      {...props}
    >
      <div className="flex h-full w-full flex-col items-center">
        {children}
        <div className="flex h-12 shrink-0">&nbsp;</div>
      </div>
    </main>
  );
}

export function WorkspaceFooter({
  className,
  children,
  ...props
}: React.ComponentProps<"footer">) {
  return (
    <footer
      className={cn(
        "absolute right-0 bottom-8 left-0 z-30 flex justify-center",
        className,
      )}
      {...props}
    >
      {children}
    </footer>
  );
}

function nameOfSegment(segment: string | undefined) {
  if (!segment) return "home";
  return segment[0]?.toUpperCase() + segment.slice(1);
}
