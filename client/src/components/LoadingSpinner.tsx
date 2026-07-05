interface LoadingSpinnerProps {
  /** Text message to display under the spinner. Defaults to "Loading...". */
  message?: string;
  /** Whether the spinner should center itself and fill the page height. Defaults to true. */
  fullPage?: boolean;
  /** Optional additional CSS classes for styling. */
  className?: string;
  /** Spinner color theme. 'primary' matches the app theme, 'blue' matches the form theme. */
  variant?: 'blue' | 'primary';
}

export const LoadingSpinner = ({
  message = 'Loading...',
  fullPage = true,
  className = '',
  variant = 'primary',
}: LoadingSpinnerProps) => {
  const containerClasses = fullPage
    ? 'flex min-h-screen items-center justify-center bg-background px-4'
    : 'flex min-h-[400px] items-center justify-center px-4';

  const spinnerBorderClass =
    variant === 'blue'
      ? 'border-blue-600'
      : 'border-primary-container';

  const textClass =
    variant === 'blue'
      ? 'text-gray-500'
      : 'text-on-surface-variant';

  return (
    <div className={`${containerClasses} ${className}`}>
      <div className='flex flex-col items-center gap-3'>
        <div
          className={`h-8 w-8 animate-spin rounded-full border-[3px] ${spinnerBorderClass} border-t-transparent`}
        />
        {message && (
          <p className={`text-sm font-medium tracking-wide ${textClass}`}>
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
