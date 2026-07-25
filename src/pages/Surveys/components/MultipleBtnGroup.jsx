import SelectionCheckIcon from "../../../components/SelectionCheckIcon.jsx";

function MultipleBtnGroup({
    items = [],
    label,
    value = [],
    onChange,
    className = "",
    layout = "",
    labelStyle = "",
    maxSelections = 3,
    required = false,
}) {
    const selectedValues = Array.isArray(value) ? value : [];

    const handleClick = (itemValue) => {
        const isSelected = selectedValues.includes(itemValue);

        if (!isSelected && selectedValues.length >= maxSelections) {
            return;
        }

        const nextValue = isSelected
            ? selectedValues.filter((selectedValue) => selectedValue !== itemValue)
            : [...selectedValues, itemValue];

        onChange?.(nextValue);
    };

    return(
        <div className={`flex min-w-0 flex-col ${className}`}>
            <label className={labelStyle || "block text-sm font-sans font-bold text-fg-basic"}>
                {label}
                <span className="ml-2 text-xs font-normal text-fg-secondary">
                    최대 {maxSelections}개
                </span>
            </label>
            <div className={`mt-2 w-full gap-2 ${layout || "flex flex-wrap"}`}>
                {items.map(({item, value: itemValue}) => {
                    const isSelected = selectedValues.includes(itemValue);

                    return(
                        <button
                            key={itemValue}
                            type="button"
                            aria-pressed={isSelected}
                            onClick={() => handleClick(itemValue)}
                            className={[
                                "inline-flex w-fit shrink-0 items-center justify-center gap-1 rounded-select border-2 px-4 py-2 font-sans text-xs font-bold transition-transform active:scale-95",
                                isSelected
                                ? "border-brand-primary bg-white text-brand-primary"
                                : "border-transparent bg-white text-fg-basic"
                            ].join(" ")}
                        >
                            {isSelected && <SelectionCheckIcon />}
                            {item}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

export default MultipleBtnGroup;
