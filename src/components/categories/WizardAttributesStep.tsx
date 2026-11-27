import Input from '../input/Input';
import Button from '../button/Button';
import CustomSelect from '../form/CustomSelect';
import { ATTRIBUTE_TYPES, type WizardAttribute } from '../../lib/categories-wizard';

interface Props {
  attributes: WizardAttribute[];
  isSaving: boolean;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdateName: (id: string, value: string) => void;
  onUpdateType: (id: string, value: string) => void;
  onUpdateSort: (id: string, value: number) => void;
  onToggleRequired: (id: string) => void;
  onAddOption: (id: string) => void;
  onRemoveOption: (id: string, index: number) => void;
  onUpdateOption: (id: string, index: number, value: string) => void;
  onBack: () => void;
  onCancel: () => void;
  onSubmit: () => void;
}

export default function WizardAttributesStep({
  attributes,
  isSaving,
  onAdd,
  onRemove,
  onUpdateName,
  onUpdateType,
  onUpdateSort,
  onToggleRequired,
  onAddOption,
  onRemoveOption,
  onUpdateOption,
  onBack,
  onCancel,
  onSubmit,
}: Props) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[rgb(var(--secondary-rgb)/0.12)] text-secondary">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-sm font-bold text-fg">ویژگی‌های دسته‌بندی</h2>
            <p className="text-xs text-muted">
              {attributes.length.toLocaleString('fa-IR')} ویژگی تعریف شده
            </p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={onBack}>
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          بازگشت به مرحله قبل
        </Button>
      </div>

      {attributes.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border p-10 text-center">
          <p className="text-sm text-muted">هنوز ویژگی‌ای اضافه نشده است</p>
          <Button size="sm" onClick={onAdd}>
            افزودن اولین ویژگی
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {attributes.map((attr, index) => (
            <div
              key={attr.id}
              className="rounded-2xl border border-border bg-gradient-to-b from-card-from to-card-to p-4 shadow-lg shadow-black/20 sm:p-5"
            >
              <div className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-[11px] font-bold text-muted">
                  {(index + 1).toLocaleString('fa-IR')}
                </span>
                <Input
                  name={`attribute-name-${attr.id}`}
                  placeholder="عنوان ویژگی، مثلاً رنگ"
                  value={attr.name}
                  onChange={(e) => onUpdateName(attr.id, e.target.value)}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => onRemove(attr.id)}
                  title="حذف ویژگی"
                  aria-label="حذف ویژگی"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border text-muted transition-colors hover:border-[#f87171]/50 hover:text-[#f87171]"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">نوع ویژگی</label>
                  <CustomSelect
                    options={ATTRIBUTE_TYPES}
                    value={attr.type}
                    onChange={(val) => onUpdateType(attr.id, String(val))}
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-muted">ترتیب نمایش</label>
                  <Input
                    name={`attribute-order-${attr.id}`}
                    type="number"
                    value={String(attr.sortOrder)}
                    onChange={(e) => onUpdateSort(attr.id, parseInt(e.target.value) || 0)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => onToggleRequired(attr.id)}
                  className="flex items-center justify-between gap-3 self-end rounded-xl border border-border bg-surface-2 px-3.5 py-2.5 text-right transition-colors hover:border-muted-soft"
                >
                  <span className="text-xs font-medium text-fg-soft">اجباری است</span>
                  <span
                    className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                      attr.isRequired ? 'bg-primary' : 'bg-muted-soft'
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                        attr.isRequired ? 'right-0.5' : 'right-[18px]'
                      }`}
                    />
                  </span>
                </button>
              </div>

              {attr.type === 'select' && (
                <div className="mt-4 rounded-xl border border-border bg-surface p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <label className="text-xs font-medium text-muted">گزینه‌ها</label>
                    <span className="text-[11px] text-muted-soft">
                      {attr.options.length.toLocaleString('fa-IR')} گزینه
                    </span>
                  </div>
                  <div className="space-y-2">
                    {attr.options.length === 0 && (
                      <p className="rounded-lg border border-dashed border-border px-3 py-2.5 text-center text-[11px] text-muted-soft">
                        هنوز گزینه‌ای اضافه نشده است
                      </p>
                    )}
                    {attr.options.map((opt, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <Input
                          name={`attribute-option-${attr.id}-${idx}`}
                          placeholder="مثلاً قرمز"
                          value={opt}
                          onChange={(e) => onUpdateOption(attr.id, idx, e.target.value)}
                          className="flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => onRemoveOption(attr.id, idx)}
                          aria-label="حذف گزینه"
                          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-muted transition-colors hover:text-[#f87171]"
                        >
                          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                    <Button variant="ghost" size="sm" onClick={() => onAddOption(attr.id)}>
                      <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                      افزودن گزینه
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}

          <button
            type="button"
            onClick={onAdd}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-3.5 text-sm font-medium text-muted transition-colors hover:border-primary hover:text-primary"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            افزودن ویژگی جدید
          </button>
        </div>
      )}

      <div className="flex flex-col-reverse gap-2 rounded-2xl border border-border bg-surface p-4 sm:flex-row sm:justify-between">
        <Button variant="ghost" className="w-full sm:w-auto" onClick={onCancel}>
          انصراف
        </Button>
        <Button
          type="button"
          onClick={onSubmit}
          isLoading={isSaving}
          className="w-full sm:w-auto"
        >
          ذخیره و تکمیل
        </Button>
      </div>
    </div>
  );
}