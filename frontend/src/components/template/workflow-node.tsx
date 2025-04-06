export default function WorkflowNode({ node, index }: any) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-10 h-10 rounded-full flex items-center justify-center border bg-gray-100 
          border-gray-300 text-gray-700 dark:bg-gray-900 dark:border-gray-700 dark:text-gray-300 z-10`}
      >
        <img src={node.image} alt="node-logo" className="rounded-full" />
      </div>
      <div className="text-xs text-black mt-1 hidden md:block">{index + 1}</div>
    </div>
  );
}
