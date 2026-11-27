import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';

import Stepper from './Stepper';

describe('Stepper', () => {
  it('renders all step labels', () => {
    render(<Stepper steps={['اطلاعات', 'ویژگی‌ها', 'تکمیل']} current={2} />);
    expect(screen.getByText('اطلاعات')).toBeInTheDocument();
    expect(screen.getByText('ویژگی‌ها')).toBeInTheDocument();
    expect(screen.getByText('تکمیل')).toBeInTheDocument();
  });

  it('marks completed steps with a check icon', () => {
    const { container } = render(<Stepper steps={['یک', 'دو']} current={2} />);
    expect(container.querySelectorAll('svg')).toHaveLength(1);
  });
});