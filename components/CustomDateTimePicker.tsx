"use client";

import { useState, forwardRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { ko } from "date-fns/locale/ko";
import { Calendar as CalendarIcon, Clock } from "lucide-react";

interface CustomDateTimePickerProps {
    label: string;
    selectedDate: Date | null;
    onChange: (date: Date | null) => void;
    placeholder?: string;
    minDate?: Date;
}

const CustomDateTimePicker = ({ label, selectedDate, onChange, placeholder, minDate }: CustomDateTimePickerProps) => {
    const [internalDate, setInternalDate] = useState<Date | null>(selectedDate);
    const [isOpen, setIsOpen] = useState(false);

    // Sync internal state when prop changes (if needed, but usually we control via internal selection first)
    // modifying to just use the prop for initialization if null, but better to keep them separate?
    // Actually, standard behavior: Select -> Update.
    // User wants "Confirm" button. So:
    // 1. Select date/time in picker -> Update `internalDate` (do not start `onChange` yet)
    // 2. Click "Confirm" -> Call `onChange(internalDate)` and `setIsOpen(false)`

    const handleDateChange = (date: Date | null) => {
        setInternalDate(date);
    };

    const handleConfirm = () => {
        onChange(internalDate);
        setIsOpen(false);
    };

    const handleCancel = () => {
        setInternalDate(selectedDate); // Revert
        setIsOpen(false);
    };

    const handleOpen = () => {
        setInternalDate(selectedDate); // Reset to current value on open
        setIsOpen(true);
    };

    // Custom Input Component
    const CustomInput = forwardRef<HTMLButtonElement, any>(({ value, onClick }, ref) => (
        <div className="group w-full">
            <span className="text-xs font-bold text-gray-500 mb-1.5 block ml-1">{label}</span>
            <button
                type="button"
                onClick={(e) => { onClick?.(e); handleOpen(); }}
                ref={ref}
                className="w-full text-sm p-3 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-royal-blue/50 focus:bg-white transition-all text-gray-600 font-medium flex items-center justify-between hover:border-royal-blue/30"
            >
                <span className={value ? "text-gray-800" : "text-gray-400"}>
                    {value || placeholder || "날짜와 시간을 선택하세요"}
                </span>
                <CalendarIcon className="w-5 h-5 text-gray-400 group-hover:text-royal-blue transition-colors" />
            </button>
        </div>
    ));
    CustomInput.displayName = "CustomInput";

    return (
        <div className="relative w-full">
            <DatePicker
                selected={internalDate}
                onChange={handleDateChange}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="yyyy. MM. dd. a h:mm"
                minDate={minDate}
                locale={ko}
                customInput={<CustomInput />}
                open={isOpen}
                onClickOutside={handleCancel} // Close without saving if clicked outside? Or maybe save? "Confirm" usually implies explicit save. Let's start with revert on outside click.
                shouldCloseOnSelect={false} // Keep open for "Confirm"
                popperClassName="!z-50"
                popperPlacement="bottom-start"
                renderCustomHeader={({
                    date,
                    decreaseMonth,
                    increaseMonth,
                    prevMonthButtonDisabled,
                    nextMonthButtonDisabled,
                }) => (
                    <div className="flex items-center justify-between px-3 py-2 bg-royal-blue/5 border-b border-royal-blue/10 rounded-t-lg">
                        <button
                            onClick={decreaseMonth}
                            disabled={prevMonthButtonDisabled}
                            className="text-gray-500 hover:text-royal-blue disabled:opacity-30 p-1"
                        >
                            &lt;
                        </button>
                        <span className="text-lg font-black text-gray-700">
                            {date.getFullYear()}년 {date.getMonth() + 1}월
                        </span>
                        <button
                            onClick={increaseMonth}
                            disabled={nextMonthButtonDisabled}
                            className="text-gray-500 hover:text-royal-blue disabled:opacity-30 p-1"
                        >
                            &gt;
                        </button>
                    </div>
                )}
            >
                {/* Custom Footer with Confirm Button */}
                <div className="flex items-center justify-end gap-2 p-3 border-t border-gray-100 bg-white rounded-b-lg">
                    <button
                        onClick={handleCancel}
                        className="px-4 py-2 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        취소
                    </button>
                    <button
                        onClick={handleConfirm}
                        className="px-4 py-2 text-xs font-bold text-white bg-royal-blue hover:bg-blue-600 rounded-lg shadow-md transition-colors flex items-center gap-1"
                    >
                        확인
                    </button>
                </div>
            </DatePicker>

            {/* Global Style Override for Premium Look (Scoped to this usage if possible, but global is easier for react-datepicker) */}
            <style jsx global>{`
        .react-datepicker {
          font-family: inherit;
          border: none;
          box-shadow: 0 10px 40px -10px rgba(0,0,0,0.1);
          border-radius: 1rem;
          overflow: hidden;
        }
        .react-datepicker__header {
          background-color: white;
          border-bottom: 1px solid #f3f4f6;
          padding-top: 0;
        }
        .react-datepicker__triangle {
          display: none;
        }
        .react-datepicker__day--selected, 
        .react-datepicker__day--keyboard-selected, 
        .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item--selected {
          background-color: #7CB9E8 !important;
          color: white !important;
          border-radius: 0.5rem;
          font-weight: bold;
        }
        .react-datepicker__day:hover,
        .react-datepicker__time-container .react-datepicker__time .react-datepicker__time-box ul.react-datepicker__time-list li.react-datepicker__time-list-item:hover {
          background-color: #f0f9ff !important;
          color: #7CB9E8 !important;
          border-radius: 0.5rem;
        }
        .react-datepicker__time-container {
          border-left: 1px solid #f3f4f6;
        }
        .react-datepicker__day-name {
          color: #9ca3af;
          font-weight: bold;
          margin: 0.5rem;
        }
        .react-datepicker__day {
          margin: 0.5rem;
        }
      `}</style>
        </div>
    );
};

export default CustomDateTimePicker;
