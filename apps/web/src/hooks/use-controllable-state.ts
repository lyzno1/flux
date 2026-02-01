import { useCallback, useState } from "react";

export function useControllableState<T>({
	prop,
	defaultProp,
	onChange,
}: {
	prop?: T;
	defaultProp?: T;
	onChange?: (value: T) => void;
}): [T, (value: T) => void] {
	const [uncontrolledState, setUncontrolledState] = useState(defaultProp as T);
	const isControlled = prop !== undefined;
	const value = isControlled ? prop : uncontrolledState;
	const setValue = useCallback(
		(nextValue: T) => {
			if (!isControlled) {
				setUncontrolledState(nextValue);
			}
			onChange?.(nextValue);
		},
		[isControlled, onChange],
	);
	return [value, setValue] as [T, (value: T) => void];
}
