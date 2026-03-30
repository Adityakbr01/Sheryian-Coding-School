import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  adminApi,
  type AdminProduct,
  type AdminUser,
  type CreateProductInput,
  type UpdateProductInput,
  type UserRole,
} from '../api/admin.api'
import { useAuthStore } from '../../auth/store/auth.store'

interface CreateProductFormState {
  id: string
  name: string
  description: string
  basePrice: string
  minimumPrice: string
  emoji: string
  isActive: boolean
}

const initialCreateForm: CreateProductFormState = {
  id: '',
  name: '',
  description: '',
  basePrice: '',
  minimumPrice: '',
  emoji: '🛍️',
  isActive: true,
}

function parsePositiveNumber(value: string): number | null {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) return null
  return parsed
}

export default function AdminPage() {
  const queryClient = useQueryClient()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const isAuthLoading = useAuthStore((state) => state.isLoading)

  const [notice, setNotice] = useState('')
  const [createForm, setCreateForm] =
    useState<CreateProductFormState>(initialCreateForm)
  const [productDrafts, setProductDrafts] = useState<
    Record<string, AdminProduct>
  >({})
  const [userRoleDrafts, setUserRoleDrafts] = useState<
    Record<string, UserRole>
  >({})

  const productsQuery = useQuery({
    queryKey: ['admin-products'],
    queryFn: adminApi.listProducts,
    enabled: isAuthenticated && user?.role === 'admin',
  })

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminApi.listUsers,
    enabled: isAuthenticated && user?.role === 'admin',
  })

  useEffect(() => {
    const items = productsQuery.data?.data ?? []
    if (items.length === 0) return

    const next: Record<string, AdminProduct> = {}
    for (const item of items) {
      next[item.id] = item
    }
    setProductDrafts(next)
  }, [productsQuery.data])

  useEffect(() => {
    const items = usersQuery.data?.data ?? []
    if (items.length === 0) return

    const next: Record<string, UserRole> = {}
    for (const entry of items) {
      const key = entry._id ?? entry.id
      if (key) next[key] = entry.role
    }
    setUserRoleDrafts(next)
  }, [usersQuery.data])

  const invalidateAdminData = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['admin-products'] }),
      queryClient.invalidateQueries({ queryKey: ['admin-users'] }),
      queryClient.invalidateQueries({ queryKey: ['products'] }),
    ])
  }

  const createProductMutation = useMutation({
    mutationFn: (payload: CreateProductInput) =>
      adminApi.createProduct(payload),
    onSuccess: async () => {
      setCreateForm(initialCreateForm)
      setNotice('Product created successfully.')
      await invalidateAdminData()
    },
    onError: (error: Error) => {
      setNotice(error.message)
    },
  })

  const updateProductMutation = useMutation({
    mutationFn: ({
      productId,
      payload,
    }: {
      productId: string
      payload: UpdateProductInput
    }) => adminApi.updateProduct(productId, payload),
    onSuccess: async () => {
      setNotice('Product updated successfully.')
      await invalidateAdminData()
    },
    onError: (error: Error) => {
      setNotice(error.message)
    },
  })

  const deactivateProductMutation = useMutation({
    mutationFn: (productId: string) => adminApi.deactivateProduct(productId),
    onSuccess: async () => {
      setNotice('Product deactivated successfully.')
      await invalidateAdminData()
    },
    onError: (error: Error) => {
      setNotice(error.message)
    },
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, role }: { userId: string; role: UserRole }) =>
      adminApi.updateUserRole(userId, role),
    onSuccess: async () => {
      setNotice('User role updated successfully.')
      await invalidateAdminData()
    },
    onError: (error: Error) => {
      setNotice(error.message)
    },
  })

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault()

    const id = createForm.id.trim()
    const name = createForm.name.trim()
    const description = createForm.description.trim()
    const basePrice = parsePositiveNumber(createForm.basePrice)
    const minimumPrice = parsePositiveNumber(createForm.minimumPrice)

    if (!id || !name || !description || !basePrice || !minimumPrice) {
      setNotice('Please fill all product fields with valid values.')
      return
    }

    if (minimumPrice > basePrice) {
      setNotice('Minimum price should be less than or equal to base price.')
      return
    }

    createProductMutation.mutate({
      id,
      name,
      description,
      basePrice,
      minimumPrice,
      emoji: createForm.emoji || '🛍️',
      isActive: createForm.isActive,
    })
  }

  const handleDraftChange = <K extends keyof AdminProduct>(
    productId: string,
    key: K,
    value: AdminProduct[K],
  ) => {
    setProductDrafts((prev) => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [key]: value,
      },
    }))
  }

  const handleSaveProduct = (productId: string) => {
    const draft = productDrafts[productId]
    if (!draft) return

    if (!draft.name.trim() || !draft.description.trim()) {
      setNotice('Product name and description cannot be empty.')
      return
    }

    if (draft.basePrice <= 0 || draft.minimumPrice <= 0) {
      setNotice('Product prices must be greater than zero.')
      return
    }

    if (draft.minimumPrice > draft.basePrice) {
      setNotice('Minimum price should be less than or equal to base price.')
      return
    }

    updateProductMutation.mutate({
      productId,
      payload: {
        name: draft.name,
        description: draft.description,
        basePrice: draft.basePrice,
        minimumPrice: draft.minimumPrice,
        emoji: draft.emoji,
        isActive: draft.isActive,
      },
    })
  }

  const handleRoleChange = (targetUserId: string, role: UserRole) => {
    setUserRoleDrafts((prev) => ({ ...prev, [targetUserId]: role }))
  }

  const handleSaveRole = (entry: AdminUser) => {
    const targetUserId = entry._id ?? entry.id
    if (!targetUserId) {
      setNotice('Could not resolve target user id.')
      return
    }

    const role = userRoleDrafts[targetUserId] ?? entry.role
    if (role === entry.role) {
      setNotice('Role is unchanged.')
      return
    }

    updateRoleMutation.mutate({ userId: targetUserId, role })
  }

  if (isAuthLoading) {
    return (
      <div className="py-10 text-center text-(--text-muted)">
        Checking permissions...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user?.role !== 'admin') {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border border-(--border-default) bg-(--card-bg) p-8 text-center">
        <h1 className="text-2xl font-bold text-(--text-primary)">
          Admin Access Required
        </h1>
        <p className="mt-2 text-(--text-secondary)">
          Your account does not have admin permission to view this page.
        </p>
      </div>
    )
  }

  const products = productsQuery.data?.data ?? []
  const users = usersQuery.data?.data ?? []

  return (
    <div className="mx-auto max-w-6xl space-y-6 py-6">
      <div>
        <h1 className="text-3xl font-bold text-(--text-primary)">
          Admin Panel
        </h1>
        <p className="mt-1 text-sm text-(--text-secondary)">
          Manage products and user roles connected to backend admin APIs.
        </p>
      </div>

      {notice && (
        <div className="rounded-lg border border-(--border-default) bg-(--bg-elevated) px-4 py-3 text-sm text-(--text-primary)">
          {notice}
        </div>
      )}

      <section className="rounded-xl border border-(--border-default) bg-(--card-bg) p-5">
        <h2 className="mb-4 text-xl font-semibold text-(--text-primary)">
          Create Product
        </h2>
        <form
          onSubmit={handleCreateProduct}
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          <input
            value={createForm.id}
            onChange={(e) =>
              setCreateForm((prev) => ({ ...prev, id: e.target.value }))
            }
            placeholder="id (e.g. laptop-pro-max)"
            className="rounded-md border border-(--input-border) bg-(--input-bg) px-3 py-2"
          />
          <input
            value={createForm.name}
            onChange={(e) =>
              setCreateForm((prev) => ({ ...prev, name: e.target.value }))
            }
            placeholder="name"
            className="rounded-md border border-(--input-border) bg-(--input-bg) px-3 py-2"
          />
          <input
            value={createForm.basePrice}
            onChange={(e) =>
              setCreateForm((prev) => ({ ...prev, basePrice: e.target.value }))
            }
            type="number"
            min={1}
            placeholder="base price"
            className="rounded-md border border-(--input-border) bg-(--input-bg) px-3 py-2"
          />
          <input
            value={createForm.minimumPrice}
            onChange={(e) =>
              setCreateForm((prev) => ({
                ...prev,
                minimumPrice: e.target.value,
              }))
            }
            type="number"
            min={1}
            placeholder="minimum price"
            className="rounded-md border border-(--input-border) bg-(--input-bg) px-3 py-2"
          />
          <input
            value={createForm.emoji}
            onChange={(e) =>
              setCreateForm((prev) => ({ ...prev, emoji: e.target.value }))
            }
            placeholder="emoji"
            className="rounded-md border border-(--input-border) bg-(--input-bg) px-3 py-2"
          />
          <label className="flex items-center gap-2 rounded-md border border-(--input-border) bg-(--input-bg) px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={createForm.isActive}
              onChange={(e) =>
                setCreateForm((prev) => ({
                  ...prev,
                  isActive: e.target.checked,
                }))
              }
            />
            Active product
          </label>
          <textarea
            value={createForm.description}
            onChange={(e) =>
              setCreateForm((prev) => ({
                ...prev,
                description: e.target.value,
              }))
            }
            placeholder="description"
            className="min-h-24 rounded-md border border-(--input-border) bg-(--input-bg) px-3 py-2 md:col-span-2"
          />
          <button
            type="submit"
            disabled={createProductMutation.isPending}
            className="rounded-md bg-(--accent) px-4 py-2 font-semibold text-(--text-on-accent) disabled:opacity-50 md:col-span-2"
          >
            {createProductMutation.isPending ? 'Creating...' : 'Create Product'}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-(--border-default) bg-(--card-bg) p-5">
        <h2 className="mb-4 text-xl font-semibold text-(--text-primary)">
          Manage Products
        </h2>

        {productsQuery.isLoading ? (
          <div className="py-6 text-sm text-(--text-muted)">
            Loading products...
          </div>
        ) : (
          <div className="space-y-4">
            {products.map((product) => {
              const draft = productDrafts[product.id] ?? product
              return (
                <div
                  key={product.id}
                  className="rounded-lg border border-(--border-subtle) p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-(--text-primary)">
                      {product.id}
                    </h3>
                    <span
                      className={`text-xs font-semibold ${draft.isActive ? 'text-green-600' : 'text-red-600'}`}
                    >
                      {draft.isActive ? 'ACTIVE' : 'INACTIVE'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <input
                      value={draft.name}
                      onChange={(e) =>
                        handleDraftChange(product.id, 'name', e.target.value)
                      }
                      className="rounded-md border border-(--input-border) bg-(--input-bg) px-3 py-2"
                    />
                    <input
                      value={draft.emoji}
                      onChange={(e) =>
                        handleDraftChange(product.id, 'emoji', e.target.value)
                      }
                      className="rounded-md border border-(--input-border) bg-(--input-bg) px-3 py-2"
                    />
                    <label className="flex items-center gap-2 rounded-md border border-(--input-border) bg-(--input-bg) px-3 py-2 text-sm">
                      <input
                        type="checkbox"
                        checked={draft.isActive}
                        onChange={(e) =>
                          handleDraftChange(
                            product.id,
                            'isActive',
                            e.target.checked,
                          )
                        }
                      />
                      Active
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={draft.basePrice}
                      onChange={(e) =>
                        handleDraftChange(
                          product.id,
                          'basePrice',
                          Number(e.target.value),
                        )
                      }
                      className="rounded-md border border-(--input-border) bg-(--input-bg) px-3 py-2"
                    />
                    <input
                      type="number"
                      min={1}
                      value={draft.minimumPrice}
                      onChange={(e) =>
                        handleDraftChange(
                          product.id,
                          'minimumPrice',
                          Number(e.target.value),
                        )
                      }
                      className="rounded-md border border-(--input-border) bg-(--input-bg) px-3 py-2"
                    />
                    <textarea
                      value={draft.description}
                      onChange={(e) =>
                        handleDraftChange(
                          product.id,
                          'description',
                          e.target.value,
                        )
                      }
                      className="min-h-20 rounded-md border border-(--input-border) bg-(--input-bg) px-3 py-2 md:col-span-3"
                    />
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleSaveProduct(product.id)}
                      disabled={updateProductMutation.isPending}
                      className="rounded-md bg-(--accent) px-3 py-2 text-sm font-semibold text-(--text-on-accent) disabled:opacity-50"
                    >
                      Save
                    </button>
                    <button
                      onClick={() =>
                        deactivateProductMutation.mutate(product.id)
                      }
                      disabled={
                        deactivateProductMutation.isPending || !draft.isActive
                      }
                      className="rounded-md border border-red-400 px-3 py-2 text-sm font-semibold text-red-600 disabled:opacity-50"
                    >
                      Deactivate
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-(--border-default) bg-(--card-bg) p-5">
        <h2 className="mb-4 text-xl font-semibold text-(--text-primary)">
          Manage Users
        </h2>

        {usersQuery.isLoading ? (
          <div className="py-6 text-sm text-(--text-muted)">
            Loading users...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-(--border-subtle)">
                  <th className="py-2">Name</th>
                  <th className="py-2">Email</th>
                  <th className="py-2">Stats</th>
                  <th className="py-2">Role</th>
                  <th className="py-2">Action</th>
                </tr>
              </thead>
              <tbody>
                {users.map((entry) => {
                  const targetUserId = entry._id ?? entry.id
                  const roleDraft = targetUserId
                    ? (userRoleDrafts[targetUserId] ?? entry.role)
                    : entry.role
                  const isCurrentUser = targetUserId === user?.id
                  const unchanged = roleDraft === entry.role

                  return (
                    <tr
                      key={targetUserId ?? entry.email}
                      className="border-b border-(--border-subtle)"
                    >
                      <td className="py-2 pr-2 font-medium">{entry.name}</td>
                      <td className="py-2 pr-2">{entry.email}</td>
                      <td className="py-2 pr-2">
                        score {entry.score} | wins {entry.wins}/
                        {entry.totalSessions}
                      </td>
                      <td className="py-2 pr-2">
                        <select
                          value={roleDraft}
                          onChange={(e) =>
                            targetUserId &&
                            handleRoleChange(
                              targetUserId,
                              e.target.value as UserRole,
                            )
                          }
                          disabled={!targetUserId || isCurrentUser}
                          className="rounded-md border border-(--input-border) bg-(--input-bg) px-2 py-1"
                        >
                          <option value="user">user</option>
                          <option value="admin">admin</option>
                        </select>
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => handleSaveRole(entry)}
                          disabled={
                            !targetUserId ||
                            isCurrentUser ||
                            unchanged ||
                            updateRoleMutation.isPending
                          }
                          className="rounded-md bg-(--accent) px-3 py-1.5 text-xs font-semibold text-(--text-on-accent) disabled:opacity-50"
                        >
                          Update Role
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
