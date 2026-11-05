import { Link, useRouter } from '@tanstack/react-router';
import type { ErrorComponentProps } from '@tanstack/react-router';

export function DefaultCatchBoundary({ error }: ErrorComponentProps) {
  const router = useRouter();
  console.error(error);

  return (
    <section className='mx-auto flex max-w-2xl flex-col items-center px-5 py-28 text-center'>
      <p className='eyebrow'>Something went wrong</p>
      <h1 className='display-lg mt-5'>This page didn’t load.</h1>
      <p className='lede mt-5'>Try again in a moment. If it keeps happening, go back to the home page.</p>
      <div className='mt-8 flex flex-wrap justify-center gap-3'>
        <button type='button' onClick={() => router.invalidate()} className='btn btn-primary'>
          Try again
        </button>
        <Link to='/' className='btn btn-quiet'>
          Home
        </Link>
      </div>
    </section>
  );
}
