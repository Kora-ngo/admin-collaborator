// components/ui/Accordion.tsx
import { useState } from "react";

interface SubTile {
  title: string;
  subtitle?: string;
  iconLeading?: React.ReactNode;
  by?: string;
  content?: React.ReactNode;
}

interface AccordionItem {
  title: string;
  subtitle?: string;
  count?: number;           // optional badge
  subTiles: SubTile[];      // array of sub-tiles to show when expanded
}

interface AccordionProps {
  items: AccordionItem[];
  allowMultiple?: boolean;  // default true = multiple can be open
  className?: string;
}

const Accordion = ({
  items,
  allowMultiple = true,
  className = "",
}: AccordionProps) => {
  const [openIds, setOpenIds] = useState<string[]>([]);

  const toggle = (id: string) => {
    if (allowMultiple) {
      setOpenIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    } else {
      setOpenIds((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {items.map((item, index) => {
        const itemId = `accordion-${index}`;
        const isOpen = openIds.includes(itemId);

        return (
          <div
            key={itemId}
            className="border border-gray-200 rounded-lg overflow-hidden bg-white"
          >
            {/* Big Tile Header (clickable) */}
            <button
              onClick={() => toggle(itemId)}
              className="w-full px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors text-left group"
            >
              <div className=" items-center gap-4">
                <span className="font-bold text-md text-gray-900">
                  {item.title}
                </span>

                {item.subtitle && (
                  <p className="text-sm text-gray-400 font-medium">
                    {item.subtitle}
                  </p>
                )}

                {/* {item.count !== undefined && (
                  <span className="bg-primary text-white text-sm font-medium px-3 py-1 rounded-full">
                    {item.count}
                  </span>
                )} */}
              </div>

              {/* Pure Tailwind chevron (no icon library) */}
              <span
                className={`inline-block w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-gray-500 transition-transform duration-300 group-hover:border-t-gray-700 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown Content */}
            {isOpen && (
              <div className="pb-6 border-t border-gray-100">


                {/* Sub-tiles */}
                <div className="">
                  {item.subTiles.map((sub, subIndex) => (
                    <div
                      key={subIndex}
                      className=" border-b border-gray-200 p-5"
                    >
                      <div className="flex w-full justify-between">
                        <div className="flex items-center space-x-3">
                            {
                              sub.iconLeading &&
                              (
                              <div className="bg-primary/10 p-2 rounded-md">
                                {sub.iconLeading}
                              </div>
                              )
                            }
                          <div className="">
                            <h4 className="text-md font-semibold text-gray-900">
                              {sub.title}
                            </h4>
                            {sub.content && (
                              <div className="text-sm text-gray-700">
                                {sub.content}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="mt-5">
                          <span className="text-sm text-gray-400">{sub.by}</span>
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default Accordion;