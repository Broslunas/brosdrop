import Sidebar from "@/components/Sidebar"
import DashboardHeader from "@/components/DashboardHeader"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/authOptions"
import { redirect } from "next/navigation"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="flex h-screen w-full override-main-layout bg-background overflow-hidden">
      <Sidebar />
      <div className="flex flex-col flex-1 w-full h-full overflow-hidden">
         <DashboardHeader />
         <main className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="mx-auto max-w-7xl">
                {children}
            </div>
         </main>
      </div>
    </div>
  )
}
