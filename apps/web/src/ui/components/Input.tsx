import { InputHTMLAttributes, forwardRef } from 'react';
import '../../styles/design-tokens.css';
import './ui.css';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  return <input ref={ref} className="input" {...props} />;
});

export default Input;
