import { cn } from "@/lib/utils";
import { FC, ReactNode } from "react";
interface AnimatedGradientTextProps {
  children: ReactNode;
  className?: string;
}
const AnimatedGradientText: FC<AnimatedGradientTextProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        "group relative mx-auto flex max-w-fit flex-row items-center justify-center rounded-2xl bg-white/40 px-4 py-1.5 text-sm font-medium text-gray-500 shadow-lg shadow-zinc-800/5 backdrop-blur-sm dark:bg-black/40 dark:text-gray-400",
        className,
      )}
    >
      <div
        className={cn(
          "absolute inset-0 -z-10 rounded-xl bg-gradient-to-b from-blue-500/80 to-blue-700/80 opacity-0 blur-lg transition-all duration-500 group-hover:opacity-100 group-hover:blur-xl"
        )}
      />
      <div className="animate-gradient bg-gradient-to-r from-blue-500 via-blue-400 to-blue-500 bg-[length:200%_100%] bg-clip-text text-transparent">
        {children}
      </div>
    </div>
  );
};
export default AnimatedGradientText;