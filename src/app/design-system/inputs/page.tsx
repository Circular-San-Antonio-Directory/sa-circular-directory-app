import { Metadata } from 'next';
import { InputsDemo } from './InputsDemo';

export const metadata: Metadata = {
  title: 'Inputs — Design System',
};

export default function InputsPage() {
  return <InputsDemo />;
}
