
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { AIAnalysisProvider } from '@/contexts/AIAnalysisContext';
import '@/styles/globals.css';
import type { AppProps } from 'next/app';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AIAnalysisProvider showToasts={true}>
        <Component {...pageProps} />
        <Toaster />
      </AIAnalysisProvider>
    </ThemeProvider>
  );
}
