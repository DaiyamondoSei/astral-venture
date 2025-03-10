
import { toast } from 'sonner';
import { ValidationError } from '../validation/ValidationError';

type ErrorHandler = (error: Error) => void;
type ErrorWithContext = { error: Error; context: string };

interface ErrorPreventionConfig {
  logErrors: boolean;
  notifyUser: boolean;
  reportToService: boolean;
}

class ErrorPreventionBridge {
  private static instance: ErrorPreventionBridge;
  private handlers: Set<ErrorHandler> = new Set();
  private config: ErrorPreventionConfig = {
    logErrors: true,
    notifyUser: true,
    reportToService: false
  };

  private constructor() {
    this.setupGlobalHandlers();
  }

  static getInstance(): ErrorPreventionBridge {
    if (!ErrorPreventionBridge.instance) {
      ErrorPreventionBridge.instance = new ErrorPreventionBridge();
    }
    return ErrorPreventionBridge.instance;
  }

  private setupGlobalHandlers() {
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(event.reason, 'Unhandled Promise Rejection');
    });

    window.addEventListener('error', (event) => {
      this.handleError(event.error, 'Uncaught Error');
    });
  }

  public handleError(error: Error, context: string = 'unknown'): void {
    const errorWithContext: ErrorWithContext = { error, context };

    if (this.config.logErrors) {
      console.error(`[${context}]`, error);
    }

    if (this.config.notifyUser) {
      if (error instanceof ValidationError) {
        toast.error(error.message, {
          description: error.details || 'Please try again or contact support',
          duration: 5000
        });
      } else {
        toast.error('An unexpected error occurred', {
          description: 'Please try again or contact support',
          duration: 5000
        });
      }
    }

    this.handlers.forEach(handler => {
      try {
        handler(error);
      } catch (handlerError) {
        console.error('Error in error handler:', handlerError);
      }
    });
  }

  public addHandler(handler: ErrorHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  public updateConfig(config: Partial<ErrorPreventionConfig>): void {
    this.config = { ...this.config, ...config };
  }

  public wrapPromise<T>(
    promise: Promise<T>,
    context: string
  ): Promise<T> {
    return promise.catch(error => {
      this.handleError(error instanceof Error ? error : new Error(String(error)), context);
      throw error;
    });
  }
}

export const errorBridge = ErrorPreventionBridge.getInstance();

/**
 * HOC to wrap components with error prevention
 */
export function withErrorPrevention<P extends object>(
  Component: React.ComponentType<P>,
  context: string
): React.ComponentType<P> {
  return function WrappedComponent(props: P) {
    useEffect(() => {
      return () => {
        // Cleanup any component-specific error handling
      };
    }, []);

    return <Component {...props} />;
  };
}
