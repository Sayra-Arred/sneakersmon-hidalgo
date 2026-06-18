'use client'
// Copyright © 2026 SneakersMon Hidalgo. All Rights Reserved.
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Plus, Trash2, X, GripVertical } from 'lucide-react'
import { cn, generateSlug } from '@/lib/utils'
import toast from 'react-hot-toast'
import type { FullProductInput } from '@/app/actions/admin-products'

// ─── Validation schema ───────────────────────────────────────────────────────

const variantSchema = z.object({
  id: z.string().optional(),
  size: z.string().min(1, 'Ingresa la talla'),
  sku: z.string().min(1, 'Ingresa el SKU'),
  price: z.number().positive().optional().nullable(),
  stock: z.number().int().min(0),
  isActive: z.boolean(),
})

const formSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(200),
  slug: z.string().regex(/^[a-z0-9-]*$/, 'Solo minúsculas, números y guiones').max(200),
  description: z.string().min(20, 'Mínimo 20 caracteres'),
  shortDescription: z.string().max(300).optional(),
  brandId: z.string().min(1, 'Selecciona una marca'),
  categoryId: z.string().min(1, 'Selecciona una categoría'),
  gender: z.string().optional(),
  colorway: z.string().max(100).optional(),
  price: z.number({ error: 'Ingresa el precio' }).positive('El precio debe ser mayor a 0'),
  compareAtPrice: z.number().positive().optional().nullable(),
  cost: z.number().positive().optional().nullable(),
  status: z.enum(['ACTIVE', 'DRAFT', 'ARCHIVED']),
  isFeatured: z.boolean(),
  isLimitedEdition: z.boolean(),
  isBestSeller: z.boolean(),
  isNewArrival: z.boolean(),
  tags: z.string(),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
  imageUrls: z.string(),
  variants: z.array(variantSchema).min(1, 'Agrega al menos una talla'),
})

type FormValues = z.infer<typeof formSchema>

interface SelectOption {
  id: string
  name: string
}

interface ProductFormProps {
  brands: SelectOption[]
  categories: SelectOption[]
  defaultValues?: Partial<FormValues & { imageUrlsList?: string[] }>
  productId?: string
  onSubmit: (data: FullProductInput) => Promise<{ success: boolean; error?: string }>
  submitLabel: string
}

