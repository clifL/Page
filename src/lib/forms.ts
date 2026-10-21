import { startTransition, type FormEvent } from 'react';

/**
 * onSubmit handler that runs a `useActionState` action without React's automatic
 * form reset, so fields keep what the user typed if the action fails.
 */
export function submitKeepingValues(action: (form: FormData) => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(() => action(form));
  };
}
