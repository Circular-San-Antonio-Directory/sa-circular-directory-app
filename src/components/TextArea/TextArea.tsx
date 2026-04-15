import styles from './TextArea.module.scss';

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function TextArea({ className, ...rest }: TextAreaProps) {
  const rootClass = [styles.root, className ?? ''].filter(Boolean).join(' ');

  return <textarea className={rootClass} {...rest} />;
}
