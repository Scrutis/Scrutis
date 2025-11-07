'use client'
import { DashboardStats } from "@/components/main/dashboard/dashboard-stats";
import { authClient } from "@/lib/auth-client";
import { ScansTable } from "@/components/main/dashboard/scan-table";

export default function Page() {
  const {
    data: session,
  } = authClient.useSession(); 

  return (
    <main className="relative z-10">
      <div className="mx-auto px-2 sm:px-6 lg:px-8">
        {/* Welcome Section */}
        <div className="mb-8">
            <div>
              <h1 className="w-fit text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back, {session?.user.name}!
              </h1>
              <p className="w-fit text-gray-600 dark:text-gray-300 mt-2">
                Here&apos;s a quick summary of your scans.
              </p>
            </div>
        </div>

        {/* Stats Cards */}
        <div className="mb-8">
          <DashboardStats />
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-3 mb-8">
          {/* Quick Actions */}
          {/* <QuickActions /> */}

          {/* Activity Feed */}
          <div className="lg:col-span-2">{/* <ActivityFeed /> */}</div>
        </div>

        {/* Deployments Table */}
        <ScansTable />
      </div>
    </main>
  );
}
