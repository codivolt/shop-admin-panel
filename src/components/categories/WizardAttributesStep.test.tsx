import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import WizardAttributesStep from './WizardAttributesStep';

const handlers = {
  isSaving: false,
  onAdd: vi.fn(),
  onRemove: vi.fn(),
  onUpdateName: vi.fn(),
  onUpdateType: vi.fn(),
  onUpdateSort: vi.fn(),
  onToggleRequired: vi.fn(),
  onAddOption: vi.fn(),
  onRemoveOption: vi.fn(),
  onUpdateOption: vi.fn(),
  onBack: vi.fn(),
  onCancel: vi.fn(),
  onSubmit: vi.fn(),
};

describe('WizardAttributesStep', () => {
  it('shows the empty state and adds the first attribute', async () => {
    render(<WizardAttributesStep attributes={[]} {...handlers} />);
    await userEvent.click(screen.getByRole('button', { name: 'افزودن اولین ویژگی' }));
    expect(handlers.onAdd).toHaveBeenCalledOnce();
  });

  it('renders an attribute row and its controls', () => {
    render(
      <WizardAttributesStep
        {...handlers}
        attributes={[
          { id: 'a1', name: 'رنگ', type: 'select', options: ['قرمز'], isRequired: false, sortOrder: 0 },
        ]}
      />,
    );
    expect(screen.getByDisplayValue('رنگ')).toBeInTheDocument();
    expect(screen.getByText('گزینه‌ها')).toBeInTheDocument();
    expect(screen.getByText('افزودن ویژگی جدید')).toBeInTheDocument();
  });
});