import type { Metadata } from "next"
import { CustomerList } from "@/components/customer-list"

export const metadata: Metadata = {
  title: "Customers | Baccarat Trading System",
  description: "Manage your customers and their information",
}

export default function CustomersPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
      </div>
      <CustomerList />
    </div>
  )
}

