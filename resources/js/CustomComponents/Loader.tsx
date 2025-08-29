// components/LoadingText.tsx
import { Loader2Icon } from 'lucide-react';

type LoadingTextProps = {
  loading: boolean;
  text: string;
  normal_text:string
};

export default function LoadingText({ loading, text,normal_text }: LoadingTextProps) {
  return loading ? (
    <div className="flex items-center justify-center gap-x-3">
      <Loader2Icon className="animate-spin w-4 h-4" />
      <p>{text}</p>
    </div>
  ) : (
    <>{normal_text}</>
  );
}
