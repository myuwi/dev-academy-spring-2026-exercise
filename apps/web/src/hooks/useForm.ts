import { useState, useEffect } from "react";

interface UseFormProps<T> {
  defaultValues: Partial<T>;
}

export const useForm = <K extends string>({
  defaultValues = {},
}: UseFormProps<Record<K, string>>) => {
  type T = Record<K, string>;

  const [values, setValues] = useState<Partial<T>>({});
  useEffect(() => {
    setValues(defaultValues);
  }, [defaultValues]);

  const register = (fieldName: K) => {
    return {
      value: values[fieldName] ?? "",
      onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
        setValues((prev) => {
          const next = { ...prev };

          if (e.target.value) {
            next[fieldName] = e.target.value;
          } else {
            delete next[fieldName];
          }

          return next;
        });
      },
    };
  };

  const handleSubmit = (cb: (values: Partial<T>) => void) => {
    return (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      cb(values);
    };
  };

  return { values, setValues, register, handleSubmit };
};
