import React, { useEffect, useState, useContext } from 'react'
import axios from 'axios'
import { AppContext } from '../../context/AppContext'
import Loading from '../../components/users/Loading'
import { toast } from 'react-toastify'

const StudentEnrollment = () => {
  const { backendUrl, getToken } = useContext(AppContext)
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)

  // Popup control state
  const [editingUserId, setEditingUserId] = useState(null)
  const [editForm, setEditForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    affiliateEarnings: 0,
  })

  useEffect(() => {
    const fetchPurchasesWithUserData = async () => {
      try {
        const token = await getToken()
        const { data } = await axios.get(`${backendUrl}/api/admin/purchased-users`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!data.success) {
          toast.error('Failed to fetch purchases')
          setLoading(false)
          return
        }

        const purchasesData = data.purchases

        const purchasesWithUserData = await Promise.all(
          purchasesData.map(async (purchase) => {
            try {
              const userRes = await axios.get(
                `${backendUrl}/api/user/${purchase.userId._id}`,
                {
                  headers: { Authorization: `Bearer ${token}` },
                }
              )
              return {
                ...purchase,
                userDetails: userRes.data.data,
              }
            } catch {
              return {
                ...purchase,
                userDetails: null,
              }
            }
          })
        )

        // ✅ Remove duplicate users by keeping only the first occurrence
        const uniquePurchases = []
        const seenUserIds = new Set()
        for (const purchase of purchasesWithUserData) {
          if (purchase.userDetails && !seenUserIds.has(purchase.userDetails._id)) {
            seenUserIds.add(purchase.userDetails._id)
            uniquePurchases.push(purchase)
          }
        }

        setPurchases(uniquePurchases)
      } catch (error) {
        toast.error('Error fetching data')
      } finally {
        setLoading(false)
      }
    }

    fetchPurchasesWithUserData()
  }, [backendUrl, getToken])

  // Open popup & fill form
  const startEditing = (user) => {
    setEditingUserId(user._id)
    setEditForm({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      affiliateEarnings: user.affiliateEarnings || 0,
    })
  }

  // Close popup
  const cancelEditing = () => {
    setEditingUserId(null)
  }

  // Handle input changes inside popup
  const handleChange = (e) => {
    const { name, value } = e.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  // Save changes API call
  const saveUser = async () => {
    try {
      const token = await getToken()
      const { data } = await axios.put(
        `${backendUrl}/api/user/update/${editingUserId}`,
        editForm,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      )
      if (data.success) {
        toast.success('User updated successfully')
        setPurchases((prev) =>
          prev.map((purchase) =>
            purchase.userDetails?._id === editingUserId
              ? { ...purchase, userDetails: data.data }
              : purchase
          )
        )
        setEditingUserId(null)
      } else {
        toast.error(data.message || 'Failed to update user')
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || 'Error updating user')
    }
  }

  if (loading) return <Loading />

  return (
    <div className="h-screen flex flex-col items-start justify-between md:p-8 md:pb-0 p-4 pt-8 pb-0">
      <div className="w-full max-w-4xl ">
        <h2 className="pb-4 text-lg font-medium">Students Enrolled</h2>
        <div className="flex flex-col items-center w-full overflow-hidden rounded-md bg-white border border-gray-500/20">
          <table className="md:table-auto table-fixed w-full overflow-hidden">
            <thead className="text-gray-900 border-b border-gray-500/20 text-sm text-left">
              <tr>
                <th className="px-4 py-3 font-semibold truncate">Name</th>
                <th className="px-4 py-3 font-semibold truncate hidden md:table-cell">Email</th>
                <th className="px-4 py-3 font-semibold truncate">Affiliate Earnings</th>
                <th className="px-4 py-3 font-semibold truncate">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-500">
              {purchases.map((purchase) => {
                const user = purchase.userDetails
                if (!user) {
                  return (
                    <tr key={purchase._id} className="border-b border-gray-500/20">
                      <td colSpan={4} className="px-4 py-3 text-center text-red-600">
                        Failed to load user data
                      </td>
                    </tr>
                  )
                }

                return (
                  <tr key={purchase._id} className="border-b border-gray-500/20 hover:bg-gray-50">
                    <td className="md:px-4 pl-2 md:pl-4 py-3 truncate">{`${user.firstName} ${user.lastName}`}</td>
                    <td className="px-4 py-3 hidden md:table-cell truncate">{user.email}</td>
                    <td className="px-4 py-3">{`$${user.affiliateEarnings?.toFixed(2) || '0.00'}`}</td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => startEditing(user)}
                        className="text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Popup modal */}
      {editingUserId && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={cancelEditing}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 w-96"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold mb-4">Edit User</h3>

            <label className="block mb-2">
              First Name
              <input
                type="text"
                name="firstName"
                value={editForm.firstName}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-3 py-2"
                placeholder="First Name"
              />
            </label>

            <label className="block mb-2">
              Last Name
              <input
                type="text"
                name="lastName"
                value={editForm.lastName}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-3 py-2"
                placeholder="Last Name"
              />
            </label>

            <label className="block mb-2">
              Email
              <input
                type="email"
                name="email"
                value={editForm.email}
                onChange={handleChange}
                className="mt-1 w-full border rounded px-3 py-2"
                placeholder="Email"
              />
            </label>

            <label className="block mb-4">
              Affiliate Earnings
              <input
                type="number"
                name="affiliateEarnings"
                value={editForm.affiliateEarnings}
                onChange={handleChange}
                min="0"
                step="0.01"
                className="mt-1 w-full border rounded px-3 py-2"
                placeholder="Affiliate Earnings"
              />
            </label>

            <div className="flex justify-end space-x-3">
              <button
                onClick={saveUser}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save
              </button>
              <button
                onClick={cancelEditing}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default StudentEnrollment
