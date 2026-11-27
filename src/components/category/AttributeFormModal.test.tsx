import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useForm } from 'react-hook-form';

import AttributeFormModal from './AttributeFormModal';

function Harness({ onSubmit }: { onSubmit: (e: React.FormEvent<HTMLFormElement>) => void }) {
  const methods = useForm({ defaultValues: { name: '', type: 'text', options: '' } });
  return (
    <AttributeFormModal
      open
      title="افزودن ویژگی"
      methods={methods}
      currentType="text"
      optionsPreview={[]}
      isSaving={false}
      onClose={() => {}}
      onSubmit={onSubmit}
    />
  );
}

describe('AttributeFormModal', () => {
  it('renders the form fields', () => {
    render(<Harness onSubmit={() => {}} />);
    expect(screen.getByRole('heading', { name: 'افزودن ویژگی' })).toBeInTheDocument();
    expect(screen.getByText(/نام ویژگی/)).toBeInTheDocument();
    expect(screen.getByText(/نوع ویژگی/)).toBeInTheDocument();
  });

  it('submits the form', async () => {
    let submitted = false;
    render(
      <Harness
        onSubmit={(e) => {
          e.preventDefault();
          submitted = true;
        }}
      />,
    );
    const submit = screen.getByRole('button', { name: 'افزودن ویژگی' });
    submit.click();
    expect(submitted).toBe(true);
  });
});