export const Input = ({
                          type,
                          id,
                          name,
                          className,
                          placeholder,
                          required,
                          style,
                          label,
                      }) => {
    return (
        <div style={{display: "flex", flexDirection: "column", ...style}}>
            {label && <label htmlFor={id}>{label}</label>}
            <input
                type={type}
                id={id}
                name={name}
                className={className}
                placeholder={placeholder}
                required={required}
            />
        </div>
    );
};
