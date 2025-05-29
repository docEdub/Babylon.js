import { Input as FluentInput, InputProps, makeStyles } from "@fluentui/react-components";

const useInputStyles = makeStyles({
    text: {
        height: "auto",
        marginRight: "5px",
    },
    float: {
        height: "auto",
        marginRight: "5px",
        width: "30px",
    },
});
export const Input: React.FC<InputProps> = (props: InputProps) => {
    const styles = useInputStyles();
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>, data: any) => {
        event.stopPropagation(); // Prevent event propagation
        if (props.onChange) {
            props.onChange(event, data); // Call the original onChange handler passed as prop
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        event.stopPropagation(); // Prevent event propagation
        if (props.onKeyDown) {
            props.onKeyDown(event); // Call the original onKeyDown handler passed as prop
        }
    };

    return <FluentInput {...props} className={props.type === "number" ? styles.float : styles.text} onChange={handleChange} onKeyDown={handleKeyDown} />;
};
