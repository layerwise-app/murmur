import { useEffect, useId, useRef, useState } from 'react';
import type * as React from 'react';
import { SmartLink } from '~/components/site/SmartLink';
import { home } from '~/content/home';
import {
  HONEYPOT_FIELD,
  validateSubmission,
  type FieldErrors,
  type SubmitResult
} from '~/lib/waitlist/rules';
import { joinWaitlist } from '~/lib/waitlist/server';
import { siteConfig } from '~/site.config';

type Values = { email: string; platform: string; listensTo: string; website: string };
type Outcome =
  | { kind: 'form' }
  | { kind: 'joined' | 'duplicate'; email: string };

export function Waitlist() {
  const copy = home.waitlist;
  const [values, setValues] = useState<Values>({
    email: '',
    platform: '',
    listensTo: '',
    website: ''
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [banner, setBanner] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [outcome, setOutcome] = useState<Outcome>({ kind: 'form' });
  const doneRef = useRef<HTMLHeadingElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (outcome.kind !== 'form') doneRef.current?.focus();
  }, [outcome.kind]);

  const update = (field: keyof Values) => (value: string) => {
    setValues((current) => ({ ...current, [field]: value }));
    if (field in errors) setErrors((current) => ({ ...current, [field]: undefined }));
  };

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setBanner('');
    const check = validateSubmission(values);
    if (!check.ok && !values.website) {
      setErrors(check.errors);
      focusFirstError(formRef.current, check.errors);
      return;
    }
    setSubmitting(true);
    let result: SubmitResult;
    try {
      result = await joinWaitlist({
        data: {
          email: values.email,
          platform: values.platform,
          listensTo: values.listensTo,
          [HONEYPOT_FIELD]: values.website
        }
      });
    } catch {
      setSubmitting(false);
      setBanner(copy.failed);
      return;
    }
    setSubmitting(false);
    if (result.status === 'joined' || result.status === 'duplicate') {
      setOutcome({ kind: result.status, email: result.email });
    } else if (result.status === 'invalid') {
      setErrors(result.errors);
      focusFirstError(formRef.current, result.errors);
    } else {
      setBanner(copy.rateLimited);
    }
  }

  return (
    <section id='waitlist' aria-labelledby='waitlist-heading' className='px-3 pb-3 sm:px-4 sm:pb-4'>
      <div className='panel relative mx-auto grid max-w-[86rem] gap-10 overflow-hidden px-5 py-16 sm:px-10 md:py-24 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:grid-rows-[auto_1fr] lg:gap-x-16 lg:gap-y-10 lg:px-16'>
        <div className='relative lg:col-start-1 lg:row-start-1'>
          <p className='eyebrow'>{copy.eyebrow}</p>
          <h2 id='waitlist-heading' className='display-lg mt-5 max-w-[13ch]'>
            {copy.heading}
          </h2>
          <p className='lede mt-6 max-w-[30rem]'>{copy.body}</p>
        </div>

        <div className='relative self-start rounded-[2rem] bg-cream p-6 hairline sm:p-9 lg:col-start-2 lg:row-span-2 lg:row-start-1'>
          {outcome.kind === 'form' ? (
            <form ref={formRef} noValidate onSubmit={onSubmit} aria-describedby='waitlist-fine'>
              <div
                aria-hidden='true'
                className='pointer-events-none absolute -left-[9999px] top-0 h-px w-px overflow-hidden'
              >
                <label>
                  Website
                  <input
                    type='text'
                    name={HONEYPOT_FIELD}
                    tabIndex={-1}
                    autoComplete='off'
                    value={values.website}
                    onChange={(event) => update('website')(event.target.value)}
                  />
                </label>
              </div>

              <EmailField
                label={copy.fields.email}
                placeholder={copy.fields.emailPlaceholder}
                value={values.email}
                error={errors.email}
                onChange={update('email')}
              />
              <Choice
                name='platform'
                legend={copy.fields.platform}
                options={copy.platforms}
                value={values.platform}
                error={errors.platform}
                onChange={update('platform')}
              />
              <Choice
                name='listensTo'
                legend={copy.fields.listensTo}
                options={copy.listensTo}
                value={values.listensTo}
                error={errors.listensTo}
                onChange={update('listensTo')}
              />

              {banner ? (
                <p role='alert' className='mt-7 rounded-2xl bg-[color-mix(in_srgb,var(--error)_9%,transparent)] px-4 py-3 text-[0.95rem] font-medium text-error'>
                  {banner}
                </p>
              ) : null}

              <button
                type='submit'
                disabled={submitting}
                aria-disabled={submitting}
                className='btn btn-primary mt-8 h-14 w-full text-[1.0625rem] disabled:cursor-wait disabled:opacity-80'
              >
                {submitting ? copy.submitting : siteConfig.cta.label}
              </button>
              <p id='waitlist-fine' className='mt-4 text-center text-sm text-ink-soft'>
                {copy.fine}{' '}
                <SmartLink href='/privacy' className='link'>
                  Privacy
                </SmartLink>
              </p>
            </form>
          ) : (
            <div aria-live='polite' className='flex min-h-[22rem] flex-col items-start justify-center'>
              <span
                aria-hidden='true'
                className='flex size-12 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--sage)_35%,transparent)]'
              >
                <svg viewBox='0 0 24 24' className='size-5'>
                  <path d='M5 12.5l4.2 4L19 7' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round' />
                </svg>
              </span>
              <h3 ref={doneRef} tabIndex={-1} className='display-md mt-6 outline-none'>
                {outcome.kind === 'joined' ? copy.success.heading : copy.duplicate.heading}
              </h3>
              <p className='mt-3 max-w-[28rem] text-ink-soft'>
                {(outcome.kind === 'joined' ? copy.success.body : copy.duplicate.body)
                  .split('{email}')
                  .flatMap((part, index) =>
                    index === 0
                      ? [part]
                      : [
                          <strong key={index} className='font-semibold text-ink'>
                            {outcome.email}
                          </strong>,
                          part
                        ]
                  )}
              </p>
            </div>
          )}
        </div>
        <ol className='max-w-[30rem] border-t border-line lg:col-start-1 lg:row-start-2 lg:self-start'>
            {copy.next.map((step, index) => (
              <li key={step} className='flex gap-4 border-b border-line py-4 text-ink-soft'>
                <span className='font-display w-6 shrink-0 text-xl font-[380] text-ink'>{index + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
      </div>
    </section>
  );
}

function focusFirstError(form: HTMLFormElement | null, errors: FieldErrors) {
  const first = (['email', 'platform', 'listensTo'] as const).find((field) => errors[field]);
  if (!first || !form) return;
  form.querySelector<HTMLInputElement>(`[name="${first}"]`)?.focus();
}

function EmailField({
  label,
  placeholder,
  value,
  error,
  onChange
}: {
  label: string;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className='block text-[0.95rem] font-semibold'>
        {label}
      </label>
      <input
        id={id}
        name='email'
        type='email'
        inputMode='email'
        autoComplete='email'
        autoCapitalize='off'
        spellCheck={false}
        required
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`mt-2.5 h-14 w-full rounded-full bg-[#fffdf9] px-5 text-[1.0625rem] text-ink outline-none transition-shadow placeholder:text-ink-soft/80 focus-visible:shadow-[0_0_0_2px_var(--ink)] ${
          error ? 'shadow-[inset_0_0_0_1.5px_var(--error)]' : 'shadow-[inset_0_0_0_1px_var(--line)]'
        }`}
      />
      {error ? (
        <p id={`${id}-error`} className='mt-2 pl-5 text-sm font-medium text-error'>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Choice({
  name,
  legend,
  options,
  value,
  error,
  onChange
}: {
  name: string;
  legend: string;
  options: { value: string; label: string }[];
  value: string;
  error?: string;
  onChange: (value: string) => void;
}) {
  const id = useId();
  return (
    <fieldset
      className='mt-7'
      aria-invalid={error ? true : undefined}
      aria-describedby={error ? `${id}-error` : undefined}
    >
      <legend className='text-[0.95rem] font-semibold'>{legend}</legend>
      <div className={`mt-2.5 grid gap-2 ${options.length === 4 ? 'grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4' : 'grid-cols-3'}`}>
        {options.map((option) => (
          <label
            key={option.value}
            className={`relative flex h-12 cursor-pointer items-center justify-center rounded-full px-3 text-[0.98rem] font-medium transition-colors has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink ${
              value === option.value
                ? 'bg-ink text-cream'
                : `bg-[#fffdf9] text-ink hover:bg-sand ${error ? 'shadow-[inset_0_0_0_1.5px_var(--error)]' : 'shadow-[inset_0_0_0_1px_var(--line)]'}`
            }`}
          >
            <input
              type='radio'
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              required
              className='absolute inset-0 cursor-pointer opacity-0'
            />
            {option.label}
          </label>
        ))}
      </div>
      {error ? (
        <p id={`${id}-error`} className='mt-2 pl-5 text-sm font-medium text-error'>
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
