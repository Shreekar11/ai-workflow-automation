export default function WorkflowNode({ node, index, isLast, iconMap }: any) {
  const nodeTypeColors = {
    input:
      "bg-blue-100 border-blue-300 text-blue-700 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-300",
    processor:
      "bg-purple-100 border-purple-300 text-purple-700 dark:bg-purple-900 dark:border-purple-700 dark:text-purple-300",
    ai: "bg-green-100 border-green-300 text-green-700 dark:bg-green-900 dark:border-green-700 dark:text-green-300",
    output:
      "bg-amber-100 border-amber-300 text-amber-700 dark:bg-amber-900 dark:border-amber-700 dark:text-amber-300",
  };

  const IconComponent = iconMap[node.icon];

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center border ${
          (nodeTypeColors as any)[node.type]
        } z-10`}
      >
        {IconComponent && <IconComponent className="h-5 w-5" />}
      </div>
      {!isLast && (
        <div className="text-xs text-muted-foreground mt-1 hidden md:block">
          {index + 1}
        </div>
      )}
    </div>
  );
}
