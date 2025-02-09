export default function Input({ handleChange, name, value, heading, className, selectedOption, filterType }) {

    return (
        <>
            <label className={`sidebar-label ${selectedOption.value === value ? 'active-label' : ''}`}>
                <input
                    className={className}
                    onChange={() => handleChange(filterType, value)}
                    type="radio"
                    value={value}
                    name={name}
                    checked={selectedOption.value === value}
                />
                {heading}
            </label>
        </>
    );
}