export function ProductForm({ brands, categories, defaultValues, productId, onSubmit, submitLabel }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: 'DRAFT',
      isFeatured: false,
      isLimitedEdition: false,
      isBestSeller: false,
      isNewArrival: true,
      tags: '',
      imageUrls: defaultValues?.imageUrlsList?.join('\n') ?? '',
      variants: [{ size: '', sku: '', stock: 0, isActive: true }],
      ...defaultValues,
    },
  })

  const { fields, append, remove } = useFieldArray({ control, name: 'variants' })
  const watchedName = watch('name')
  const watchedSlug = watch('slug')
  const watchedTags = watch('tags')

  // Auto-generate slug from name on new products
  useEffect(() => {
    if (!productId && watchedName && !watchedSlug) {
      setValue('slug', generateSlug(watchedName))
    }
  }, [watchedName, productId, watchedSlug, setValue])

  const tagsList = watchedTags
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)

  function addTag() {
    const t = tagInput.trim()
    if (!t) return
    const current = getValues('tags')
    const existing = current.split(',').map((s) => s.trim()).filter(Boolean)
    if (!existing.includes(t)) {
      setValue('tags', [...existing, t].join(', '))
    }
    setTagInput('')
  }

  function removeTag(tag: string) {
    const current = getValues('tags')
    const remaining = current.split(',').map((s) => s.trim()).filter((t) => t !== tag)
    setValue('tags', remaining.join(', '))
  }

  async function handleFormSubmit(values: FormValues) {
    setIsSubmitting(true)
    const images = values.imageUrls
      .split('\n')
      .map((u) => u.trim())
      .filter((u) => u.length > 0)
      .map((url, i) => ({ url, altText: values.name, order: i, isPrimary: i === 0 }))

    const payload: FullProductInput = {
      name: values.name,
      slug: values.slug,
      description: values.description,
      shortDescription: values.shortDescription,
      brandId: values.brandId,
      categoryId: values.categoryId,
      gender: values.gender,
      colorway: values.colorway,
      price: values.price,
      compareAtPrice: values.compareAtPrice ?? undefined,
      cost: values.cost ?? undefined,
      status: values.status,
      isFeatured: values.isFeatured,
      isLimitedEdition: values.isLimitedEdition,
      isBestSeller: values.isBestSeller,
      isNewArrival: values.isNewArrival,
      tags: values.tags.split(',').map((t) => t.trim()).filter(Boolean),
      metaTitle: values.metaTitle,
      metaDescription: values.metaDescription,
      images,
      variants: values.variants.map((v) => ({
        id: v.id,
        size: v.size,
        sku: v.sku,
        price: v.price,
        stock: v.stock,
        isActive: v.isActive,
      })),
    }

    const result = await onSubmit(payload)
    setIsSubmitting(false)

    if (result.success) {
      toast.success(productId ? 'Producto actualizado' : 'Producto creado')
      router.push('/admin/products')
      router.refresh()
    } else {
      toast.error(result.error ?? 'Error al guardar')
    }
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8 max-w-4xl">
      {/* Basic info */}
      <section className="bg-brand-elevated border border-brand-border rounded-xl p-6 space-y-5">
        <h2 className="font-display font-bold text-white">Información básica</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Nombre del producto *
            </label>
            <input
              {...register('name')}
              placeholder="Nike Air Max 95 OG"
              className={cn(
                'w-full px-4 py-2.5 bg-brand-black border rounded-lg text-sm text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors',
                errors.name ? 'border-brand-error' : 'border-brand-border'
              )}
            />
            {errors.name && <p className="text-xs text-brand-error">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Slug *</label>
            <input
              {...register('slug')}
              placeholder="nike-air-max-95-og"
              className={cn(
                'w-full px-4 py-2.5 bg-brand-black border rounded-lg text-sm font-mono text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors',
                errors.slug ? 'border-brand-error' : 'border-brand-border'
              )}
            />
            {errors.slug && <p className="text-xs text-brand-error">{errors.slug.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Colorway</label>
            <input
              {...register('colorway')}
              placeholder="Black / White"
              className="w-full px-4 py-2.5 bg-brand-black border border-brand-border rounded-lg text-sm text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors"
            />
          </div>

          <div className="sm:col-span-2 space-y-1.5">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Descripción *</label>
            <textarea
              {...register('description')}
              rows={4}
              placeholder="Descripción detallada del producto..."
              className={cn(
                'w-full px-4 py-2.5 bg-brand-black border rounded-lg text-sm text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors resize-none',
                errors.description ? 'border-brand-error' : 'border-brand-border'
              )}
            />
            {errors.description && <p className="text-xs text-brand-error">{errors.description.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Descripción corta</label>
            <input
              {...register('shortDescription')}
              placeholder="Resumen breve (max 300 caracteres)"
              className="w-full px-4 py-2.5 bg-brand-black border border-brand-border rounded-lg text-sm text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Género</label>
            <select
              {...register('gender')}
              className="w-full px-4 py-2.5 bg-brand-black border border-brand-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-accent transition-colors"
            >
              <option value="">Sin especificar</option>
              <option>Hombre</option>
              <option>Mujer</option>
              <option>Unisex</option>
              <option>Niño</option>
              <option>Niña</option>
            </select>
          </div>
        </div>
      </section>

      {/* Brand, category & status */}
      <section className="bg-brand-elevated border border-brand-border rounded-xl p-6 space-y-5">
        <h2 className="font-display font-bold text-white">Clasificación y estado</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Marca *</label>
            <select
              {...register('brandId')}
              className={cn(
                'w-full px-4 py-2.5 bg-brand-black border rounded-lg text-sm text-white focus:outline-none focus:border-brand-accent transition-colors',
                errors.brandId ? 'border-brand-error' : 'border-brand-border'
              )}
            >
              <option value="">Selecciona marca</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>{b.name}</option>
              ))}
            </select>
            {errors.brandId && <p className="text-xs text-brand-error">{errors.brandId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Categoría *</label>
            <select
              {...register('categoryId')}
              className={cn(
                'w-full px-4 py-2.5 bg-brand-black border rounded-lg text-sm text-white focus:outline-none focus:border-brand-accent transition-colors',
                errors.categoryId ? 'border-brand-error' : 'border-brand-border'
              )}
            >
              <option value="">Selecciona categoría</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.categoryId && <p className="text-xs text-brand-error">{errors.categoryId.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Estado</label>
            <select
              {...register('status')}
              className="w-full px-4 py-2.5 bg-brand-black border border-brand-border rounded-lg text-sm text-white focus:outline-none focus:border-brand-accent transition-colors"
            >
              <option value="DRAFT">Borrador</option>
              <option value="ACTIVE">Activo</option>
              <option value="ARCHIVED">Archivado</option>
            </select>
          </div>
        </div>

        {/* Toggles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(
            [
              { name: 'isFeatured', label: 'Destacado' },
              { name: 'isLimitedEdition', label: 'Edición limitada' },
              { name: 'isBestSeller', label: 'Best seller' },
              { name: 'isNewArrival', label: 'Nueva llegada' },
            ] as const
          ).map(({ name, label }) => (
            <label key={name} className="flex items-center gap-3 p-3 bg-brand-black border border-brand-border rounded-lg cursor-pointer hover:border-brand-accent/50 transition-colors">
              <input
                type="checkbox"
                {...register(name)}
                className="w-4 h-4 accent-brand-accent"
              />
              <span className="text-sm text-white">{label}</span>
            </label>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-brand-elevated border border-brand-border rounded-xl p-6 space-y-5">
        <h2 className="font-display font-bold text-white">Precios</h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Precio de venta (MXN) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('price', { valueAsNumber: true })}
              placeholder="2500.00"
              className={cn(
                'w-full px-4 py-2.5 bg-brand-black border rounded-lg text-sm font-mono text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors',
                errors.price ? 'border-brand-error' : 'border-brand-border'
              )}
            />
            {errors.price && <p className="text-xs text-brand-error">{errors.price.message}</p>}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Precio comparado (MXN)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('compareAtPrice', { valueAsNumber: true, setValueAs: (v) => (isNaN(v) ? null : v) })}
              placeholder="3200.00"
              className="w-full px-4 py-2.5 bg-brand-black border border-brand-border rounded-lg text-sm font-mono text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">
              Costo (MXN)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              {...register('cost', { valueAsNumber: true, setValueAs: (v) => (isNaN(v) ? null : v) })}
              placeholder="1800.00"
              className="w-full px-4 py-2.5 bg-brand-black border border-brand-border rounded-lg text-sm font-mono text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors"
            />
          </div>
        </div>
      </section>

      {/* Images */}
      <section className="bg-brand-elevated border border-brand-border rounded-xl p-6 space-y-5">
        <h2 className="font-display font-bold text-white">Imágenes</h2>
        <p className="text-xs text-brand-muted">Una URL por línea. La primera imagen será la principal.</p>
        <textarea
          {...register('imageUrls')}
          rows={4}
          placeholder={'https://example.com/image1.jpg\nhttps://example.com/image2.jpg'}
          className="w-full px-4 py-2.5 bg-brand-black border border-brand-border rounded-lg text-sm font-mono text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors resize-none"
        />
      </section>

      {/* Tags */}
      <section className="bg-brand-elevated border border-brand-border rounded-xl p-6 space-y-5">
        <h2 className="font-display font-bold text-white">Tags</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
            placeholder="Agregar tag..."
            className="flex-1 px-4 py-2.5 bg-brand-black border border-brand-border rounded-lg text-sm text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2.5 bg-brand-accent text-white text-sm font-semibold rounded-lg hover:bg-brand-accent/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <input type="hidden" {...register('tags')} />
        {tagsList.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tagsList.map((tag) => (
              <span
                key={tag}
                className="flex items-center gap-1.5 px-3 py-1 bg-brand-black border border-brand-border rounded-full text-xs text-white"
              >
                {tag}
                <button type="button" onClick={() => removeTag(tag)}>
                  <X className="w-3 h-3 text-brand-muted hover:text-brand-error transition-colors" />
                </button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Variants */}
      <section className="bg-brand-elevated border border-brand-border rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-white">Tallas y variantes</h2>
            <p className="text-xs text-brand-muted mt-0.5">Define tallas, SKUs e inventario inicial</p>
          </div>
          <button
            type="button"
            onClick={() => append({ size: '', sku: '', stock: 0, isActive: true })}
            className="flex items-center gap-2 px-3 py-2 bg-brand-black border border-brand-border rounded-lg text-sm text-brand-muted hover:text-white hover:border-brand-accent transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Agregar talla
          </button>
        </div>

        {errors.variants?.root && (
          <p className="text-xs text-brand-error">{errors.variants.root.message}</p>
        )}

        <div className="space-y-3">
          <div className="grid grid-cols-12 gap-3 text-xs font-semibold text-brand-muted uppercase tracking-wider px-1">
            <div className="col-span-1" />
            <div className="col-span-2">Talla</div>
            <div className="col-span-3">SKU</div>
            <div className="col-span-2">Precio</div>
            <div className="col-span-2">Stock</div>
            <div className="col-span-1 text-center">Activo</div>
            <div className="col-span-1" />
          </div>

          {fields.map((field, index) => (
            <div key={field.id} className="grid grid-cols-12 gap-3 items-center p-3 bg-brand-black border border-brand-border rounded-lg">
              <div className="col-span-1 flex justify-center text-brand-muted">
                <GripVertical className="w-4 h-4" />
              </div>
              <div className="col-span-2">
                <input
                  {...register(`variants.${index}.size`)}
                  placeholder="US 10"
                  className={cn(
                    'w-full px-3 py-2 bg-brand-surface border rounded-lg text-sm text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors',
                    errors.variants?.[index]?.size ? 'border-brand-error' : 'border-brand-border'
                  )}
                />
              </div>
              <div className="col-span-3">
                <input
                  {...register(`variants.${index}.sku`)}
                  placeholder="NK-AM95-US10"
                  className={cn(
                    'w-full px-3 py-2 bg-brand-surface border rounded-lg text-sm font-mono text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors',
                    errors.variants?.[index]?.sku ? 'border-brand-error' : 'border-brand-border'
                  )}
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  {...register(`variants.${index}.price`, {
                    valueAsNumber: true,
                    setValueAs: (v) => (v === '' || isNaN(Number(v)) ? null : Number(v)),
                  })}
                  placeholder="—"
                  className="w-full px-3 py-2 bg-brand-surface border border-brand-border rounded-lg text-sm font-mono text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  min="0"
                  step="1"
                  {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                  placeholder="0"
                  className={cn(
                    'w-full px-3 py-2 bg-brand-surface border rounded-lg text-sm font-mono text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors',
                    errors.variants?.[index]?.stock ? 'border-brand-error' : 'border-brand-border'
                  )}
                />
              </div>
              <div className="col-span-1 flex justify-center">
                <input
                  type="checkbox"
                  {...register(`variants.${index}.isActive`)}
                  className="w-4 h-4 accent-brand-accent"
                />
              </div>
              <div className="col-span-1 flex justify-center">
                <button
                  type="button"
                  onClick={() => remove(index)}
                  disabled={fields.length === 1}
                  className="p-1.5 rounded-lg text-brand-muted hover:text-brand-error hover:bg-brand-error/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SEO */}
      <section className="bg-brand-elevated border border-brand-border rounded-xl p-6 space-y-5">
        <h2 className="font-display font-bold text-white">SEO <span className="text-brand-muted font-normal text-sm">(opcional)</span></h2>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Meta título</label>
            <input
              {...register('metaTitle')}
              maxLength={70}
              placeholder="Título optimizado para SEO"
              className="w-full px-4 py-2.5 bg-brand-black border border-brand-border rounded-lg text-sm text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-brand-muted uppercase tracking-wider">Meta descripción</label>
            <textarea
              {...register('metaDescription')}
              maxLength={160}
              rows={2}
              placeholder="Descripción para buscadores (máx. 160 caracteres)"
              className="w-full px-4 py-2.5 bg-brand-black border border-brand-border rounded-lg text-sm text-white placeholder:text-brand-muted focus:outline-none focus:border-brand-accent transition-colors resize-none"
            />
          </div>
        </div>
      </section>

      {/* Actions */}
      <div className="flex items-center gap-4 pb-8">
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-8 py-3 bg-brand-accent text-white font-semibold rounded-lg hover:bg-brand-accent/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Guardando...' : submitLabel}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-3 border border-brand-border text-brand-muted hover:text-white hover:border-white rounded-lg text-sm font-medium transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
