import React, { forwardRef } from 'react'

type Props = {
    id? : string,
    name? : string,
    type : string,
    placeholder? : string,
    className? : string,
    value? : string,
    pattern? : string,
    maxLength? : number,
    inputMode? : "search" | "email" | "tel" | "text" | "url" | "none" | "numeric" | "decimal" | undefined,
    onChange? : (e : React.ChangeEvent<HTMLInputElement>)=> void;
    onKeyDown? : (e: React.KeyboardEvent<HTMLInputElement>)=> void;
    onPaste? : (e: React.ClipboardEvent<HTMLInputElement>)=> void;
}

const Input = forwardRef<HTMLInputElement, Props>(
  (
    {
      id,
      name,
      type,
      className,
      value,
      placeholder,
      inputMode,
      pattern,
      maxLength,
      onChange,
      onKeyDown,
      onPaste,
      ...rest
    },
    ref
  ) => {
  return (
    <input ref={ref} {...rest} id={id}
    name={name}
    type={type}
    value={value}
    placeholder={placeholder}
    inputMode={inputMode}
    pattern={pattern}
    maxLength={maxLength}
    className={`${className} w-full border border-[#D9D9D9] rounded-md fontOutfit focus:border focus:border-[#28574E]  px-3 py-2`}
    onChange={onChange}
    onKeyDown={onKeyDown}
    onPaste={onPaste} />
  )
}
);
Input.displayName= "Input";

export default Input;