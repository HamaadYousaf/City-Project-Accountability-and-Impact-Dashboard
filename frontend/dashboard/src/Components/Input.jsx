

export default function Input({ handleChange, name, value, heading, className, selectedOption }) {

    return (
        <>
            <label className={`sidebar-label ${selectedOption === value ? 'active-label' : ''}`}>
                <input
                    className={className}
                    onChange={handleChange}
                    type="radio"
                    value={value}
                    name={name}
                />
                {heading}
            </label>
        </>
    )
}

