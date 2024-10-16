import React, { useState, useRef, useEffect } from "react";
import { IoIosArrowDown, IoIosArrowUp } from "react-icons/io";
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
    <div ref={dropdownRef} className="relative min-w-36  text-center">
      {/* Toggle dropdown on click */}
      <p
        className="text-sm flex justify-center items-center border-2 border-gray-200 py-2 rounded-lg bg-white cursor-pointer"
        onClick={() => setIsDropdownOpen((prev) => !prev)}
      >

        <span>{selectedText || "Select a value"}</span>
        {isDropdownOpen ? (
          <IoIosArrowUp className="w-4 h-4 ml-1 text-gray-500" />
        ) : (
          <IoIosArrowDown className="w-4 h-4 ml-1 text-gray-500" />
        )}
      </p>

      {/* Dropdown options, visible only when isDropdownOpen is true */}
      {isDropdownOpen && (
        <div className="absolute w-full border-2 border-gray-200 rounded-lg shadow-lg z-10 bg-base-100 mt-1">
          <ul className="flex flex-col max-h-60 overflow-y-auto rounded-lg">
            {options.length > 0 ? (
              options.map((option) => (
                <li
                  key={option}
                  onClick={() => handleOptionClick(option)}
                  className="cursor-pointer hover:bg-gray-300 p-2 rounded-sm text-sm"
                >
                  {option}
                </li>
              ))
            ) : (
              <li className="p-2 text-gray-500">No matches</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default DropDownInput;
