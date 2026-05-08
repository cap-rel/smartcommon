import { Fragment } from "react";
import { FaChevronRight } from "react-icons/fa6";
import { twMerge } from "lib/utils";

export const Breadcrumb = ({ path = [], rootLabel, onNavigateRoot, onNavigateTo, ...rest }) => {
    const isAtRoot = path.length === 0;
    return (
        <div
            {...rest}
            className={twMerge(
                "flex-shrink-0 h-10 flex items-center px-4 gap-1 border-b border-gray-100 dark:border-gray-700 overflow-x-auto",
                rest.className
            )}
        >
            <button
                type="button"
                onClick={onNavigateRoot}
                className={`text-sm whitespace-nowrap ${
                    isAtRoot
                        ? "font-semibold text-gray-900 dark:text-white cursor-default"
                        : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                }`}
            >
                {rootLabel}
            </button>
            {path.map((item, index) => {
                const isLast = index === path.length - 1;
                return (
                    <Fragment key={item.id}>
                        <FaChevronRight className="mx-1 text-gray-400 text-xs flex-shrink-0" />
                        <button
                            type="button"
                            onClick={() => { if (!isLast) onNavigateTo?.(item, index); }}
                            className={`text-sm whitespace-nowrap ${
                                isLast
                                    ? "font-semibold text-gray-900 dark:text-white cursor-default"
                                    : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                            }`}
                        >
                            {item.label}
                        </button>
                    </Fragment>
                );
            })}
        </div>
    );
};
