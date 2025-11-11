export function InnerShadow({
  position = "both",
  height = "2rem",
}: {
  position?: "top" | "bottom" | "both";
  height?: React.CSSProperties["height"];
}) {
  return (
    <>
      {(position === "top" || position === "both") && (
        <div
          className="from-background pointer-events-none absolute top-0 right-0 left-0 z-0 bg-linear-to-b to-transparent"
          style={{ height }}
        ></div>
      )}
      {(position === "bottom" || position === "both") && (
        <div
          className="from-background pointer-events-none absolute right-0 bottom-0 left-0 z-0 bg-linear-to-t to-transparent"
          style={{ height }}
        ></div>
      )}
    </>
  );
}
