import React, { useState, ChangeEvent, useRef, useEffect } from "react";

type DropdownProps = {
  options: string[];
  placeholder: string;
  selectedText: string;
  setSelectedText: (text: string) => void;
};

const DropDownInput: React.FC<DropdownProps> = ({
  options,
  selectedText,
  setSelectedText,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  /**
   * Handle click on one of the dropdown options
   */
  const handleOptionClick = (option: string) => {
    setSelectedText(option);
    setIsDropdownOpen(false);
  };

  /**
   * Handle click outside of the dropdown by closing it
   */
  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={dropdownRef} className="min-w-32 text-center">
      <p className="text-sm border-2 border-gray-200 p-2 rounded-lg bg-white">{selectedText || "Select a value"}</p>

      <div className="w-full border-2 border-gray-200 rounded-lg shadow-lg z-10">
        <ul className="flex flex-col bg-base-100 max-h-60 overflow-y-auto rounded-lg">
          {options.length > 0 ? (
            options.map((option) => (
              <li
                key={option}
                onClick={() => handleOptionClick(option)}
                className="cursor-pointer hover:bg-gray-300 p-2 rounded-lg text-sm"
              >
                {option}
              </li>
            ))
          ) : (
            <li className="p-2 text-gray-500">No matches</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default DropDownInput;
