import Input from '../input/Input';
import Button from '../button/Button';
import CustomSelect from '../form/CustomSelect';
import Modal from '../layout/Modal';
import { ATTRIBUTE_TYPES, type AttributeType } from '../../lib/category-attributes';

type AttributeFormModalProps = {
  open: boolean;
  title: string;
  methods: any;
  currentType: AttributeType;
  optionsPreview: string[];
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function AttributeFormModal({
  open,
  title,
  methods,
  currentType,
  optionsPreview,
  isSaving,
  onClose,
  onSubmit,
}: AttributeFormModalProps) {
  const { register, formState } = methods;
  const errors = formState.errors;

  return (
    <Modal open={open} onClose={onClose} title={title} size="lg">
      <form onSubmit={onSubmit} className="space-y-5" noValidate>
        <Input name="name" label="نام ویژگی" placeholder="مثلاً رنگ" required methods={methods} />

        <CustomSelect
          label="نوع ویژگی"
          name="type"
          methods={methods}
          options={ATTRIBUTE_TYPES}
          required
        />

        {currentType === 'select' && (
          <div className="space-y-2 rounded-xl border border-border bg-surface-2 p-3.5">
            <label className="block text-xs font-medium text-muted">
              گزینه‌ها <span className="text-accent">*</span>
            </label>
            <textarea
              {...register('options')}
              rows={3}
              placeholder="قرمز، آبی، سبز"
              className={`field resize-y font-mono text-xs ${
                errors.options ? 'border-[#f87171] focus:border-[#f87171]' : ''
              }`}
              dir="ltr"
            />
            {errors.options ? (
              <p className="text-xs font-medium text-[#f87171]">{errors.options.message}</p>
            ) : (
              <p className="text-[11px] text-muted">
                گزینه‌ها را با کاما جدا کنید یا آرایه JSON وارد کنید.
              </p>
            )}

            {optionsPreview.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {optionsPreview.map((option) => (
                  <span
                    key={option}
                    className="rounded-md border border-border bg-surface px-2 py-0.5 text-[11px] text-fg-soft"
                  >
                    {option}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-1">
            <Input
              name="sortOrder"
              label="ترتیب نمایش"
              type="number"
              placeholder="0"
              methods={methods}
            />
          </div>

          <div className="flex items-end">
            <label className="flex w-full cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 transition-colors hover:border-border-strong">
              <input
                type="checkbox"
                {...register('isRequired')}
                className="h-4 w-4 rounded border-border text-primary accent-[rgb(var(--primary-rgb))] focus:ring-primary"
              />
              <span className="text-sm text-fg-soft">
                پر کردن این ویژگی روی محصول اجباری است
              </span>
            </label>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-5 sm:flex-row sm:justify-end">
          <Button variant="outline" type="button" className="w-full sm:w-auto" onClick={onClose} disabled={isSaving}>
            لغو
          </Button>
          <Button type="submit" className="w-full sm:w-auto" isLoading={isSaving}>
            {title.includes('ویرایش') ? 'ذخیره تغییرات' : 'افزودن ویژگی'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}